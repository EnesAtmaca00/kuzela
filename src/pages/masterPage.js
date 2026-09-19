import wixSeoFrontend from 'wix-seo-frontend';

// Mobil tarayicinin adres cubugu rengi (Android Chrome). Wix Studio'da bunun
// icin bir ayar yok (klasik Wix Editor'de vardi), o yuzden meta etiketini
// koddan ekliyoruz. Arama motorlarinin da gormesi icin onReady icinde.
const THEME_COLOR = '#f0c44c';

$w.onReady(function () {
    wixSeoFrontend.addMetaTags([{ name: 'theme-color', content: THEME_COLOR }])
        .catch((error) => {
            console.warn('[kuzela] tarayici rengi eklenemedi:', (error && error.message) || error);
        });

    try {
        $w('#text3').text = 'KUZELA';
    } catch (error) {
        // Header text is optional on alternate breakpoints.
    }

    try {
        $w('#text2').text = 'KUZELA THE BOWL HOUSE · Markt 23 · 2430 Laakdal · © 2026 Kuzela';
    } catch (error) {
        // Footer text is optional on alternate breakpoints.
    }
});
