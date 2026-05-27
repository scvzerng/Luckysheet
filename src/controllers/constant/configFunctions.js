import locale from "../../locale/locale";
import Store from "../../store";
import luckysheetConfigsetting from "../luckysheetConfigsetting";

const luckysheetdefaultFont = function() {
    return (
        "normal normal normal " +
        Store.defaultFontSize +
        "pt " +
        locale().fontarray[0] +
        ', "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC",  "WenQuanYi Micro Hei", sans-serif'
    );
};

/**
 *单元格右击菜单配�?
 *
 */
function customCellRightClickConfig() {
    const config = {
        copy: true, // copy
        copyAs: true, // copy as
        paste: true, // paste
        insertRow: true, // insert row
        insertColumn: true, // insert column
        deleteRow: true, // delete the selected row
        deleteColumn: true, // delete the selected column
        deleteCell: true, // delete cell
        hideRow: true, // hide the selected row and display the selected row
        hideColumn: true, // hide the selected column and display the selected column
        rowHeight: true, // row height
        columnWidth: true, // column width
        clear: true, // clear content
        matrix: true, // matrix operation selection
        sort: true, // sort selection
        filter: true, // filter selection
        image: true, // insert picture
        link: true, // insert link
        data: true, // data verification
    };

    // cellRightClickConfig determines the final result
    if (JSON.stringify(luckysheetConfigsetting.cellRightClickConfig) !== "{}") {
        Object.assign(config, luckysheetConfigsetting.cellRightClickConfig);
    }
    luckysheetConfigsetting.cellRightClickConfig = config;
    return config;
}

/**
 *sheet页右击菜单配�?
 *
 */
function customSheetRightClickConfig() {
    const config = {
        delete: true, //Delete
        copy: true, //Copy
        rename: true, //Rename
        color: true, //Change color
        hide: true, //Hide, unhide
        move: true, //Move to the left, move to the right
    };

    // sheetRightClickConfig determines the final result
    if (JSON.stringify(luckysheetConfigsetting.sheetRightClickConfig) !== "{}") {
        Object.assign(config, luckysheetConfigsetting.sheetRightClickConfig);
    }
    luckysheetConfigsetting.sheetRightClickConfig = config;
    return config;
}

export { luckysheetdefaultFont, customCellRightClickConfig, customSheetRightClickConfig };
