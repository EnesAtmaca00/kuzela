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
    for (const [, wrap] of WRAPPERS) {
        try {
            const cards = await loadHighlights(wrap);
            if (cards.length) return cards;
        } catch (error) {
            // Sonraki sarmalayiciyi dene.
        }
    }
    return [];
});
