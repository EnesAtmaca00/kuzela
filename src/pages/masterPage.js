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

function collapseById(id) {
    try {
        const element = $w(id);
        if (typeof element.collapse === 'function') element.collapse();
    } catch (error) {
        // The template can rename structural sections between editor versions.
    }
}

$w.onReady(function () {
    collapseAll('Header');
    collapseAll('Footer');
    collapseById('#section3');
    collapseById('#section4');

    ['Text', 'Menu', 'Image', 'Button'].forEach((type) => collapseAll(type));
});
