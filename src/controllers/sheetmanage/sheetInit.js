import {  datagridgrowth,  getcellFormula  } from "../../global/getdata";
import luckysheetcreatedom from "../../global/createdom";
import tooltip from "../../global/tooltip";
import formula from "../../global/formula";
import {  arrayRemoveItem  } from "../../utils/util";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetsizeauto from "../resize";
import Store from "../../store";
import locale from "../../locale/locale";
import {  menuToolBarWidth  } from "../resize";
import menuButton from "../menuButton";
import localforage from 'localforage';
import scrollBarX from '../../ui/scrollBarX.js';
import scrollBarY from '../../ui/scrollBarY.js';
import cellMain from '../../ui/cellMain.js';
import canvasContext from '../../ui/canvasContext.js';
const sheetInitModule = {
  initialjfFile: function (menu, title) {
    let _this = this;
    _this.getCurSheet();
    let file = Store.luckysheetfile[_this.getSheetIndex(Store.currentSheetIndex)];
    _this.nulldata = datagridgrowth([], Store.defaultrowNum, Store.defaultcolumnNum);
    let data = _this.buildGridData(file);

    //初始化的时候 记录选区
    let select_save = [];
    file.jfgird_select_save = file.jfgird_select_save || [];
    file.jfgird_select_save.forEach(item => select_save.push({
      row: item.row,
      column: item.column
    }));
    file.luckysheet_select_save = select_save;
    this.sheetParamRestore(file, data);
    let r2 = 0, c2 = 0;
    if (Store.luckysheet_select_save && Store.luckysheet_select_save.length > 0 && Store.luckysheet_select_save[0].row) {
      r2 = Store.luckysheet_select_save[0].row[1];
      c2 = Store.luckysheet_select_save[0].column[1];
      if (Store.luckysheet_select_save.length > 1) {
        for (let i = 0; i < Store.luckysheet_select_save.length; i++) {
          if (Store.luckysheet_select_save[i].row && Store.luckysheet_select_save[i].row[1] > r2) {
            r2 = Store.luckysheet_select_save[i].row[1];
          }
          if (Store.luckysheet_select_save[i].column && Store.luckysheet_select_save[i].column[1] > c2) {
            c2 = Store.luckysheet_select_save[i].column[1];
          }
        }
      }
    }
    menuButton.fontInitial(Store.fontList); //initial font

    file.data = data;
    let rowheight = data.length;
    if (r2 > rowheight - 1) {
      rowheight = r2 + 1;
    }
    let colwidth = data.length > 0 && data[0] ? data[0].length : 0;
    if (c2 > colwidth - 1) {
      colwidth = c2 + 1;
    }

    //钩子函数 表格创建之前触发
    if (typeof luckysheetConfigsetting.beforeCreateDom == "function") {
      luckysheetConfigsetting.beforeCreateDom(luckysheet);
    }
    if (typeof luckysheetConfigsetting.workbookCreateBefore == "function") {
      luckysheetConfigsetting.workbookCreateBefore(luckysheet);
    }

    // Store.sheetData = data;

    luckysheetcreatedom(colwidth, rowheight, data, menu, title);
    setTimeout(function () {
      tooltip.createHoverTip("#luckysheet-sheet-info", ".luckysheet_info_detail_back, .luckysheet_info_detail_input, .luckysheet_info_detail_update");
      tooltip.createHoverTip("#luckysheet-toolbar", ".luckysheet-toolbar-menu-button, .luckysheet-toolbar-button, .luckysheet-toolbar-combo-button");
      Store.luckysheetTableContentHW = [cellMain.getWidth() + Store.rowHeaderWidth - Store.cellMainSrollBarSize, cellMain.getHeight() + Store.columnHeaderHeight - Store.cellMainSrollBarSize];
      canvasContext.initContext({
        width: Math.ceil(Store.luckysheetTableContentHW[0] * Store.devicePixelRatio),
        height: Math.ceil(Store.luckysheetTableContentHW[1] * Store.devicePixelRatio)
      }, {
        width: Store.luckysheetTableContentHW[0],
        height: Store.luckysheetTableContentHW[1]
      });
      let locale_info = locale().info;
      let key = luckysheetConfigsetting.gridKey;
      let cahce_key = key + "__qkcache";
      let ini = function () {
        file["load"] = "1";
        _this.createSheet();
        let execF = function () {
          _this.mergeCalculation(file["index"]);
          _this.setSheetParam(false);
          // editor.webWorkerFlowDataCache(Store.sheetData);//worker存数据
          _this.storeSheetParam();
          _this.restoreselect();
          _this.CacheNotLoadControll = [];
          _this.restoreCache();
          formula.execFunctionGroupForce(luckysheetConfigsetting.forceCalculation);
          _this.restoreSheetAll(Store.currentSheetIndex);

          // luckysheetrefreshgrid(0, 0);
          const _elDetailSave = document.getElementById("luckysheet_info_detail_save"); if (_elDetailSave) _elDetailSave.innerHTML = locale_info.detailSave;

          // Store toolbar button width value
          menuToolBarWidth();
          luckysheetsizeauto();

          //等待滚动条dom宽高加载完成后 初始化滚动位置
          if (file["scrollLeft"] != null && file["scrollLeft"] > 0) {
            scrollBarX.setScrollLeft(file["scrollLeft"]);
          } else {
            scrollBarX.setScrollLeft(0);
          }
          if (file["scrollTop"] != null && file["scrollTop"] > 0) {
            scrollBarY.setScrollTop(file["scrollTop"]);
          } else {
            scrollBarY.setScrollTop(0);
          }

          // 此处已经渲染完成表格，应该挪到前面
          // //钩子函数 表格创建之前触发
          // if(typeof luckysheetConfigsetting.beforeCreateDom == "function" ){
          //     luckysheetConfigsetting.beforeCreateDom(luckysheet);
          // }

          // if(typeof luckysheetConfigsetting.workbookCreateBefore == "function"){
          //     luckysheetConfigsetting.workbookCreateBefore(luckysheet);
          // }

          arrayRemoveItem(Store.asyncLoad, "core");
          if (luckysheetConfigsetting.pointEdit) {
            setTimeout(function () {
              Store.loadingObj.close();
            }, 0);
          } else {
            setTimeout(function () {
              Store.loadingObj.close();
            }, 500);
          }
        };
        let loadSheetUrl = luckysheetConfigsetting.loadSheetUrl;
        if (loadSheetUrl == "") {
          //     execF();
          // }
          // else if(sheetindex.length>0 && loadSheetUrl == ""){
          // for(let i = 0;i<Store.luckysheetfile.length;i++){
          //     let otherfile = Store.luckysheetfile[i];
          //     if(otherfile.index == file.index){
          //         continue;
          //     }
          //     // let otherfile = Store.luckysheetfile[_this.getSheetIndex(item)];
          //     if(otherfile["load"] == null || otherfile["load"] == "0"){
          //         otherfile["data"] = _this.buildGridData(otherfile);
          //         otherfile["load"] = "1";
          //     }
          // }

          _this.loadOtherFile(file);
          execF();
        } else {
          let sheetindexset = _this.checkLoadSheetIndex(file);
          let sheetindex = [];
          for (let i = 0; i < sheetindexset.length; i++) {
            let item = sheetindexset[i];
            if (item == file["index"]) {
              continue;
            }
            sheetindex.push(item);
          }

          // No request is sent if it is not linked to other worksheets
          if (sheetindex.length === 0) {
            execF();
            return;
          }
          fetch(loadSheetUrl, {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              gridKey: luckysheetConfigsetting.gridKey,
              index: sheetindex.join(",")
            }).toString()
          }).then(function(response) { return response.text(); }).then(function (d) {
            let dataset = new Function("return " + d)();
            for (let item in dataset) {
              if (item == file["index"]) {
                continue;
              }
              let otherfile = Store.luckysheetfile[_this.getSheetIndex(item)];
              if (otherfile["load"] == null || otherfile["load"] == "0") {
                otherfile.celldata = dataset[item.toString()];
                otherfile["data"] = _this.buildGridData(otherfile);
                otherfile["load"] = "1";
              }
            }
            execF();
          });
        }
      };
      try {
        localforage.getItem(cahce_key).then(function (readValue) {
          if (readValue != null) {
            _this.CacheNotLoadControll = readValue;
          }
          ini();
        });
      } catch (e) {
        ini();
        console.log("缓存操作失败");
      }
    }, 1);
  },
  loadOtherFile: function (file) {
    let _this = this;
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

    for (let i = 0; i < Store.luckysheetfile.length; i++) {
      let otherfile = Store.luckysheetfile[i];
      if (otherfile.index == file.index) {
        continue;
      }
      // let otherfile = Store.luckysheetfile[_this.getSheetIndex(item)];
      if (otherfile["load"] == null || otherfile["load"] == "0") {
        otherfile["data"] = _this.buildGridData(otherfile);
        otherfile["load"] = "1";
      }
    }
  },
  checkLoadSheetIndex: function (file) {
    let calchain = formula.getAllFunctionGroup(); //file.calcChain; //index

    let ret = [],
      cache = {};
    if (file.index in this.checkLoadSheetIndexToDataIndex) {
      return [];
    }
    ret.push(file.index);
    cache[file.index.toString()] = 1;
    this.checkLoadSheetIndexToDataIndex[file.index] = 1;
    if (calchain != null) {
      let dataIndexList = {};
      for (let i = 0; i < calchain.length; i++) {
        let f = calchain[i];
        let dataindex = f.index;
        let formulaTxt = getcellFormula(f.r, f.c, dataindex);
        if (formulaTxt == null) {
          let file = Store.luckysheetfile[this.getSheetIndex(dataindex)];
          file.data = this.buildGridData(file);
          formulaTxt = getcellFormula(f.r, f.c, dataindex);
          if (formulaTxt == null) {
            continue;
          }
        }
        if (formulaTxt.indexOf("!") == -1) {
          // dataIndexList[dataindex] = 1;
          formula.addToSheetIndexList(formulaTxt, dataindex);
        } else if (formula.formulaContainSheetList != null && formula.formulaContainSheetList[formulaTxt] != null) {
          for (let dataSheetIndex in formula.formulaContainSheetList[formulaTxt]) {
            dataIndexList[dataSheetIndex] = 1;
          }
        } else {
          formula.functionParser(formulaTxt, str => {
            formula.addToCellList(formulaTxt, str);
            if (str.indexOf("!") > -1) {
              let name = str.substr(0, str.indexOf("!"));
              // dataNameList[name] = true;

              let sheet = this.getSheetByName(name);
              if (sheet != null) {
                let dataSheetIndex = sheet.index;
                dataIndexList[dataSheetIndex] = 1;
                formula.addToSheetIndexList(formulaTxt, dataSheetIndex);
              }
            }
          });
          if (formula.formulaContainSheetList[formulaTxt] == null) {
            // dataIndexList[dataindex] = 1;
            formula.addToSheetIndexList(formulaTxt, dataindex);
          }
        }
        if (dataindex == null) {
          continue;
        }

        // if(cache[dataindex.toString()] == null){
        // 	// ret.push(dataindex);
        //     cache[dataindex.toString()] = 1;
        //     this.checkLoadSheetIndexToDataIndex[dataindex] = 1;
        // }
      }
      for (let index in dataIndexList) {
        // let sheet = this.getSheetByName(n);
        // if(sheet==null){
        //     continue;
        // }

        // if(index == Store.currentSheetIndex){
        //     continue;
        // }

        let dataindex = index;
        if (cache[dataindex.toString()] == null) {
          ret.push(dataindex);
          cache[dataindex.toString()] = 1;
          this.checkLoadSheetIndexToDataIndex[dataindex] = 1;
        }
      }
    }
    return ret;
  },
  mergeCalculation: function (index) {
    let file = Store.luckysheetfile[this.getSheetIndex(index)];
    let config = file.config,
      data = file.data;
    if (config == null) {
      return;
    }
    let mergeConfig = config.merge;
    if (mergeConfig == null || index in this.mergeCalculationSheet || file["autoCalculationMerge"] === false) {
      return;
    }
    this.mergeCalculationSheet[index] = 1;
    for (let x in mergeConfig) {
      let r = parseInt(x.substr(0, x.indexOf("_")));
      let c = parseInt(x.substr(x.indexOf("_") + 1));
      let mcInfo = mergeConfig[x];
      if (data[r][c] == null) {
        data[r][c] = {};
      }
      data[r][c]["mc"] = {
        r: r,
        c: c,
        rs: mcInfo.rs,
        cs: mcInfo.cs
      };
      for (let ir = r; ir < r + mcInfo.rs; ir++) {
        for (let ic = c; ic < c + mcInfo.cs; ic++) {
          if (ir == r && ic == c) {
            continue;
          }
          if (data[ir][ic] == null) {
            data[ir][ic] = {};
          }
          data[ir][ic]["mc"] = {
            r: r,
            c: c
          };
        }
      }
    }
  }
};
export default sheetInitModule;