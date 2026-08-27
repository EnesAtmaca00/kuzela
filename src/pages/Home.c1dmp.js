function addClass(element, className) {
    if (element?.customClassList?.add) {
        element.customClassList.add([className]);
    }
}

function addClassToType(type, className) {
    const elements = $w(type);
    if (!Array.isArray(elements)) return [];

    elements.forEach((element) => addClass(element, className));
    return elements;
}

$w.onReady(function () {
    const sections = addClassToType('Section', 'kz-section');
    const buttons = addClassToType('Button', 'kz-button');
    const images = addClassToType('Image', 'kz-image');
    const boxes = addClassToType('Box', 'kz-card');
    const texts = $w('Text');

    if (sections.length) {
        addClass(sections[0], 'kz-hero');
        if (sections[1]) addClass(sections[1], 'kz-panel');
        if (sections[2]) addClass(sections[2], 'kz-menu-zone');
        if (sections[3]) addClass(sections[3], 'kz-story-zone');
        if (sections.length > 4) addClass(sections[sections.length - 1], 'kz-final-zone');
    }

    if (Array.isArray(texts)) {
        texts.forEach((text, index) => {
            if (index === 0) addClass(text, 'kz-eyebrow');
            if (index === 1) addClass(text, 'kz-editorial');
            if (index < 3) addClass(text, index === 0 ? 'kz-reveal' : 'kz-reveal-delay');
        });
    }

    if (buttons[0]) addClass(buttons[0], 'kz-reveal-delay');

    // Keep image/card effects deliberately restrained: premium, not template-like.
    images.slice(0, 4).forEach((image) => addClass(image, 'kz-reveal'));
    boxes.slice(0, 6).forEach((box) => addClass(box, 'kz-reveal-delay'));
});
