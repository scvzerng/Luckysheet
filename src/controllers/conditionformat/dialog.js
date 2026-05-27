import { getSheetIndex, getRangetxt } from "../../methods/get";
import { replaceHtml, getObjType, chatatABC } from "../../utils/util";
import formula from "../../global/formula";
import { isRealNull, isEditMode } from "../../global/validate";
import tooltip from "../../global/tooltip";
import { luckysheetrefreshgrid } from "../../global/refresh";
import { getcellvalue } from "../../global/getdata";
import { genarate } from "../../global/format";
import { modelHTML, luckysheet_CFiconsImg } from "../constant";
import { selectionCopyShow } from "../select";
import sheetmanage from "../sheetmanage";
import locale from "../../locale/locale";
import Store from "../../store";
import dayjs from 'dayjs';

//条件格式
const dialogModule = {
  //{"sheetIndex": sheetIndex,"itemIndex": itemIndex,"data": luckysheetfile[sheetIndex].luckysheet_conditionformat_save[itemIndex]}
  ruleTypeHtml: function () {
    const conditionformat_Text = locale().conditionformat;
    return `<div class="ruleTypeBox">
                    <div class="ruleTypeItem">
                        <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                        <span>${conditionformat_Text.ruleTypeItem1}</span>
                    </div>
                    <div class="ruleTypeItem">
                        <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                        <span>${conditionformat_Text.ruleTypeItem2}</span>
                    </div>
                    <div class="ruleTypeItem">
                        <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                        <span>${conditionformat_Text.ruleTypeItem3}</span>
                    </div>
                    <div class="ruleTypeItem">
                        <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                        <span>${conditionformat_Text.ruleTypeItem4}</span>
                    </div>
                    <div class="ruleTypeItem">
                        <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                        <span>${conditionformat_Text.ruleTypeItem5}</span>
                    </div>
                    <div class="ruleTypeItem">
                        <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                        <span>${conditionformat_Text.ruleTypeItem6}</span>
                    </div>
                </div>`;
  },
  textCellColorHtml: function () {
    const conditionformat_Text = locale().conditionformat;
    return `<div id="textCellColor">
                    <div class="colorbox">
                        <input id="checkTextColor" type="checkbox" checked="checked">
                        <label for="checkTextColor">${conditionformat_Text.textColor}：</label>
                        <input id="textcolorshow" data-tips="${conditionformat_Text.textColor}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="#9c0006" style="display: none;">
                    </div>
                    <div class="colorbox">
                        <input id="checkCellColor" type="checkbox" checked="checked">
                        <label for="checkCellColor">${conditionformat_Text.cellColor}：</label>
                        <input id="cellcolorshow" data-tips="${conditionformat_Text.cellColor}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="#ffc7ce" style="display: none;">
                    </div>
                </div>`;
  },
  init: function () {
    let _this = this;
    const conditionformat_Text = locale().conditionformat;

    // 管理规则
    $(document).off("change.CFchooseSheet").on("change.CFchooseSheet", "#luckysheet-administerRule-dialog .chooseSheet", function () {
      let index = $("#luckysheet-administerRule-dialog .chooseSheet option:selected").val();
      _this.getConditionRuleList(index);
    });
    $(document).off("click.CFadministerRuleItem").on("click.CFadministerRuleItem", "#luckysheet-administerRule-dialog .ruleList .listBox .item", function () {
      $(this).addClass("on").siblings().removeClass("on");
    });
    $(document).off("click.CFadministerRuleConfirm").on("click.CFadministerRuleConfirm", "#luckysheet-administerRule-dialog-confirm", function () {
      //保存之前的规则
      let fileH = $.extend(true, [], Store.luckysheetfile);
      let historyRules = _this.getHistoryRules(fileH);

      //保存当前的规则
      let fileClone = $.extend(true, [], _this.fileClone);
      for (let c = 0; c < fileClone.length; c++) {
        let sheetIndex = fileClone[c]["index"];
        Store.luckysheetfile[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"] = fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"];
      }
      let fileC = $.extend(true, [], Store.luckysheetfile);
      let currentRules = _this.getCurrentRules(fileC);

      //刷新一次表格
      _this.ref(historyRules, currentRules);

      //隐藏一些dom
      $("#luckysheet-modal-dialog-mask").hide();
      $("#luckysheet-administerRule-dialog").hide();
    });
    $(document).off("click.CFadministerRuleClose").on("click.CFadministerRuleClose", "#luckysheet-administerRule-dialog-close", function () {
      $("#luckysheet-modal-dialog-mask").hide();
      $("#luckysheet-administerRule-dialog").hide();
      _this.fileClone = [];
    });
    $(document).off("click.CFadministerRuleFa").on("click.CFadministerRuleFa", "#luckysheet-administerRule-dialog .item .fa-table", function () {
      $(this).parents("#luckysheet-administerRule-dialog").hide();
      let sheetIndex = $("#luckysheet-administerRule-dialog .chooseSheet select option:selected").val();
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
    $(document).off("click.CFmultiRangeConfirm").on("click.CFmultiRangeConfirm", "#luckysheet-multiRange-dialog-confirm", function () {
      $(this).parents("#luckysheet-multiRange-dialog").hide();
      let dataItem = $(this).attr("data-item");
      let v = $(this).parents("#luckysheet-multiRange-dialog").find("input").val();
      $("#luckysheet-administerRule-dialog .item[data-item=" + dataItem + "] input").val(v);
      let sheetIndex = $("#luckysheet-administerRule-dialog .chooseSheet option:selected").val();
      _this.fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"][dataItem].cellrange = _this.getRangeByTxt(v);
      $("#luckysheet-modal-dialog-mask").show();
      $("#luckysheet-administerRule-dialog").show();
      let range = [];
      selectionCopyShow(range);
    });
    $(document).off("click.CFmultiRangeClose").on("click.CFmultiRangeClose", "#luckysheet-multiRange-dialog-close", function () {
      $(this).parents("#luckysheet-multiRange-dialog").hide();
      $("#luckysheet-modal-dialog-mask").show();
      $("#luckysheet-administerRule-dialog").show();
      $("#luckysheet-formula-functionrange-select").hide();
      $("#luckysheet-row-count-show").hide();
      $("#luckysheet-column-count-show").hide();
      let range = [];
      selectionCopyShow(range);
    });

    // 新建规则
    $(document).off("click.CFnewConditionRule").on("click.CFnewConditionRule", "#newConditionRule", function () {
      let sheetIndex = $("#luckysheet-administerRule-dialog .chooseSheet option:selected").val();
      if (Store.luckysheet_select_save.length == 0) {
        if (isEditMode()) {
          alert(conditionformat_Text.pleaseSelectRange);
        } else {
          tooltip.info(conditionformat_Text.pleaseSelectRange, "");
        }
        return;
      }
      _this.newConditionRuleDialog(1);
    });
    $(document).off("click.CFnewConditionRuleConfirm").on("click.CFnewConditionRuleConfirm", "#luckysheet-newConditionRule-dialog-confirm", function () {
      let index = $("#luckysheet-newConditionRule-dialog .ruleTypeItem.on").index();
      let type1 = $("#luckysheet-newConditionRule-dialog #type1 option:selected").val();
      let type2 = $("#luckysheet-newConditionRule-dialog ." + type1 + "Box #type2 option:selected").val();
      let format, rule;
      if (index == 0) {
        if (type1 == "dataBar") {
          //数据条
          let color = $(this).parents("#luckysheet-newConditionRule-dialog").find(".dataBarBox .luckysheet-conditionformat-config-color").spectrum("get").toHexString();
          if (type2 == "gradient") {
            //渐变填充
            format = [color, "#ffffff"];
          } else if (type2 == "solid") {
            //实心填充
            format = [color];
          }
          rule = {
            "type": "dataBar",
            "cellrange": $.extend(true, [], Store.luckysheet_select_save),
            "format": format
          };
        } else if (type1 == "colorGradation") {
          //色阶
          let maxcolor = $(this).parents("#luckysheet-newConditionRule-dialog").find(".colorGradationBox .maxVal .luckysheet-conditionformat-config-color").spectrum("get").toRgbString();
          let midcolor = $(this).parents("#luckysheet-newConditionRule-dialog").find(".colorGradationBox .midVal .luckysheet-conditionformat-config-color").spectrum("get").toRgbString();
          let mincolor = $(this).parents("#luckysheet-newConditionRule-dialog").find(".colorGradationBox .minVal .luckysheet-conditionformat-config-color").spectrum("get").toRgbString();
          if (type2 == "threeColor") {
            //三色
            format = [maxcolor, midcolor, mincolor];
          } else if (type2 == "twoColor") {
            //双色
            format = [maxcolor, mincolor];
          }
          rule = {
            "type": "colorGradation",
            "cellrange": $.extend(true, [], Store.luckysheet_select_save),
            "format": format
          };
        } else if (type1 == "icons") {
          //图标集
          let len = $(this).parents("#luckysheet-newConditionRule-dialog").find(".iconsBox .model").attr("data-len");
          let leftMin = $(this).parents("#luckysheet-newConditionRule-dialog").find(".iconsBox .model").attr("data-leftmin");
          let top = $(this).parents("#luckysheet-newConditionRule-dialog").find(".iconsBox .model").attr("data-top");
          format = {
            "len": len,
            "leftMin": leftMin,
            "top": top
          };
          rule = {
            "type": "icons",
            "cellrange": $.extend(true, [], Store.luckysheet_select_save),
            "format": format
          };
        }
      } else {
        let conditionName = "",
          conditionRange = [],
          conditionValue = [];
        if (index == 1) {
          if (type1 == "number") {
            //单元格值
            conditionName = type2;
            if (type2 == "betweenness") {
              let v1 = $("#luckysheet-newConditionRule-dialog #conditionVal input").val().trim();
              let v2 = $("#luckysheet-newConditionRule-dialog #conditionVal2 input").val().trim();

              //条件值是否是选区
              let rangeArr1 = _this.getRangeByTxt(v1);
              if (rangeArr1.length > 1) {
                _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                return;
              } else if (rangeArr1.length == 1) {
                let r1 = rangeArr1[0].row[0],
                  r2 = rangeArr1[0].row[1];
                let c1 = rangeArr1[0].column[0],
                  c2 = rangeArr1[0].column[1];
                if (r1 == r2 && c1 == c2) {
                  v1 = getcellvalue(r1, c1, Store.flowdata);

                  // conditionRange.push({ "row": rangeArr1[0].row, "column": rangeArr1[0].column });
                  conditionRange[0] = {
                    "row": rangeArr1[0].row,
                    "column": rangeArr1[0].column
                  };
                  conditionValue.push(v1);
                } else {
                  _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                  return;
                }
              } else if (rangeArr1.length == 0) {
                if (isNaN(v1) || v1 == "") {
                  _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
                  return;
                } else {
                  conditionValue.push(v1);
                }
              }
              let rangeArr2 = _this.getRangeByTxt(v2);
              if (rangeArr2.length > 1) {
                _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                return;
              } else if (rangeArr2.length == 1) {
                let r1 = rangeArr2[0].row[0],
                  r2 = rangeArr2[0].row[1];
                let c1 = rangeArr2[0].column[0],
                  c2 = rangeArr2[0].column[1];
                if (r1 == r2 && c1 == c2) {
                  v2 = getcellvalue(r1, c1, Store.flowdata);

                  // conditionRange.push({ "row": rangeArr2[0].row, "column": rangeArr2[0].column });

                  // If the first value is a custom value, and the cell range selected by the second value, push will cause the position to be wrong
                  conditionRange[1] = {
                    "row": rangeArr2[0].row,
                    "column": rangeArr2[0].column
                  };
                  conditionValue.push(v2);
                } else {
                  _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                  return;
                }
              } else if (rangeArr2.length == 0) {
                if (isNaN(v2) || v2 == "") {
                  _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
                  return;
                } else {
                  conditionValue.push(v2);
                }
              }
            } else {
              //条件值
              let v = $("#luckysheet-newConditionRule-dialog #conditionVal input").val().trim();

              //条件值是否是选区
              let rangeArr = _this.getRangeByTxt(v);
              if (rangeArr.length > 1) {
                _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                return;
              } else if (rangeArr.length == 1) {
                let r1 = rangeArr[0].row[0],
                  r2 = rangeArr[0].row[1];
                let c1 = rangeArr[0].column[0],
                  c2 = rangeArr[0].column[1];
                if (r1 == r2 && c1 == c2) {
                  v = getcellvalue(r1, c1, Store.flowdata);
                  conditionRange.push({
                    "row": rangeArr[0].row,
                    "column": rangeArr[0].column
                  });
                  conditionValue.push(v);
                } else {
                  _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                  return;
                }
              } else if (rangeArr.length == 0) {
                if (isNaN(v) || v == "") {
                  _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
                  return;
                } else {
                  conditionValue.push(v);
                }
              }
            }
          } else if (type1 == "text") {
            //特定文本
            conditionName = "textContains";

            //条件值
            let v = $("#luckysheet-newConditionRule-dialog #conditionVal input").val().trim();

            //条件值是否是选区
            let rangeArr = _this.getRangeByTxt(v);
            if (rangeArr.length > 1) {
              _this.infoDialog(conditionformat_Text.onlySingleCell, "");
              return;
            } else if (rangeArr.length == 1) {
              let r1 = rangeArr[0].row[0],
                r2 = rangeArr[0].row[1];
              let c1 = rangeArr[0].column[0],
                c2 = rangeArr[0].column[1];
              if (r1 == r2 && c1 == c2) {
                v = getcellvalue(r1, c1, Store.flowdata);
                conditionRange.push({
                  "row": rangeArr[0].row,
                  "column": rangeArr[0].column
                });
                conditionValue.push(v);
              } else {
                _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                return;
              }
            } else if (rangeArr.length == 0) {
              if (v == "") {
                _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
                return;
              } else {
                conditionValue.push(v);
              }
            }
          } else if (type1 == "date") {
            //发生日期
            conditionName = "occurrenceDate";

            //条件值
            let v = $("#luckysheet-newConditionRule-dialog #daterange-btn").val();
            if (v == "" || v == null) {
              _this.infoDialog(conditionformat_Text.pleaseSelectADate, "");
              return;
            }
            conditionValue.push(v);
          }
        } else if (index == 2) {
          //排名靠前靠后
          //条件名称
          if (type1 == "top") {
            if ($("#luckysheet-newConditionRule-dialog #isPercent").is(":selected")) {
              conditionName = "top10%";
            } else {
              conditionName = "top10";
            }
          } else if (type1 == "last") {
            if ($("#luckysheet-newConditionRule-dialog #isPercent").is(":selected")) {
              conditionName = "last10%";
            } else {
              conditionName = "last10";
            }
          }

          //条件值
          let v = $("#luckysheet-newConditionRule-dialog #conditionVal input").val().trim();
          if (parseInt(v) != v || parseInt(v) < 1 || parseInt(v) > 1000) {
            _this.infoDialog(conditionformat_Text.pleaseEnterInteger, "");
            return;
          }
          conditionValue.push(parseInt(v));
        } else if (index == 3) {
          //平均值
          if (type1 == "AboveAverage") {
            conditionName = "AboveAverage";
            conditionValue.push("AboveAverage");
          } else if (type1 == "SubAverage") {
            conditionName = "SubAverage";
            conditionValue.push("SubAverage");
          }
        } else if (index == 4) {
          //重复值
          conditionName = "duplicateValue";
          conditionValue.push(type1);
        } else if (index == 5) {
          //公式
          conditionName = "formula";

          //条件值
          let v = $("#luckysheet-newConditionRule-dialog #formulaConditionVal input").val().trim();
          if (v == "") {
            _this.infoDialog("Condition value cannot be empty!", "");
            return;
          }
          conditionValue.push(v);
        }

        //格式颜色
        let textcolor;
        if ($("#luckysheet-newConditionRule-dialog #checkTextColor").is(":checked")) {
          textcolor = $("#luckysheet-newConditionRule-dialog #textcolorshow").spectrum("get").toHexString();
        } else {
          textcolor = null;
        }
        let cellcolor;
        if ($("#luckysheet-newConditionRule-dialog #checkCellColor").is(":checked")) {
          cellcolor = $("#luckysheet-newConditionRule-dialog #cellcolorshow").spectrum("get").toHexString();
        } else {
          cellcolor = null;
        }
        format = {
          "textColor": textcolor,
          "cellColor": cellcolor
        };
        rule = {
          "type": "default",
          "cellrange": $.extend(true, [], Store.luckysheet_select_save),
          "format": format,
          "conditionName": conditionName,
          "conditionRange": conditionRange,
          "conditionValue": conditionValue
        };
      }
      $("#luckysheet-newConditionRule-dialog").hide();

      //新建规则的入口
      let source = $(this).attr("data-source");
      if (source == 0) {
        $("#luckysheet-modal-dialog-mask").hide();

        //保存之前的规则
        let fileH = $.extend(true, [], Store.luckysheetfile);
        let historyRules = _this.getHistoryRules(fileH);

        //保存当前的规则
        let ruleArr = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] == undefined ? [] : Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"];
        ruleArr.push(rule);
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] = ruleArr;
        let fileC = $.extend(true, [], Store.luckysheetfile);
        let currentRules = _this.getCurrentRules(fileC);

        //刷新一次表格
        _this.ref(historyRules, currentRules);
      } else if (source == 1) {
        //临时存储新规则
        let ruleArr = !!_this.fileClone[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] ? _this.fileClone[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] : [];
        ruleArr.push(rule);
        _this.fileClone[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] = ruleArr;

        //新建规则隐藏，管理规则显示
        _this.administerRuleDialog();
      }
    });
    $(document).off("click.CFnewConditionRuleClose").on("click.CFnewConditionRuleClose", "#luckysheet-newConditionRule-dialog-close", function () {
      //新建规则的入口
      let source = $(this).attr("data-source");
      if (source == 0) {
        $("#luckysheet-modal-dialog-mask").hide();
      }
      if (source == 1) {
        $("#luckysheet-administerRule-dialog").show();
      }

      //新建规则隐藏
      $("#luckysheet-newConditionRule-dialog").hide();

      //隐藏虚线框
      $("#luckysheet-formula-functionrange-select").hide();
      $("#luckysheet-row-count-show").hide();
      $("#luckysheet-column-count-show").hide();
    });

    // 编辑规则
    $(document).off("click.CFeditorConditionRule").on("click.CFeditorConditionRule", "#editorConditionRule", function () {
      let sheetIndex = $("#luckysheet-administerRule-dialog .chooseSheet option:selected").val();
      let itemIndex = $("#luckysheet-administerRule-dialog .ruleList .listBox .item.on").attr("data-item");
      let rule = {
        "sheetIndex": sheetIndex,
        "itemIndex": itemIndex,
        "data": _this.fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"][itemIndex]
      };
      _this.editorRule = rule;
      _this.editorConditionRuleDialog();
    });
    $(document).off("click.CFeditorConditionRuleConfirm").on("click.CFeditorConditionRuleConfirm", "#luckysheet-editorConditionRule-dialog-confirm", function () {
      let index = $("#luckysheet-editorConditionRule-dialog .ruleTypeItem.on").index();
      let type1 = $("#luckysheet-editorConditionRule-dialog #type1 option:selected").val();
      let type2 = $("#luckysheet-editorConditionRule-dialog ." + type1 + "Box #type2 option:selected").val();
      let cellrange = _this.editorRule["data"].cellrange;
      let format, rule;
      if (index == 0) {
        if (type1 == "dataBar") {
          //数据条
          let color = $(this).parents("#luckysheet-editorConditionRule-dialog").find(".dataBarBox .luckysheet-conditionformat-config-color").spectrum("get").toHexString();
          if (type2 == "gradient") {
            //渐变填充
            format = [color, "#ffffff"];
          } else if (type2 == "solid") {
            //实心填充
            format = [color];
          }
          rule = {
            "type": "dataBar",
            "cellrange": cellrange,
            "format": format
          };
        } else if (type1 == "colorGradation") {
          //色阶
          let maxcolor = $(this).parents("#luckysheet-editorConditionRule-dialog").find(".colorGradationBox .maxVal .luckysheet-conditionformat-config-color").spectrum("get").toRgbString();
          let midcolor = $(this).parents("#luckysheet-editorConditionRule-dialog").find(".colorGradationBox .midVal .luckysheet-conditionformat-config-color").spectrum("get").toRgbString();
          let mincolor = $(this).parents("#luckysheet-editorConditionRule-dialog").find(".colorGradationBox .minVal .luckysheet-conditionformat-config-color").spectrum("get").toRgbString();
          if (type2 == "threeColor") {
            //三色
            format = [maxcolor, midcolor, mincolor];
          } else if (type2 == "twoColor") {
            //双色
            format = [maxcolor, mincolor];
          }
          rule = {
            "type": "colorGradation",
            "cellrange": cellrange,
            "format": format
          };
        } else if (type1 == "icons") {
          //图标集
          let len = $(this).parents("#luckysheet-editorConditionRule-dialog").find(".iconsBox .model").attr("data-len");
          let leftMin = $(this).parents("#luckysheet-editorConditionRule-dialog").find(".iconsBox .model").attr("data-leftmin");
          let top = $(this).parents("#luckysheet-editorConditionRule-dialog").find(".iconsBox .model").attr("data-top");
          format = {
            "len": len,
            "leftMin": leftMin,
            "top": top
          };
          rule = {
            "type": "icons",
            "cellrange": cellrange,
            "format": format
          };
        }
      } else {
        let conditionName = "",
          conditionRange = [],
          conditionValue = [];
        if (index == 1) {
          if (type1 == "number") {
            //单元格值
            conditionName = type2;
            if (type2 == "betweenness") {
              let v1 = $("#luckysheet-editorConditionRule-dialog #conditionVal input").val().trim();
              let v2 = $("#luckysheet-editorConditionRule-dialog #conditionVal2 input").val().trim();

              //条件值是否是选区
              let rangeArr1 = _this.getRangeByTxt(v1);
              if (rangeArr1.length > 1) {
                _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                return;
              } else if (rangeArr1.length == 1) {
                let r1 = rangeArr1[0].row[0],
                  r2 = rangeArr1[0].row[1];
                let c1 = rangeArr1[0].column[0],
                  c2 = rangeArr1[0].column[1];
                if (r1 == r2 && c1 == c2) {
                  v1 = getcellvalue(r1, c1, Store.flowdata);

                  // conditionRange.push({ "row": rangeArr1[0].row, "column": rangeArr1[0].column });
                  conditionRange[0] = {
                    "row": rangeArr1[0].row,
                    "column": rangeArr1[0].column
                  };
                  conditionValue.push(v1);
                } else {
                  _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                  return;
                }
              } else if (rangeArr1.length == 0) {
                if (isNaN(v1) || v1 == "") {
                  _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
                  return;
                } else {
                  conditionValue.push(v1);
                }
              }
              let rangeArr2 = _this.getRangeByTxt(v2);
              if (rangeArr2.length > 1) {
                _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                return;
              } else if (rangeArr2.length == 1) {
                let r1 = rangeArr2[0].row[0],
                  r2 = rangeArr2[0].row[1];
                let c1 = rangeArr2[0].column[0],
                  c2 = rangeArr2[0].column[1];
                if (r1 == r2 && c1 == c2) {
                  v2 = getcellvalue(r1, c1, Store.flowdata);

                  // conditionRange.push({ "row": rangeArr2[0].row, "column": rangeArr2[0].column });
                  conditionRange[1] = {
                    "row": rangeArr2[0].row,
                    "column": rangeArr2[0].column
                  };
                  conditionValue.push(v2);
                } else {
                  _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                  return;
                }
              } else if (rangeArr2.length == 0) {
                if (isNaN(v2) || v2 == "") {
                  _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
                  return;
                } else {
                  conditionValue.push(v2);
                }
              }
            } else {
              //条件值
              let v = $("#luckysheet-editorConditionRule-dialog #conditionVal input").val().trim();

              //条件值是否是选区
              let rangeArr = _this.getRangeByTxt(v);
              if (rangeArr.length > 1) {
                _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                return;
              } else if (rangeArr.length == 1) {
                let r1 = rangeArr[0].row[0],
                  r2 = rangeArr[0].row[1];
                let c1 = rangeArr[0].column[0],
                  c2 = rangeArr[0].column[1];
                if (r1 == r2 && c1 == c2) {
                  v = getcellvalue(r1, c1, Store.flowdata);
                  conditionRange.push({
                    "row": rangeArr[0].row,
                    "column": rangeArr[0].column
                  });
                  conditionValue.push(v);
                } else {
                  _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                  return;
                }
              } else if (rangeArr.length == 0) {
                if (isNaN(v) || v == "") {
                  _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
                  return;
                } else {
                  conditionValue.push(v);
                }
              }
            }
          } else if (type1 == "text") {
            //特定文本
            conditionName = "textContains";

            //条件值
            let v = $("#luckysheet-editorConditionRule-dialog #conditionVal input").val().trim();

            //条件值是否是选区
            let rangeArr = _this.getRangeByTxt(v);
            if (rangeArr.length > 1) {
              _this.infoDialog(conditionformat_Text.onlySingleCell, "");
              return;
            } else if (rangeArr.length == 1) {
              let r1 = rangeArr[0].row[0],
                r2 = rangeArr[0].row[1];
              let c1 = rangeArr[0].column[0],
                c2 = rangeArr[0].column[1];
              if (r1 == r2 && c1 == c2) {
                v = getcellvalue(r1, c1, Store.flowdata);
                conditionRange.push({
                  "row": rangeArr[0].row,
                  "column": rangeArr[0].column
                });
                conditionValue.push(v);
              } else {
                _this.infoDialog(conditionformat_Text.onlySingleCell, "");
                return;
              }
            } else if (rangeArr.length == 0) {
              if (isNaN(v) || v == "") {
                _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
                return;
              } else {
                conditionValue.push(v);
              }
            }
          } else if (type1 == "date") {
            //发生日期
            conditionName = "occurrenceDate";

            //条件值
            let v = $("#luckysheet-editorConditionRule-dialog #daterange-btn").val();
            if (v == "" || v == null) {
              _this.infoDialog(conditionformat_Text.pleaseSelectADate, "");
              return;
            }
            conditionValue.push(v);
          }
        } else if (index == 2) {
          //排名靠前靠后
          //条件名称
          if (type1 == "top") {
            if ($("#luckysheet-editorConditionRule-dialog #isPercent").is(":selected")) {
              conditionName = "top10%";
            } else {
              conditionName = "top10";
            }
          } else if (type1 == "last") {
            if ($("#luckysheet-editorConditionRule-dialog #isPercent").is(":selected")) {
              conditionName = "last10%";
            } else {
              conditionName = "last10";
            }
          }

          //条件值
          let v = $("#luckysheet-editorConditionRule-dialog #conditionVal input").val().trim();
          if (parseInt(v) != v || parseInt(v) < 1 || parseInt(v) > 1000) {
            _this.infoDialog(conditionformat_Text.pleaseEnterInteger, "");
            return;
          }
          conditionValue.push(v);
        } else if (index == 3) {
          //平均值
          if (type1 == "AboveAverage") {
            conditionName = "AboveAverage";
            conditionValue.push("AboveAverage");
          } else if (type1 == "SubAverage") {
            conditionName = "SubAverage";
            conditionValue.push("SubAverage");
          }
        } else if (index == 4) {
          //重复值
          conditionName = "duplicateValue";
          conditionValue.push(type1);
        } else if (index == 5) {
          //公式
          conditionName = "formula";

          //条件值
          let v = $("#luckysheet-editorConditionRule-dialog #formulaConditionVal input").val().trim();
          console.log(v);
          if (v == "") {
            _this.infoDialog("Condition value cannot be empty!", "");
            return;
          }
          conditionValue.push(v);
        }

        //格式颜色
        let textcolor;
        if ($("#luckysheet-editorConditionRule-dialog #checkTextColor").is(":checked")) {
          textcolor = $("#luckysheet-editorConditionRule-dialog #textcolorshow").spectrum("get").toHexString();
        } else {
          textcolor = null;
        }
        let cellcolor;
        if ($("#luckysheet-editorConditionRule-dialog #checkCellColor").is(":checked")) {
          cellcolor = $("#luckysheet-editorConditionRule-dialog #cellcolorshow").spectrum("get").toHexString();
        } else {
          cellcolor = null;
        }
        format = {
          "textColor": textcolor,
          "cellColor": cellcolor
        };
        rule = {
          "type": "default",
          "cellrange": cellrange,
          "format": format,
          "conditionName": conditionName,
          "conditionRange": conditionRange,
          "conditionValue": conditionValue
        };
      }

      //修改编辑的规则
      let sheetIndex = _this.editorRule["sheetIndex"];
      let itemIndex = _this.editorRule["itemIndex"];
      _this.fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"][itemIndex] = rule;

      //编辑规则隐藏，管理规则显示
      $("#luckysheet-editorConditionRule-dialog").hide();
      _this.administerRuleDialog();
    });
    $(document).off("click.CFeditorConditionRuleClose").on("click.CFeditorConditionRuleClose", "#luckysheet-editorConditionRule-dialog-close", function () {
      //编辑规则隐藏，管理规则显示
      $("#luckysheet-editorConditionRule-dialog").hide();
      $("#luckysheet-administerRule-dialog").show();
      //隐藏虚线框
      $("#luckysheet-formula-functionrange-select").hide();
      $("#luckysheet-row-count-show").hide();
      $("#luckysheet-column-count-show").hide();
    });

    // 新建规则、编辑规则 类型切换
    $(document).off("click.CFnewEditorRuleItem").on("click.CFnewEditorRuleItem", ".luckysheet-newEditorRule-dialog .ruleTypeItem", function () {
      $(this).addClass("on").siblings().removeClass("on");
      let index = $(this).index();
      $(this).parents(".luckysheet-newEditorRule-dialog").find(".ruleExplainBox").html(_this.getRuleExplain(index));
      _this.colorSelectInit();
    });
    $(document).off("change.CFnewEditorRuleType1").on("change.CFnewEditorRuleType1", ".luckysheet-newEditorRule-dialog #type1", function () {
      let optionVal = $(this).find("option:selected").val();
      if (optionVal == "dataBar" || optionVal == "colorGradation" || optionVal == "icons" || optionVal == "number" || optionVal == "text" || optionVal == "date") {
        $(this).parents(".luckysheet-newEditorRule-dialog").find("." + optionVal + "Box").show().siblings().hide();
      }
      if (optionVal == "date") {
        _this.daterangeInit($(this).parents(".luckysheet-newEditorRule-dialog").attr("id"));
      }
    });
    $(document).off("change.CFnewEditorRuleType2").on("change.CFnewEditorRuleType2", ".luckysheet-newEditorRule-dialog #type2", function () {
      let type1 = $(this).parents(".luckysheet-newEditorRule-dialog").find("#type1 option:selected").val();
      if (type1 == "colorGradation") {
        let type2 = $(this).find("option:selected").val();
        if (type2 == "threeColor") {
          $(this).parents(".luckysheet-newEditorRule-dialog").find(".midVal").show();
        } else {
          $(this).parents(".luckysheet-newEditorRule-dialog").find(".midVal").hide();
        }
      } else if (type1 == "number") {
        let type2 = $(this).find("option:selected").val();
        if (type2 == "betweenness") {
          $(this).parents(".luckysheet-newEditorRule-dialog").find(".txt").show();
          $(this).parents(".luckysheet-newEditorRule-dialog").find("#conditionVal2").show();
        } else {
          $(this).parents(".luckysheet-newEditorRule-dialog").find(".txt").hide();
          $(this).parents(".luckysheet-newEditorRule-dialog").find("#conditionVal2").hide();
        }
      }
    });
    $(document).off("click.CFiconsShowbox").on("click.CFiconsShowbox", ".luckysheet-newEditorRule-dialog .iconsBox .showbox", function () {
      $(this).parents(".iconsBox").find("ul").toggle();
    });
    $(document).off("click.CFiconsLi").on("click.CFiconsLi", ".luckysheet-newEditorRule-dialog .iconsBox li", function () {
      let len = $(this).find("div").attr("data-len");
      let leftmin = $(this).find("div").attr("data-leftmin");
      let top = $(this).find("div").attr("data-top");
      let title = $(this).find("div").attr("title");
      let position = $(this).find("div").css("background-position");
      $(this).parents(".iconsBox").find(".showbox .model").css("background-position", position);
      $(this).parents(".iconsBox").find(".showbox .model").attr("data-len", len);
      $(this).parents(".iconsBox").find(".showbox .model").attr("data-leftmin", leftmin);
      $(this).parents(".iconsBox").find(".showbox .model").attr("data-top", top);
      $(this).parents(".iconsBox").find(".showbox .model").attr("title", title);
      $(this).parents("ul").hide();
    });

    // 删除规则
    $(document).off("click.CFdeleteConditionRule").on("click.CFdeleteConditionRule", "#deleteConditionRule", function () {
      let sheetIndex = $("#luckysheet-administerRule-dialog .chooseSheet option:selected").val();
      let itemIndex = $("#luckysheet-administerRule-dialog .ruleList .listBox .item.on").attr("data-item");
      _this.fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"].splice(itemIndex, 1);
      _this.administerRuleDialog();
    });

    // 规则子菜单弹出层 点击确定修改样式
    $(document).off("click.CFdefault").on("click.CFdefault", "#luckysheet-conditionformat-dialog-confirm", function () {
      //条件名称
      let conditionName = $("#luckysheet-conditionformat-dialog .box").attr("data-itemvalue");

      //条件单元格
      let conditionRange = [];

      //条件值
      let conditionValue = [];
      if (conditionName == "greaterThan" || conditionName == "lessThan" || conditionName == "equal" || conditionName == "textContains") {
        let v = $("#luckysheet-conditionformat-dialog #conditionVal").val().trim();

        //条件值是否是选区
        let rangeArr = _this.getRangeByTxt(v);
        if (rangeArr.length > 1) {
          _this.infoDialog(conditionformat_Text.onlySingleCell, "");
          return;
        } else if (rangeArr.length == 1) {
          let r1 = rangeArr[0].row[0],
            r2 = rangeArr[0].row[1];
          let c1 = rangeArr[0].column[0],
            c2 = rangeArr[0].column[1];
          if (r1 == r2 && c1 == c2) {
            v = getcellvalue(r1, c1, Store.flowdata);
            conditionRange.push({
              "row": rangeArr[0].row,
              "column": rangeArr[0].column
            });
            conditionValue.push(v);
          } else {
            _this.infoDialog(conditionformat_Text.onlySingleCell, "");
            return;
          }
        } else if (rangeArr.length == 0) {
          if (isNaN(v) || v == "") {
            _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
            return;
          } else {
            conditionValue.push(v);
          }
        }
      } else if (conditionName == "betweenness") {
        //介于
        let v1 = $("#luckysheet-conditionformat-dialog #conditionVal").val().trim();
        let v2 = $("#luckysheet-conditionformat-dialog #conditionVal2").val().trim();

        //条件值是否是选区
        let rangeArr1 = _this.getRangeByTxt(v1);
        if (rangeArr1.length > 1) {
          _this.infoDialog(conditionformat_Text.onlySingleCell, "");
          return;
        } else if (rangeArr1.length == 1) {
          let r1 = rangeArr1[0].row[0],
            r2 = rangeArr1[0].row[1];
          let c1 = rangeArr1[0].column[0],
            c2 = rangeArr1[0].column[1];
          if (r1 == r2 && c1 == c2) {
            v1 = getcellvalue(r1, c1, Store.flowdata);

            // conditionRange.push({ "row": rangeArr1[0].row, "column": rangeArr1[0].column });
            conditionRange[0] = {
              "row": rangeArr1[0].row,
              "column": rangeArr1[0].column
            };
            conditionValue.push(v1);
          } else {
            _this.infoDialog(conditionformat_Text.onlySingleCell, "");
            return;
          }
        } else if (rangeArr1.length == 0) {
          if (isNaN(v1) || v1 == "") {
            _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
            return;
          } else {
            conditionValue.push(v1);
          }
        }
        let rangeArr2 = _this.getRangeByTxt(v2);
        if (rangeArr2.length > 1) {
          _this.infoDialog(conditionformat_Text.onlySingleCell, "");
          return;
        } else if (rangeArr2.length == 1) {
          let r1 = rangeArr2[0].row[0],
            r2 = rangeArr2[0].row[1];
          let c1 = rangeArr2[0].column[0],
            c2 = rangeArr2[0].column[1];
          if (r1 == r2 && c1 == c2) {
            v2 = getcellvalue(r1, c1, Store.flowdata);

            // conditionRange.push({ "row": rangeArr2[0].row, "column": rangeArr2[0].column });
            conditionRange[1] = {
              "row": rangeArr2[0].row,
              "column": rangeArr2[0].column
            };
            conditionValue.push(v2);
          } else {
            _this.infoDialog(conditionformat_Text.onlySingleCell, "");
            return;
          }
        } else if (rangeArr2.length == 0) {
          if (isNaN(v2) || v2 == "") {
            _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
            return;
          } else {
            conditionValue.push(v2);
          }
        }
      } else if (conditionName == "occurrenceDate") {
        //日期
        let v = $("#luckysheet-conditionformat-dialog #daterange-btn").val();
        if (v == "" || v == null) {
          _this.infoDialog(conditionformat_Text.pleaseSelectADate, "");
          return;
        }
        conditionValue.push(v);
      } else if (conditionName == "duplicateValue") {
        //重复值
        conditionValue.push($("#luckysheet-conditionformat-dialog #conditionVal option:selected").val());
      } else if (conditionName == "top10" || conditionName == "top10%" || conditionName == "last10" || conditionName == "last10%") {
        let v = $("#luckysheet-conditionformat-dialog #conditionVal").val().trim();
        if (parseInt(v) != v || parseInt(v) < 1 || parseInt(v) > 1000) {
          _this.infoDialog(conditionformat_Text.pleaseEnterInteger, "");
          return;
        }
        conditionValue.push(v);
      } else if (conditionName == "AboveAverage") {
        //高于平均值
        conditionValue.push("AboveAverage");
      } else if (conditionName == "SubAverage") {
        //低于平均值
        conditionValue.push("SubAverage");
      }

      //格式颜色
      let textcolor;
      if ($("#checkTextColor").is(":checked")) {
        textcolor = $("#textcolorshow").spectrum("get").toHexString();
      } else {
        textcolor = null;
      }
      let cellcolor;
      if ($("#checkCellColor").is(":checked")) {
        cellcolor = $("#cellcolorshow").spectrum("get").toHexString();
      } else {
        cellcolor = null;
      }

      //保存之前的规则
      let fileH = $.extend(true, [], Store.luckysheetfile);
      let historyRules = _this.getHistoryRules(fileH);

      //保存当前的规则
      let rule = {
        "type": "default",
        "cellrange": $.extend(true, [], Store.luckysheet_select_save),
        "format": {
          "textColor": textcolor,
          "cellColor": cellcolor
        },
        "conditionName": conditionName,
        "conditionRange": conditionRange,
        "conditionValue": conditionValue
      };
      let ruleArr = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] == undefined ? [] : Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"];
      ruleArr.push(rule);
      Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] = ruleArr;
      let fileC = $.extend(true, [], Store.luckysheetfile);
      let currentRules = _this.getCurrentRules(fileC);

      //刷新一次表格
      _this.ref(historyRules, currentRules);

      //隐藏一些dom
      $("#luckysheet-modal-dialog-mask").hide();
      $("#luckysheet-conditionformat-dialog").hide();
    });

    // 图标集弹出层 选择
    $(document).off("click.CFicons").on("click.CFicons", "#luckysheet-CFicons-dialog .item", function () {
      $("#luckysheet-modal-dialog-mask").hide();
      $("#luckysheet-CFicons-dialog").hide();
      if (Store.luckysheet_select_save.length > 0) {
        let cellrange = $.extend(true, [], Store.luckysheet_select_save);
        let format = {
          "len": $(this).attr("data-len"),
          "leftMin": $(this).attr("data-leftMin"),
          "top": $(this).attr("data-top")
        };
        _this.updateItem("icons", cellrange, format);
      }
    });

    // 选择单元格
    $(document).on("click", ".range .fa-table", function () {
      let id = $(this).parents(".luckysheet-modal-dialog").attr("id");
      $("#" + id).hide();
      //入口
      let source;
      if (id == "luckysheet-conditionformat-dialog") {
        let $id = $(this).siblings("input").attr("id");
        if ($id == "conditionVal") {
          source = "0_1";
        } else {
          source = "0_2";
        }
      } else if (id == "luckysheet-newConditionRule-dialog") {
        let $id = $(this).parents(".range").attr("id");
        if ($id == "formulaConditionVal") {
          source = "1_0";
        } else if ($id == "conditionVal") {
          source = "1_1";
        } else {
          source = "1_2";
        }
      } else if (id == "luckysheet-editorConditionRule-dialog") {
        let $id = $(this).parents(".range").attr("id");
        if ($id == "formulaConditionVal") {
          source = "2_0";
        } else if ($id == "conditionVal") {
          source = "2_1";
        } else {
          source = "2_2";
        }
      }
      //input值
      let v = $(this).siblings("input").val();
      _this.singleRangeDialog(source, v);
      selectionCopyShow(_this.getRangeByTxt(v));
    });
    $(document).on("click", "#luckysheet-singleRange-dialog-confirm", function () {
      $("#luckysheet-modal-dialog-mask").show();
      $(this).parents("#luckysheet-singleRange-dialog").hide();
      let source = $(this).attr("data-source");
      let v = $(this).parents("#luckysheet-singleRange-dialog").find("input").val();
      if (source == "0_1") {
        $("#luckysheet-conditionformat-dialog").show();
        $("#luckysheet-conditionformat-dialog #conditionVal").val(v);
      } else if (source == "0_2") {
        $("#luckysheet-conditionformat-dialog").show();
        $("#luckysheet-conditionformat-dialog #conditionVal2").val(v);
      } else if (source == "1_0") {
        $("#luckysheet-newConditionRule-dialog").show();
        $("#luckysheet-newConditionRule-dialog #formulaConditionVal input").val(v);
      } else if (source == "1_1") {
        $("#luckysheet-newConditionRule-dialog").show();
        $("#luckysheet-newConditionRule-dialog #conditionVal input").val(v);
      } else if (source == "1_2") {
        $("#luckysheet-newConditionRule-dialog").show();
        $("#luckysheet-newConditionRule-dialog #conditionVal2 input").val(v);
      } else if (source == "2_0") {
        $("#luckysheet-editorConditionRule-dialog").show();
        $("#luckysheet-editorConditionRule-dialog #formulaConditionVal input").val(v);
      } else if (source == "2_1") {
        $("#luckysheet-editorConditionRule-dialog").show();
        $("#luckysheet-editorConditionRule-dialog #conditionVal input").val(v);
      } else if (source == "2_2") {
        $("#luckysheet-editorConditionRule-dialog").show();
        $("#luckysheet-editorConditionRule-dialog #conditionVal2 input").val(v);
      }
      let range = [];
      selectionCopyShow(range);
    });
    $(document).on("click", "#luckysheet-singleRange-dialog-close", function () {
      $("#luckysheet-modal-dialog-mask").show();
      $(this).parents("#luckysheet-singleRange-dialog").hide();
      let source = $(this).attr("data-source");
      if (source == "0_1" || source == "0_2") {
        $("#luckysheet-conditionformat-dialog").show();
      } else if (source == "1_0" || source == "1_1" || source == "1_2") {
        $("#luckysheet-newConditionRule-dialog").show();
      } else if (source == "2_0" || source == "2_1" || source == "2_2") {
        $("#luckysheet-editorConditionRule-dialog").show();
      }
      let range = [];
      selectionCopyShow(range);
    });

    // 弹出层右上角关闭按钮
    $(document).on("click", ".luckysheet-modal-dialog-title-close", function () {
      let id = $(this).parents(".luckysheet-modal-dialog").attr("id");

      //新建规则弹出层
      if (id == "luckysheet-newConditionRule-dialog") {
        let source = $("#" + id).find("#luckysheet-newConditionRule-dialog-close").attr("data-source");
        //新建规则入口
        if (source == 1) {
          $("#luckysheet-administerRule-dialog").show();
        }
      }

      //编辑规则弹出层
      if (id == "luckysheet-editorConditionRule-dialog") {
        $("#luckysheet-administerRule-dialog").show();
      }

      //选择单元格弹出层
      if (id == "luckysheet-singleRange-dialog") {
        $("#luckysheet-modal-dialog-mask").show();
        let source = $(this).parents("#luckysheet-singleRange-dialog").find("#luckysheet-singleRange-dialog-confirm").attr("data-source");
        if (source == "0_1" || source == "0_2") {
          $("#luckysheet-conditionformat-dialog").show();
        } else if (source == "1_1" || source == "1_2") {
          $("#luckysheet-newConditionRule-dialog").show();
        } else if (source == "2_1" || source == "2_2") {
          $("#luckysheet-editorConditionRule-dialog").show();
        }
        let range = [];
        selectionCopyShow(range);
      }

      //选择应用范围弹出层
      if (id == "luckysheet-multiRange-dialog") {
        $("#luckysheet-modal-dialog-mask").show();
        $("#luckysheet-administerRule-dialog").show();
        let range = [];
        selectionCopyShow(range);
      }

      //提示框
      if (id == "luckysheet-conditionformat-info-dialog") {
        $("#luckysheet-modal-dialog-mask").show();
      }
    });

    //提示框
    $(document).on("click", "#luckysheet-conditionformat-info-dialog-close", function () {
      $(this).parents("#luckysheet-conditionformat-info-dialog").hide();
    });
  },
  singleRangeDialog: function (source, value) {
    $("#luckysheet-modal-dialog-mask").hide();
    $("#luckysheet-singleRange-dialog").remove();
    const conditionformat_Text = locale().conditionformat;
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-singleRange-dialog",
      "addclass": "luckysheet-singleRange-dialog",
      "title": conditionformat_Text.selectCell,
      "content": `<input readonly="readonly" placeholder="${conditionformat_Text.pleaseSelectCell}" value="${value}"/>`,
      "botton": `<button id="luckysheet-singleRange-dialog-confirm" class="btn btn-primary" data-source="${source}">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-singleRange-dialog-close" class="btn btn-default" data-source="${source}">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-singleRange-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 300).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#luckysheet-singleRange-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();
  },
  multiRangeDialog: function (dataItem, value) {
    let _this = this;
    $("#luckysheet-modal-dialog-mask").hide();
    $("#luckysheet-multiRange-dialog").remove();
    const conditionformat_Text = locale().conditionformat;
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-multiRange-dialog",
      "addclass": "luckysheet-multiRange-dialog",
      "title": conditionformat_Text.selectRange,
      "content": `<input readonly="readonly" placeholder="${conditionformat_Text.pleaseSelectRange}" value="${value}"/>`,
      "botton": `<button id="luckysheet-multiRange-dialog-confirm" class="btn btn-primary" data-item="${dataItem}">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-multiRange-dialog-close" class="btn btn-default">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-multiRange-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 300).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#luckysheet-multiRange-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();
    selectionCopyShow(_this.getRangeByTxt(value));
  },
  conditionformatDialog: function (title, content) {
    let _this = this;
    $("#luckysheet-modal-dialog-mask").show();
    $("#luckysheet-conditionformat-dialog").remove();
    const conditionformat_Text = locale().conditionformat;
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-conditionformat-dialog",
      "addclass": "luckysheet-conditionformat-dialog",
      "title": title,
      "content": content,
      "botton": `<button id="luckysheet-conditionformat-dialog-confirm" class="btn btn-primary">${conditionformat_Text.confirm}</button>
                        <button class="btn btn-default luckysheet-model-close-btn">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:9999"
    }));
    let $t = $("#luckysheet-conditionformat-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 300).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#luckysheet-conditionformat-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();
    _this.init();
    _this.colorSelectInit();
    if (title == locale().conditionformat.conditionformat_occurrenceDate) {
      _this.daterangeInit("luckysheet-conditionformat-dialog");
    }
  },
  CFiconsDialog: function () {
    $("#luckysheet-modal-dialog-mask").show();
    $("#luckysheet-CFicons-dialog").remove();
    const conditionformat_Text = locale().conditionformat;
    let content = `<div class="box">
                            <div style="margin-bottom: 10px;">${conditionformat_Text.pleaseSelectIcon}</div>
                            <div class="title">${conditionformat_Text.direction}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.multicolor})"><div style="background-position:0 0;"></div></div>
                                    <div class="item" data-len="3" data-leftMin="0" data-top="1" title="${conditionformat_Text.threeTriangles}"><div style="background-position:0 -20px;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="0" data-top="2" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.multicolor})"><div style="background-position:0 -40px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="0" data-top="3" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.multicolor})"><div style="background-position:0 -60px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="3" data-leftMin="5" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.grayColor})"><div style="background-position:-131px 0;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="5" data-top="1" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.grayColor})"><div style="background-position:-131px -20px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="5" data-top="2" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.grayColor})"><div style="background-position:-131px -40px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div class="title">${conditionformat_Text.shape}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.rimless})"><div style="background-position:0 -80px;"></div></div>
                                    <div class="item" data-len="3" data-leftMin="0" data-top="5" title="${conditionformat_Text.threeSigns}"><div style="background-position:0 -100px;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="0" data-top="6" title="${conditionformat_Text.greenRedBlackGradient}"><div style="background-position:0 -120px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="3" data-leftMin="5" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.bordered})"><div style="background-position:-131px -80px;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="5" data-top="5" title="${conditionformat_Text.fourColorTrafficLight}"><div style="background-position:-131px -100px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div class="title">${conditionformat_Text.mark}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.circled})"><div style="background-position:0 -140px;"></div></div>
                                    <div class="item" data-len="3" data-leftMin="0" data-top="8" title="${conditionformat_Text.tricolorFlag}"><div style="background-position:0 -160px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="3" data-leftMin="5" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.noCircle})"><div style="background-position:-131px -140px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div class="title">${conditionformat_Text.grade}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="9" title="${conditionformat_Text.threeStars}"><div style="background-position:0 -180px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="0" data-top="10" title="${conditionformat_Text.fiveQuadrantDiagram}"><div style="background-position:0 -200px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="0" data-top="11" title="${conditionformat_Text.fiveBoxes}"><div style="background-position:0 -220px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="4" data-leftMin="5" data-top="9" title="${conditionformat_Text.grade4}"><div style="background-position:-131px -180px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="5" data-top="10" title="${conditionformat_Text.grade5}"><div style="background-position:-131px -200px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                        </div>`;
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-CFicons-dialog",
      "addclass": "luckysheet-CFicons-dialog",
      "title": conditionformat_Text.icons,
      "content": content,
      "botton": `<button class="btn btn-default luckysheet-model-close-btn">${conditionformat_Text.close}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-CFicons-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 400).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#luckysheet-CFicons-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();
  },
  administerRuleDialog: function () {
    $("#luckysheet-modal-dialog-mask").show();
    $("#luckysheet-administerRule-dialog").remove();
    const conditionformat_Text = locale().conditionformat;

    //工作表
    let opHtml = '';
    for (let j = 0; j < Store.luckysheetfile.length; j++) {
      if (Store.luckysheetfile[j].status == "1") {
        opHtml += `<option value="${Store.luckysheetfile[j]["index"]}" selected="selected">
                                ${conditionformat_Text.currentSheet}：${Store.luckysheetfile[j]["name"]}
                            </option>`;
      } else {
        opHtml += `<option value="${Store.luckysheetfile[j]["index"]}">
                                ${conditionformat_Text.sheet}：${Store.luckysheetfile[j]["name"]}
                            </option>`;
      }
    }
    let content = `<div class="chooseSheet">
                            <label>${conditionformat_Text.showRules}：</label>
                            <select>${opHtml}</select>
                        </div>
                        <div class="ruleBox">
                            <div class="ruleBtn">
                                <button id="newConditionRule" class="btn btn-default">${conditionformat_Text.newRule}</button>
                                <button id="editorConditionRule" class="btn btn-default">${conditionformat_Text.editRule}</button>
                                <button id="deleteConditionRule" class="btn btn-default">${conditionformat_Text.deleteRule}</button>
                            </div>
                            <div class="ruleList">
                                <div class="listTitle">
                                    <span>${conditionformat_Text.rule}</span>
                                    <span>${conditionformat_Text.format}</span>
                                    <span>${conditionformat_Text.applyRange}</span>
                                </div>
                                <div class="listBox"></div>
                            </div>
                        </div>`;
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-administerRule-dialog",
      "addclass": "luckysheet-administerRule-dialog",
      "title": conditionformat_Text.conditionformatManageRules,
      "content": content,
      "botton": `<button id="luckysheet-administerRule-dialog-confirm" class="btn btn-primary">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-administerRule-dialog-close" class="btn btn-default">${conditionformat_Text.close}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-administerRule-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 400).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#luckysheet-administerRule-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();

    //当前工作表的规则列表
    let index = $("#luckysheet-administerRule-dialog .chooseSheet option:selected").val();
    this.getConditionRuleList(index);
  },
  newConditionRuleDialog: function (source) {
    let _this = this;
    const conditionformat_Text = locale().conditionformat;

    //规则说明
    let ruleExplainHtml = _this.getRuleExplain(0);

    //弹出层
    $("#luckysheet-modal-dialog-mask").show();
    $("#luckysheet-administerRule-dialog").hide();
    $("#luckysheet-newConditionRule-dialog").remove();
    let content = '<div>' + '<div class="boxTitle">' + conditionformat_Text.chooseRuleType + '：</div>' + _this.ruleTypeHtml() + '<div class="boxTitle">' + conditionformat_Text.editRuleDescription + '：</div>' + '<div class="ruleExplainBox">' + ruleExplainHtml + '</div>' + '</div>';
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-newConditionRule-dialog",
      "addclass": "luckysheet-newEditorRule-dialog",
      "title": conditionformat_Text.newFormatRule,
      "content": content,
      "botton": `<button id="luckysheet-newConditionRule-dialog-confirm" class="btn btn-primary" data-source="${source}">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-newConditionRule-dialog-close" class="btn btn-default" data-source="${source}">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-newConditionRule-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 400).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#luckysheet-newConditionRule-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();

    //index的规则类型focus
    $("#luckysheet-newConditionRule-dialog .ruleTypeBox .ruleTypeItem:eq(0)").addClass("on").siblings().removeClass("on");
    _this.colorSelectInit();
  },
  editorConditionRuleDialog: function () {
    let _this = this;
    const conditionformat_Text = locale().conditionformat;
    let rule = _this.editorRule.data;
    if (rule == null) {
      return;
    }
    let ruleType = rule["type"],
      ruleFormat = rule["format"],
      conditionName = rule["conditionName"];
    let index, type1;
    if (ruleType == "dataBar" || ruleType == "colorGradation" || ruleType == "icons") {
      index = 0;
      type1 = ruleType;
    } else {
      if (conditionName == "greaterThan" || conditionName == "lessThan" || conditionName == "betweenness" || conditionName == "equal" || conditionName == "textContains" || conditionName == "occurrenceDate") {
        index = 1;
        if (conditionName == "greaterThan" || conditionName == "lessThan" || conditionName == "betweenness" || conditionName == "equal") {
          type1 = "number";
        } else if (conditionName == "textContains") {
          type1 = "text";
        } else if (conditionName == "occurrenceDate") {
          type1 = "date";
        }
      } else if (conditionName == "top10" || conditionName == "top10%" || conditionName == "last10" || conditionName == "last10%") {
        index = 2;
        if (conditionName == "top10" || conditionName == "top10%") {
          type1 = "top";
        } else if (conditionName == "last10" || conditionName == "last10%") {
          type1 = "last";
        }
      } else if (conditionName == "AboveAverage" || conditionName == "SubAverage") {
        index = 3;
        type1 = conditionName;
      } else if (conditionName == "duplicateValue") {
        index = 4;
        type1 = rule["conditionValue"];
      } else if (conditionName == "formula") {
        index = 5;
      }
    }

    //规则说明
    let ruleExplainHtml = _this.getRuleExplain(index);

    //弹出层
    $("#luckysheet-modal-dialog-mask").show();
    $("#luckysheet-administerRule-dialog").hide();
    $("#luckysheet-editorConditionRule-dialog").remove();
    let content = '<div>' + '<div class="boxTitle">' + conditionformat_Text.chooseRuleType + '：</div>' + _this.ruleTypeHtml() + '<div class="boxTitle">' + conditionformat_Text.editRuleDescription + '：</div>' + '<div class="ruleExplainBox">' + ruleExplainHtml + '</div>' + '</div>';
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-editorConditionRule-dialog",
      "addclass": "luckysheet-newEditorRule-dialog",
      "title": conditionformat_Text.editFormatRule,
      "content": content,
      "botton": `<button id="luckysheet-editorConditionRule-dialog-confirm" class="btn btn-primary">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-editorConditionRule-dialog-close" class="btn btn-default">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-editorConditionRule-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 400).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#luckysheet-editorConditionRule-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();
    _this.colorSelectInit();

    //规则类型focus
    $("#luckysheet-editorConditionRule-dialog .ruleTypeBox .ruleTypeItem:eq(" + index + ")").addClass("on").siblings().removeClass("on");

    //type1
    $("#luckysheet-editorConditionRule-dialog #type1").val(type1);
    if (type1 == "dataBar" || type1 == "colorGradation" || type1 == "icons" || type1 == "number" || type1 == "text" || type1 == "date") {
      $("#luckysheet-editorConditionRule-dialog ." + type1 + "Box").show();
      $("#luckysheet-editorConditionRule-dialog ." + type1 + "Box").siblings().hide();
    }
    if (type1 == "date") {
      _this.daterangeInit("luckysheet-editorConditionRule-dialog");
    }

    //type2  format  value
    if (ruleType == "dataBar" || ruleType == "colorGradation" || ruleType == "icons") {
      if (type1 == "dataBar") {
        if (ruleFormat.length == 2) {
          $("#luckysheet-editorConditionRule-dialog .dataBarBox #type2").val("gradient");
        } else if (ruleFormat.length == 1) {
          $("#luckysheet-editorConditionRule-dialog .dataBarBox #type2").val("solid");
        }
        $("#luckysheet-editorConditionRule-dialog .dataBarBox .luckysheet-conditionformat-config-color").spectrum("set", ruleFormat[0]);
      } else if (type1 == "colorGradation") {
        if (ruleFormat.length == 3) {
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox #type2").val("threeColor");
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox .midVal").show();
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox .maxVal .luckysheet-conditionformat-config-color").spectrum("set", ruleFormat[0]);
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox .midVal .luckysheet-conditionformat-config-color").spectrum("set", ruleFormat[1]);
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox .minVal .luckysheet-conditionformat-config-color").spectrum("set", ruleFormat[2]);
        } else if (ruleFormat.length == 2) {
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox #type2").val("twoColor");
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox .midVal").hide();
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox .maxVal .luckysheet-conditionformat-config-color").spectrum("set", ruleFormat[0]);
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox .minVal .luckysheet-conditionformat-config-color").spectrum("set", ruleFormat[1]);
        }
      } else if (type1 == "icons") {
        let len = ruleFormat["len"];
        let l = ruleFormat["leftMin"];
        let t = ruleFormat["top"];
        $("#luckysheet-editorConditionRule-dialog .iconsBox li").each(function (i, e) {
          if ($(e).find("div").attr("data-len") == len && $(e).find("div").attr("data-leftmin") == l && $(e).find("div").attr("data-top") == t) {
            $("#luckysheet-editorConditionRule-dialog .iconsBox .showbox .model").css("background-position", $(e).find("div").css("background-position"));
            $("#luckysheet-editorConditionRule-dialog .iconsBox .showbox .model").attr("data-len", $(e).find("div").attr("data-len"));
            $("#luckysheet-editorConditionRule-dialog .iconsBox .showbox .model").attr("data-leftmin", $(e).find("div").attr("data-leftmin"));
            $("#luckysheet-editorConditionRule-dialog .iconsBox .showbox .model").attr("data-top", $(e).find("div").attr("data-leftmin"));
            $("#luckysheet-editorConditionRule-dialog .iconsBox .showbox .model").attr("title", $(e).find("div").attr("title"));
            return true;
          }
        });
      }
    } else {
      if (type1 == "number") {
        $("#luckysheet-editorConditionRule-dialog .numberBox #type2").val(conditionName);
        let val1;
        if (rule.conditionRange[0] != null) {
          val1 = getRangetxt(Store.currentSheetIndex, {
            "row": rule.conditionRange[0]["row"],
            "column": rule.conditionRange[0]["column"]
          }, Store.currentSheetIndex);
        } else {
          val1 = rule.conditionValue[0];
        }
        $("#luckysheet-editorConditionRule-dialog .numberBox #conditionVal input").val(val1);
        if (conditionName == "betweenness") {
          $("#luckysheet-editorConditionRule-dialog .numberBox .txt").show();
          $("#luckysheet-editorConditionRule-dialog .numberBox #conditionVal2").show();
          let val2;
          if (rule.conditionRange[1] != null) {
            val2 = getRangetxt(Store.currentSheetIndex, {
              "row": rule.conditionRange[1]["row"],
              "column": rule.conditionRange[1]["column"]
            }, Store.currentSheetIndex);
          } else {
            val2 = rule.conditionValue[1];
          }
          $("#luckysheet-editorConditionRule-dialog .numberBox #conditionVal2 input").val(val2);
        } else {
          $("#luckysheet-editorConditionRule-dialog .numberBox .txt").hide();
          $("#luckysheet-editorConditionRule-dialog .numberBox #conditionVal2").hide();
        }
      } else if (type1 == "text") {
        let val1;
        if (rule.conditionRange[0] != null) {
          val1 = getRangetxt(Store.currentSheetIndex, {
            "row": rule.conditionRange[0]["row"],
            "column": rule.conditionRange[0]["column"]
          }, Store.currentSheetIndex);
        } else {
          val1 = rule.conditionValue[0];
        }
        $("#luckysheet-editorConditionRule-dialog .textBox #conditionVal input").val(val1);
      } else if (type1 == "date") {
        _this.daterangeInit("luckysheet-editorConditionRule-dialog");
        let val1 = rule.conditionValue[0];
        $("#luckysheet-editorConditionRule-dialog .dateBox #daterange-btn").val(val1);
      } else if (type1 == "top" || type1 == "last") {
        let val1 = rule.conditionValue[0];
        if (conditionName == "top10%" || conditionName == "last10%") {
          $("#luckysheet-editorConditionRule-dialog #isPercent").attr("checked", "checked");
        }
      } else {
        if (conditionName == "formula") {
          let val1 = rule.conditionValue[0];
          $("#luckysheet-editorConditionRule-dialog #formulaConditionVal input").val(val1);
        }
      }
      $("#luckysheet-editorConditionRule-dialog #textcolorshow").spectrum("set", ruleFormat.textColor);
      $("#luckysheet-editorConditionRule-dialog #cellcolorshow").spectrum("set", ruleFormat.cellColor);
    }
  },
  infoDialog: function (title, content) {
    $("#luckysheet-modal-dialog-mask").show();
    $("#luckysheet-conditionformat-info-dialog").remove();
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-conditionformat-info-dialog",
      "addclass": "",
      "title": title,
      "content": content,
      "botton": `<button id="luckysheet-conditionformat-info-dialog-close" class="btn btn-default">${locale().conditionformat.close}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-conditionformat-info-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 300).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#luckysheet-conditionformat-info-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();
  },
  getRuleExplain: function (index) {
    const conditionformat_Text = locale().conditionformat;
    let textCellColorHtml = this.textCellColorHtml();
    let ruleExplainHtml;
    switch (index) {
      case 0:
        //基于各自值设置所有单元格的格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem1}：</div>
                                    <div style="height: 30px;margin-bottom: 5px;">
                                        <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.formatStyle}：</label>
                                        <select id="type1">
                                            <option value="dataBar">${conditionformat_Text.dataBar}</option>
                                            <option value="colorGradation">${conditionformat_Text.colorGradation}</option>
                                            <option value="icons">${conditionformat_Text.icons}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div class="type1Box dataBarBox">
                                            <div style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.fillType}：</label>
                                                <select id="type2">
                                                    <option value="gradient">${conditionformat_Text.gradient}</option>
                                                    <option value="solid">${conditionformat_Text.solid}</option>
                                                </select>
                                            </div>
                                            <div style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.color}：</label>
                                                <input data-tips="${conditionformat_Text.dataBarColor}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="#638ec6" style="display: none;"> 
                                            </div>
                                        </div>
                                        <div class="type1Box colorGradationBox" style="display: none;">
                                            <div style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.fillType}：</label>
                                                <select id="type2">
                                                    <option value="threeColor">${conditionformat_Text.tricolor}</option>
                                                    <option value="twoColor">${conditionformat_Text.twocolor}</option>
                                                </select>
                                            </div>
                                            <div class="maxVal" style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.maxValue}：</label>
                                                <input data-tips="${conditionformat_Text.maxValue} ${conditionformat_Text.color}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="rgb(99, 190, 123)" style="display: none;">
                                            </div>
                                            <div class="midVal" style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.medianValue}：</label>
                                                <input data-tips="${conditionformat_Text.medianValue} ${conditionformat_Text.color}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="rgb(255, 235, 132)" style="display: none;">
                                            </div>
                                            <div class="minVal" style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.minValue}：</label>
                                                <input data-tips="${conditionformat_Text.minValue} ${conditionformat_Text.color}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="rgb(248, 105, 107)" style="display: none;">
                                            </div>
                                        </div>
                                        <div class="type1Box iconsBox" style="display: none;">
                                            <label>${conditionformat_Text.fillType}：</label>
                                            <div class="showbox">
                                                <div class="model" data-len="3" data-leftmin="0" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 0;"></div>
                                                <span class="ui-selectmenu-icon ui-icon ui-icon-triangle-1-s" style="margin-top: 2px;"></span>
                                            </div>
                                            <ul>
                                                <li><div data-len="3" data-leftmin="0" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 0;"></div></li>
                                                <li><div data-len="3" data-leftmin="5" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.grayColor})" style="background-position: -131px 0;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="1" title="${conditionformat_Text.threeTriangles}" style="background-position: 0 -20px;"></div></li>
                                                <li><div data-len="4" data-leftmin="0" data-top="2" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 -40px;"></div></li>
                                                <li><div data-len="4" data-leftmin="5" data-top="1" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.grayColor})" style="background-position: -131px -20px;"></div></li>
                                                <li><div data-len="5" data-leftmin="0" data-top="3" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 -60px;"></div></li>
                                                <li><div data-len="5" data-leftmin="5" data-top="2" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.grayColor})" style="background-position: -131px -40px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.rimless})" style="background-position: 0 -80px;"></div></li>
                                                <li><div data-len="3" data-leftmin="5" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.bordered})" style="background-position: -131px -80px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="5" title="${conditionformat_Text.threeSigns}" style="background-position: 0 -100px;"></div></li>
                                                <li><div data-len="4" data-leftmin="5" data-top="5" title="${conditionformat_Text.fourColorTrafficLight}" style="background-position: -131px -100px;"></div></li>
                                                <li><div data-len="4" data-leftmin="0" data-top="6" title="${conditionformat_Text.greenRedBlackGradient}" style="background-position: 0 -120px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.circled})" style="background-position: 0 -140px;"></div></li>
                                                <li><div data-len="3" data-leftmin="5" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.noCircle})" style="background-position: -131px -140px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="8" title="${conditionformat_Text.tricolorFlag}" style="background-position: 0 -160px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="9" title="${conditionformat_Text.threeStars}" style="background-position: 0 -180px;"></div></li>
                                                <li><div data-len="5" data-leftmin="0" data-top="10" title="${conditionformat_Text.fiveQuadrantDiagram}" style="background-position: 0 -200px;"></div></li>
                                                <li><div data-len="5" data-leftmin="0" data-top="11" title="${conditionformat_Text.fiveBoxes}" style="background-position: 0 -220px;"></div></li>
                                                <li><div data-len="4" data-leftmin="5" data-top="9" title="${conditionformat_Text.grade4}" style="background-position: -131px -180px;"></div></li>
                                                <li><div data-len="5" data-leftmin="5" data-top="10" title="${conditionformat_Text.grade5}" style="background-position: -131px -200px;"></div></li>
                                            </ul>
                                        </div>
                                    </div>`;
        break;
      case 1:
        //只为包含以下内容的单元格设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem2_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="number">${conditionformat_Text.cellValue}</option>
                                            <option value="text">${conditionformat_Text.specificText}</option>
                                            <option value="date">${conditionformat_Text.occurrence}</option>
                                        </select>
                                        <div>
                                            <div class="type1Box numberBox">
                                                <select id="type2">
                                                    <option value="greaterThan">${conditionformat_Text.greaterThan}</option>
                                                    <option value="lessThan">${conditionformat_Text.lessThan}</option>
                                                    <option value="betweenness">${conditionformat_Text.between}</option>
                                                    <option value="equal">${conditionformat_Text.equal}</option>
                                                </select>
                                                <div class="inpbox range" id="conditionVal">
                                                    <input class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectCell}"></i>
                                                </div>
                                                <span class="txt" style="display: none;">${conditionformat_Text.in}</span>
                                                <div class="inpbox range" id="conditionVal2" style="display: none;">
                                                    <input class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectDataRange}"></i>
                                                </div>
                                            </div>
                                            <div class="type1Box textBox" style="display: none;">
                                                <select id="type2">
                                                    <option value="">${conditionformat_Text.contain}</option>
                                                </select>
                                                <div class="inpbox range" id="conditionVal">
                                                    <input class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectCell}"></i>
                                                </div>
                                            </div>
                                            <div class="type1Box dateBox" style="display: none;">
                                                <div style="width: 162px;" class="inpbox">
                                                    <input style="width: 150px;" id="daterange-btn" readonly="readonly" placeholder="${conditionformat_Text.pleaseSelectADate}"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}: </div>${textCellColorHtml}`;
        break;
      case 2:
        //仅对排名靠前或靠后的数值设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem3_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="top">${conditionformat_Text.top}</option>
                                            <option value="last">${conditionformat_Text.last}</option>
                                        </select>
                                        <div class="inpbox" id="conditionVal">
                                            <input class="formulaInputFocus" type="number" value="10"/>
                                        </div>
                                        <input id="isPercent" type="checkbox"/>
                                        <label for="isPercent" class="txt">${conditionformat_Text.selectRange_percent}</label>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}：</div>${textCellColorHtml}`;
        break;
      case 3:
        //仅对高于或低于平均值的数值设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem4_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="AboveAverage">${conditionformat_Text.above}</option>
                                            <option value="SubAverage">${conditionformat_Text.below}</option>
                                        </select>
                                        <span class="txt">${conditionformat_Text.selectRange_average}</span>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}：</div>${textCellColorHtml}`;
        break;
      case 4:
        //仅对唯一值或重复值设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.all}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="0">${conditionformat_Text.duplicateValue}</option>
                                            <option value="1">${conditionformat_Text.uniqueValue}</option>
                                        </select>
                                        <span class="txt">${conditionformat_Text.selectRange_value}</span>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}：</div>${textCellColorHtml}`;
        break;
      case 5:
        //使用公式确定要设置格式的单元格
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem2_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <div class="inpbox range" id="formulaConditionVal" style="width: 250px;">
                                            <input class="formulaInputFocus" style="width: 200px;"/>
                                            <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectCell}"></i>
                                        </div>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}: </div>${textCellColorHtml}`;
        break;
    }
    return ruleExplainHtml;
  },
  colorSelectInit: function () {
    const conditionformat_Text = locale().conditionformat;
    $(".luckysheet-conditionformat-config-color").spectrum({
      showPalette: true,
      showPaletteOnly: true,
      preferredFormat: "hex",
      clickoutFiresChange: false,
      showInitial: true,
      showInput: true,
      // flat: true,
      hideAfterPaletteSelect: true,
      showSelectionPalette: true,
      // showButtons: false,//隐藏选择取消按钮
      maxPaletteSize: 8,
      maxSelectionSize: 8,
      // color: currenColor,
      cancelText: conditionformat_Text.cancel,
      chooseText: conditionformat_Text.confirmColor,
      togglePaletteMoreText: "自定义",
      togglePaletteLessText: "收起",
      togglePaletteOnly: true,
      clearText: conditionformat_Text.clearColorSelect,
      noColorSelectedText: "没有颜色被选择",
      localStorageKey: "spectrum.textcolor" + luckysheetConfigsetting.gridKey,
      palette: [["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"], ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"], ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"], ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"], ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"], ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"], ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"], ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]],
      change: function (color) {
        if (color != null) {
          color = color.toHexString();
        }
      }
    });
  },
  daterangeInit: function (id) {
    const conditionformat_Text = locale().conditionformat;
    const regexSingleDate = /^\d{4}-\d{2}-\d{2}$/; // 匹配  "YYYY-MM-DD"
    const regexStartEndDate = /^\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}$/; // 匹配 "YYYY-MM-DD to YYYY-MM-DD"
    // const regexStartEndDate = /^(\d{4}-\d{2}-\d{2})( to (\d{4}-\d{2}-\d{2}))?$/; // 

    //日期选择插件
    $('.ranges_1 ul').remove();
    const daterangeBtn = $('#' + id).find("#daterange-btn");
    daterangeBtn.flatpickr({
      mode: "range",
      onChange: (data, label) => {
        const [start, end] = data;
        //label:通过它来知道用户选择的是什么，传给后台进行相应的展示
        let format1 = [conditionformat_Text.yesterday, conditionformat_Text.today];
        let format2 = [conditionformat_Text.lastWeek, conditionformat_Text.thisWeek, conditionformat_Text.lastMonth, conditionformat_Text.thisMonth, conditionformat_Text.lastYear, conditionformat_Text.thisYear, conditionformat_Text.last7days, conditionformat_Text.last30days];
        if (label == conditionformat_Text.all) {
          daterangeBtn.val('');
        } else if (format1.indexOf(label) > -1) {
          daterangeBtn.val(dayjs(start).format('YYYY/MM/DD'));
        } else if (format2.indexOf(label) > -1) {
          daterangeBtn.val(dayjs(start).format('YYYY/MM/DD') + '-' + dayjs(end).format('YYYY/MM/DD'));
        }

        // 匹配  "2023-05-17 to 2023-05-19"
        const isValidSingleFormat = regexSingleDate.test(label);
        const isValidStartEndFormat = regexStartEndDate.test(label);
        if (isValidSingleFormat) {
          daterangeBtn.val(dayjs(start).format('YYYY/MM/DD'));
        } else if (isValidStartEndFormat) {
          daterangeBtn.val(dayjs(start).format('YYYY/MM/DD') + '-' + dayjs(end).format('YYYY/MM/DD'));
        }
      }
    });
  }
};
export default dialogModule;