import { deepMerge } from '../../utils/migrationHelpers.js';
import formula from "../../global/formula";
import {  jfrefreshgrid_rhcw } from "../../global/refresh";
import rhchInit from "../../global/rhchInit";
import editor from "../../global/editor";
import {  getObjType } from "../../utils/util";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetPostil from "../postil";
import imageCtrl from "../imageCtrl";
import hyperlinkCtrl from "../hyperlinkCtrl";
import luckysheetFreezen from "../freezen";
import { createFilterOptions, labelFilterOptionState } from "../filter";
import { selectHightlightShow, selectionCopyShow } from "../select";
import Store from "../../store";
import { zoomNumberDomBind } from "../zoom";
import scrollBarX from '../../ui/scrollBarX.js';
import scrollBarY from '../../ui/scrollBarY.js';
import resizeHandles from '../../ui/resizeHandles.js';
const sheetParamRestoreModule = {
  sheetParamRestore: function (file, data) {
    Store.luckysheet_select_save = file["luckysheet_select_save"];
    if (Store.luckysheet_select_save == null || Store.luckysheet_select_save === null) {
      if (data[0] != null && data[0][0] != null && data[0][0].mc != null) {
        Store.luckysheet_select_save = [{
          row: [0, data[0][0].mc.rs - 1],
          column: [0, data[0][0].mc.cs - 1]
        }];
      } else {
        Store.luckysheet_select_save = [{
          row: [0, 0],
          column: [0, 0]
        }];
      }
    }
    Store.luckysheet_selection_range = file["luckysheet_selection_range"] == null ? [] : file["luckysheet_selection_range"];
    Store.config = file["config"] == null ? {} : file["config"];
    Store.zoomRatio = file["zoomRatio"] == null ? 1 : file["zoomRatio"];
    if (file["defaultRowHeight"] != null) {
      Store.defaultrowlen = parseFloat(file["defaultRowHeight"]);
    } else {
      Store.defaultrowlen = luckysheetConfigsetting["defaultRowHeight"];
    }
    if (file["defaultColWidth"] != null) {
      Store.defaultcollen = parseFloat(file["defaultColWidth"]);
    } else {
      Store.defaultcollen = luckysheetConfigsetting["defaultColWidth"];
    }
    if (file["showGridLines"] != null) {
      let showGridLines = file["showGridLines"];
      if (showGridLines == 0 || showGridLines == false) {
        Store.showGridLines = false;
      } else {
        Store.showGridLines = true;
      }
    } else {
      Store.showGridLines = true;
    }
  },
  storeSheetParam: function () {
    let index = this.getSheetIndex(Store.currentSheetIndex);
    let file = Store.luckysheetfile[index];
    file["config"] = Store.config;
    file["visibledatarow"] = Store.visibledatarow;
    file["visibledatacolumn"] = Store.visibledatacolumn;
    file["ch_width"] = Store.ch_width;
    file["rh_height"] = Store.rh_height;
    file["luckysheet_select_save"] = structuredClone(Store.luckysheet_select_save);
    file["luckysheet_selection_range"] = structuredClone(Store.luckysheet_selection_range);
    if (scrollBarX.getScrollWidth() > scrollBarX.getOffsetWidth()) {
      file["scrollLeft"] = scrollBarX.getScrollLeft();
    }
    if (scrollBarY.getScrollHeight() > scrollBarY.getOffsetHeight()) {
      file["scrollTop"] = scrollBarY.getScrollTop();
    }
    file["zoomRatio"] = Store.zoomRatio;
  },
  storeSheetParamALL: function () {
    let _this = this;
    _this.storeSheetParam();
    let index = _this.getSheetIndex(Store.currentSheetIndex);
    Store.luckysheetfile[index]["data"] = Store.flowdata;
    Store.luckysheetfile[index]["config"] = structuredClone(Store.config);
  },
  setSheetParam: function (isload = true) {
    let index = this.getSheetIndex(Store.currentSheetIndex);
    let file = Store.luckysheetfile[index];
    Store.flowdata = file["data"];
    editor.webWorkerFlowDataCache(Store.flowdata); //worker存数据

    // formula.execFunctionGroupData = null;
    formula.execFunctionGlobalData = null;
    window.luckysheet_getcelldata_cache = null;
    this.sheetParamRestore(file, Store.flowdata);
    if (file["freezen"] == null) {
      luckysheetFreezen.freezenhorizontaldata = null;
      luckysheetFreezen.freezenverticaldata = null;
    } else {
      luckysheetFreezen.freezenhorizontaldata = file["freezen"].horizontal == null ? null : file["freezen"].horizontal.freezenhorizontaldata;
      luckysheetFreezen.freezenverticaldata = file["freezen"].vertical == null ? null : file["freezen"].vertical.freezenverticaldata;
    }
    if (isload) {
      rhchInit(Store.flowdata.length, Store.flowdata[0].length);
    }

    //批注
    luckysheetPostil.buildAllPs(Store.flowdata);

    //图片
    imageCtrl.currentImgId = null;
    imageCtrl.images = file.images;
    imageCtrl.allImagesShow();
    imageCtrl.init();

    //数据验证

    //链接
    hyperlinkCtrl.hyperlink = file.hyperlink;
    hyperlinkCtrl.init();
    createFilterOptions(file["filter_select"], file["filter"]);
  },
  restoreselect: function () {
    let index = this.getSheetIndex(Store.currentSheetIndex);
    let file = Store.luckysheetfile[index];

    //选区
    selectHightlightShow(true);

    //复制选区虚线框
    selectionCopyShow();
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
  },
  restoreSheetAll: function (sheetIndex) {
    let _this = this;
    _this.restorePivot(sheetIndex);
    _this.restoreFilter(sheetIndex);
    _this.restoreFreezen(sheetIndex);
  },
  restoreFilter: function (sheetIndex) {
    let index = this.getSheetIndex(sheetIndex);
    let file = Store.luckysheetfile[index];

    // if(document.getElementById('#luckysheet-filter-selected-sheet' + sheetIndex) !== null || file.filter_select == null || JSON.stringify(file.filter_select) == "{}"){
    //     if(file.config != null && file.config.rowhidden != null){
    //         file.config.rowhidden =  {};
    //         Store.config = file.config;

    //         jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length,false);
    //     }

    //     return;
    // }

    if (getObjType(file.filter_select) == "string") {
      file.filter_select = JSON.parse(file.filter_select);
    }
    if (file.filter_select == null || file.filter_select.row == null || file.filter_select.column == null) {
      return;
    }
    createFilterOptions(file.filter_select);
    if (getObjType(file.filter) != "object") {
      if (file.filter != null && getObjType(file.filter) == "string") {
        file.filter = JSON.parse(file.filter);
      }
    }
    let rowhidden = {};
    if (file.config != null && file.config.rowhidden != null) {
      rowhidden = file.config.rowhidden;
    }
    document.querySelectorAll("#luckysheet-filter-options-sheet" + sheetIndex + " .luckysheet-filter-options").forEach(function(i) {
      if (file.filter == null) {
        return false;
      }
      let $top = this;
      let item = file.filter[i];
      if (item == null) {
        return true;
      }
      if (getObjType(item) != "object") {
        item = JSON.parse(item);
      }
      labelFilterOptionState($top, item.optionstate, item.rowhidden, item.caljs, false, item.st_r, item.ed_r, item.cindex, item.st_c, item.ed_c);
      rowhidden = deepMerge(rowhidden, item.rowhidden);
    });
    if (file.config == null) {
      file.config = {};
    }
    file.config["rowhidden"] = rowhidden;
    Store.config = file.config;
    jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length, false);
  },
  restoreFreezen: function (sheetIndex) {
    luckysheetFreezen.initialFreezen(sheetIndex);
  },
  restoreCache: function () {
    let _this = this;
    let data = _this.CacheNotLoadControll;
    _this.CacheNotLoadControll = [];
    if (data === null) {
      return;
    }
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      _this.execCache(item);
    }
  },
  showSheet: function () {
    // changeSheetContainerSize();
    const _elCellFlow = document.getElementById("luckysheet-cell-flow_0"); if (_elCellFlow) Object.assign(_elCellFlow.style, {
      width: Store.ch_width + "px",
      top: "-1px"
    }); //width更新
    resizeHandles.sheetTable.setCss({
      width: Store.ch_width - 1,
      height: Store.rh_height
    });
    const _elRowHeader = document.getElementById("luckysheetrowHeader_0"); if (_elRowHeader) _elRowHeader.style.height = Store.rh_height + "px";
    const _elColsHCells = document.getElementById("luckysheet-cols-h-cells_0"); if (_elColsHCells) _elColsHCells.style.width = Store.ch_width + "px"; //width更新

    scrollBarX.setInnerDivWidth(Store.ch_width);
    scrollBarY.setInnerDivHeight(Store.rh_height + Store.columnHeaderHeight - Store.cellMainSrollBarSize - 3);

    //等待滚动条dom宽高计算完成后 初始化该表格滚动位置
    let index = this.getSheetIndex(Store.currentSheetIndex);
    let file = Store.luckysheetfile[index];
    Store.scrollRefreshSwitch = false;
    if (file["scrollLeft"] != null && file["scrollLeft"] > 0) {
      scrollBarX.setScrollLeft(file["scrollLeft"] * Store.zoomRatio);
    } else {
      scrollBarX.setScrollLeft(0);
    }
    if (file["scrollTop"] != null && file["scrollTop"] > 0) {
      scrollBarY.setScrollTop(file["scrollTop"] * Store.zoomRatio);
    } else {
      scrollBarY.setScrollTop(0);
    }
    setTimeout(() => {
      Store.scrollRefreshSwitch = true;
    }, 0);
    zoomNumberDomBind(Store.zoomRatio);
  }
};
export default sheetParamRestoreModule;