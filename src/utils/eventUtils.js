export function bindNamespacedEvent(selector, event, namespace, handler, filter) {
    let $el = (typeof selector === 'string') ? $(selector) : selector;
    let eventStr = event + "." + namespace;
    $el.off(eventStr);
    if (filter) {
        $el.on(eventStr, filter, handler);
    } else {
        $el.on(eventStr, handler);
    }
}

export function unbindNamespacedEvent(selector, event, namespace) {
    let $el = (typeof selector === 'string') ? $(selector) : selector;
    $el.off(event + "." + namespace);
}
