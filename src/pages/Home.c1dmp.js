const ORDER_URL = 'https://kuzelathebowlhouse.itsready.be/nl';

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

function setIfPresent(element, prop, value) {
    if (element && prop in element) {
        element[prop] = value;
    }
}

function wireLinks(elements) {
    elements.forEach((element) => {
        setIfPresent(element, 'link', ORDER_URL);
        setIfPresent(element, 'target', '_self');
    });
}

$w.onReady(function () {
    const sections = addClassToType('Section', 'kz-section');
    const buttons = addClassToType('Button', 'kz-button');
    const images = addClassToType('Image', 'kz-image');
    const boxes = addClassToType('Box', 'kz-card');
    const texts = $w('Text');

    const textUpdates = [
        'Jouw bowl. Jouw smaak.',
        'Verse pokébowls, wraps, quesadilla’s en wings in Laakdal. Stel je favoriet samen, bestel online en geniet zonder gedoe.'
    ];

    if (Array.isArray(texts)) {
        texts.forEach((text, index) => {
            if (textUpdates[index]) setIfPresent(text, 'text', textUpdates[index]);
            if (index === 0) addClass(text, 'kz-editorial');
            if (index < 2) addClass(text, index === 0 ? 'kz-reveal' : 'kz-reveal-delay');
        });
    }

    if (sections.length) {
        addClass(sections[0], 'kz-hero');
        if (sections[1]) addClass(sections[1], 'kz-panel');
        if (sections[2]) addClass(sections[2], 'kz-menu-zone');
        if (sections[3]) addClass(sections[3], 'kz-story-zone');
        if (sections.length > 4) addClass(sections[sections.length - 1], 'kz-final-zone');
    }

    buttons.forEach((button, index) => {
        if (index === 0) setIfPresent(button, 'label', 'Bestel online');
        addClass(button, 'kz-reveal-delay');
    });
    wireLinks(buttons);

    images.slice(0, 4).forEach((image) => addClass(image, 'kz-reveal'));
    boxes.slice(0, 6).forEach((box) => addClass(box, 'kz-reveal-delay'));
});
