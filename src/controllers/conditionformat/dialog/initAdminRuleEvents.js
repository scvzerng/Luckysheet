import { onNS, offNS } from '../../../utils/migrationHelpers.js';
import { getSheetIndex } from '../../../methods/get';
import { getFileBySheetIndex } from '../../../utils/storeAccess.js';
import Store from '../../../store';
import { selectionCopyShow } from '../../select';
import sheetmanage from '../../sheetmanage';
import { showModalMask, hideModalMask } from '../../../utils/domUtils.js';
import countShow from '../../../ui/countShow.js';
import formulaRangeSelect from '../../../ui/formulaRangeSelect.js';
import formulaDialogs from '../../../ui/formulaDialogs.js';
import conditionformatDialog from '../../../ui/conditionformatDialog.js';

export function initAdminRuleEvents(_this) {
      offNS("CFchooseSheet");
      onNS(document, "change.CFchooseSheet", "#luckysheet-administerRule-dialog .chooseSheet", function () {
        let index = conditionformatDialog.adminRule.find(".chooseSheet option:selected").val();
        _this.getConditionRuleList(index);
      });
      offNS("CFadministerRuleItem");
      onNS(document, "click.CFadministerRuleItem", "#luckysheet-administerRule-dialog .ruleList .listBox .item", function () {
        $(this).addClass("on").siblings().removeClass("on");
      });
      offNS("CFadministerRuleConfirm");
      onNS(document, "click.CFadministerRuleConfirm", "#luckysheet-administerRule-dialog-confirm", function () {
        let fileH = $.extend(true, [], Store.luckysheetfile);
        let historyRules = _this.getHistoryRules(fileH);

        let fileClone = $.extend(true, [], _this.fileClone);
        for (let c = 0; c < fileClone.length; c++) {
          let sheetIndex = fileClone[c]["index"];
          getFileBySheetIndex(sheetIndex)["luckysheet_conditionformat_save"] = fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"];
        }
        let fileC = $.extend(true, [], Store.luckysheetfile);
        let currentRules = _this.getCurrentRules(fileC);

        _this.ref(historyRules, currentRules);

        hideModalMask();
        conditionformatDialog.adminRule.hide();
      });
      offNS("CFadministerRuleClose");
      onNS(document, "click.CFadministerRuleClose", "#luckysheet-administerRule-dialog-close", function () {
        hideModalMask();
        conditionformatDialog.adminRule.hide();
        _this.fileClone = [];
      });
      offNS("CFadministerRuleFa");
      onNS(document, "click.CFadministerRuleFa", "#luckysheet-administerRule-dialog .item .fa-table", function () {
        conditionformatDialog.adminRule.hide();
        let sheetIndex = conditionformatDialog.adminRule.find(".chooseSheet select option:selected").val();
        if (sheetIndex != Store.currentSheetIndex) {
          sheetmanage.changeSheetExec(sheetIndex);
        }
        let txt = $(this).siblings("input").val().trim();
        let dataItem = $(this).parents(".item").attr("data-item");
        _this.multiRangeDialog(dataItem, txt);
        _this.selectRange = [];
        let range = _this.getRangeByTxt(txt);
        if (range.length > 0) {
          for (let s = 0; s < range.length; s++) {
            let r1 = range[s].row[0],
              r2 = range[s].row[1];
            let c1 = range[s].column[0],
              c2 = range[s].column[1];
            let row = Store.visibledatarow[r2],
              row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
            let col = Store.visibledatacolumn[c2],
              col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];
            _this.selectRange.push({
              "left": col_pre,
              "width": col - col_pre - 1,
              "top": row_pre,
              "height": row - row_pre - 1,
              "left_move": col_pre,
              "width_move": col - col_pre - 1,
              "top_move": row_pre,
              "height_move": row - row_pre - 1,
              "row": [r1, r2],
              "column": [c1, c2],
              "row_focus": r1,
              "column_focus": c1
            });
          }
        }
        selectionCopyShow(_this.selectRange);
      });
      offNS("CFmultiRangeConfirm");
      onNS(document, "click.CFmultiRangeConfirm", "#luckysheet-multiRange-dialog-confirm", function () {
        formulaDialogs.multiRange.hide();
        let dataItem = $(this).attr("data-item");
        let v = formulaDialogs.multiRange.find("input").val();
        conditionformatDialog.adminRule.find(".item[data-item=" + dataItem + "] input").val(v);
        let sheetIndex = conditionformatDialog.adminRule.find(".chooseSheet option:selected").val();
        _this.fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"][dataItem].cellrange = _this.getRangeByTxt(v);
        showModalMask();
        conditionformatDialog.adminRule.show();
        let range = [];
        selectionCopyShow(range);
      });
      offNS("CFmultiRangeClose");
      onNS(document, "click.CFmultiRangeClose", "#luckysheet-multiRange-dialog-close", function () {
        formulaDialogs.multiRange.hide();
        showModalMask();
        conditionformatDialog.adminRule.show();
        formulaRangeSelect.hide();
        countShow.row.hide();
        countShow.column.hide();
        let range = [];
        selectionCopyShow(range);
      });
}
