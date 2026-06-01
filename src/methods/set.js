import { getCurrentFile } from '../utils/storeAccess.js';
import Store from '../store';

function setluckysheet_select_save(v) {
    Store.selections = v;
}

function setluckysheet_scroll_status(v) {
    Store.luckysheet_scroll_status = v;
}

function setluckysheetfile(d) {
    Store.luckysheetfile = d;
}

function setconfig(v) {
    Store.config = v;

    if(Store.luckysheetfile != null){
        getCurrentFile().config = v;
    }
}

function setvisibledatarow(v) {
    Store.visibledatarow = v;

    if(Store.luckysheetfile != null){
        getCurrentFile().visibledatarow = v;
    }
}

function setvisibledatacolumn(v) {
    Store.visibleColPositions = v;

    if(Store.luckysheetfile != null){
        getCurrentFile().visibledatacolumn = v;
    }
}

export {
    setluckysheet_select_save,
    setluckysheet_scroll_status,
    setluckysheetfile,
    setconfig,
    setvisibledatarow,
    setvisibledatacolumn,
}