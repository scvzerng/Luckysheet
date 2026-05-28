import selection from '../controllers/selection';
import menuButton from '../controllers/menuButton';
import rightClickMenu from '../ui/rightClickMenu.js';
import cellSelectedFocus from '../ui/cellSelectedFocus.js';
import countShow from '../ui/countShow.js';
import resizeHandles from '../ui/resizeHandles.js';

export default function cleargridelement(event) {
    resizeHandles.colHover.hide();
    rightClickMenu.hide();

    $("#luckysheet-cell-selected-boxs .luckysheet-cell-selected").hide();
    $("#luckysheet-cols-h-selected .luckysheet-cols-h-selected").hide();
    $("#luckysheet-rows-h-selected .luckysheet-rows-h-selected").hide();

    cellSelectedFocus.hide();
    resizeHandles.rowHover.hide();
    $("#luckysheet-selection-copy .luckysheet-selection-copy").hide();
    $("#luckysheet-cols-menu-btn").hide();
    $("#luckysheet-row-count-show, #luckysheet-column-count-show").hide();
    if (!event) {
        selection.clearcopy(event);
    }
    //else{
    //	selection.clearcopy();
    //}

    //选区下拉icon隐藏
    if($("#luckysheet-dropCell-icon").is(":visible")){
        if(event){
            $("#luckysheet-dropCell-icon").remove();
        }
    }
    //格式刷
    if(menuButton.luckysheetPaintModelOn && !event){
        menuButton.cancelPaintModel();
    }
}