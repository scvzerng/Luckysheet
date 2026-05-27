let refreshCanvasTimeOut;

function getRefreshCanvasTimeOut() {
    return refreshCanvasTimeOut;
}

function setRefreshCanvasTimeOut(value) {
    refreshCanvasTimeOut = value;
}

function clearRefreshCanvasTimeOut() {
    clearTimeout(refreshCanvasTimeOut);
    refreshCanvasTimeOut = undefined;
}

export { getRefreshCanvasTimeOut, setRefreshCanvasTimeOut, clearRefreshCanvasTimeOut };
