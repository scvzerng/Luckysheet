const _namespacedHandlers = new Map();

export function bindNamespacedEvent(selector, event, namespace, handler, filter) {
    let el = (typeof selector === 'string') ? document.querySelector(selector) : selector;
    if (!el) return;
    let key = event + "." + namespace;

    if (_namespacedHandlers.has(el) && _namespacedHandlers.get(el).has(key)) {
        let oldHandler = _namespacedHandlers.get(el).get(key);
        el.removeEventListener(event, oldHandler);
    }

    let wrappedHandler = filter
        ? function(e) {
            let target = e.target?.closest?.(filter);
            if (!target) return;
            handler.call(target, e);
        }
        : handler;

    if (!_namespacedHandlers.has(el)) {
        _namespacedHandlers.set(el, new Map());
    }
    _namespacedHandlers.get(el).set(key, wrappedHandler);
    el.addEventListener(event, wrappedHandler);
}

export function unbindNamespacedEvent(selector, event, namespace) {
    let el = (typeof selector === 'string') ? document.querySelector(selector) : selector;
    if (!el) return;
    let key = event + "." + namespace;

    if (_namespacedHandlers.has(el) && _namespacedHandlers.get(el).has(key)) {
        let handler = _namespacedHandlers.get(el).get(key);
        el.removeEventListener(event, handler);
        _namespacedHandlers.get(el).delete(key);
    }
}
