import { getScrollPosition } from '../../utils/domUtils.js';
import { getCurrentFile, getMaxRowIndex, getMaxColIndex, getFileBySheetIndex } from "../../utils/storeAccess.js";
import { luckysheet_searcharray } from "../sheetSearch";
import Store from "../../store";
import locale from "../../locale/locale";
import { luckysheetrefreshgrid } from "../../global/refresh";
import freezeCanvasModule from "./freezeCanvas";
import scrollBarX from '../../ui/scrollBarX.js';
import scrollBarY from '../../ui/scrollBarY.js';
import gridWindow from '../../ui/gridWindow.js';
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
    let _freezenBtnH = document.getElementById("luckysheet-freezen-btn-horizontal");
    if (_freezenBtnH) _freezenBtnH.innerHTML = freezeHTML;
    let _freezenBtnV = document.getElementById("luckysheet-freezen-btn-vertical");
    if (_freezenBtnV) _freezenBtnV.innerHTML = '<i class="fa fa-indent"></i> ' + locale_freezen.freezenColumn;
    _this.freezenverticaldata = null;
    let _freezebarVertical = document.getElementById("luckysheet-freezebar-vertical");
    let isvertical = _freezebarVertical && _freezebarVertical.offsetWidth > 0;
    if (_freezebarVertical) _freezebarVertical.style.display = 'none';
    if (sheetIndex == null) {
      sheetIndex = Store.currentSheetIndex;
    }
    let currentSheet = getFileBySheetIndex(sheetIndex);
    if (currentSheet.freezen != null) {
      currentSheet.freezen.vertical = null;
    }
    if (currentSheet.frozen != null && isvertical) {}
  },
  createFreezenVertical: function (freezenverticaldata, left) {
    let _this = this;
    if (_this.initialVertical) {
      _this.initialVertical = false;
      gridWindow.append(_this.freezenVerticalHTML);
      let _freezebarVDrop = document.getElementById("luckysheet-freezebar-vertical")?.querySelector(".luckysheet-freezebar-vertical-drop");
      _freezebarVDrop?.addEventListener("mouseenter", function () {
        this.parentElement.classList.add("luckysheet-freezebar-hover");
      });
      _freezebarVDrop?.addEventListener("mouseleave", function () {
        this.parentElement.classList.remove("luckysheet-freezebar-hover");
      });
      _freezebarVDrop?.addEventListener("mousedown", function () {
        _this.verticalmovestate = true;
        _this.verticalmoveposition = this.offsetLeft;
        _this.windowWidth = gridWindow.getWidth();
        this.parentElement.classList.add("luckysheet-freezebar-active");
        const _elHandle = document.getElementById("luckysheet-freezebar-vertical")?.querySelector(".luckysheet-freezebar-vertical-handle"); if (_elHandle) _elHandle.style.cursor = "-webkit-grabbing";
      });
      let gridheight = gridWindow.getHeight();
      let _freezebarVHandle = document.getElementById("luckysheet-freezebar-vertical")?.querySelector(".luckysheet-freezebar-vertical-handle");
      if (_freezebarVHandle) Object.assign(_freezebarVHandle.style, {
        height: gridheight - 10 + "px",
        width: "4px",
        cursor: "-webkit-grab",
        top: "0px"
      });
      if (_freezebarVDrop) Object.assign(_freezebarVDrop.style, {
        height: gridheight - 10 + "px",
        width: "4px",
        top: "0px",
        cursor: "-webkit-grab"
      });
    }
    if (freezenverticaldata == null) {
      if (_this.freezenRealFirstRowColumn) {
        let dataset_col_st = 0;
        left = Store.visibleColPositions[dataset_col_st] - 2 + Store.rowHeaderWidth;
        freezenverticaldata = [Store.visibleColPositions[dataset_col_st], dataset_col_st + 1, 0, _this.cutVolumn(Store.visibleColPositions, dataset_col_st + 1), left];
      } else {
        let scrollLeft = getScrollPosition().scrollLeft;
        let dataset_col_st = luckysheet_searcharray(Store.visibleColPositions, scrollLeft);
        if (dataset_col_st == -1) {
          dataset_col_st = 0;
        }
        left = Store.visibleColPositions[dataset_col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
        freezenverticaldata = [Store.visibleColPositions[dataset_col_st], dataset_col_st + 1, scrollLeft, _this.cutVolumn(Store.visibleColPositions, dataset_col_st + 1), left];
      }
      _this.saveFreezen(null, null, freezenverticaldata, left);
    }
    _this.freezenverticaldata = freezenverticaldata;

    // document.getElementById("luckysheet-freezen-btn-horizontal").innerHTML = '<i class="luckysheet-icon-img-container iconfont-luckysheet luckysheet-iconfont-dongjie1"></i> '+locale(.freezen.freezenCancel);

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
    let _freezenBtnH2 = document.getElementById("luckysheet-freezen-btn-horizontal");
    if (_freezenBtnH2) _freezenBtnH2.innerHTML = freezeHTML;
    let _freezebarV = document.getElementById("luckysheet-freezebar-vertical");
    if (_freezebarV) {
      _freezebarV.style.display = 'block';
      let _vHandle = _freezebarV.querySelector(".luckysheet-freezebar-vertical-handle");
      if (_vHandle) _vHandle.style.left = left + "px";
      let _vDrop = _freezebarV.querySelector(".luckysheet-freezebar-vertical-drop");
      if (_vDrop) _vDrop.style.left = left + "px";
    }
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
    let currentSheet = getFileBySheetIndex(sheetIndex);
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
      let offset = luckysheet_searcharray(Store.visibleColPositions, getScrollPosition().scrollLeft);
      if (originindex - offset < freezen_colindex) {
        originindex = originindex - offset;
      }
    } else if (type == "h" && _this.freezenhorizontaldata != null) {
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let offset = luckysheet_searcharray(Store.visibledatarow, getScrollPosition().scrollTop);
      if (originindex - offset < freezen_rowindex) {
        originindex = originindex - offset;
      }
    }
    return originindex;
  },
  scrollFreezen: function () {
    let _this = this;
    let row;
    let row_focus = Store.selections[0]["row_focus"];
    if (row_focus == Store.selections[0]["row"][0]) {
      row = Store.selections[0]["row"][1];
    } else if (row_focus == Store.selections[0]["row"][1]) {
      row = Store.selections[0]["row"][0];
    }
    let column;
    let column_focus = Store.selections[0]["column_focus"];
    if (column_focus == Store.selections[0]["column"][0]) {
      column = Store.selections[0]["column"][1];
    } else if (column_focus == Store.selections[0]["column"][1]) {
      column = Store.selections[0]["column"][0];
    }
    if (_this.freezenverticaldata != null) {
      let freezen_colindex = _this.freezenverticaldata[1];
      let offset = luckysheet_searcharray(_this.freezenverticaldata[3], getScrollPosition().scrollLeft);
      let top = _this.freezenverticaldata[4];
      freezen_colindex += offset;
      if (column >= Store.visibleColPositions.length) {
        column = getMaxColIndex();
      }
      if (freezen_colindex >= Store.visibleColPositions.length) {
        freezen_colindex = getMaxColIndex();
      }
      let column_px = Store.visibleColPositions[column],
        freezen_px = Store.visibleColPositions[freezen_colindex];
      if (column_px <= freezen_px + top) {
        setTimeout(function () {
          scrollBarX.setScrollLeft(0);
        }, 100);
      }
    }
    if (_this.freezenhorizontaldata != null) {
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let offset = luckysheet_searcharray(_this.freezenhorizontaldata[3], getScrollPosition().scrollTop);
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
          scrollBarY.setScrollTop(0);
        }, 100);
      }
    }
  },
  cancelFreezenHorizontal: function (sheetIndex) {
    let _this = this;

    // document.getElementById("luckysheet-freezen-btn-horizontal").innerHTML = '<i class="luckysheet-icon-img-container iconfont-luckysheet luckysheet-iconfont-dongjie1"></i> '+locale(.freezen.default);

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
    let _freezenBtnH3 = document.getElementById("luckysheet-freezen-btn-horizontal");
    if (_freezenBtnH3) _freezenBtnH3.innerHTML = freezeHTML;
    _this.freezenhorizontaldata = null;
    let _freezebarHorizontal = document.getElementById("luckysheet-freezebar-horizontal");
    let ishorizontal = _freezebarHorizontal && _freezebarHorizontal.offsetWidth > 0;
    if (_freezebarHorizontal) _freezebarHorizontal.style.display = 'none';
    if (sheetIndex == null) {
      sheetIndex = Store.currentSheetIndex;
    }
    let currentSheet = getFileBySheetIndex(sheetIndex);
    if (currentSheet.freezen != null) {
      currentSheet.freezen.horizontal = null;
    }
    if (currentSheet.frozen != null && ishorizontal) {}
  },
  createFreezenHorizontal: function (freezenhorizontaldata, top) {
    let _this = this;
    if (_this.initialHorizontal) {
      _this.initialHorizontal = false;
      gridWindow.append(_this.freezenHorizontalHTML);
      let _freezebarHDrop = document.getElementById("luckysheet-freezebar-horizontal")?.querySelector(".luckysheet-freezebar-horizontal-drop");
      _freezebarHDrop?.addEventListener("mouseenter", function () {
        this.parentElement.classList.add("luckysheet-freezebar-hover");
      });
      _freezebarHDrop?.addEventListener("mouseleave", function () {
        this.parentElement.classList.remove("luckysheet-freezebar-hover");
      });
      _freezebarHDrop?.addEventListener("mousedown", function () {
        _this.horizontalmovestate = true;
        _this.horizontalmoveposition = this.offsetTop;
        _this.windowHeight = gridWindow.getHeight();
        this.parentElement.classList.add("luckysheet-freezebar-active");
        const _elHHandle = document.getElementById("luckysheet-freezebar-horizontal")?.querySelector(".luckysheet-freezebar-horizontal-handle"); if (_elHHandle) _elHHandle.style.cursor = "-webkit-grabbing";
      });
      let gridwidth = gridWindow.getWidth();
      let _freezebarHHandle = document.getElementById("luckysheet-freezebar-horizontal")?.querySelector(".luckysheet-freezebar-horizontal-handle");
      if (_freezebarHHandle) Object.assign(_freezebarHHandle.style, {
        width: gridwidth - 10 + "px",
        height: "4px",
        cursor: "-webkit-grab",
        left: "0px"
      });
      if (_freezebarHDrop) Object.assign(_freezebarHDrop.style, {
        width: gridwidth - 10 + "px",
        height: "4px",
        left: "0px",
        cursor: "-webkit-grab"
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
        let scrollTop = getScrollPosition().scrollTop;
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

    // document.getElementById("luckysheet-freezen-btn-horizontal").innerHTML = '<i class="fa fa-list-alt"></i> '+locale(.freezen.freezenCancel);

    // document.getElementById("luckysheet-freezen-btn-horizontal").innerHTML = '<i class="luckysheet-icon-img-container iconfont-luckysheet luckysheet-iconfont-dongjie1"></i> '+locale(.freezen.freezenCancel);

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
    let _freezenBtnH4 = document.getElementById("luckysheet-freezen-btn-horizontal");
    if (_freezenBtnH4) _freezenBtnH4.innerHTML = freezeHTML;
    let _freezebarH = document.getElementById("luckysheet-freezebar-horizontal");
    if (_freezebarH) {
      _freezebarH.style.display = 'block';
      let _hHandle = _freezebarH.querySelector(".luckysheet-freezebar-horizontal-handle");
      if (_hHandle) _hHandle.style.top = top + "px";
      let _hDrop = _freezebarH.querySelector(".luckysheet-freezebar-horizontal-drop");
      if (_hDrop) _hDrop.style.top = top + "px";
    }
  }
};
export default freezeCoreModule;