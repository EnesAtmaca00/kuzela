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

function formattedPrice(item) {
    const direct = item && item.priceInfo && item.priceInfo.formattedPrice;
    if (direct) return direct;

    // Bazi urunlerin tek fiyati yok, varyantlari var (orn. Wings 4/8/12 st).
    const variants = (item && item.priceVariants && item.priceVariants.variants) || [];
    for (const variant of variants) {
        const price = variant && variant.priceInfo && variant.priceInfo.formattedPrice;
        if (price) return `vanaf ${price}`;
    }
    return '';
}

function isEligible(item) {
    if (!item) return false;
    if (item.visible === false) return false;
    if (item.orderSettings && item.orderSettings.inStock === false) return false;
    if (!item.image || !item.image.url) return false;
    return Boolean(formattedPrice(item));
}

function toCard(item) {
    return {
        id: item.id,
        name: item.name || '',
        note: (item.description || '').trim(),
        price: formattedPrice(item),
        image: item.image.url,
        alt: item.image.altText || item.name || ''
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
    const orderedSections = sectionIds.map((id) => sectionById.get(id)).filter(Boolean);
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
    const picked = [];
    const pickedIds = new Set();

    for (const section of orderedSections) {
        const candidates = (section.itemIds || [])
            .map((id) => itemById.get(id))
            .filter(isEligible);
        if (!candidates.length) continue;
        const choice = candidates.find((item) => item.featured) || candidates[0];
        if (pickedIds.has(choice.id)) continue;
        picked.push(choice);
        pickedIds.add(choice.id);
        if (picked.length >= HIGHLIGHT_COUNT) break;
    }

    // Bolum sayisi yetmezse menu sirasiyla tamamla.
    if (picked.length < HIGHLIGHT_COUNT) {
        for (const id of itemIds) {
            if (picked.length >= HIGHLIGHT_COUNT) break;
            if (pickedIds.has(id)) continue;
            const item = itemById.get(id);
            if (!isEligible(item)) continue;
            picked.push(item);
            pickedIds.add(id);
        }
    }

    return picked.map(toCard);
}
