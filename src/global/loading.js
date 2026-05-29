export function showloading(txt) {
    const _elLoading = document.getElementById("luckysheet-cell-loading"); if (_elLoading) { const _span = _elLoading.querySelector("span"); if (_span) _span.textContent = txt; _elLoading.style.display = ''; }
};

export function hideloading() {
    const _elLoading = document.getElementById("luckysheet-cell-loading"); if (_elLoading) _elLoading.style.display = 'none';
};