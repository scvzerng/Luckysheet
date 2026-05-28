import luckysheetformula from '../../../global/formula';
import tooltip from '../../../global/tooltip';
import { isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import ifFormulaGenerator from '../../ifFormulaGenerator';
import insertFormula from '../../insertFormula';
import { luckysheetupdateCell } from '../../updateCell';

export function initFunction(_this) {
      //公式
      $("#luckysheet-icon-function").click(function () {
        _this.autoSelectionFormula("SUM");
      });
  
      //公式菜单
      $("#luckysheet-icon-function-menu").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        const _locale = locale();
        const locale_formula = _locale.formula;
        if ($menuButton.length == 0) {
          let itemdata = [{
            text: locale_formula.sum,
            value: "SUM",
            example: "SUM"
          }, {
            text: locale_formula.average,
            value: "AVERAGE",
            example: "AVERAGE"
          }, {
            text: locale_formula.count,
            value: "COUNT",
            example: "COUNT"
          }, {
            text: locale_formula.max,
            value: "MAX",
            example: "MAX"
          }, {
            text: locale_formula.min,
            value: "MIN",
            example: "MIN"
          }, {
            text: "",
            value: "split",
            example: ""
          }, {
            text: locale_formula.ifGenerate,
            value: "if",
            example: "IF"
          }, {
            text: locale_formula.find + " ...",
            value: "formula",
            example: ""
          }];
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "function-menu",
            item: itemset,
            subclass: "",
            sub: ""
          });
          $("body").append(menu);
          $menuButton = $("#" + menuButtonId).width(180);
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            if (itemvalue == "if") {
              let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
              let r = last["row_focus"] == null ? last["row"][0] : last["row_focus"];
              let c = last["column_focus"] == null ? last["column"][0] : last["column_focus"];
              if (!!Store.flowdata[r] && !!Store.flowdata[r][c] && !!Store.flowdata[r][c]["f"]) {
                let fp = Store.flowdata[r][c]["f"].toString();
                if (fp.indexOf("=if(") != -1) {
                  ifFormulaGenerator.ifFormulaDialog(fp);
                } else {
                  if (isEditMode()) {
                    alert(locale_formula.tipNotBelongToIf);
                  } else {
                    tooltip.info(locale_formula.tipNotBelongToIf, "");
                  }
                  return;
                }
              } else {
                ifFormulaGenerator.ifFormulaDialog();
              }
              ifFormulaGenerator.init();
            } else if (itemvalue == "formula") {
              //点击函数查找弹出�?
              if (Store.luckysheet_select_save.length == 0) {
                if (isEditMode()) {
                  alert(locale_formula.tipSelectCell);
                } else {
                  tooltip.info(locale_formula.tipSelectCell, "");
                }
                return;
              }
              let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
              let row_index = last["row_focus"],
                col_index = last["column_focus"];
              luckysheetupdateCell(row_index, col_index, Store.flowdata);
              let cell = Store.flowdata[row_index][col_index];
              if (cell != null && cell.f != null) {
                //单元格有计算
                let functionStr = luckysheetformula.getfunctionParam(cell.f);
                if (functionStr.fn != null) {
                  //有函数公�?
                  insertFormula.formulaParmDialog(functionStr.fn, functionStr.param);
                } else {
                  //无函数公�?
                  insertFormula.formulaListDialog();
                }
              } else {
                //单元格无计算
                $("#luckysheet-rich-text-editor").html('<span dir="auto" class="luckysheet-formula-text-color">=</span>');
                $("#luckysheet-functionbox-cell").html($("#luckysheet-rich-text-editor").html());
                insertFormula.formulaListDialog();
              }
              insertFormula.init();
            } else {
              _this.autoSelectionFormula(itemvalue);
            }
          });
        }
        let userlen = $(this).outerWidth();
        let tlen = $menuButton.outerWidth();
        let menuleft = $(this).offset().left;
        if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition($menuButton, menuleft - 48, $(this).offset().top + 25, "lefttop");
      });
}
