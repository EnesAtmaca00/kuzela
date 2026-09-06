import { Permissions, webMethod } from 'wix-web-module';
import { elevate } from 'wix-auth';
import { auth } from '@wix/essentials';
import { loadHighlights } from 'backend/menu-data';

/*
 * Ana sayfa icin urun kartlari. Menu okumak yukseltilmis izin istedigi icin
 * cagrilari sarmalamamiz gerekiyor; hangi sarmalayicinin gectigi ortama gore
 * degisebildiginden sirayla deneniyor. Hicbiri calismazsa bos donuyoruz ve
 * gomulu sayfa kendi yedek listesini gosteriyor.
 */

const WRAPPERS = [
    ['essentials', (fn) => auth.elevate(fn)],
    ['wix-auth', (fn) => elevate(fn)],
    ['plain', (fn) => fn]
];

export const getHighlights = webMethod(Permissions.Anyone, async () => {
    const errors = [];
    for (const [label, wrap] of WRAPPERS) {
        const stages = {};
        try {
            const items = await loadHighlights(wrap, stages);
            if (items.length) return { items, errors, used: label, stages };
            errors.push(`${label}: bos sonuc ${JSON.stringify(stages)}`);
        } catch (error) {
            // Hata yutulmuyor: menu okunamadiginda sebebini sayfa kodu
            // konsola yaziyor, yoksa kartlar sessizce yedek listede kaliyor.
            errors.push(`${label}: ${(error && error.message) || error}`);
        }
    }
    return { items: [], errors, used: null };
});
