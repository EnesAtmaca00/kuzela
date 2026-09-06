import { items, menus, sections } from '@wix/restaurants';

/*
 * Ana sayfadaki urun kartlarinin verisi.
 *
 * Kartlar eskiden HTML'e elle yazilmisti; menude fiyat degisince ana sayfa
 * eski fiyati gostermeye devam ediyordu. Artik veri dogrudan Wix Restaurants
 * menusunden geliyor.
 *
 * Menu okumak yukseltilmis izin istiyor. Hangi elevate sarmalayicisinin
 * kullanilacagini cagiran taraf veriyor (bkz. menu.web.js), boylece bu dosya
 * izin mekanizmasindan bagimsiz kaliyor ve test edilebiliyor.
 */

const HIGHLIGHT_COUNT = 6;

/*
 * Bir bolumde birden fazla uygun urun varsa hangisinin one cikacagi.
 * Sira onemli: listedeki ilk eslesme kazanir. Once tam isim, sonra parcali
 * eslesme araniyor - "Coca-Cola" yazinca "Coca-Cola zero" secilmiyor.
 *
 * Menu panelindeki "featured" isareti bundan once geliyor, yani restoran
 * isterse secimi buraya dokunmadan panelden degistirebilir. Icecek bolumunde
 * varsayilan olarak Spa blauw geliyordu; ana sayfada cola tercih ediliyor.
 */
const PREFERRED_ITEM_NAMES = ['Coca-Cola'];

function preferredChoice(candidates) {
    for (const wanted of PREFERRED_ITEM_NAMES) {
        const target = wanted.toLowerCase();
        const exact = candidates.find((item) => (item.name || '').toLowerCase() === target);
        if (exact) return exact;
        const partial = candidates.find((item) => (item.name || '').toLowerCase().includes(target));
        if (partial) return partial;
    }
    return null;
}

function priceText(priceInfo) {
    if (!priceInfo) return '';
    if (priceInfo.formattedPrice) return priceInfo.formattedPrice;
    // formattedPrice her ortamda gelmiyor; ham fiyat varsa kendimiz yaziyoruz.
    const raw = Number(priceInfo.price);
    return Number.isFinite(raw) ? `€${raw.toFixed(2)}` : '';
}

function formattedPrice(item) {
    const direct = priceText(item && item.priceInfo);
    if (direct) return direct;

    // Bazi urunlerin tek fiyati yok, varyantlari var (orn. Wings 4/8/12 st).
    const variants = (item && item.priceVariants && item.priceVariants.variants) || [];
    for (const variant of variants) {
        const price = priceText(variant && variant.priceInfo);
        if (price) return `vanaf ${price}`;
    }
    return '';
}

const MEDIA_BASE = 'https://static.wixstatic.com/media/';

// Gorsel alani ortama gore uc farkli bicimde gelebiliyor: REST'te {url,...}
// nesnesi, SDK'da duz medya kimligi, Velo'da ise "wix:image://v1/<id>/..."
// URI'si. Ucunu de tek bir adrese ceviriyoruz.
function imageUrl(item) {
    const image = item && item.image;
    if (!image) return '';

    if (typeof image === 'object') {
        if (image.url) return image.url;
        return image.id ? MEDIA_BASE + image.id : '';
    }

    const raw = String(image);
    if (!raw) return '';
    if (raw.indexOf('http') === 0) return raw;
    if (raw.indexOf('wix:image://') === 0) {
        const parts = raw.replace('wix:image://', '').split('/');
        // "v1/<mediaId>/<dosyaadi>#..." -> mediaId
        const mediaId = parts[0] === 'v1' ? parts[1] : parts[0];
        return mediaId ? MEDIA_BASE + mediaId.split('#')[0] : '';
    }
    return MEDIA_BASE + raw;
}

function imageAlt(item) {
    const image = item && item.image;
    if (image && typeof image === 'object' && image.altText) return image.altText;
    return (item && item.name) || '';
}

function isEligible(item) {
    if (!item) return false;
    if (item.visible === false) return false;
    if (item.orderSettings && item.orderSettings.inStock === false) return false;
    if (!imageUrl(item)) return false;
    return Boolean(formattedPrice(item));
}

function toCard(item) {
    return {
        id: item.id || '',
        name: item.name || '',
        note: (item.description || '').trim(),
        price: formattedPrice(item),
        image: imageUrl(item),
        alt: imageAlt(item)
    };
}

export async function loadHighlights(wrap, stages) {
    const note = (key, value) => {
        if (stages) stages[key] = value;
    };

    const listMenus = wrap(menus.listMenus);
    const listSections = wrap(sections.listSections);
    const listItems = wrap(items.listItems);

    const menusResponse = await listMenus({ onlyVisible: true });
    const menuList = (menusResponse && menusResponse.menus) || [];
    note('menus', menuList.length);
    const menu = menuList.find((entry) => entry.visible !== false) || menuList[0];
    if (!menu) return [];

    const sectionIds = (menu.sectionIds || []).filter(Boolean);
    note('sectionIds', sectionIds.length);
    if (!sectionIds.length) return [];

    // sectionIds/itemIds filtresi bu SDK'da bos sonuc donduruyor (menu 8 bolum
    // bildiriyor ama filtreli cagri 0 bolum getiriyordu). Hepsini cekip id ile
    // eslestirmek hem calisiyor hem de bu menu icin ucuz: 8 bolum, 38 urun.
    const sectionsResponse = await listSections({ paging: { limit: 100 } });
    const sectionList = (sectionsResponse && sectionsResponse.sections) || [];
    note('sectionsFetched', sectionList.length);
    const sectionById = new Map(sectionList.map((s) => [s.id, s]));

    // Bolumleri menudeki siraya gore geziyoruz; listSections sirayi korumuyor.
    // Menudeki sirayi kullanmayi tercih ediyoruz. Id'ler eslesmezse
    // (SDK menu.sectionIds ile bolum id'lerini farkli bicimde donduruyor
    // olabilir) gelen sirayla devam ediyoruz - sira ideal olmasa da sayfa
    // calisir kaliyor.
    let orderedSections = sectionIds.map((id) => sectionById.get(id)).filter(Boolean);
    note('matchedByMenuOrder', orderedSections.length);
    if (!orderedSections.length) {
        orderedSections = sectionList;
        note('orderFallback', true);
        note('sampleMenuSectionId', String(sectionIds[0] || ''));
        note('sampleSectionId', String((sectionList[0] || {}).id || ''));
    }
    note('sections', orderedSections.length);

    const itemIds = [];
    for (const section of orderedSections) {
        for (const id of section.itemIds || []) {
            if (id && !itemIds.includes(id)) itemIds.push(id);
        }
    }
    note('itemIds', itemIds.length);
    if (!itemIds.length) return [];

    const itemsResponse = await listItems({ paging: { limit: 500 }, onlyVisible: true });
    const itemList = (itemsResponse && itemsResponse.items) || [];
    note('items', itemList.length);
    note('eligible', itemList.filter(isEligible).length);
    const itemById = new Map(itemList.map((item) => [item.id, item]));

    // Bolum basina en fazla bir urun: ana sayfada cesitlilik olsun.
    // Bolum icinde "featured" isaretli urun varsa o secilir, boylece hangi
    // urunun one cikacagini restoran menu panelinden belirleyebiliyor.
    // Urun kimligi her ortamda gelmiyor (bolumler id'siz donuyor), bu yuzden
    // tekrar kontrolu isim uzerinden yapiliyor.
    const keyOf = (item) => item.id || item.name || '';

    const picked = [];
    const pickedKeys = new Set();

    for (const section of orderedSections) {
        const candidates = (section.itemIds || [])
            .map((id) => itemById.get(id))
            .filter(isEligible);
        if (!candidates.length) continue;
        const choice = candidates.find((item) => item.featured)
            || preferredChoice(candidates)
            || candidates[0];
        if (pickedKeys.has(keyOf(choice))) continue;
        picked.push(choice);
        pickedKeys.add(keyOf(choice));
        if (picked.length >= HIGHLIGHT_COUNT) break;
    }

    note('pickedBySection', picked.length);

    // Bolum basina secim yetmezse (veya bolum-urun eslesmesi hic tutmazsa)
    // dogrudan urun listesinden tamamla.
    if (picked.length < HIGHLIGHT_COUNT) {
        for (const item of itemList) {
            if (picked.length >= HIGHLIGHT_COUNT) break;
            if (!isEligible(item)) continue;
            if (pickedKeys.has(keyOf(item))) continue;
            picked.push(item);
            pickedKeys.add(keyOf(item));
        }
    }

    note('picked', picked.length);
    return picked.map(toCard);
}
