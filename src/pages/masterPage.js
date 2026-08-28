function selectAll(type) {
    try {
        const elements = $w(type);
        return Array.isArray(elements) ? elements : [];
    } catch (error) {
        return [];
    }
}

function collapseAll(type) {
    selectAll(type).forEach((element) => {
        if (typeof element.collapse === 'function') {
            element.collapse();
        }
    });
}

$w.onReady(function () {
    collapseAll('Header');
    collapseAll('Footer');

    ['Text', 'Menu', 'Image', 'Button'].forEach((type) => collapseAll(type));
});
