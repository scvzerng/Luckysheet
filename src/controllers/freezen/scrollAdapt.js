import { getScrollPosition } from '../../utils/domUtils.js';
import { getCurrentFile } from "../../utils/storeAccess.js";
import { luckysheet_searcharray } from "../sheetSearch";
import { selectHightlightShow } from "../select";
import { createFilterOptions } from "../filter";
import menuButton from "../menuButton";
import luckysheetPostil from "../postil";
import luckysheetDropCell from "../dropCell";
import { rowLocationByIndex, colLocationByIndex } from "../../global/location";
import Store from "../../store";
import imageCtrl from "../imageCtrl";
import cellSelectedFocus from '../../ui/cellSelectedFocus.js';
import countShow from '../../ui/countShow.js';

function getCellSelectedEl(s) {
    let els = document.querySelectorAll("#luckysheet-cell-selected-boxs .luckysheet-cell-selected");
    return els[s] || null;
}

function showCellSelected(s, cssObj) {
    let el = getCellSelectedEl(s);
    if (el) {
        el.style.display = 'block';
        if (cssObj) Object.assign(el.style, cssObj);
    }
}

function hideCellSelected(s) {
    let el = getCellSelectedEl(s);
    if (el) el.style.display = 'none';
}

function showCellSelectedProp(s, prop, val) {
    let el = getCellSelectedEl(s);
    if (el) {
        el.style.display = 'block';
        el.style[prop] = val;
    }
}

const scrollAdaptModule = {
  scrollAdapt: function () {
    let _this = this;

    if (Store.selections != null && Store.selections.length > 0) {
      _this.scrollAdaptOfselect();
    }

    if (document.querySelectorAll(".luckysheet-modal-dialog-image").length > 0 && imageCtrl.images != undefined) {
      _this.scrollAdaptOfImage();
    }

    if (document.querySelectorAll("#luckysheet-postil-showBoxs .luckysheet-postil-show").length > 0) {
      _this.scrollAdaptOfpostil();
    }

    if (document.getElementById("luckysheet-dropCell-icon") != null) {
      _this.scrollAdaptOfdpicon();
    }

    if (document.querySelectorAll("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").length > 0) {
      _this.scrollAdaptOffilteroptions();
    }
  },
  scrollAdaptOfselect: function () {
    let _this = this;
    if (countShow.row.isVisible()) {
      countShow.row.hide();
    }
    if (countShow.column.isVisible()) {
      countShow.column.hide();
    }
    let _elRowsH = document.getElementById("luckysheet-rows-h-selected");
    if (_elRowsH) _elRowsH.innerHTML = '';
    let _elColsH = document.getElementById("luckysheet-cols-h-selected");
    if (_elColsH) _elColsH.innerHTML = '';
    let scroll = getScrollPosition();
    let scrollTop = scroll.scrollTop;
    let scrollLeft = scroll.scrollLeft;
    if (_this.freezenhorizontaldata != null && _this.freezenverticaldata != null) {
      let freezenTop = _this.freezenhorizontaldata[0];
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let offTop = scrollTop - _this.freezenhorizontaldata[2];
      let freezenLeft = _this.freezenverticaldata[0];
      let freezen_colindex = _this.freezenverticaldata[1];
      let offLeft = scrollLeft - _this.freezenverticaldata[2];
      for (let s = 0; s < Store.selections.length; s++) {
        let obj = structuredClone(Store.selections[s]);
        let r1 = obj.row[0],
          r2 = obj.row[1];
        let row = Store.visibledatarow[r2],
          row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
        let top_move = row_pre;
        let height_move = row - row_pre - 1;
        let rangeshow = true;
        if (r1 >= freezen_rowindex) {
          if (top_move + height_move < freezenTop + offTop) {
            rangeshow = false;
          } else if (top_move < freezenTop + offTop) {
            showCellSelected(s, {
              "top": freezenTop + offTop + "px",
              "height": (height_move - (freezenTop + offTop - top_move)) + "px"
            });
          } else {
            showCellSelected(s, {
              "top": top_move + "px",
              "height": height_move + "px"
            });
          }
        } else if (r2 >= freezen_rowindex) {
          if (top_move + height_move < freezenTop + offTop) {
            showCellSelected(s, {
              "top": (top_move + offTop) + "px",
              "height": (freezenTop - top_move) + "px"
            });
          } else {
            showCellSelected(s, {
              "top": (top_move + offTop) + "px",
              "height": (height_move - offTop) + "px"
            });
          }
        } else {
          showCellSelectedProp(s, "top", (top_move + offTop) + "px");
        }
        let c1 = obj.column[0],
          c2 = obj.column[1];
        let col = Store.visibledatacolumn[c2],
          col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];
        let left_move = col_pre;
        let width_move = col - col_pre - 1;
        if (c1 >= freezen_colindex) {
          if (left_move + width_move < freezenLeft + offLeft) {
            rangeshow = false;
          } else if (left_move < freezenLeft + offLeft) {
            showCellSelected(s, {
              "left": (freezenLeft + offLeft) + "px",
              "width": (width_move - (freezenLeft + offLeft - left_move)) + "px"
            });
          } else {
            showCellSelected(s, {
              "left": left_move + "px",
              "width": width_move + "px"
            });
          }
        } else if (c2 >= freezen_colindex) {
          if (left_move + width_move < freezenLeft + offLeft) {
            showCellSelected(s, {
              "left": (left_move + offLeft) + "px",
              "width": (freezenLeft - left_move) + "px"
            });
          } else {
            showCellSelected(s, {
              "left": (left_move + offLeft) + "px",
              "width": (width_move - offLeft) + "px"
            });
          }
        } else {
          showCellSelectedProp(s, "left", (left_move + offLeft) + "px");
        }
        if (!rangeshow) {
          hideCellSelected(s);
        }
        if (s == Store.selections.length - 1) {
          let rf = obj.row_focus == null ? r1 : obj.row_focus;
          let cf = obj.column_focus == null ? c1 : obj.column_focus;
          let row_f = Store.visibledatarow[rf],
            row_pre_f = rf - 1 == -1 ? 0 : Store.visibledatarow[rf - 1];
          let col_f = Store.visibledatacolumn[cf],
            col_pre_f = cf - 1 == -1 ? 0 : Store.visibledatacolumn[cf - 1];
          let margeset = menuButton.mergeborer(Store.sheetData, rf, cf);
          if (margeset) {
            row_f = margeset.row[1];
            row_pre_f = margeset.row[0];
            col_f = margeset.column[1];
            col_pre_f = margeset.column[0];
          }
          let top = row_pre_f;
          let height = row_f - row_pre_f - 1;
          let left = col_pre_f;
          let width = col_f - col_pre_f - 1;
          let focuscell = true;
          if (top >= freezenTop) {
            if (top + height < freezenTop + offTop) {
              focuscell = false;
            } else if (top < freezenTop + offTop) {
              cellSelectedFocus.showAt({
              "top": freezenTop + offTop,
              "height": height - (freezenTop + offTop - top)
            });
          } else {
            cellSelectedFocus.showAt({
              "top": top,
              "height": height
            });
          }
        } else if (top + height >= freezenTop) {
          if (top + height < freezenTop + offTop) {
            cellSelectedFocus.showAt({
              "top": top + offTop,
              "height": freezenTop - top
            });
          } else {
            cellSelectedFocus.showAt({
              "top": top + offTop,
              "height": height - offTop
            });
          }
        } else {
            cellSelectedFocus.showAt({"top": top + offTop});
          }
          if (left >= freezenLeft) {
            if (left + width < freezenLeft + offLeft) {
              focuscell = false;
            } else if (left < freezenLeft + offLeft) {
              cellSelectedFocus.showAt({
              "left": freezenLeft + offLeft,
              "width": width - (freezenLeft + offLeft - left)
            });
          } else {
            cellSelectedFocus.showAt({
              "left": left,
              "width": width
            });
          }
        } else if (left + width >= freezenLeft) {
          if (left + width < freezenLeft + offLeft) {
            cellSelectedFocus.showAt({
              "left": left + offLeft,
              "width": freezenLeft - left
            });
          } else {
            cellSelectedFocus.showAt({
              "left": left + offLeft,
              "width": width - offLeft
            });
          }
        } else {
            cellSelectedFocus.showAt({"left": left + offLeft});
          }
          if (!focuscell) {
            cellSelectedFocus.hide();
          }
        }
      }
    } else if (_this.freezenhorizontaldata != null) {
      let freezenTop = _this.freezenhorizontaldata[0];
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let offTop = scrollTop - _this.freezenhorizontaldata[2];
      for (let s = 0; s < Store.selections.length; s++) {
        let obj = structuredClone(Store.selections[s]);
        let r1 = obj.row[0],
          r2 = obj.row[1];
        let row = Store.visibledatarow[r2],
          row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
        let top_move = row_pre;
        let height_move = row - row_pre - 1;
        if (r1 >= freezen_rowindex) {
          if (top_move + height_move < freezenTop + offTop) {
            hideCellSelected(s);
          } else if (top_move < freezenTop + offTop) {
            showCellSelected(s, {
              "top": (freezenTop + offTop) + "px",
              "height": (height_move - (freezenTop + offTop - top_move)) + "px"
            });
          } else {
            showCellSelected(s, {
              "top": top_move + "px",
              "height": height_move + "px"
            });
          }
        } else if (r2 >= freezen_rowindex) {
          if (top_move + height_move < freezenTop + offTop) {
            showCellSelected(s, {
              "top": (top_move + offTop) + "px",
              "height": (freezenTop - top_move) + "px"
            });
          } else {
            showCellSelected(s, {
              "top": (top_move + offTop) + "px",
              "height": (height_move - offTop) + "px"
            });
          }
        } else {
          showCellSelectedProp(s, "top", (top_move + offTop) + "px");
        }
        if (s == Store.selections.length - 1) {
          let rf = obj.row_focus == null ? r1 : obj.row_focus;
          let cf = obj.column_focus == null ? obj.column[0] : obj.column_focus;
          let row_f = Store.visibledatarow[rf],
            row_pre_f = rf - 1 == -1 ? 0 : Store.visibledatarow[rf - 1];
          let margeset = menuButton.mergeborer(Store.sheetData, rf, cf);
          if (margeset) {
            row_f = margeset.row[1];
            row_pre_f = margeset.row[0];
          }
          let top = row_pre_f;
          let height = row_f - row_pre_f - 1;
          if (top >= freezenTop) {
            if (top + height < freezenTop + offTop) {
              cellSelectedFocus.hide();
            } else if (top < freezenTop + offTop) {
              cellSelectedFocus.showAt({
                "top": freezenTop + offTop,
                "height": height - (freezenTop + offTop - top)
              });
            } else {
              cellSelectedFocus.showAt({
                "top": top,
                "height": height
              });
            }
          } else if (top + height >= freezenTop) {
            if (top + height < freezenTop + offTop) {
              cellSelectedFocus.showAt({
                "top": top + offTop,
                "height": freezenTop - top
              });
            } else {
              cellSelectedFocus.showAt({
                "top": top + offTop,
                "height": height - offTop
              });
            }
          } else {
            cellSelectedFocus.showAt({"top": top + offTop});
          }
        }
      }
    } else if (_this.freezenverticaldata != null) {
      let freezenLeft = _this.freezenverticaldata[0];
      let freezen_colindex = _this.freezenverticaldata[1];
      let offLeft = scrollLeft - _this.freezenverticaldata[2];
      for (let s = 0; s < Store.selections.length; s++) {
        let obj = structuredClone(Store.selections[s]);
        let c1 = obj.column[0],
          c2 = obj.column[1];
        let col = Store.visibledatacolumn[c2],
          col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];
        let left_move = col_pre;
        let width_move = col - col_pre - 1;
        if (c1 >= freezen_colindex) {
          if (left_move + width_move < freezenLeft + offLeft) {
            hideCellSelected(s);
          } else if (left_move < freezenLeft + offLeft) {
            showCellSelected(s, {
              "left": (freezenLeft + offLeft) + "px",
              "width": (width_move - (freezenLeft + offLeft - left_move)) + "px"
            });
          } else {
            showCellSelected(s, {
              "left": left_move + "px",
              "width": width_move + "px"
            });
          }
        } else if (c2 >= freezen_colindex) {
          if (left_move + width_move < freezenLeft + offLeft) {
            showCellSelected(s, {
              "left": (left_move + offLeft) + "px",
              "width": (freezenLeft - left_move) + "px"
            });
          } else {
            showCellSelected(s, {
              "left": (left_move + offLeft) + "px",
              "width": (width_move - offLeft) + "px"
            });
          }
        } else {
          showCellSelectedProp(s, "left", (left_move + offLeft) + "px");
        }
        if (s == Store.selections.length - 1) {
          let rf = obj.row_focus == null ? obj.row[0] : obj.row_focus;
          let cf = obj.column_focus == null ? c1 : obj.column_focus;
          let col_f = Store.visibledatacolumn[cf],
            col_pre_f = cf - 1 == -1 ? 0 : Store.visibledatacolumn[cf - 1];
          let margeset = menuButton.mergeborer(Store.sheetData, rf, cf);
          if (margeset) {
            col_f = margeset.column[1];
            col_pre_f = margeset.column[0];
          }
          let left = col_pre_f;
          let width = col_f - col_pre_f - 1;
          if (left >= freezenLeft) {
            if (left + width < freezenLeft + offLeft) {
              cellSelectedFocus.hide();
            } else if (left < freezenLeft + offLeft) {
              cellSelectedFocus.showAt({
                "left": freezenLeft + offLeft,
                "width": width - (freezenLeft + offLeft - left)
              });
            } else {
              cellSelectedFocus.showAt({
                "left": left,
                "width": width
              });
            }
          } else if (left + width >= freezenLeft) {
            if (left + width < freezenLeft + offLeft) {
              cellSelectedFocus.showAt({
                "left": left + offLeft,
                "width": freezenLeft - left
              });
            } else {
              cellSelectedFocus.showAt({
                "left": left + offLeft,
                "width": width - offLeft
              });
            }
          } else {
            cellSelectedFocus.showAt({"left": left + offLeft});
          }
        }
      }
    } else {
      selectHightlightShow();
    }
  },
  scrollAdaptOfImage: function () {
    let _this = this;
    var images = imageCtrl.images;
    let scroll = getScrollPosition();
    let scrollTop = scroll.scrollTop;
    let scrollLeft = scroll.scrollLeft;
    let freezenTop = _this.freezenhorizontaldata != null ? _this.freezenhorizontaldata[0] - _this.freezenhorizontaldata[2] : -1;
    let freezenLeft = _this.freezenverticaldata != null ? _this.freezenverticaldata[0] - _this.freezenverticaldata[2] : -1;
    let zoomRatio = Store.zoomRatio;
    Object.keys(images).forEach(function (i) {
      let image = images[i];
      let dialogImage = document.getElementById(i);
      if (!dialogImage) return;
      let x = {top: dialogImage.offsetTop, left: dialogImage.offsetLeft};
      let width = dialogImage.offsetWidth;
      let height = dialogImage.offsetHeight;
      let defaultTop = image.default.top * zoomRatio;
      let defaultLeft = image.default.left * zoomRatio;
      let isHidden = false;

      if (defaultTop >= freezenTop) {
        if (x.top < freezenTop) {
          dialogImage.style.visibility = "hidden";
          isHidden = true;
        } else {
          dialogImage.style.visibility = "visible";
        }
      } else {
        Object.assign(dialogImage.style, {
          "top": (defaultTop + scrollTop) + "px",
          "height": height + "px",
          "visibility": "visible"
        });
      }

      if (!isHidden) {
        if (defaultLeft >= freezenLeft) {
          if (x.left < freezenLeft) {
            dialogImage.style.visibility = "hidden";
          } else {
            dialogImage.style.visibility = "visible";
          }
        } else {
          Object.assign(dialogImage.style, {
            "left": (defaultLeft + scrollLeft) + "px",
            "width": width + "px",
            "visibility": "visible"
          });
        }
      }
    });
  },
  scrollAdaptOfpostil: function () {
    let _this = this;
    let scroll = getScrollPosition();
    let scrollTop = scroll.scrollTop;
    let scrollLeft = scroll.scrollLeft;
    if (_this.freezenhorizontaldata != null && _this.freezenverticaldata != null) {
      let freezenTop = _this.freezenhorizontaldata[0];
      let freezenLeft = _this.freezenverticaldata[0];
      let offTop = scrollTop - _this.freezenhorizontaldata[2];
      let offLeft = scrollLeft - _this.freezenverticaldata[2];
      document.querySelectorAll("#luckysheet-postil-showBoxs .luckysheet-postil-show").forEach(function (e) {
        let id = e.id;
        let r = id.split("luckysheet-postil-show_")[1].split("_")[0];
        let c = id.split("luckysheet-postil-show_")[1].split("_")[1];
        let postil = Store.sheetData[r][c].ps;
        let row = Store.visibledatarow[r],
          row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c],
          col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];
        let margeset = menuButton.mergeborer(Store.sheetData, r, c);
        if (margeset) {
          row = margeset.row[1];
          row_pre = margeset.row[0];
          col = margeset.column[1];
          col_pre = margeset.column[0];
        }
        let toX = col;
        let toY = row_pre;
        let postil_left = postil["left"] == null ? toX + 18 : postil["left"];
        let postil_top = postil["top"] == null ? toY - 18 : postil["top"];
        let postil_width = postil["width"] == null ? luckysheetPostil.defaultWidth : postil["width"];
        let postil_height = postil["height"] == null ? luckysheetPostil.defaultHeight : postil["height"];
        if (postil_top < 0) {
          postil_top = 2;
        }
        let size = luckysheetPostil.getArrowCanvasSize(postil_left, postil_top, toX, toY);
        let show = true;
        let show2 = true;
        let _elMain = e.querySelector(".luckysheet-postil-show-main");
        let _elArrow = e.querySelector(".arrowCanvas");
        let _elFormulaInput = e.querySelector(".formulaInputFocus");
        if (r >= _this.freezenhorizontaldata[1]) {
          if (postil_top + postil_height < freezenTop) {
            e.style.display = 'block';
            if (_elMain) _elMain.style.top = (postil_top + offTop) + "px";
            if (_elArrow) _elArrow.style.top = (size[1] + offTop) + "px";
          } else {
            if (postil_top < freezenTop + offTop) {
              if (postil_top + postil_height <= freezenTop + offTop) {
                show = false;
              } else {
                e.style.display = 'block';
                if (_elMain) Object.assign(_elMain.style, {
                  "top": (freezenTop + offTop) + "px",
                  "height": (postil_height - (freezenTop + offTop - postil_top)) + "px"
                });
                if (_elFormulaInput) _elFormulaInput.style.marginTop = -(freezenTop + offTop - postil_top) + "px";
                if (_elArrow) _elArrow.style.display = 'none';
                show2 = false;
              }
            } else {
              e.style.display = 'block';
              if (_elMain) Object.assign(_elMain.style, {
                "top": postil_top + "px",
                "height": postil_height + "px"
              });
              if (_elFormulaInput) _elFormulaInput.style.marginTop = "0px";
              if (_elArrow) _elArrow.style.top = size[1] + "px";
            }
          }
        } else {
          e.style.display = 'block';
          if (_elMain) _elMain.style.top = (postil_top + offTop) + "px";
          if (_elArrow) _elArrow.style.top = (size[1] + offTop) + "px";
        }
        if (c >= _this.freezenverticaldata[1]) {
          if (postil_left + postil_width < freezenLeft) {
            e.style.display = 'block';
            if (_elMain) _elMain.style.left = (postil_left + offLeft) + "px";
            if (_elArrow) _elArrow.style.left = (size[0] + offLeft) + "px";
          } else {
            if (postil_left < freezenLeft + offLeft) {
              if (postil_left + postil_width <= freezenLeft + offLeft) {
                show = false;
              } else {
                e.style.display = 'block';
                if (_elMain) Object.assign(_elMain.style, {
                  "left": (freezenLeft + offLeft) + "px",
                  "width": (postil_width - (freezenLeft + offLeft - postil_left)) + "px"
                });
                if (_elFormulaInput) _elFormulaInput.style.marginLeft = -(freezenLeft + offLeft - postil_left) + "px";
                if (_elArrow) _elArrow.style.display = 'none';
                show2 = false;
              }
            } else {
              e.style.display = 'block';
              if (_elMain) Object.assign(_elMain.style, {
                "left": postil_left + "px",
                "width": postil_width + "px"
              });
              if (_elFormulaInput) _elFormulaInput.style.marginLeft = "0px";
              if (_elArrow) _elArrow.style.left = size[0] + "px";
            }
          }
        } else {
          e.style.display = 'block';
          if (_elMain) _elMain.style.left = (postil_left + offLeft) + "px";
          if (_elArrow) _elArrow.style.left = (size[0] + offLeft) + "px";
        }
        if (!show) {
          e.style.display = 'none';
        }
        if (show && show2) {
          e.style.display = 'block';
          if (_elArrow) _elArrow.style.display = 'block';
        }
      });
    } else if (_this.freezenhorizontaldata != null) {
      let freezenTop = _this.freezenhorizontaldata[0];
      let offTop = scrollTop - _this.freezenhorizontaldata[2];
      document.querySelectorAll("#luckysheet-postil-showBoxs .luckysheet-postil-show").forEach(function (e) {
        let id = e.id;
        let r = id.split("luckysheet-postil-show_")[1].split("_")[0];
        let c = id.split("luckysheet-postil-show_")[1].split("_")[1];
        let postil = Store.sheetData[r][c].ps;
        let row = Store.visibledatarow[r],
          row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c],
          col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];
        let margeset = menuButton.mergeborer(Store.sheetData, r, c);
        if (margeset) {
          row = margeset.row[1];
          row_pre = margeset.row[0];
          col = margeset.column[1];
          col_pre = margeset.column[0];
        }
        let toX = col;
        let toY = row_pre;
        let postil_left = postil["left"] == null ? toX + 18 : postil["left"];
        let postil_top = postil["top"] == null ? toY - 18 : postil["top"];
        let postil_width = postil["width"] == null ? luckysheetPostil.defaultWidth : postil["width"];
        let postil_height = postil["height"] == null ? luckysheetPostil.defaultHeight : postil["height"];
        if (postil_top < 0) {
          postil_top = 2;
        }
        let size = luckysheetPostil.getArrowCanvasSize(postil_left, postil_top, toX, toY);
        let _elMain = e.querySelector(".luckysheet-postil-show-main");
        let _elArrow = e.querySelector(".arrowCanvas");
        let _elFormulaInput = e.querySelector(".formulaInputFocus");
        if (r >= _this.freezenhorizontaldata[1]) {
          if (postil_top + postil_height < freezenTop) {
            e.style.display = 'block';
            if (_elMain) _elMain.style.top = (postil_top + offTop) + "px";
            if (_elArrow) _elArrow.style.top = (size[1] + offTop) + "px";
          } else {
            if (postil_top < freezenTop + offTop) {
              if (postil_top + postil_height <= freezenTop + offTop) {
                e.style.display = 'none';
              } else {
                e.style.display = 'block';
                if (_elMain) Object.assign(_elMain.style, {
                  "top": (freezenTop + offTop) + "px",
                  "height": (postil_height - (freezenTop + offTop - postil_top)) + "px"
                });
                if (_elFormulaInput) _elFormulaInput.style.marginTop = -(freezenTop + offTop - postil_top) + "px";
                if (_elArrow) _elArrow.style.display = 'none';
              }
            } else {
              luckysheetPostil.buildPs(r, c, postil);
            }
          }
        } else {
          e.style.display = 'block';
          if (_elMain) _elMain.style.top = (postil_top + offTop) + "px";
          if (_elArrow) _elArrow.style.top = (size[1] + offTop) + "px";
        }
      });
    } else if (_this.freezenverticaldata != null) {
      let freezenLeft = _this.freezenverticaldata[0];
      let offLeft = scrollLeft - _this.freezenverticaldata[2];
      document.querySelectorAll("#luckysheet-postil-showBoxs .luckysheet-postil-show").forEach(function (e) {
        let id = e.id;
        let r = id.split("luckysheet-postil-show_")[1].split("_")[0];
        let c = id.split("luckysheet-postil-show_")[1].split("_")[1];
        let postil = Store.sheetData[r][c].ps;
        let row = Store.visibledatarow[r],
          row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c],
          col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];
        let margeset = menuButton.mergeborer(Store.sheetData, r, c);
        if (margeset) {
          row = margeset.row[1];
          row_pre = margeset.row[0];
          col = margeset.column[1];
          col_pre = margeset.column[0];
        }
        let toX = col;
        let toY = row_pre;
        let postil_left = postil["left"] == null ? toX + 18 : postil["left"];
        let postil_top = postil["top"] == null ? toY - 18 : postil["top"];
        let postil_width = postil["width"] == null ? luckysheetPostil.defaultWidth : postil["width"];
        let postil_height = postil["height"] == null ? luckysheetPostil.defaultHeight : postil["height"];
        if (postil_top < 0) {
          postil_top = 2;
        }
        let size = luckysheetPostil.getArrowCanvasSize(postil_left, postil_top, toX, toY);
        let _elMain = e.querySelector(".luckysheet-postil-show-main");
        let _elArrow = e.querySelector(".arrowCanvas");
        let _elFormulaInput = e.querySelector(".formulaInputFocus");
        if (c >= _this.freezenverticaldata[1]) {
          if (postil_left + postil_width < freezenLeft) {
            e.style.display = 'block';
            if (_elMain) _elMain.style.left = (postil_left + offLeft) + "px";
            if (_elArrow) _elArrow.style.left = (size[0] + offLeft) + "px";
          } else {
            if (postil_left < freezenLeft + offLeft) {
              if (postil_left + postil_width <= freezenLeft + offLeft) {
                e.style.display = 'none';
              } else {
                e.style.display = 'block';
                if (_elMain) Object.assign(_elMain.style, {
                  "left": (freezenLeft + offLeft) + "px",
                  "width": (postil_width - (freezenLeft + offLeft - postil_left)) + "px"
                });
                if (_elFormulaInput) _elFormulaInput.style.marginLeft = -(freezenLeft + offLeft - postil_left) + "px";
                if (_elArrow) _elArrow.style.display = 'none';
              }
            } else {
              luckysheetPostil.buildPs(r, c, postil);
            }
          }
        } else {
          e.style.display = 'block';
          if (_elMain) _elMain.style.left = (postil_left + offLeft) + "px";
          if (_elArrow) _elArrow.style.left = (size[0] + offLeft) + "px";
        }
      });
    } else {
      document.querySelectorAll("#luckysheet-postil-showBoxs .luckysheet-postil-show").forEach(function (e) {
        let id = e.id;
        let r = id.split("luckysheet-postil-show_")[1].split("_")[0];
        let c = id.split("luckysheet-postil-show_")[1].split("_")[1];
        let postil = Store.sheetData[r][c].ps;
        luckysheetPostil.buildPs(r, c, postil);
      });
    }
  },
  scrollAdaptOfdpicon: function () {
    let _this = this;
    let copy_r = luckysheetDropCell.copyRange["row"][1],
      copy_c = luckysheetDropCell.copyRange["column"][1];
    let apply_r = luckysheetDropCell.applyRange["row"][1],
      apply_c = luckysheetDropCell.applyRange["column"][1];
    let row_index, col_index;
    if (apply_r >= copy_r && apply_c >= copy_c) {
      row_index = apply_r;
      col_index = apply_c;
    } else {
      row_index = copy_r;
      col_index = copy_c;
    }
    let _elDropCellIcon = document.getElementById("luckysheet-dropCell-icon");
    if (!_elDropCellIcon) return;
    if (_this.freezenhorizontaldata != null && _this.freezenverticaldata != null) {
      let scroll = getScrollPosition();
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let offsetRow = luckysheet_searcharray(_this.freezenhorizontaldata[3], scroll.scrollTop - _this.freezenhorizontaldata[2]);
      let freezen_colindex = _this.freezenverticaldata[1];
      let offsetColumn = luckysheet_searcharray(_this.freezenverticaldata[3], scroll.scrollLeft - _this.freezenverticaldata[2]);
      if (row_index >= freezen_rowindex && col_index >= freezen_colindex) {
        if (row_index < freezen_rowindex + offsetRow - 1 || col_index < freezen_colindex + offsetColumn - 1) {
          _elDropCellIcon.style.display = 'none';
        } else {
          _elDropCellIcon.style.display = 'block';
        }
      } else if (row_index >= freezen_rowindex) {
        if (row_index < freezen_rowindex + offsetRow - 1) {
          _elDropCellIcon.style.display = 'none';
        } else {
          let col = colLocationByIndex(col_index + offsetColumn)[1];
          _elDropCellIcon.style.display = 'block';
          _elDropCellIcon.style.left = col + "px";
        }
      } else if (col_index >= freezen_colindex) {
        if (col_index < freezen_colindex + offsetColumn - 1) {
          _elDropCellIcon.style.display = 'none';
        } else {
          let row = rowLocationByIndex(row_index + offsetRow)[1];
          _elDropCellIcon.style.display = 'block';
          _elDropCellIcon.style.top = row + "px";
        }
      } else {
        let row = rowLocationByIndex(row_index + offsetRow)[1],
          col = colLocationByIndex(col_index + offsetColumn)[1];
        _elDropCellIcon.style.display = 'block';
        Object.assign(_elDropCellIcon.style, {
          "left": col + "px",
          "top": row + "px"
        });
      }
    } else if (_this.freezenhorizontaldata != null) {
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let offsetRow = luckysheet_searcharray(_this.freezenhorizontaldata[3], getScrollPosition().scrollTop - _this.freezenhorizontaldata[2]);
      if (row_index >= freezen_rowindex) {
        if (row_index < freezen_rowindex + offsetRow - 1) {
          _elDropCellIcon.style.display = 'none';
        } else {
          _elDropCellIcon.style.display = 'block';
        }
      } else {
        let row = rowLocationByIndex(row_index + offsetRow)[1];
        _elDropCellIcon.style.display = 'block';
        _elDropCellIcon.style.top = row + "px";
      }
    } else if (_this.freezenverticaldata != null) {
      let freezen_colindex = _this.freezenverticaldata[1];
      let offsetColumn = luckysheet_searcharray(_this.freezenverticaldata[3], getScrollPosition().scrollLeft - _this.freezenverticaldata[2]);
      if (col_index >= freezen_colindex) {
        if (col_index < freezen_colindex + offsetColumn - 1) {
          _elDropCellIcon.style.display = 'none';
        } else {
          _elDropCellIcon.style.display = 'block';
        }
      } else {
        let col = colLocationByIndex(col_index + offsetColumn)[1];
        _elDropCellIcon.style.display = 'block';
        _elDropCellIcon.style.left = col + "px";
      }
    } else {
      let row = rowLocationByIndex(row_index)[1],
        col = colLocationByIndex(col_index)[1];
      _elDropCellIcon.style.display = 'block';
      Object.assign(_elDropCellIcon.style, {
        "left": col + "px",
        "top": row + "px"
      });
    }
  },
  scrollAdaptOffilteroptions: function () {
    let _this = this;
    if (_this.freezenhorizontaldata != null && _this.freezenverticaldata != null) {
      let scroll = getScrollPosition();
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let freezen_top = _this.freezenhorizontaldata[0] + scroll.scrollTop;
      let freezen_colindex = _this.freezenverticaldata[1];
      let offsetColumn = luckysheet_searcharray(_this.freezenverticaldata[3], scroll.scrollLeft - _this.freezenverticaldata[2]);
      document.querySelectorAll("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").forEach(function (e) {
        let row_index = e.dataset.str;
        let top = row_index - 1 == -1 ? 0 : Store.visibledatarow[row_index - 1];
        let col_index = e.dataset.cindex;
        if (row_index >= freezen_rowindex && col_index >= freezen_colindex) {
          if (top < freezen_top || col_index < freezen_colindex + offsetColumn) {
            e.style.display = 'none';
          } else {
            e.style.display = 'block';
          }
        } else if (row_index >= freezen_rowindex) {
          if (top < freezen_top) {
            e.style.display = 'none';
          } else {
            let left = Store.visibledatacolumn[col_index + offsetColumn] - 20;
            e.style.display = 'block';
            e.style.left = left + "px";
          }
        } else if (col_index >= freezen_colindex) {
          if (col_index < freezen_colindex + offsetColumn) {
            e.style.display = 'none';
          } else {
            e.style.display = 'block';
            e.style.top = (top + scroll.scrollTop) + "px";
          }
        } else {
          let left = Store.visibledatacolumn[col_index + offsetColumn] - 20;
          e.style.display = 'block';
          Object.assign(e.style, {
            "left": left + "px",
            "top": (top + scroll.scrollTop) + "px"
          });
        }
      });
    } else if (_this.freezenhorizontaldata != null) {
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let freezen_top = _this.freezenhorizontaldata[0] + getScrollPosition().scrollTop;
      document.querySelectorAll("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").forEach(function (e) {
        let row_index = e.dataset.str;
        let top = row_index - 1 == -1 ? 0 : Store.visibledatarow[row_index - 1];
        if (row_index >= freezen_rowindex) {
          if (top < freezen_top) {
            e.style.display = 'none';
          } else {
            e.style.display = 'block';
          }
        } else {
          e.style.display = 'block';
          e.style.top = (top + getScrollPosition().scrollTop) + "px";
        }
      });
    } else if (_this.freezenverticaldata != null) {
      let freezen_colindex = _this.freezenverticaldata[1];
      let offsetColumn = luckysheet_searcharray(_this.freezenverticaldata[3], getScrollPosition().scrollLeft - _this.freezenverticaldata[2]);
      document.querySelectorAll("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").forEach(function (e) {
        let col_index = e.dataset.cindex;
        if (col_index >= freezen_colindex) {
          if (col_index < freezen_colindex + offsetColumn) {
            e.style.display = 'none';
          } else {
            e.style.display = 'block';
          }
        } else {
          let left = Store.visibledatacolumn[col_index + offsetColumn] - 20;
          e.style.display = 'block';
          e.style.left = left + "px";
        }
      });
    } else {
      let _elFilterOpts = document.getElementById("luckysheet-filter-options-sheet" + Store.currentSheetIndex);
      if (_elFilterOpts) _elFilterOpts.innerHTML = '';
      createFilterOptions(getCurrentFile().filter_select);
    }
  }
};
export default scrollAdaptModule;
