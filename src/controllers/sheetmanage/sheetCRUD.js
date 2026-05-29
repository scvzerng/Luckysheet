import { isEditMode } from "../../global/validate";
import cleargridelement from "../../global/cleargridelement";
import {  replaceHtml } from "../../utils/util";
import {  sheetHTML } from "../constant";
import Store from "../../store";
import method from "../../global/method";
import sheetContainer from "../../ui/sheetContainer.js";
import cellMain from '../../ui/cellMain.js';
const sheetCRUDModule = {
  addNewSheet: function (e) {
    if (isEditMode() || Store.allowEdit === false) {
      // alert("非编辑模式下不允许该操作！");
      return;
    }
    // 钩子 sheetCreateBefore
    if (!method.createHookFunction("sheetCreateBefore")) {
      return;
    }
    let _this = this;
    let order = Store.luckysheetfile.length;
    let index = _this.generateRandomSheetIndex();
    let sheetname = _this.generateRandomSheetName(Store.luckysheetfile);
    sheetContainer.append(replaceHtml(sheetHTML, {
      index: index,
      active: "",
      name: sheetname,
      style: "",
      colorset: ""
    }));
    let sheetconfig = {};
    let sheet_defaullt_config = this.getCustomSheet();
    if (JSON.stringify(sheet_defaullt_config) != "{}" && sheet_defaullt_config != null && sheetconfig != undefined) {
      //判断设置的自定义sheet
      sheetconfig = sheet_defaullt_config;
      sheetconfig.index = index;
      sheetconfig.order = order;
      sheetconfig.name = sheetname;
      // sheet_defaullt_config.config={};
    } else {
      //自定义sheet为空的话
      sheetconfig = {
        name: sheetname,
        color: "",
        status: "0",
        order: order,
        index: index,
        celldata: [],
        row: Store.defaultrowNum,
        column: Store.defaultcolumnNum,
        config: {}
      };
    }
    Store.luckysheetfile.push(sheetconfig);
    document.querySelector("#luckysheet-sheet-area div.luckysheet-sheets-item").classList.remove("luckysheet-sheets-item-active");
    document.getElementById("luckysheet-sheets-item" + index).classList.add("luckysheet-sheets-item-active");
    cellMain.append('<div id="luckysheet-datavisual-selection-set-' + index + '" class="luckysheet-datavisual-selection-set"></div>');
    cleargridelement(e);
    if (Store.clearjfundo) {
      Store.jfundo.length = 0;
      let redo = {};
      redo["type"] = "addSheet";
      redo["sheetconfig"] = structuredClone(sheetconfig);
      redo["index"] = index;
      redo["currentSheetIndex"] = Store.currentSheetIndex;
      Store.jfredo.push(redo);
    }
    _this.changeSheetExec(index, true);

    // 钩子 sheetCreateAfter 不应该在这里 应在绘制完成后 因此在 changeSheet 实现
  },
  copySheet: function (copyindex, e) {
    if (isEditMode() || Store.allowEdit === false) {
      // alert("非编辑模式下不允许该操作！");
      return;
    }
    let _this = this;
    let order = Store.luckysheetfile.length;
    let index = _this.generateRandomSheetIndex();
    let copyarrindex = _this.getSheetIndex(copyindex);
    let copyjson = structuredClone(Store.luckysheetfile[copyarrindex]);
    copyjson.order = order;
    copyjson.index = index;
    copyjson.name = _this.generateCopySheetName(Store.luckysheetfile, copyjson.name);

    // 钩子 sheetCreateBefore
    if (!method.createHookFunction("sheetCopyBefore", {
      targetSheet: Store.luckysheetfile[copyarrindex],
      copySheet: copyjson
    })) {
      return;
    }
    let colorset = "";
    if (copyjson.color != null) {
      colorset = '<div class="luckysheet-sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' + copyjson.color + ';"></div>';
    }
    let copyobject = document.getElementById("luckysheet-sheets-item" + copyindex);
    sheetContainer.append(replaceHtml(sheetHTML, {
      index: copyjson.index,
      active: "",
      name: copyjson.name,
      order: copyjson.order,
      style: "",
      colorset: colorset
    }));
    copyobject.parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + copyjson.index), copyobject.nextElementSibling);
    Store.luckysheetfile.splice(copyarrindex + 1, 0, copyjson);
    document.querySelector("#luckysheet-sheet-area div.luckysheet-sheets-item").classList.remove("luckysheet-sheets-item-active");
    document.getElementById("luckysheet-sheets-item" + index).classList.add("luckysheet-sheets-item-active");
    cellMain.append('<div id="luckysheet-datavisual-selection-set-' + index + '" class="luckysheet-datavisual-selection-set"></div>');
    cleargridelement(e);
    _this.changeSheetExec(index, undefined, undefined, true);
    _this.reOrderAllSheet();
    if (Store.clearjfundo) {
      Store.jfredo.push({
        type: "copySheet",
        copyindex: copyindex,
        index: copyjson.index,
        sheetIndex: copyjson.index
      });
    } else if (Store.jfredo !== null) {
      let jfredostr = Store.jfredo[Store.jfredo.length - 1];
      if (jfredostr.type == "copySheet") {
        jfredostr.index = copyjson.index;
        jfredostr.sheetIndex = copyjson.index;
      }
    }
  },
  deleteSheet: function (index) {
    let _this = this;
    if (Store.allowEdit === false) {
      return;
    }
    let arrIndex = _this.getSheetIndex(index);
    const file = Store.luckysheetfile[arrIndex];

    // 钩子 sheetDeleteBefore
    if (!method.createHookFunction("sheetDeleteBefore", {
      sheet: file
    })) {
      return;
    }
    _this.setSheetHide(index, true);
    document.getElementById("luckysheet-sheets-item" + index).remove();
    document.getElementById("luckysheet-datavisual-selection-set-" + index).remove();
    let removedsheet = Store.luckysheetfile.splice(arrIndex, 1);
    _this.reOrderAllSheet();
    if (Store.clearjfundo) {
      removedsheet[0].type = "deleteSheet";
      Store.jfredo.push(removedsheet[0]);
    }
    // 钩子 sheetDeleteAfter
    method.createHookFunction("sheetDeleteAfter", {
      sheet: file
    });
  },
  createSheet: function () {
    //修复拖动sheet更新后台后，重新打开显示错误
    let _this = this;
    let btn = [];
    Store.luckysheetfile.sort(_this.ordersheet("order"));
    for (let i = 0; i < Store.luckysheetfile.length; i++) {
      let display = "";
      let sheetIndex = Store.luckysheetfile[i].index;
      let colorset = "";
      if (Store.luckysheetfile[i].color != null) {
        colorset = '<div class="luckysheet-sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' + Store.luckysheetfile[i].color + ';"></div>';
      }
      if (Store.currentSheetIndex == sheetIndex) {
        //使用Store.luckysheetfile中的index比较，而不是order
        btn.push(replaceHtml(sheetHTML, {
          index: sheetIndex,
          active: "luckysheet-sheets-item-active",
          name: Store.luckysheetfile[i].name,
          style: "",
          colorset: colorset
        }));
      } else {
        if (Store.luckysheetfile[i].hide == 1) {
          btn.push(replaceHtml(sheetHTML, {
            index: sheetIndex,
            active: "",
            name: Store.luckysheetfile[i].name,
            style: "display:none;",
            colorset: colorset
          }));
        } else {
          btn.push(replaceHtml(sheetHTML, {
            index: sheetIndex,
            active: "",
            name: Store.luckysheetfile[i].name,
            style: "",
            colorset: colorset
          }));
        }
        display = "style='display:none;'";
      }
      //Store.luckysheetfile[i].index = i; //index即为默认
      // if(sheetIndex > this.sheetMaxIndex){
      //     this.sheetMaxIndex = sheetIndex;
      // }

      cellMain.append("<div " + display + ' id="luckysheet-datavisual-selection-set-' + sheetIndex + '" class="luckysheet-datavisual-selection-set"></div>');
    }
    sheetContainer.append(btn.join(""));
    _this.locationSheet();
  },
  createSheetbydata: function (data, isrenew, isBefore = true) {
    let _this = this;
    let colorset = "";
    if (data.color != null) {
      colorset = '<div class="luckysheet-sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' + data.color + ';"></div>';
    }
    sheetContainer.append(replaceHtml(sheetHTML, {
      index: data.index,
      active: "",
      name: data.name,
      order: data.order,
      style: "",
      colorset: colorset
    }));
    if (isBefore) {
      let previndex = data.order;
      if (previndex >= Store.luckysheetfile.length) {
        previndex = Store.luckysheetfile.length - 1;
        let _ref = document.getElementById("luckysheet-sheets-item" + Store.luckysheetfile[previndex].index);
        _ref.parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + data.index), _ref.nextElementSibling);
      } else {
        let _ref = document.getElementById("luckysheet-sheets-item" + Store.luckysheetfile[previndex].index);
        _ref.parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + data.index), _ref);
      }
    }
    Store.luckysheetfile.push(data);
    document.querySelector("#luckysheet-sheet-area div.luckysheet-sheets-item").classList.remove("luckysheet-sheets-item-active");
    document.getElementById("luckysheet-sheets-item" + data.index).classList.add("luckysheet-sheets-item-active");
    cellMain.append('<div id="luckysheet-datavisual-selection-set-' + data.index + '" class="luckysheet-datavisual-selection-set"></div>');
    cleargridelement();
    if (isrenew != null) {
      data.hide = 0;
    } else {}
    _this.changeSheetExec(data.index, true);
    _this.reOrderAllSheet();
  },
  hasSheet: function (index) {
    if (index == null) {
      return false;
    }
    index = this.getSheetIndex(index);
    if (index == null) {
      return false;
    } else {
      return true;
    }
  }
};
export default sheetCRUDModule;