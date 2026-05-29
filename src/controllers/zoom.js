import { onNS, offNS } from '../utils/migrationHelpers.js';
import Store from '../store';
import sheetmanage from './sheetmanage';
import {changeSheetContainerSize} from './resize';
import { jfrefreshgrid_rhcw } from '../global/refresh';
import luckysheetPostil from './postil';
import imageCtrl from './imageCtrl';



let luckysheetZoomTimeout = null;

export function zoomChange(ratio){
    if(Store.flowdata==null || Store.flowdata.length==0){
        return;
    }

    clearTimeout(luckysheetZoomTimeout);
    luckysheetZoomTimeout = setTimeout(() => {
        if (Store.clearjfundo) {
            Store.jfredo.push({ 
                "type": "zoomChange", 
                "zoomRatio": Store.zoomRatio, 
                "curZoomRatio": ratio, 
                "sheetIndex": Store.currentSheetIndex, 
            });
        }
        currentWheelZoom = null;
        Store.zoomRatio = ratio;

        let currentSheet = sheetmanage.getSheetByIndex();

        luckysheetPostil.buildAllPs(currentSheet.data);

        imageCtrl.images = currentSheet.images;
        imageCtrl.allImagesShow();
        imageCtrl.init();

        if(currentSheet.config==null){
            currentSheet.config = {};
        }
    
        if(currentSheet.config.sheetViewZoom==null){
            currentSheet.config.sheetViewZoom = {};
        }

        let type = currentSheet.config.curentsheetView;
        if(type==null){
            type = "viewNormal";
        }
        currentSheet.config.sheetViewZoom[type+"ZoomScale"] = ratio;
    

        zoomRefreshView();
    }, 100);
    
}

export function zoomRefreshView(){
    jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    changeSheetContainerSize();
}

let currentWheelZoom = null;
export function zoomInitial(){

    const ZOOM_WHEEL_STEP = 0.02;
    const ZOOM_STEP = 0.1;
    
    const MAX_ZOOM_RATIO = 4;
    const MIN_ZOOM_RATIO = .1;
    
    document.getElementById("luckysheet-zoom-minus").addEventListener("click", function(){
        let currentRatio;
        if(Store.zoomRatio==null){
            currentRatio = Store.zoomRatio = 1;
        }
        else{
            currentRatio = Math.ceil(Store.zoomRatio*10)/10;
        }

        currentRatio = currentRatio-ZOOM_STEP;

        if(currentRatio==Store.zoomRatio){
            currentRatio = currentRatio-ZOOM_STEP;
        }

        if(currentRatio<=MIN_ZOOM_RATIO){
            currentRatio = MIN_ZOOM_RATIO;
        }

        zoomChange(currentRatio);
        zoomNumberDomBind(currentRatio);
    });

    document.getElementById("luckysheet-zoom-plus").addEventListener("click", function(){
        let currentRatio;
        if(Store.zoomRatio==null){
            currentRatio = Store.zoomRatio = 1;
        }
        else{
            currentRatio = Math.floor(Store.zoomRatio*10)/10;
        }

        currentRatio = currentRatio+ZOOM_STEP;

        if(currentRatio==Store.zoomRatio){
            currentRatio = currentRatio+ZOOM_STEP;
        }

        if(currentRatio>=MAX_ZOOM_RATIO){
            currentRatio = MAX_ZOOM_RATIO;
        }

        zoomChange(currentRatio);
        zoomNumberDomBind(currentRatio);
    });

    document.getElementById("luckysheet-zoom-slider").addEventListener("mousedown", function(e){
        let xoffset = this.getBoundingClientRect().left + window.pageXOffset, pageX = e.pageX;

        let currentRatio = positionToRatio(pageX-xoffset);
        zoomChange(currentRatio);
        zoomNumberDomBind(currentRatio);
    });

    let _elZoomCursor = document.getElementById("luckysheet-zoom-cursor");
    _elZoomCursor.addEventListener("mousedown", function(e){
        let curentX = e.pageX, cursorLeft = parseFloat(_elZoomCursor.style.left);
        _elZoomCursor.style.transition = "none";
        offNS("zoomCursor");
        onNS(document, "mousemove.zoomCursor", null, function(event){
            let moveX = event.pageX;
            let offsetX = moveX - curentX;
            let pos = cursorLeft + offsetX; 
            let currentRatio = positionToRatio(pos);

            if(currentRatio>MAX_ZOOM_RATIO){
                currentRatio = MAX_ZOOM_RATIO;
                pos = 100;
            }

            if(currentRatio<MIN_ZOOM_RATIO){
                currentRatio = MIN_ZOOM_RATIO;
                pos = 0;
            }

            zoomChange(currentRatio);
            let r = Math.round(currentRatio*100) + "%";
            const _el = document.getElementById("luckysheet-zoom-ratioText"); if (_el) _el.innerHTML = r;
            _elZoomCursor.style.left = (pos-4) + "px";
        });

        offNS("zoomCursor");
        onNS(document, "mouseup.zoomCursor", null, function(event){
            offNS("zoomCursor");
            _elZoomCursor.style.transition = "all 0.3s";
        });

        e.stopPropagation();
    });
    _elZoomCursor.addEventListener("click", function(e){
        e.stopPropagation();
    });

    document.getElementById("luckysheet-zoom-ratioText").addEventListener("click", function(){
        zoomChange(1);
        zoomNumberDomBind(1);
    });

    zoomNumberDomBind(Store.zoomRatio);

    currentWheelZoom = null;
    document.addEventListener(
        'wheel',
        function (ev) {
            if (!ev.ctrlKey || !ev.deltaY) {
                return;
            }
            if (currentWheelZoom === null) {
                currentWheelZoom = Store.zoomRatio || 1;
            }
            currentWheelZoom += ev.deltaY < 0 ? ZOOM_WHEEL_STEP : -ZOOM_WHEEL_STEP;
            if (currentWheelZoom >= MAX_ZOOM_RATIO) {
                currentWheelZoom = MAX_ZOOM_RATIO;
            } else if (currentWheelZoom < MIN_ZOOM_RATIO) {
                currentWheelZoom = MIN_ZOOM_RATIO;
            }
            zoomChange(currentWheelZoom);
            zoomNumberDomBind(currentWheelZoom);
            ev.preventDefault();
            ev.stopPropagation();
        },
        { capture: true, passive: false }
    );

    document.addEventListener(
        'keydown',
        function (ev) {
            if (!ev.ctrlKey) {
                return;
            }
            let handled = false;
            let zoom = Store.zoomRatio || 1;
            if (ev.key === '-' || ev.which === 189) {
                zoom -= ZOOM_STEP;
                handled = true;
            } else if (ev.key === '+' || ev.which === 187) {
                zoom += ZOOM_STEP;
                handled = true;
            } else if (ev.key === '0' || ev.which === 48) {
                zoom = 1;
                handled = true;
            }
    
            if (handled) {
                ev.preventDefault();
                if (zoom >= MAX_ZOOM_RATIO) {
                    zoom = MAX_ZOOM_RATIO;
                } else if (zoom < MIN_ZOOM_RATIO) {
                    zoom = MIN_ZOOM_RATIO;
                }
                zoomChange(zoom);
                zoomNumberDomBind(zoom);
            }
        },
        { capture: true }
    );
}

function positionToRatio(pos){
    let ratio = 1;
    if(pos<50){
        ratio = Math.round((pos*1.8/100 + 0.1)*100)/100;
    }
    else if(pos>50){
        ratio = Math.round(((pos-50)*6/100 + 1)*100)/100;
    }

    return ratio;
}

function zoomSlierDomBind(ratio){
    let domPos = 50;
    if(ratio<1){
        domPos = Math.round((ratio - 0.1)*100 / 0.18)/10;
    }
    else if(ratio>1){
        domPos = Math.round((ratio - 1)*100 / 0.6)/10+50;
    }
    document.getElementById("luckysheet-zoom-cursor").style.left = (domPos-4) + "px";
}

export function zoomNumberDomBind(ratio){
    let r = Math.round(ratio*100) + "%";
    const _el = document.getElementById("luckysheet-zoom-ratioText"); if (_el) _el.innerHTML = r;
    zoomSlierDomBind(ratio);
}
