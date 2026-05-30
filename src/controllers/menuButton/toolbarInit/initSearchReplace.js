import tooltip from '../../../global/tooltip';
import { isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import luckysheetLocationCell from '../../locationCell';
import luckysheetSearchReplace from '../../searchReplace';

export function initSearchReplace(_this) {
      //查找和替�?
      document.getElementById("luckysheet-icon-seachmore")?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;
        if (menuButton == null) {
          let itemdata = [{
            text: locale_findAndReplace.find + " ...",
            value: "search",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-sousuo" aria-hidden="true"></i>'
          }, {
            text: locale_findAndReplace.replace + " ...",
            value: "replace",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-tihuan" aria-hidden="true"></i>'
          },
          // {"text": locale_findAndReplace.goto+" ...", "value": "goto", "example": '<i class="iconfont-luckysheet luckysheet-iconfont-zhuandao1" aria-hidden="true"></i>'},
          {
            text: "",
            value: "split",
            example: ""
          }, {
            text: locale_findAndReplace.location + " ...",
            value: "location",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-dingwei" aria-hidden="true"></i>'
          }, {
            text: locale_findAndReplace.formula,
            value: "locationFormula",
            example: locale_findAndReplace.locationExample
          }, {
            text: locale_findAndReplace.date,
            value: "locationConstantDate",
            example: locale_findAndReplace.locationExample
          }, {
            text: locale_findAndReplace.number,
            value: "locationConstantNumber",
            example: locale_findAndReplace.locationExample
          }, {
            text: locale_findAndReplace.string,
            value: "locationConstantString",
            example: locale_findAndReplace.locationExample
          }, {
            text: locale_findAndReplace.error,
            value: "locationConstantError",
            example: locale_findAndReplace.locationExample
          }, {
            text: locale_findAndReplace.condition,
            value: "locationCF",
            example: locale_findAndReplace.locationExample
          }, {
            text: locale_findAndReplace.rowSpan,
            value: "locationStepRow",
            example: locale_findAndReplace.locationExample
          }, {
            text: locale_findAndReplace.columnSpan,
            value: "locationStepColumn",
            example: locale_findAndReplace.locationExample
          }];
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "seachmore",
            item: itemset,
            subclass: "",
            sub: ""
          });
          document.body.insertAdjacentHTML('beforeend', menu);
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "180px";
          menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
            if (itemvalue == "search" || itemvalue == "replace") {
              //查找替换
              if (itemvalue == "search") {
                luckysheetSearchReplace.createDialog(0);
              } else if (itemvalue == "replace") {
                luckysheetSearchReplace.createDialog(1);
              }
              luckysheetSearchReplace.init();
              document.querySelector("#luckysheet-search-replace #searchInput input")?.focus();
            } else if (itemvalue == "location") {
              //定位条件
              luckysheetLocationCell.createDialog();
              luckysheetLocationCell.init();
            } else if (itemvalue == "locationFormula" || itemvalue == "locationConstantDate" || itemvalue == "locationConstantNumber" || itemvalue == "locationConstantString" || itemvalue == "locationConstantError" || itemvalue == "locationCF") {
              let last = Store.luckysheet_select_save[0];
              let range;
              if (Store.luckysheet_select_save.length == 0 || Store.luckysheet_select_save.length == 1 && last.row[0] == last.row[1] && last.column[0] == last.column[1]) {
                //单个单元�?
                range = [{
                  row: [0, Store.flowdata.length - 1],
                  column: [0, Store.flowdata[0].length - 1]
                }];
              } else {
                range = structuredClone(Store.luckysheet_select_save);
              }
              if (itemvalue == "locationFormula") {
                //公式
                luckysheetLocationCell.apply(range, "locationFormula", "all");
              } else if (itemvalue == "locationConstantDate") {
                //日期
                luckysheetLocationCell.apply(range, "locationConstant", "d");
              } else if (itemvalue == "locationConstantNumber") {
                //数字
                luckysheetLocationCell.apply(range, "locationConstant", "n");
              } else if (itemvalue == "locationConstantString") {
                //字符
                luckysheetLocationCell.apply(range, "locationConstant", "s,g");
              } else if (itemvalue == "locationConstantError") {
                //错误
                luckysheetLocationCell.apply(range, "locationConstant", "e");
              } else if (itemvalue == "locationCF") {
                //条件格式
                luckysheetLocationCell.apply(range, "locationCF");
              }
            } else if (itemvalue == "locationStepRow") {
              //间隔�?
              if (Store.luckysheet_select_save.length == 0 || Store.luckysheet_select_save.length == 1 && Store.luckysheet_select_save[0].row[0] == Store.luckysheet_select_save[0].row[1]) {
                if (isEditMode()) {
                  alert(locale_findAndReplace.lessTwoRowTip);
                } else {
                  tooltip.info("", locale_findAndReplace.lessTwoRowTip);
                }
                return;
              }
              let range = structuredClone(Store.luckysheet_select_save);
              luckysheetLocationCell.apply(range, "locationStepRow");
            } else if (itemvalue == "locationStepColumn") {
              //间隔�?
              if (Store.luckysheet_select_save.length == 0 || Store.luckysheet_select_save.length == 1 && Store.luckysheet_select_save[0].column[0] == Store.luckysheet_select_save[0].column[1]) {
                if (isEditMode()) {
                  alert(locale_findAndReplace.lessTwoColumnTip);
                } else {
                  tooltip.info("", locale_findAndReplace.lessTwoColumnTip);
                }
                return;
              }
              let range = structuredClone(Store.luckysheet_select_save);
              luckysheetLocationCell.apply(range, "locationStepColumn");
            }
            });
          });
        }
        let userlen = this.offsetWidth;
        let tlen = menuButton.offsetWidth;
        let menuleft = this.getBoundingClientRect().left + window.pageXOffset;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition(menuButton, menuleft, this.getBoundingClientRect().top + window.pageYOffset + 25, "lefttop");
      });
}
