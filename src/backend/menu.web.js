import { Permissions, webMethod } from 'wix-web-module';
import { elevate } from 'wix-auth';
import { items, menus, sections } from '@wix/restaurants';

/*
 * Ana sayfadaki urun kartlarinin verisi.
 *
 * Kartlar eskiden HTML'e elle yazilmisti; menude fiyat degisince ana sayfa
 * eski fiyati gostermeye devam ediyordu. Artik veri dogrudan Wix Restaurants
 * menusunden geliyor.
 *
 * Menu okumak "Manage Restaurants" izni istedigi icin cagrilar elevate ile
 * yapiliyor; disari yalnizca ziyaretcinin zaten sipariş sayfasinda gordugu
 * alanlar (ad, aciklama, fiyat, gorsel) donuyor.
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

export const getHighlights = webMethod(Permissions.Anyone, async () => {
    const listMenus = elevate(menus.listMenus);
    const listSections = elevate(sections.listSections);
    const listItems = elevate(items.listItems);

    const menusResponse = await listMenus({ onlyVisible: true });
    const menuList = (menusResponse && menusResponse.menus) || [];
    const menu = menuList.find((entry) => entry.visible !== false) || menuList[0];
    if (!menu) return [];

    const sectionIds = (menu.sectionIds || []).filter(Boolean);
    if (!sectionIds.length) return [];

    const sectionsResponse = await listSections({ sectionIds });
    const sectionById = new Map(
        ((sectionsResponse && sectionsResponse.sections) || []).map((s) => [s.id, s])
    );

    // Bolumleri menudeki siraya gore geziyoruz; listSections sirayi korumuyor.
    const orderedSections = sectionIds.map((id) => sectionById.get(id)).filter(Boolean);

    const itemIds = [];
    for (const section of orderedSections) {
        for (const id of section.itemIds || []) {
            if (id && !itemIds.includes(id)) itemIds.push(id);
        }
    }
    if (!itemIds.length) return [];

    const itemsResponse = await listItems({ itemIds, onlyVisible: true });
    const itemById = new Map(
        ((itemsResponse && itemsResponse.items) || []).map((item) => [item.id, item])
    );

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
});
