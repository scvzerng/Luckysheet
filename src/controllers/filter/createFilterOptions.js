import Store from '../../store';
import { getCurrentFile } from '../../utils/storeAccess.js';
import { isColHidden } from '../../utils/util';

function createFilterOptions(luckysheet_filter_save, filterObj) {
    $("#luckysheet-filter-selected-sheet" + Store.currentSheetIndex).remove();
    $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex).remove();

    if(luckysheet_filter_save == null || JSON.stringify(luckysheet_filter_save) == "{}"){
        return;
    }

    let r1 = luckysheet_filter_save.row[0], 
        r2 = luckysheet_filter_save.row[1];
    let c1 = luckysheet_filter_save.column[0], 
        c2 = luckysheet_filter_save.column[1];

    let row = Store.visibledatarow[r2], 
        row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
    let col = Store.visibledatacolumn[c2], 
        col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

    let newSelectedHTML = '<div id="luckysheet-filter-selected-sheet'+ Store.currentSheetIndex +'" class="luckysheet-cell-selected luckysheet-filter-selected"  style="left:'+ col_pre +'px;width:'+ (col - col_pre - 1) +'px;top:'+ row_pre +'px;height:'+ (row - row_pre - 1) +'px;display:block;border-color:#897BFF;z-index:20;background:none;"></div>';
    $("#luckysheet-cell-main").append(newSelectedHTML);

    let optionHTML = "";

    for (let c = c1; c <= c2; c++) {
        const isHide = isColHidden(c)

        if(filterObj == null || filterObj[c - c1] == null){
            optionHTML += '<div data-rowhidden="" data-str="'+ r1 +'" data-edr="'+ r2 +'" data-cindex="'+ c +'" data-stc="'+ c1 +'" data-edc="'+ c2 +'" class="luckysheet-filter-options" style="left:'+ (Store.visibledatacolumn[c] - 20) +'px;top:'+ row_pre +'px;display:'+ (isHide ? 'none' : 'block') +';"><i class="fa fa-caret-down" aria-hidden="true"></i></div>';
        }
        else{
            let caljs_data;

            if(filterObj[c - c1].caljs != null){
                let caljs_value1_data;
                if (filterObj[c - c1].caljs["value1"] != null) {
                    caljs_value1_data = 'data-byconditionvalue1="'+ filterObj[c - c1].caljs["value1"] +'" ';
                }
                else{
                    caljs_value1_data = '';
                }

                let caljs_value2_data;
                if (filterObj[c - c1].caljs["value2"] != null) {
                    caljs_value2_data = 'data-byconditionvalue2="'+ filterObj[c - c1].caljs["value2"] +'" ';
                }
                else{
                    caljs_value2_data = '';
                }

                caljs_data = 'data-caljs="'+ JSON.stringify(filterObj[c - c1].caljs) +'" ' +
                                 'data-byconditionvalue="'+ filterObj[c - c1].caljs["value"] +'" ' + 
                                 'data-byconditiontype="'+ filterObj[c - c1].caljs["type"] +'" ' +
                                 'data-byconditiontext="'+ filterObj[c - c1].caljs["text"] +'" ' +
                                 caljs_value1_data + caljs_value2_data;
            }
            else{
                caljs_data = '';
            }

            optionHTML += '<div data-rowhidden="'+ JSON.stringify(filterObj[c - c1].rowhidden).replace(/\"/g, "'") +'" '+ caljs_data +' data-str="'+ r1 +'" data-edr="'+ r2 +'" data-cindex="'+ c +'" data-stc="'+ c1 +'" data-edc="'+ c2 +'" class="luckysheet-filter-options luckysheet-filter-options-active" style="left:'+ (Store.visibledatacolumn[c] - 20) +'px;top:'+ row_pre +'px;display:'+ (isHide ? 'none' : 'block') +';"><i class="fa fa-filter luckysheet-mousedown-cancel" aria-hidden="true"></i></div>';
        }
    }

    $("#luckysheet-cell-main").append('<div id="luckysheet-filter-options-sheet'+ Store.currentSheetIndex +'" class="luckysheet-filter-options-c">' + optionHTML + '</div>');
    $("#luckysheet-rightclick-menu").hide();
    $("#luckysheet-filter-menu, #luckysheet-filter-submenu").hide();

    if ($("#luckysheet-cell-main").scrollTop() > luckysheet_filter_save["top_move"]) {
        $("#luckysheet-scrollbar-y").scrollTop(luckysheet_filter_save["top_move"]);
    }

    let file = getCurrentFile();

    file.filter_select = luckysheet_filter_save;
}

export { createFilterOptions };
