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
    ['Text', 'Button', 'Image', 'Box'].forEach((type) => collapseAll(type));
    collapseAll('CustomElement');
    collapseAll('HtmlComponent', ['html1']);

    const app = $w('#html1');
    if (typeof app.show === 'function') app.show();
    if (typeof app.expand === 'function') app.expand();
});
