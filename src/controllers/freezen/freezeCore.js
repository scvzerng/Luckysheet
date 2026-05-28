import { getSheetIndex } from "../../methods/get";
import { getCurrentFile, getMaxRowIndex, getMaxColIndex } from "../../utils/storeAccess.js";
import { luckysheet_searcharray } from "../sheetSearch";
import Store from "../../store";
import locale from "../../locale/locale";
import { luckysheetrefreshgrid } from "../../global/refresh";
import freezeCanvasModule from "./freezeCanvas";
const freezeCoreModule = {
  freezenHorizontalHTML: '<div id="luckysheet-freezebar-horizontal" class="luckysheet-freezebar" tabindex="0"><div class="luckysheet-freezebar-handle luckysheet-freezebar-horizontal-handle" ><div class="luckysheet-freezebar-handle-bar luckysheet-freezebar-horizontal-handle-title" ></div><div class="luckysheet-freezebar-handle-bar luckysheet-freezebar-horizontal-handle-bar" ></div></div><div class="luckysheet-freezebar-drop luckysheet-freezebar-horizontal-drop" ><div class="luckysheet-freezebar-drop-bar luckysheet-freezebar-horizontal-drop-title" ></div><div class="luckysheet-freezebar-drop-bar luckysheet-freezebar-horizontal-drop-bar" >&nbsp;</div></div></div>',
  freezenVerticalHTML: '<div id="luckysheet-freezebar-vertical" class="luckysheet-freezebar" tabindex="0"><div class="luckysheet-freezebar-handle luckysheet-freezebar-vertical-handle" ><div class="luckysheet-freezebar-handle-bar luckysheet-freezebar-vertical-handle-title" ></div><div class="luckysheet-freezebar-handle-bar luckysheet-freezebar-vertical-handle-bar" ></div></div><div class="luckysheet-freezebar-drop luckysheet-freezebar-vertical-drop" ><div class="luckysheet-freezebar-drop-bar luckysheet-freezebar-vertical-drop-title" ></div><div class="luckysheet-freezebar-drop-bar luckysheet-freezebar-vertical-drop-bar" >&nbsp;</div></div></div>',
  initialHorizontal: true,
  initialVertical: true,
  horizontalmovestate: false,
  horizontalmoveposition: null,
  verticalmovestate: false,
  verticalmoveposition: null,
  freezenhorizontaldata: null,
  freezenverticaldata: null,
  // 定义冻结首行、首列是实际的第一行第一列还是当前视图的第一行第一列
  // excel 为视图的第一行第一列，但此处实现有问题，如滚动到15行冻结首行，当前冻结了15行，保存再进去实际冻结了第一行
  // 冻结真实的第一行、第一列更符合直觉
  freezenRealFirstRowColumn: true,
  cutVolumn: function (arr, cutindex) {
    if (cutindex <= 0) {
      return arr;
    }
    let pre = arr.slice(0, cutindex);
    let premax = pre[pre.length - 1];
    let ret = arr.slice(cutindex);

    // for (let i = 0; i < ret.length; i++) {
    //     ret[i] -= premax;
    // }

    return ret;
  },
  cancelFreezenVertical: function (sheetIndex) {
    let _this = this;
    const _locale = locale();
    const locale_freezen = _locale.freezen;
    // 解决freeze 不垂直居中的问题
    const freezeHTML = `
            <div class="luckysheet-toolbar-button-outer-box luckysheet-inline-block"
            style="user-select: none;">
                <div class="luckysheet-toolbar-button-inner-box luckysheet-inline-block"
                style="user-select: none;">
                    <div class="luckysheet-icon luckysheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-function iconfont-luckysheet luckysheet-iconfont-dongjie1"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="luckysheet-toolbar-menu-button-caption luckysheet-inline-block"
                    style="user-select: none;">
                        ${locale_freezen.default}
                    </div>
                </div>
            </div>
        `;
    $("#luckysheet-freezen-btn-horizontal").html(freezeHTML);
    $("#luckysheet-freezen-btn-vertical").html('<i class="fa fa-indent"></i> ' + locale_freezen.freezenColumn);
    _this.freezenverticaldata = null;
    let isvertical = $("#luckysheet-freezebar-vertical").is(":visible");
    $("#luckysheet-freezebar-vertical").hide();
    if (sheetIndex == null) {
      sheetIndex = Store.currentSheetIndex;
    }
    let currentSheet = Store.luckysheetfile[getSheetIndex(sheetIndex)];
    if (currentSheet.freezen != null) {
      currentSheet.freezen.vertical = null;
    }
    if (currentSheet.frozen != null && isvertical) {}
  },
  createFreezenVertical: function (freezenverticaldata, left) {
    let _this = this;
    if (_this.initialVertical) {
      _this.initialVertical = false;
      $("#luckysheet-grid-window-1").append(_this.freezenVerticalHTML);
      $("#luckysheet-freezebar-vertical").find(".luckysheet-freezebar-vertical-drop").hover(function () {
        $(this).parent().addClass("luckysheet-freezebar-hover");
      }, function () {
        $(this).parent().removeClass("luckysheet-freezebar-hover");
      });
      $("#luckysheet-freezebar-vertical").find(".luckysheet-freezebar-vertical-drop").mousedown(function () {
        _this.verticalmovestate = true;
        _this.verticalmoveposition = $(this).position().left;
        _this.windowWidth = $("#luckysheet-grid-window-1").width();
        $(this).parent().addClass("luckysheet-freezebar-active");
        $("#luckysheet-freezebar-vertical").find(".luckysheet-freezebar-vertical-handle").css("cursor", "-webkit-grabbing");
      });
      let gridheight = $("#luckysheet-grid-window-1").height();
      $("#luckysheet-freezebar-vertical").find(".luckysheet-freezebar-vertical-handle").css({
        "height": gridheight - 10,
        "width": "4px",
        "cursor": "-webkit-grab",
        "top": "0px"
      }).end().find(".luckysheet-freezebar-vertical-drop").css({
        "height": gridheight - 10,
        "width": "4px",
        "top": "0px",
        "cursor": "-webkit-grab"
      });
    }
    if (freezenverticaldata == null) {
      if (_this.freezenRealFirstRowColumn) {
        let dataset_col_st = 0;
        left = Store.visibledatacolumn[dataset_col_st] - 2 + Store.rowHeaderWidth;
        freezenverticaldata = [Store.visibledatacolumn[dataset_col_st], dataset_col_st + 1, 0, _this.cutVolumn(Store.visibledatacolumn, dataset_col_st + 1), left];
      } else {
        let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
        let dataset_col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
        if (dataset_col_st == -1) {
          dataset_col_st = 0;
        }
        left = Store.visibledatacolumn[dataset_col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
        freezenverticaldata = [Store.visibledatacolumn[dataset_col_st], dataset_col_st + 1, scrollLeft, _this.cutVolumn(Store.visibledatacolumn, dataset_col_st + 1), left];
      }
      _this.saveFreezen(null, null, freezenverticaldata, left);
    }
    _this.freezenverticaldata = freezenverticaldata;

    // $("#luckysheet-freezen-btn-horizontal").html('<i class="luckysheet-icon-img-container iconfont-luckysheet luckysheet-iconfont-dongjie1"></i> '+locale().freezen.freezenCancel);

    // 解决freeze 不垂直居中的问题
    const freezeHTML = `
            <div class="luckysheet-toolbar-button-outer-box luckysheet-inline-block"
            style="user-select: none;">
                <div class="luckysheet-toolbar-button-inner-box luckysheet-inline-block"
                style="user-select: none;">
                    <div class="luckysheet-icon luckysheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-function iconfont-luckysheet luckysheet-iconfont-dongjie1"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="luckysheet-toolbar-menu-button-caption luckysheet-inline-block"
                    style="user-select: none;">
                        ${locale().freezen.freezenCancel}
                    </div>
                </div>
            </div>
        `;
    $("#luckysheet-freezen-btn-horizontal").html(freezeHTML);
    $("#luckysheet-freezebar-vertical").show().find(".luckysheet-freezebar-vertical-handle").css({
      "left": left
    }).end().find(".luckysheet-freezebar-vertical-drop").css({
      "left": left
    });
  },
  saveFreezen: function (freezenhorizontaldata, top, freezenverticaldata, left) {
    let currentSheet = getCurrentFile();
    if (currentSheet.freezen == null) {
      currentSheet.freezen = {};
    }
    if (freezenhorizontaldata != null) {
      if (currentSheet.freezen.horizontal == null) {
        currentSheet.freezen.horizontal = {};
      }
      currentSheet.freezen.horizontal.freezenhorizontaldata = freezenhorizontaldata;
      currentSheet.freezen.horizontal.top = top;
    }
    if (freezenverticaldata != null) {
      if (currentSheet.freezen.vertical == null) {
        currentSheet.freezen.vertical = {};
      }
      currentSheet.freezen.vertical.freezenverticaldata = freezenverticaldata;
      currentSheet.freezen.vertical.left = left;
    }

    // if(currentSheet.freezen != null){
    // }

    // use new property frozen
    if (currentSheet.frozen != null) {}
  },
  initialFreezen: function (sheetIndex) {
    let _this = this;

    // when init ,we get frozen, but here, we need freezen,so tranform it
    _this.frozenTofreezen();
    let currentSheet = Store.luckysheetfile[getSheetIndex(sheetIndex)];
    if (currentSheet.freezen != null && currentSheet.freezen.horizontal != null && currentSheet.freezen.horizontal.freezenhorizontaldata != null) {
      _this.createFreezenHorizontal(currentSheet.freezen.horizontal.freezenhorizontaldata, currentSheet.freezen.horizontal.top);
    } else {
      _this.cancelFreezenHorizontal(sheetIndex);
    }
    if (currentSheet.freezen != null && currentSheet.freezen.vertical != null && currentSheet.freezen.vertical.freezenverticaldata != null) {
      _this.createFreezenVertical(currentSheet.freezen.vertical.freezenverticaldata, currentSheet.freezen.vertical.left);
    } else {
      _this.cancelFreezenVertical(sheetIndex);
    }
    _this.createAssistCanvas();
  },
  changeFreezenIndex: function (originindex, type) {
    let _this = this;
    if (type == "v" && _this.freezenverticaldata != null) {
      let freezen_colindex = _this.freezenverticaldata[1];
      let offset = luckysheet_searcharray(Store.visibledatacolumn, $("#luckysheet-cell-main").scrollLeft());
      if (originindex - offset < freezen_colindex) {
        originindex = originindex - offset;
      }
    } else if (type == "h" && _this.freezenhorizontaldata != null) {
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let offset = luckysheet_searcharray(Store.visibledatarow, $("#luckysheet-cell-main").scrollTop());
      if (originindex - offset < freezen_rowindex) {
        originindex = originindex - offset;
      }
    }
    return originindex;
  },
  scrollFreezen: function () {
    let _this = this;
    let row;
    let row_focus = Store.luckysheet_select_save[0]["row_focus"];
    if (row_focus == Store.luckysheet_select_save[0]["row"][0]) {
      row = Store.luckysheet_select_save[0]["row"][1];
    } else if (row_focus == Store.luckysheet_select_save[0]["row"][1]) {
      row = Store.luckysheet_select_save[0]["row"][0];
    }
    let column;
    let column_focus = Store.luckysheet_select_save[0]["column_focus"];
    if (column_focus == Store.luckysheet_select_save[0]["column"][0]) {
      column = Store.luckysheet_select_save[0]["column"][1];
    } else if (column_focus == Store.luckysheet_select_save[0]["column"][1]) {
      column = Store.luckysheet_select_save[0]["column"][0];
    }
    if (_this.freezenverticaldata != null) {
      let freezen_colindex = _this.freezenverticaldata[1];
      let offset = luckysheet_searcharray(_this.freezenverticaldata[3], $("#luckysheet-cell-main").scrollLeft());
      let top = _this.freezenverticaldata[4];
      freezen_colindex += offset;
      if (column >= Store.visibledatacolumn.length) {
        column = getMaxColIndex();
      }
      if (freezen_colindex >= Store.visibledatacolumn.length) {
        freezen_colindex = getMaxColIndex();
      }
      let column_px = Store.visibledatacolumn[column],
        freezen_px = Store.visibledatacolumn[freezen_colindex];
      if (column_px <= freezen_px + top) {
        setTimeout(function () {
          $("#luckysheet-scrollbar-x").scrollLeft(0);
        }, 100);
      }
    }
    if (_this.freezenhorizontaldata != null) {
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let offset = luckysheet_searcharray(_this.freezenhorizontaldata[3], $("#luckysheet-cell-main").scrollTop());
      let left = _this.freezenhorizontaldata[4];
      freezen_rowindex += offset;
      if (row >= Store.visibledatarow.length) {
        row = getMaxRowIndex();
      }
      if (freezen_rowindex >= Store.visibledatarow.length) {
        freezen_rowindex = getMaxRowIndex();
      }
      let row_px = Store.visibledatarow[row],
        freezen_px = Store.visibledatarow[freezen_rowindex];
      if (row_px <= freezen_px + left) {
        setTimeout(function () {
          $("#luckysheet-scrollbar-y").scrollTop(0);
        }, 100);
      }
    }
  },
  cancelFreezenHorizontal: function (sheetIndex) {
    let _this = this;

    // $("#luckysheet-freezen-btn-horizontal").html('<i class="luckysheet-icon-img-container iconfont-luckysheet luckysheet-iconfont-dongjie1"></i> '+locale().freezen.default);

    // 解决freeze 不垂直居中的问题
    const freezeHTML = `
            <div class="luckysheet-toolbar-button-outer-box luckysheet-inline-block"
            style="user-select: none;">
                <div class="luckysheet-toolbar-button-inner-box luckysheet-inline-block"
                style="user-select: none;">
                    <div class="luckysheet-icon luckysheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-function iconfont-luckysheet luckysheet-iconfont-dongjie1"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="luckysheet-toolbar-menu-button-caption luckysheet-inline-block"
                    style="user-select: none;">
                        ${locale().freezen.default}
                    </div>
                </div>
            </div>
        `;
    $("#luckysheet-freezen-btn-horizontal").html(freezeHTML);
    _this.freezenhorizontaldata = null;
    let ishorizontal = $("#luckysheet-freezebar-horizontal").is(":visible");
    $("#luckysheet-freezebar-horizontal").hide();
    if (sheetIndex == null) {
      sheetIndex = Store.currentSheetIndex;
    }
    let currentSheet = Store.luckysheetfile[getSheetIndex(sheetIndex)];
    if (currentSheet.freezen != null) {
      currentSheet.freezen.horizontal = null;
    }
    if (currentSheet.frozen != null && ishorizontal) {}
  },
  createFreezenHorizontal: function (freezenhorizontaldata, top) {
    let _this = this;
    if (_this.initialHorizontal) {
      _this.initialHorizontal = false;
      $("#luckysheet-grid-window-1").append(_this.freezenHorizontalHTML);
      $("#luckysheet-freezebar-horizontal").find(".luckysheet-freezebar-horizontal-drop").hover(function () {
        $(this).parent().addClass("luckysheet-freezebar-hover");
      }, function () {
        $(this).parent().removeClass("luckysheet-freezebar-hover");
      });
      $("#luckysheet-freezebar-horizontal").find(".luckysheet-freezebar-horizontal-drop").mousedown(function () {
        _this.horizontalmovestate = true;
        _this.horizontalmoveposition = $(this).position().top;
        _this.windowHeight = $("#luckysheet-grid-window-1").height();
        $(this).parent().addClass("luckysheet-freezebar-active");
        $("#luckysheet-freezebar-horizontal").find(".luckysheet-freezebar-horizontal-handle").css("cursor", "-webkit-grabbing");
      });
      let gridwidth = $("#luckysheet-grid-window-1").width();
      $("#luckysheet-freezebar-horizontal").find(".luckysheet-freezebar-horizontal-handle").css({
        "width": gridwidth - 10,
        "height": "4px",
        "cursor": "-webkit-grab",
        "left": "0px"
      }).end().find(".luckysheet-freezebar-horizontal-drop").css({
        "width": gridwidth - 10,
        "height": "4px",
        "left": "0px",
        "cursor": "-webkit-grab"
      });
    }
    if (freezenhorizontaldata == null) {
      let dataset_row_st;
      if (_this.freezenRealFirstRowColumn) {
        dataset_row_st = 0;
        top = Store.visibledatarow[dataset_row_st] - 2 + Store.columnHeaderHeight;
        freezenhorizontaldata = [Store.visibledatarow[dataset_row_st], dataset_row_st + 1, 0, _this.cutVolumn(Store.visibledatarow, dataset_row_st + 1), top];
        _this.saveFreezen(freezenhorizontaldata, top, null, null);
        // todo: 没有下面代码 如果有滚动，冻结之后首行的行号仍显示的之前滚动的行号
        // todo: 不 setTimeout 这里直接刷新的话，冻结的首行显示有问题，没有列的分割线
        setTimeout(() => {
          freezeCanvasModule.createAssistCanvas();
          luckysheetrefreshgrid();
        });
      } else {
        let scrollTop = $("#luckysheet-cell-main").scrollTop();
        dataset_row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
        if (dataset_row_st == -1) {
          dataset_row_st = 0;
        }
        top = Store.visibledatarow[dataset_row_st] - 2 - scrollTop + Store.columnHeaderHeight;
        freezenhorizontaldata = [Store.visibledatarow[dataset_row_st], dataset_row_st + 1, scrollTop, _this.cutVolumn(Store.visibledatarow, dataset_row_st + 1), top];
        _this.saveFreezen(freezenhorizontaldata, top, null, null);
      }
    }
    _this.freezenhorizontaldata = freezenhorizontaldata;

    // $("#luckysheet-freezen-btn-horizontal").html('<i class="fa fa-list-alt"></i> '+locale().freezen.freezenCancel);

    // $("#luckysheet-freezen-btn-horizontal").html('<i class="luckysheet-icon-img-container iconfont-luckysheet luckysheet-iconfont-dongjie1"></i> '+locale().freezen.freezenCancel);

    const freezeHTML = `
            <div class="luckysheet-toolbar-button-outer-box luckysheet-inline-block"
            style="user-select: none;">
                <div class="luckysheet-toolbar-button-inner-box luckysheet-inline-block"
                style="user-select: none;">
                    <div class="luckysheet-icon luckysheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-function iconfont-luckysheet luckysheet-iconfont-dongjie1"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="luckysheet-toolbar-menu-button-caption luckysheet-inline-block"
                    style="user-select: none;">
                        ${locale().freezen.freezenCancel}
                    </div>
                </div>
            </div>
        `;
    $("#luckysheet-freezen-btn-horizontal").html(freezeHTML);
    $("#luckysheet-freezebar-horizontal").show().find(".luckysheet-freezebar-horizontal-handle").css({
      "top": top
    }).end().find(".luckysheet-freezebar-horizontal-drop").css({
      "top": top
    });
  }
};
export default freezeCoreModule;