import selection from '../controllers/selection';
import menuButton from '../controllers/menuButton';
import rightClickMenu from '../ui/rightClickMenu.js';
import cellSelectedFocus from '../ui/cellSelectedFocus.js';
import countShow from '../ui/countShow.js';
import resizeHandles from '../ui/resizeHandles.js';
import selectionCopy from '../ui/selectionCopy.js';

export default function cleargridelement(event) {
    resizeHandles.colHover.hide();
    rightClickMenu.hide();

    document.querySelectorAll("#luckysheet-cell-selected-boxs .luckysheet-cell-selected").forEach(el => el.style.display = 'none');
    document.querySelectorAll("#luckysheet-cols-h-selected .luckysheet-cols-h-selected").forEach(el => el.style.display = 'none');
    document.querySelectorAll("#luckysheet-rows-h-selected .luckysheet-rows-h-selected").forEach(el => el.style.display = 'none');

    cellSelectedFocus.hide();
    resizeHandles.rowHover.hide();
    selectionCopy.el.find(".luckysheet-selection-copy").hide();
    const _elColsMenuBtn = document.getElementById("luckysheet-cols-menu-btn"); if (_elColsMenuBtn) _elColsMenuBtn.style.display = 'none';
    countShow.row.hide();
    countShow.column.hide();
    if (!event) {
        selection.clearcopy(event);
    }
    //else{
    //	selection.clearcopy();
    //}

    //选区下拉icon隐藏
    const _elDropCell = document.getElementById("luckysheet-dropCell-icon");
    if(_elDropCell && _elDropCell.offsetWidth > 0){
        if(event){
            _elDropCell.remove();
        }
    }
    //格式刷
    if(menuButton.luckysheetPaintModelOn && !event){
        menuButton.cancelPaintModel();
    }
}