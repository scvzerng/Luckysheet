import imageCtrl from "../imageCtrl";
import hyperlinkCtrl from "../hyperlinkCtrl";
import conditionformat from "../conditionformat";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";
import selection from "../selection";

import {
    replaceHtml,
    getObjType,
    chatatABC,
    ArrayUnique,
    showrightclickmenu,
    luckysheetactiveCell,
    luckysheetContainerFocus,
    $$,
} from "../../utils/util";
import { getCurrentFile } from "../../utils/storeAccess.js";
import {  hasPartMC,  isEditMode,  checkIsAllowEdit  } from "../../global/validate";
import tooltip from "../../global/tooltip";
import Store from "../../store";
import context from "./context";
import rightClickMenu from '../../ui/rightClickMenu.js';

export default function rightClickButtons() {
    document.querySelectorAll("#luckysheet-copy-btn, #luckysheet-cols-copy-btn, #luckysheet-paste-btn-title").forEach(function(el) {
        el.addEventListener("click", function(event) {
            let parent = el.parentElement;
            if (parent) parent.style.display = 'none';
            if (Store.config["merge"] != null) {
                let has_PartMC = false;

                for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
                    let r1 = Store.luckysheet_select_save[s].row[0],
                        r2 = Store.luckysheet_select_save[s].row[1];
                    let c1 = Store.luckysheet_select_save[s].column[0],
                        c2 = Store.luckysheet_select_save[s].column[1];

                    has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                    if (has_PartMC) {
                        break;
                    }
                }

                if (has_PartMC) {
                    if (isEditMode()) {
                        alert(context.locale_drag.noPartMerge);
                    } else {
                        tooltip.info(context.locale_drag.noPartMerge, "");
                    }
                    return;
                }
            }

            let cdformat = getCurrentFile().luckysheet_conditionformat_save;
            if (Store.luckysheet_select_save.length > 1 && cdformat != null && cdformat.length > 0) {
                let hasCF = false;

                let cf_compute = conditionformat.getComputeMap();

                label: for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
                    if (hasCF) {
                        break;
                    }

                    let r1 = Store.luckysheet_select_save[s].row[0],
                        r2 = Store.luckysheet_select_save[s].row[1];
                    let c1 = Store.luckysheet_select_save[s].column[0],
                        c2 = Store.luckysheet_select_save[s].column[1];

                    for (let r = r1; r <= r2; r++) {
                        for (let c = c1; c <= c2; c++) {
                            if (conditionformat.checksCF(r, c, cf_compute) != null) {
                                hasCF = true;
                                continue label;
                            }
                        }
                    }
                }

                if (hasCF) {
                    if (isEditMode()) {
                        alert(context.locale_drag.noMulti);
                    } else {
                        tooltip.info(context.locale_drag.noMulti, "");
                    }
                    return;
                }
            }

            if (Store.luckysheet_select_save.length > 1) {
                let isSameRow = true,
                    str_r = Store.luckysheet_select_save[0].row[0],
                    end_r = Store.luckysheet_select_save[0].row[1];
                let isSameCol = true,
                    str_c = Store.luckysheet_select_save[0].column[0],
                    end_c = Store.luckysheet_select_save[0].column[1];

                for (let s = 1; s < Store.luckysheet_select_save.length; s++) {
                    if (
                        Store.luckysheet_select_save[s].row[0] != str_r ||
                        Store.luckysheet_select_save[s].row[1] != end_r
                    ) {
                        isSameRow = false;
                    }
                    if (
                        Store.luckysheet_select_save[s].column[0] != str_c ||
                        Store.luckysheet_select_save[s].column[1] != end_c
                    ) {
                        isSameCol = false;
                    }
                }

                if ((!isSameRow && !isSameCol) || selectIsOverlap()) {
                    if (isEditMode()) {
                        alert(context.locale_drag.noMulti);
                    } else {
                        tooltip.info(context.locale_drag.noMulti, "");
                    }
                    return;
                }
            }

            selection.copy(event);
        });
    });

    document.querySelectorAll("#luckysheet-copy-paste, #luckysheet-cols-paste-btn, #luckysheet-paste-btn-title").forEach(function(el) {
        el.addEventListener("click", function(event) {
            selection.paste(event, "btn");
            let parent = el.parentElement;
            if (parent) parent.style.display = 'none';
        });
    });

    document.getElementById("luckysheet-insertImg-btn-title").addEventListener("click", function() {
        if (!checkIsAllowEdit()) {
            return;
        }
        document.getElementById("luckysheet-imgUpload").click();
    });
    document.getElementById("luckysheetInsertImage").addEventListener("click", function() {
        document.getElementById("luckysheet-imgUpload").click();
        rightClickMenu.hide();
    });
    document.getElementById("luckysheet-imgUpload").addEventListener("click", function(e) {
        e.stopPropagation();
    });
    document.getElementById("luckysheet-imgUpload").addEventListener("change", function(e) {
        let file = e.currentTarget.files[0];
        imageCtrl.insertImg(file);
    });

    document.getElementById("luckysheet-insertLink-btn-title").addEventListener("click", function() {
        if (!checkIsAllowEdit()) {
        }

        hyperlinkCtrl.createDialog();
        hyperlinkCtrl.init();
    });
    document.getElementById("luckysheetInsertLink").addEventListener("click", function() {
        document.getElementById("luckysheet-insertLink-btn-title").click();
        rightClickMenu.hide();
    });
}
