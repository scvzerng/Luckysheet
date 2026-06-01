import luckysheetFreezen from '../controllers/freezen';
import { luckysheetrefreshgrid } from '../global/refresh';
import method from '../global/method'
import scrollBarX from '../ui/scrollBarX.js';
import scrollBarY from '../ui/scrollBarY.js';
import cellMain from '../ui/cellMain.js';
import inputBox from '../ui/inputBox.js';
import inputBoxIndex from '../ui/inputBoxIndex.js';
import { rowHeader, colHeader } from '../ui/rowColHeader.js';
import canvasContext from '../ui/canvasContext.js';

let scrollRequestAnimationFrameIni = true,scrollRequestAnimationFrame = false, scrollTimeOutCancel=null;

function execScroll(){
    let scrollLeft = scrollBarX.getScrollLeft(), 
        scrollTop = scrollBarY.getScrollTop();
    luckysheetrefreshgrid(scrollLeft, scrollTop);
    scrollRequestAnimationFrame = window.requestAnimationFrame(execScroll);
}

export default function luckysheetscrollevent(isadjust) {
    let scrollLeft = scrollBarX.getScrollLeft(), 
        scrollTop = scrollBarY.getScrollTop(),
        canvasHeight = canvasContext.getHeight();

    if (luckysheetFreezen.freezenhorizontaldata != null) {
        if (scrollTop < luckysheetFreezen.freezenhorizontaldata[2]) {
            scrollTop = luckysheetFreezen.freezenhorizontaldata[2];
            scrollBarY.setScrollTop(scrollTop);
            return;
        }
    }

    if (luckysheetFreezen.freezenverticaldata != null) {
        if (scrollLeft < luckysheetFreezen.freezenverticaldata[2]) {
            scrollLeft = luckysheetFreezen.freezenverticaldata[2];
            scrollBarX.setScrollLeft(scrollLeft);
            return;
        }
    }

    colHeader.setScrollLeft(scrollLeft);
    rowHeader.setScrollTop(scrollTop);
    
    cellMain.el.scrollLeft = scrollLeft;
    cellMain.el.scrollTop = scrollTop;

    inputBoxIndex.setCss({
        "left": inputBox.getCss("left"),
        "top": (parseInt(inputBox.getCss("top")) - 20) + "px",
        "z-index": inputBox.getCss("z-index")
    }).show();

    luckysheetrefreshgrid(scrollLeft, scrollTop);
    
    document.getElementById("luckysheet-bottom-controll-row").style.left = scrollLeft + "px";

    if(luckysheetFreezen.freezenhorizontaldata != null || luckysheetFreezen.freezenverticaldata != null){
        luckysheetFreezen.scrollAdapt();
    }

    if(!method.createHookFunction("scroll", {scrollLeft, scrollTop, canvasHeight})){ return; }

}
