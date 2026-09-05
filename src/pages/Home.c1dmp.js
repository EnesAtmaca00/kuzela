import wixWindow from 'wix-window';
import { getHighlights } from 'backend/menu.web';

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

const HEIGHT_STEP = 100;
const MIN_HEIGHT = 1000;
const MAX_HEIGHT = 12000;

function heightClassFor(rawHeight) {
    const clamped = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(rawHeight)));
    const stepped = Math.ceil(clamped / HEIGHT_STEP) * HEIGHT_STEP;
    return `kz-h-${stepped}`;
}

$w.onReady(function () {
    const app = $w('#html1');
    const page = $w('#page1');

    if (typeof app.show === 'function') app.show();
    if (typeof app.expand === 'function') app.expand();

    // global.css'teki "kapsayicilar icerige sarilsin" blogu bu sinifa bakiyor.
    // Olmazsa dar ekranda bolum, editorden gelen sabit yuksekligi koruyup
    // sayfanin altinda kocaman bir bosluk birakiyor.
    try {
        page.customClassList.add('kz-embed-page');
    } catch (error) {
        // customClassList her breakpoint'te hazir olmayabilir.
    }

    // Sayfada tek kaydirma cubugu olsun diye iframe'in kendi scroll'u olmamali.
    // Bunu `app.scrolling` ile yapmiyoruz: `src` ile ayni anda atandiginda Wix
    // iframe'i bazen hic olusturmuyor (kapsayici bos kaliyor). Bunun yerine
    // kz-h-* sinifi yuksekligi her zaman YUKARI yuvarliyor, boylece iframe
    // icerikten asla kisa kalmiyor ve tasma olmadigi icin scroll cikmiyor.
    if (EMBED_URL) {
        app.src = EMBED_URL;
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
        .then((list) => {
            if (!Array.isArray(list) || !list.length) return;
            products = list;
            pushProducts();
        })
        .catch(() => {
            // Menu okunamazsa iframe kendi yedek listesini gostermeye devam eder.
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
