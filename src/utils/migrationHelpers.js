const _nsHandlers = new Map();

export function onNS(target, eventNs, selector, handler) {
    if (!target) return;
    const dotIndex = eventNs.indexOf('.');
    const event = dotIndex === -1 ? eventNs : eventNs.substring(0, dotIndex);
    const namespace = dotIndex === -1 ? '' : eventNs.substring(dotIndex + 1);
    const delegateHandler = selector
        ? function(e) {
            const t = e.target?.closest?.(selector);
            if (t && target.contains(t)) handler.call(t, e);
        }
        : handler;
    const key = namespace || event;
    if (!_nsHandlers.has(key)) _nsHandlers.set(key, []);
    _nsHandlers.get(key).push({ event, original: handler, delegate: delegateHandler, target });
    target.addEventListener(event, delegateHandler);
}

export function offNS(namespace) {
    if (!_nsHandlers.has(namespace)) return;
    _nsHandlers.get(namespace).forEach(({ event, delegate, target }) => {
        target.removeEventListener(event, delegate);
    });
    _nsHandlers.delete(namespace);
}

export function deepMerge(target, ...sources) {
    for (const source of sources) {
        if (source === null || typeof source !== 'object') continue;
        for (const key of Object.keys(source)) {
            const tv = target[key], sv = source[key];
            if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
                if (tv && typeof tv === 'object' && !Array.isArray(tv)) {
                    deepMerge(tv, sv);
                } else {
                    target[key] = deepMerge({}, sv);
                }
            } else {
                target[key] = sv;
            }
        }
    }
    return target;
}

export function filterVisible(nodeList) {
    return Array.from(nodeList).filter(el => el.offsetWidth > 0 && el.offsetHeight > 0);
}
