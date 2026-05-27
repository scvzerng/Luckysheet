import init from "./init";
import scroll from "./scroll";
import cellEvents from "./cellEvents";
import cellDragDrop from "./cellDragDrop";
import documentMousemove from "./documentMousemove";
import documentMouseup from "./documentMouseup";
import contextMenu from "./contextMenu";
import selectionDrag from "./selectionDrag";
import bottomButtons from "./bottomButtons";
import rightClickButtons from "./rightClickButtons";
import freezeButtons from "./freezeButtons";
import globalEvents from "./globalEvents";
import formulaBarResize from "./formulaBarResize";
import pasteEvent from "./pasteEvent";
import paginationAndToolbar from "./paginationAndToolbar";

export default function luckysheetHandler() {
    init();
    scroll();
    cellEvents();
    cellDragDrop();
    documentMousemove();
    documentMouseup();
    contextMenu();
    selectionDrag();
    bottomButtons();
    rightClickButtons();
    freezeButtons();
    globalEvents();
    formulaBarResize();
    pasteEvent();
    paginationAndToolbar();
}
