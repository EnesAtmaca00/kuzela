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
    addClassToType('Section', 'kz-section');
    addClassToType('Button', 'kz-button');
    addClassToType('Image', 'kz-image');
    addClassToType('Box', 'kz-card');

    const sections = $w('Section');
    if (Array.isArray(sections) && sections.length > 0 && sections[0]?.customClassList?.add) {
        sections[0].customClassList.add(['kz-hero']);
    }

    const texts = $w('Text');
    if (Array.isArray(texts)) {
        texts.slice(0, 3).forEach((text, index) => {
            if (!text?.customClassList?.add) return;
            text.customClassList.add([index === 0 ? 'kz-reveal' : 'kz-reveal-delay']);
        });
    }
});
