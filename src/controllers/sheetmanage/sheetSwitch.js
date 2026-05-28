import { isEditMode } from "../../global/validate";
import cleargridelement from "../../global/cleargridelement";
import formula from "../../global/formula";
import {  luckysheetrefreshgrid } from "../../global/refresh";
import {  luckysheetlodingHTML  } from "../constant";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetsizeauto from "../resize";
import luckysheetFreezen from "../freezen";
import Store from "../../store";
import method from "../../global/method";
import luckysheetformula from "../../global/formula";
const sheetSwitchModule = {
  changeSheet: function (index, isNewSheet, isCopySheet) {
    if (isEditMode()) {
      // alert("非编辑模式下不允许该操作！");
      return;
    }
    let _this = this;
    if (index == Store.currentSheetIndex) {
      return;
    }
    let file = Store.luckysheetfile[_this.getSheetIndex(index)];
    // 钩子 sheetCreateAfter
    if (isNewSheet) {
      method.createHookFunction("sheetCreateAfter", {
        sheet: file
      });
    }
    // 钩子 sheetCopyAfter
    if (isCopySheet) {
      method.createHookFunction("sheetCopyAfter", {
        sheet: file
      });
    }

    // 钩子函数
    method.createHookFunction("sheetActivate", index, isNewSheet);
    $("#luckysheet-filter-selected-sheet" + Store.currentSheetIndex + ", #luckysheet-filter-options-sheet" + Store.currentSheetIndex).hide();
    $("#luckysheet-filter-selected-sheet" + index + ", #luckysheet-filter-options-sheet" + index).show();

    // 存储当前index，在远程公式里能识别，如果不是当前页就不要刷新（远程公式只能刷新当前页）
    window.luckysheetCurrentIndex = index;
    _this.storeSheetParamALL();
    _this.setCurSheet(index);
    luckysheetsizeauto(false);
    let load = file["load"];
    if (load != null) {
      let data = _this.buildGridData(file);
      file.data = data;
      // _this.loadOtherFile(file);

      _this.mergeCalculation(index);
      _this.setSheetParam(true);
      _this.showSheet();
      setTimeout(function () {
        formula.execFunctionGroupForce(true);
        luckysheetrefreshgrid();
      }, 1);
    } else {
      let loadSheetUrl = luckysheetConfigsetting.loadSheetUrl;
      if (loadSheetUrl == "" || !!isNewSheet) {
        let data = _this.buildGridData(file);
        file["data"] = data;
        file["load"] = "1";

        // *这里不应该调用loadOtherFile去加载其余页面的数据,
        // *因为loadOtherFile里判断后会调用buildGridData把其余的sheet的数据设置为空的二维数组,即使那个sheet在服务端存在数据.
        // *这就导致一个数据丢失问题.
        // _this.loadOtherFile(file);

        // let sheetindexset = _this.checkLoadSheetIndex(file);
        // let sheetindex = [];

        // for(let i = 0; i < sheetindexset.length; i++){
        //     let item = sheetindexset[i];

        //     if(item == file["index"]){
        //         continue;
        //     }

        //     sheetindex.push(item);
        // }

        // for(let i = 0;i<sheetindex.length;i++){
        //     let item = sheetindex[i];
        //     let otherfile = Store.luckysheetfile[_this.getSheetIndex(item)];
        //     if(otherfile["load"] == null || otherfile["load"] == "0"){
        //         otherfile["data"] = _this.buildGridData(otherfile);
        //         otherfile["load"] = "1";
        //     }
        // }

        _this.mergeCalculation(index);
        _this.setSheetParam();
        _this.showSheet();
        setTimeout(function () {
          _this.restoreCache();
          formula.execFunctionGroupForce(luckysheetConfigsetting.forceCalculation);
          _this.restoreSheetAll(Store.currentSheetIndex);
          luckysheetrefreshgrid();
        }, 1);
      } else {
        $("#luckysheet-grid-window-1").append(luckysheetlodingHTML());
        let sheetindex = _this.checkLoadSheetIndex(file);
        $.post(loadSheetUrl, {
          gridKey: luckysheetConfigsetting.gridKey,
          index: sheetindex.join(",")
        }, function (d) {
          let dataset = new Function("return " + d)();
          file.celldata = dataset[index.toString()];
          let data = _this.buildGridData(file);
          setTimeout(function () {
            Store.loadingObj.close();
          }, 500);
          for (let item in dataset) {
            if (item == index) {
              continue;
            }
            let otherfile = Store.luckysheetfile[_this.getSheetIndex(item)];
            if (otherfile["load"] == null || otherfile["load"] == "0") {
              otherfile.celldata = dataset[item.toString()];
              otherfile["data"] = _this.buildGridData(otherfile);
              otherfile["load"] = "1";
            }
          }
          file["data"] = data;
          file["load"] = "1";
          _this.mergeCalculation(index);
          _this.setSheetParam();
          _this.showSheet();
          setTimeout(function () {
            _this.restoreCache();
            formula.execFunctionGroupForce(luckysheetConfigsetting.forceCalculation);
            _this.restoreSheetAll(Store.currentSheetIndex);
            luckysheetrefreshgrid();
          }, 1);
        });
      }
    }
    $("#luckysheet-cell-main .luckysheet-datavisual-selection-set").hide();
    $("#luckysheet-datavisual-selection-set-" + index).show();
    luckysheetformula.hideButton();
    luckysheetFreezen.initialFreezen(index);
    _this.restoreselect();
  },
  changeSheetExec: function (index, isNewSheet, isCopySheet) {
    let $sheet = $("#luckysheet-sheets-item" + index);
    window.luckysheet_getcelldata_cache = null;
    $("#luckysheet-sheet-area div.luckysheet-sheets-item").removeClass("luckysheet-sheets-item-active");
    $sheet.addClass("luckysheet-sheets-item-active").show();
    cleargridelement();
    this.changeSheet(index, isNewSheet, isCopySheet);
    $("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").hide();
    if (formula.rangestart) {
      formula.createRangeHightlight();
    }
    this.sheetBarShowAndHide(index);
  },
  setCurSheet: function (index) {
    for (let i = 0; i < Store.luckysheetfile.length; i++) {
      if (Store.luckysheetfile[i]["index"] == index) {
        Store.luckysheetfile[i].status = 1;
      } else {
        Store.luckysheetfile[i].status = 0;
      }
    }
    Store.currentSheetIndex = index;
  },
  getCurSheet: function () {
    if (Store.luckysheetfile.length) {
      let hasActive = false,
        indexs = [];
      Store.luckysheetfile.forEach(item => {
        if ("undefined" === typeof item.index) {
          item.index = this.generateRandomSheetIndex();
        }
        if (indexs.includes(item.index)) {
          item.index = this.generateRandomSheetIndex();
        } else {
          indexs.push(item.index);
        }
        if ("undefined" === typeof item.status) {
          item.status = 0;
        }
        if (item.status == 1) {
          if (hasActive) {
            item.status = 0;
          } else {
            hasActive = true;
          }
        }
      });
      if (!hasActive) {
        Store.luckysheetfile[0].status = 1;
      }
    }
    Store.currentSheetIndex = Store.luckysheetfile[0].index;
    for (let i = 0; i < Store.luckysheetfile.length; i++) {
      if (Store.luckysheetfile[i].status == 1) {
        Store.currentSheetIndex = Store.luckysheetfile[i].index;
        break;
      }
    }
    return Store.currentSheetIndex;
  },
  getCurSheetnoset: function () {
    let curindex = 0;
    for (let i = 0; i < Store.luckysheetfile.length; i++) {
      if (Store.luckysheetfile[i].status == 1) {
        curindex = Store.luckysheetfile[i].index;
        break;
      }
    }
    return curindex;
  }
};
export default sheetSwitchModule;