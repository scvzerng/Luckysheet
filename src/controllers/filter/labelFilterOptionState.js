import Store from '../../store';
import { getCurrentFile } from '../../utils/storeAccess.js';

function labelFilterOptionState(topEl, optionstate, rowhidden, caljs, notSave, str, edr, cindex, stc, edc) {
    if (optionstate) {
        topEl.classList.add("luckysheet-filter-options-active");
        topEl.dataset.rowhidden = JSON.stringify(rowhidden);
        topEl.dataset.caljs = JSON.stringify(caljs);
        topEl.innerHTML = '<i class="fa fa-filter luckysheet-mousedown-cancel" aria-hidden="true"></i>';

        if (caljs != null) {
            topEl.dataset.byconditionvalue = caljs["value"];
            topEl.dataset.byconditiontype = caljs["type"];
            topEl.dataset.byconditiontext = caljs["text"];

            if (caljs["value1"] != null) {
                topEl.dataset.byconditionvalue1 = caljs["value1"];
            }

            if (caljs["value2"] != null) {
                topEl.dataset.byconditionvalue2 = caljs["value2"];
            }
        }
    }
    else {
        topEl.classList.remove("luckysheet-filter-options-active");
        topEl.dataset.rowhidden = "";
        topEl.dataset.caljs = "";
        topEl.innerHTML = '<i class="fa fa-caret-down luckysheet-mousedown-cancel" aria-hidden="true"></i>';

        topEl.dataset.byconditionvalue = "null";
        topEl.dataset.byconditiontype = "0";
        topEl.dataset.byconditiontext = "无";
        topEl.dataset.byconditionvalue1 = "";
        topEl.dataset.byconditionvalue2 = "";
    }

    if(notSave){
        let file = getCurrentFile();

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
