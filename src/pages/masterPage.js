function addClassToType(type, className) {
    const elements = $w(type);
    if (!Array.isArray(elements)) return;

    elements.forEach((element) => {
        if (element?.customClassList?.add) {
            element.customClassList.add([className]);
        }
    });
}

$w.onReady(function () {
    addClassToType('Button', 'kz-button');
    addClassToType('Image', 'kz-image');
});
