function selectAll(type) {
    try {
        const elements = $w(type);
        return Array.isArray(elements) ? elements : [];
    } catch (error) {
        return [];
    }
}

function collapseAll(type, keepIds = []) {
    selectAll(type).forEach((element) => {
        if (!keepIds.includes(element.id) && typeof element.collapse === 'function') {
            element.collapse();
        }
    });
}

$w.onReady(function () {
    ['Text', 'Button', 'Image', 'Box', 'CustomElement'].forEach((type) => collapseAll(type));
    collapseAll('HtmlComponent', ['html1']);

    const embed = $w('#html1');
    if (typeof embed.show === 'function') embed.show();
    if (typeof embed.expand === 'function') embed.expand();
});
