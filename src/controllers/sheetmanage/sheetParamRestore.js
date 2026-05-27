import { isEditMode } from "../../global/validate";
import cleargridelement from "../../global/cleargridelement";
import { getdatabyselectionD, getcellvalue, datagridgrowth, getcellFormula } from "../../global/getdata";
import { setcellvalue } from "../../global/setdata";
import luckysheetcreatedom from "../../global/createdom";
import tooltip from "../../global/tooltip";
import formula from "../../global/formula";
import { luckysheetrefreshgrid, jfrefreshgrid_rhcw, jfrefreshgrid } from "../../global/refresh";
import rhchInit from "../../global/rhchInit";
import editor from "../../global/editor";
import { luckysheetextendtable, luckysheetdeletetable } from "../../global/extend";
import { isRealNum } from "../../global/validate";
import { replaceHtml, getObjType, chatatABC, arrayRemoveItem } from "../../utils/util";
import { sheetHTML, luckysheetlodingHTML } from "../constant";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetsizeauto from "../resize";
import luckysheetPostil from "../postil";
import imageCtrl from "../imageCtrl";
import hyperlinkCtrl from "../hyperlinkCtrl";
import luckysheetFreezen from "../freezen";
import { createFilterOptions, labelFilterOptionState } from "../filter";
import { selectHightlightShow, selectionCopyShow } from "../select";
import Store from "../../store";
import locale from "../../locale/locale";
import { changeSheetContainerSize, menuToolBarWidth } from "../resize";
import { zoomNumberDomBind } from "../zoom";
import menuButton from "../menuButton";
import method from "../../global/method";
import luckysheetformula from "../../global/formula";
import localforage from 'localforage';
const sheetParamRestoreModule = {
  sheetParamRestore: function (file, data) {
    Store.luckysheet_select_save = file["luckysheet_select_save"];
    if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
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
    file["luckysheet_select_save"] = $.extend(true, [], Store.luckysheet_select_save);
    file["luckysheet_selection_range"] = $.extend(true, [], Store.luckysheet_selection_range);
    if ($("#luckysheet-scrollbar-x")[0].scrollWidth > $("#luckysheet-scrollbar-x")[0].offsetWidth) {
      file["scrollLeft"] = $("#luckysheet-scrollbar-x").scrollLeft(); //横向滚动条
    }
    if ($("#luckysheet-scrollbar-y")[0].scrollHeight > $("#luckysheet-scrollbar-y")[0].offsetHeight) {
      file["scrollTop"] = $("#luckysheet-scrollbar-y").scrollTop(); //纵向滚动条
    }
    file["zoomRatio"] = Store.zoomRatio;
  },
  storeSheetParamALL: function () {
    let _this = this;
    _this.storeSheetParam();
    let index = _this.getSheetIndex(Store.currentSheetIndex);
    Store.luckysheetfile[index]["data"] = Store.flowdata;
    Store.luckysheetfile[index]["config"] = $.extend(true, {}, Store.config);
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
      $("#luckysheet-scrollbar-x").scrollLeft(file["scrollLeft"]); //列标题
    } else {
      $("#luckysheet-scrollbar-x").scrollLeft(0);
    }
    if (file["scrollTop"] != null && file["scrollTop"] > 0) {
      $("#luckysheet-scrollbar-y").scrollTop(file["scrollTop"]); //列标题
    } else {
      $("#luckysheet-scrollbar-y").scrollTop(0);
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

    // if($('#luckysheet-filter-selected-sheet' + sheetIndex).length > 0 || file.filter_select == null || JSON.stringify(file.filter_select) == "{}"){
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
    $("#luckysheet-filter-options-sheet" + sheetIndex + " .luckysheet-filter-options").each(function (i) {
      if (file.filter == null) {
        return false;
      }
      let $top = $(this);
      let item = file.filter[i];
      if (item == null) {
        return true;
      }
      if (getObjType(item) != "object") {
        item = JSON.parse(item);
      }
      labelFilterOptionState($top, item.optionstate, item.rowhidden, item.caljs, false, item.st_r, item.ed_r, item.cindex, item.st_c, item.ed_c);
      rowhidden = $.extend(true, rowhidden, item.rowhidden);
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
    if (data.length == 0) {
      return;
    }
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      _this.execCache(item);
    }
  },
  showSheet: function () {
    // changeSheetContainerSize();
    $("#luckysheet-cell-flow_0").css({
      width: Store.ch_width,
      top: "-1px"
    }); //width更新
    $("#luckysheet-sheettable_0").css({
      width: Store.ch_width - 1,
      height: Store.rh_height
    });
    $("#luckysheetrowHeader_0").css("height", Store.rh_height);
    $("#luckysheet-cols-h-cells_0").css("width", Store.ch_width); //width更新

    $("#luckysheet-scrollbar-x div").width(Store.ch_width);
    $("#luckysheet-scrollbar-y div").height(Store.rh_height + Store.columnHeaderHeight - Store.cellMainSrollBarSize - 3);

    //等待滚动条dom宽高计算完成后 初始化该表格滚动位置
    let index = this.getSheetIndex(Store.currentSheetIndex);
    let file = Store.luckysheetfile[index];
    Store.scrollRefreshSwitch = false;
    if (file["scrollLeft"] != null && file["scrollLeft"] > 0) {
      $("#luckysheet-scrollbar-x").scrollLeft(file["scrollLeft"] * Store.zoomRatio);
    } else {
      $("#luckysheet-scrollbar-x").scrollLeft(0);
    }
    if (file["scrollTop"] != null && file["scrollTop"] > 0) {
      $("#luckysheet-scrollbar-y").scrollTop(file["scrollTop"] * Store.zoomRatio);
    } else {
      $("#luckysheet-scrollbar-y").scrollTop(0);
    }
    setTimeout(() => {
      Store.scrollRefreshSwitch = true;
    }, 0);
    zoomNumberDomBind(Store.zoomRatio);
  }
};
export default sheetParamRestoreModule;