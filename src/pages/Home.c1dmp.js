import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import { getHighlights } from 'backend/menu.web';

// Iframe'den gelen gezinme istekleri yalnizca bu adresle baslayabilir.
const SITE_ORIGIN = 'https://nepagy.wixstudio.com/';

/*
 * Ana sayfa tek bir HtmlComponent'ten (#html1) olusuyor.
 * Sayfadaki gercek elemanlar: #page1, #section5 (zaten gizli), #html1.
 *
 * Iframe icerigi artik bu deponun docs/index.html dosyasi ve GitHub Pages
 * uzerinden servis ediliyor. Boylece HTML surum kontrolunde ve degisiklik
 * icin editore kod yapistirmak gerekmiyor.
 *
 * ONEMLI: Wix Studio'da $w elemanlarinin height ozelligi YOK - Velo'dan
 * iframe yuksekligi dogrudan atanamiyor. Bunun yerine iframe kendi icerik
 * yuksekligini postMessage ile bildiriyor, biz de sayfaya kz-h-<piksel>
 * seklinde bir CSS sinifi ekliyoruz; yuksekligi global.css uyguluyor.
 */

const EMBED_URL = 'https://enesatmaca00.github.io/kuzela/';

// Sinirlar global.css'te uretilen kz-h-* kurallarinin araligiyla ayni olmali,
// yoksa sinif eklenir ama karsiligi olan kural bulunmaz.
const HEIGHT_STEP = 100;
const MIN_HEIGHT = 2000;
const MAX_HEIGHT = 9000;

function navigateTo(rawUrl) {
    const target = String(rawUrl || '');
    // Iframe baska bir origin'de; yalnizca bu sitenin adreslerine izin var.
    if (target.indexOf(SITE_ORIGIN) !== 0) return;

    // wixLocation.to() site koku baz alinan goreli yolu guvenilir isliyor.
    // Mutlak adres verildiginde bazi kurulumlarda sessizce hicbir sey yapmiyor,
    // bu yuzden once goreli yola cevirmeyi deniyoruz.
    const base = String(wixLocation.baseUrl || '').replace(/\/+$/, '');
    const path = base && target.indexOf(base) === 0 ? target.slice(base.length) : '';

    try {
        wixLocation.to(path || target);
    } catch (error) {
        console.warn('[kuzela] gezinme basarisiz:', target, (error && error.message) || error);
    }
}

function heightClassFor(rawHeight) {
    const clamped = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(rawHeight)));
    const stepped = Math.ceil(clamped / HEIGHT_STEP) * HEIGHT_STEP;
    return `kz-h-${stepped}`;
}

$w.onReady(function () {
    const app = $w('#html1');
    const page = $w('#page1');

    // Gezinme goreli yola cevrilirken kullaniliyor; sorun cikarsa degeri lazim.
    console.log('[kuzela] baseUrl:', wixLocation.baseUrl);

    if (typeof app.show === 'function') app.show();
    if (typeof app.expand === 'function') app.expand();


    // Sayfada tek kaydirma cubugu olsun diye iframe'in kendi scroll'u olmamali.
    // Bunu `app.scrolling` ile yapmiyoruz: `src` ile ayni anda atandiginda Wix
    // iframe'i bazen hic olusturmuyor (kapsayici bos kaliyor). Bunun yerine
    // kz-h-* sinifi yuksekligi her zaman YUKARI yuvarliyor, boylece iframe
    // icerikten asla kisa kalmiyor ve tasma olmadigi icin scroll cikmiyor.
    if (EMBED_URL) {
        // GitHub Pages gomulu sayfayi "Cache-Control: max-age=600" ile veriyor,
        // yani docs/index.html degisikligi siteye 10 dakikaya kadar gec ulasiyor.
        // Adrese dakikada bir degisen bir surum ekleyerek gecikmeyi 1 dakikaya
        // indiriyoruz; ayni dakika icindeki tekrar ziyaretler yine onbellekten.
        const bucket = Math.floor(Date.now() / 60000);
        app.src = `${EMBED_URL}?v=${bucket}`;
    }

    let appliedClass = null;

    function applyHeight(rawHeight) {
        const next = heightClassFor(rawHeight);
        if (next === appliedClass) return;
        try {
            if (appliedClass) page.customClassList.remove(appliedClass);
            page.customClassList.add(next);
            appliedClass = next;
        } catch (error) {
            // customClassList her breakpoint'te hazir olmayabilir; bir sonraki
            // yukseklik mesajinda tekrar denenecek.
        }
    }

    // Urun kartlarinin verisi Wix Restaurants menusunden geliyor.
    // Iframe baska bir origin'de oldugu icin Wix API'lerini kendisi
    // cagiramiyor; veriyi burada okuyup postMessage ile gonderiyoruz.
    let products = null;
    let iframeAlive = false;

    function pushProducts() {
        if (!iframeAlive || !products || !products.length) return;
        try {
            app.postMessage({ type: 'kuzelaProducts', items: products });
        } catch (error) {
            // Iframe henuz hazir degilse bir sonraki mesajinda tekrar denenecek.
        }
    }

    getHighlights()
        .then((result) => {
            const list = (result && result.items) || [];
            if (!list.length) {
                // Yedek liste gosterilecek; sebebi sessizce kaybolmasin.
                console.warn('[kuzela] menu okunamadi:', (result && result.errors) || result);
                return;
            }
            // Teshis: hangi kod surumunun yayinda oldugu ve secimin nasil
            // yapildigi gorunsun (bolum sirasi tutmazsa secim rastgelelesiyor).
            console.log('[kuzela] menu yuklendi:', result.used, JSON.stringify(result.stages || {}));
            products = list;
            pushProducts();
        })
        .catch((error) => {
            console.warn('[kuzela] menu cagrisi basarisiz:', (error && error.message) || error);
        });

    app.onMessage((event) => {
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        // Iframe'den herhangi bir mesaj gelmesi yuklendigini kanitliyor.
        iframeAlive = true;
        pushProducts();

        if (data.type === 'kuzelaReady') return;

        if (data.type === 'kuzelaHomeHeight') {
            const height = Number(data.height);
            if (Number.isFinite(height) && height > 0) applyHeight(height);
            return;
        }

        if (data.type === 'kuzelaNavigate') {
            // Kartlar iframe icinde target="_top" ile calisiyordu ama Wix'in
            // sandbox'li iframe'i ust pencereye gitmeye izin vermiyor, bu
            // yuzden tiklayinca hicbir sey olmuyordu. Gezinmeyi burada
            // yapiyoruz. Sadece bu sitenin kendi adreslerine izin veriliyor.
            navigateTo(data.url);
            return;
        }

        if (data.type === 'kuzelaScrollTo') {
            // Iframe icindeki "#menu" gibi baglantilar Wix sayfasini kaydirmali.
            const offset = Math.max(0, Math.round(Number(data.top) || 0));
            app.scrollTo()
                .then(() => wixWindow.getBoundingRect())
                .then((rect) => wixWindow.scrollTo(0, rect.scrollOffset.y + offset))
                .catch(() => {
                    // Kaydirma basarisiz olursa sayfa oldugu yerde kalsin.
                });
        }
    });

    // Iframe biz dinlemeye baslamadan once mesaj gondermis olabilir:
    // yuksekligi birkac kez tekrar iste.
    [400, 1200, 2500, 5000].forEach((ms) => {
        setTimeout(() => {
            try {
                app.postMessage({ type: 'kuzelaAskHeight' });
            } catch (error) {
                // Iframe henuz hazir degilse sonraki deneme yakalar.
            }
        }, ms);
    });
});
