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

$w.onReady(function () {
    const texts = $w('Text');
    const buttons = addClassToType('Button', 'kz-button');
    addClassToType('Image', 'kz-image');

    if (Array.isArray(texts) && texts[0]) {
        setIfPresent(texts[0], 'text', 'Kuzela The Bowl House');
    }

    buttons.forEach((button) => {
        setIfPresent(button, 'link', ORDER_URL);
        setIfPresent(button, 'target', '_self');
    });
});
