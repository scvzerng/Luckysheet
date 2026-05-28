import { getSheetIndex } from '../../methods/get';
import Store from '../../store';

function labelFilterOptionState($top, optionstate, rowhidden, caljs, notSave, str, edr, cindex, stc, edc) {
    if (optionstate) {
        $top.addClass("luckysheet-filter-options-active").data("rowhidden", JSON.stringify(rowhidden)).data("caljs", JSON.stringify(caljs)).html('<i class="fa fa-filter luckysheet-mousedown-cancel" aria-hidden="true"></i>');

        if (caljs != null) {
            $top.data("byconditionvalue", caljs["value"]).data("byconditiontype", caljs["type"]).data("byconditiontext", caljs["text"]);

            if (caljs["value1"] != null) {
                $top.data("byconditionvalue1", caljs["value1"]);
            }

            if (caljs["value2"] != null) {
                $top.data("byconditionvalue2", caljs["value2"]);
            }
        }
    }
    else {
        $top.removeClass("luckysheet-filter-options-active").data("rowhidden", "").data("caljs", "").html('<i class="fa fa-caret-down luckysheet-mousedown-cancel" aria-hidden="true"></i>');

        $top.data("byconditionvalue", "null").data("byconditiontype", "0").data("byconditiontext", "无").data("byconditionvalue1", "").data("byconditionvalue2", "");
    }

    if(!!notSave){
        let file = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];

        if(file.filter == null){
            file.filter = {};
        }

        if (optionstate) {
            let param = {
                "caljs": caljs, 
                "rowhidden": rowhidden, 
                "optionstate": optionstate,
                "str": str,
                "edr": edr,
                "cindex": cindex,
                "stc": stc,
                "edc": edc
            };
            file.filter[cindex - stc] = param;
        }
        else {
            delete file.filter[cindex - stc];
        }

    }
}

export { labelFilterOptionState };
