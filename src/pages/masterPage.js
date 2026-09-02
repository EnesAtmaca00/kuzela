$w.onReady(function () {
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
