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
const scrollAdaptModule = {
  scrollAdapt: function () {
    let _this = this;

    //有冻结时 选区框 滚动适应
    if (Store.luckysheet_select_save != null && Store.luckysheet_select_save.length > 0) {
      _this.scrollAdaptOfselect();
    }

    //有冻结时 图片 滚动适应
    if ($(".luckysheet-modal-dialog-image").length > 0 && imageCtrl.images != undefined) {
      _this.scrollAdaptOfImage();
    }

    //有冻结时 批注框 滚动适应
    if ($("#luckysheet-postil-showBoxs .luckysheet-postil-show").length > 0) {
      _this.scrollAdaptOfpostil();
    }

    //有冻结时 下拉选区图标 滚动适应
    if ($("#luckysheet-dropCell-icon").length > 0) {
      _this.scrollAdaptOfdpicon();
    }

    //有冻结时 筛选下拉按钮 滚动适应
    if ($("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").length > 0) {
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
    $("#luckysheet-rows-h-selected").empty();
    $("#luckysheet-cols-h-selected").empty();
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
      for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
        let obj = structuredClone(Store.luckysheet_select_save[s]);
        let r1 = obj.row[0],
          r2 = obj.row[1];
        let row = Store.visibledatarow[r2],
          row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
        let top_move = row_pre;
        let height_move = row - row_pre - 1;
        let rangeshow = true;
        if (r1 >= freezen_rowindex) {
          //原选区在冻结区外
          if (top_move + height_move < freezenTop + offTop) {
            rangeshow = false;
          } else if (top_move < freezenTop + offTop) {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "top": freezenTop + offTop,
              "height": height_move - (freezenTop + offTop - top_move)
            });
          } else {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "top": top_move,
              "height": height_move
            });
          }
        } else if (r2 >= freezen_rowindex) {
          //原选区有一部分在冻结区内
          if (top_move + height_move < freezenTop + offTop) {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "top": top_move + offTop,
              "height": freezenTop - top_move
            });
          } else {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "top": top_move + offTop,
              "height": height_move - offTop
            });
          }
        } else {
          //原选区在冻结区内
          $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css("top", top_move + offTop);
        }
        let c1 = obj.column[0],
          c2 = obj.column[1];
        let col = Store.visibledatacolumn[c2],
          col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];
        let left_move = col_pre;
        let width_move = col - col_pre - 1;
        if (c1 >= freezen_colindex) {
          //原选区在冻结区外
          if (left_move + width_move < freezenLeft + offLeft) {
            rangeshow = false;
          } else if (left_move < freezenLeft + offLeft) {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "left": freezenLeft + offLeft,
              "width": width_move - (freezenLeft + offLeft - left_move)
            });
          } else {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "left": left_move,
              "width": width_move
            });
          }
        } else if (c2 >= freezen_colindex) {
          //原选区有一部分在冻结区内
          if (left_move + width_move < freezenLeft + offLeft) {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "left": left_move + offLeft,
              "width": freezenLeft - left_move
            });
          } else {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "left": left_move + offLeft,
              "width": width_move - offLeft
            });
          }
        } else {
          //原选区在冻结区内
          $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css("left", left_move + offLeft);
        }
        if (!rangeshow) {
          $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).hide();
        }
        if (s == Store.luckysheet_select_save.length - 1) {
          let rf = obj.row_focus == null ? r1 : obj.row_focus;
          let cf = obj.column_focus == null ? c1 : obj.column_focus;
          let row_f = Store.visibledatarow[rf],
            row_pre_f = rf - 1 == -1 ? 0 : Store.visibledatarow[rf - 1];
          let col_f = Store.visibledatacolumn[cf],
            col_pre_f = cf - 1 == -1 ? 0 : Store.visibledatacolumn[cf - 1];
          let margeset = menuButton.mergeborer(Store.flowdata, rf, cf);
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
      for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
        let obj = structuredClone(Store.luckysheet_select_save[s]);
        let r1 = obj.row[0],
          r2 = obj.row[1];
        let row = Store.visibledatarow[r2],
          row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
        let top_move = row_pre;
        let height_move = row - row_pre - 1;
        if (r1 >= freezen_rowindex) {
          //原选区在冻结区外
          if (top_move + height_move < freezenTop + offTop) {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).hide();
          } else if (top_move < freezenTop + offTop) {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "top": freezenTop + offTop,
              "height": height_move - (freezenTop + offTop - top_move)
            });
          } else {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "top": top_move,
              "height": height_move
            });
          }
        } else if (r2 >= freezen_rowindex) {
          //原选区有一部分在冻结区内
          if (top_move + height_move < freezenTop + offTop) {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "top": top_move + offTop,
              "height": freezenTop - top_move
            });
          } else {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "top": top_move + offTop,
              "height": height_move - offTop
            });
          }
        } else {
          //原选区在冻结区内
          $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css("top", top_move + offTop);
        }
        if (s == Store.luckysheet_select_save.length - 1) {
          let rf = obj.row_focus == null ? r1 : obj.row_focus;
          let cf = obj.column_focus == null ? obj.column[0] : obj.column_focus;
          let row_f = Store.visibledatarow[rf],
            row_pre_f = rf - 1 == -1 ? 0 : Store.visibledatarow[rf - 1];
          let margeset = menuButton.mergeborer(Store.flowdata, rf, cf);
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
      for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
        let obj = structuredClone(Store.luckysheet_select_save[s]);
        let c1 = obj.column[0],
          c2 = obj.column[1];
        let col = Store.visibledatacolumn[c2],
          col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];
        let left_move = col_pre;
        let width_move = col - col_pre - 1;
        if (c1 >= freezen_colindex) {
          //原选区在冻结区外
          if (left_move + width_move < freezenLeft + offLeft) {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).hide();
          } else if (left_move < freezenLeft + offLeft) {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "left": freezenLeft + offLeft,
              "width": width_move - (freezenLeft + offLeft - left_move)
            });
          } else {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "left": left_move,
              "width": width_move
            });
          }
        } else if (c2 >= freezen_colindex) {
          //原选区有一部分在冻结区内
          if (left_move + width_move < freezenLeft + offLeft) {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "left": left_move + offLeft,
              "width": freezenLeft - left_move
            });
          } else {
            $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css({
              "left": left_move + offLeft,
              "width": width_move - offLeft
            });
          }
        } else {
          //原选区在冻结区内
          $("#luckysheet-cell-selected-boxs").find(".luckysheet-cell-selected").eq(s).show().css("left", left_move + offLeft);
        }
        if (s == Store.luckysheet_select_save.length - 1) {
          let rf = obj.row_focus == null ? obj.row[0] : obj.row_focus;
          let cf = obj.column_focus == null ? c1 : obj.column_focus;
          let col_f = Store.visibledatacolumn[cf],
            col_pre_f = cf - 1 == -1 ? 0 : Store.visibledatacolumn[cf - 1];
          let margeset = menuButton.mergeborer(Store.flowdata, rf, cf);
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
    $.each(images, function (i) {
      let image = images[i];
      let dialogImage = $("#" + i);
      let x = dialogImage.position();
      let width = dialogImage.width();
      let height = dialogImage.height();
      let defaultTop = image.default.top * zoomRatio;
      let defaultLeft = image.default.left * zoomRatio;
      let isHidden = false;

      //行冻结
      if (defaultTop >= freezenTop) {
        //原图片在冻结区外
        if (x.top < freezenTop) {
          //在界面上的位置已经进入冻结区里面了
          dialogImage.css("visibility", "hidden");
          isHidden = true;
        } else {
          dialogImage.css({
            "visibility": "visible"
          });
        }
      } else {
        //原图片在冻结区内
        dialogImage.css({
          "top": defaultTop + scrollTop,
          "height": height,
          "visibility": "visible"
        });
      }

      //列冻结
      if (!isHidden) {
        if (defaultLeft >= freezenLeft) {
          //原图片在冻结区外
          if (x.left < freezenLeft) {
            //在界面上的位置已经进入冻结区里面了
            dialogImage.css("visibility", "hidden");
          } else {
            dialogImage.css({
              "visibility": "visible"
            });
          }
        } else {
          //原图片在冻结区内
          dialogImage.css({
            "left": defaultLeft + scrollLeft,
            "width": width,
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
      $("#luckysheet-postil-showBoxs .luckysheet-postil-show").each(function (i, e) {
        let id = $(e).attr("id");
        let r = id.split("luckysheet-postil-show_")[1].split("_")[0];
        let c = id.split("luckysheet-postil-show_")[1].split("_")[1];
        let postil = Store.flowdata[r][c].ps;
        let row = Store.visibledatarow[r],
          row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c],
          col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];
        let margeset = menuButton.mergeborer(Store.flowdata, r, c);
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
        if (r >= _this.freezenhorizontaldata[1]) {
          if (postil_top + postil_height < freezenTop) {
            $(e).show().find(".luckysheet-postil-show-main").css("top", postil_top + offTop);
            $(e).show().find(".arrowCanvas").css("top", size[1] + offTop);
          } else {
            if (postil_top < freezenTop + offTop) {
              if (postil_top + postil_height <= freezenTop + offTop) {
                show = false;
              } else {
                $(e).show().find(".luckysheet-postil-show-main").css({
                  "top": freezenTop + offTop,
                  "height": postil_height - (freezenTop + offTop - postil_top)
                });
                $(e).show().find(".formulaInputFocus").css("margin-top", -(freezenTop + offTop - postil_top));
                $(e).show().find(".arrowCanvas").hide();
                show2 = false;
              }
            } else {
              $(e).show().find(".luckysheet-postil-show-main").css({
                "top": postil_top,
                "height": postil_height
              });
              $(e).show().find(".formulaInputFocus").css("margin-top", 0);
              $(e).show().find(".arrowCanvas").css("top", size[1]);
              // luckysheetPostil.buildPs(r, c, postil);
            }
          }
        } else {
          $(e).show().find(".luckysheet-postil-show-main").css("top", postil_top + offTop);
          $(e).show().find(".arrowCanvas").css("top", size[1] + offTop);
        }
        if (c >= _this.freezenverticaldata[1]) {
          if (postil_left + postil_width < freezenLeft) {
            $(e).show().find(".luckysheet-postil-show-main").css("left", postil_left + offLeft);
            $(e).show().find(".arrowCanvas").css("left", size[0] + offLeft);
          } else {
            if (postil_left < freezenLeft + offLeft) {
              if (postil_left + postil_width <= freezenLeft + offLeft) {
                show = false;
              } else {
                $(e).show().find(".luckysheet-postil-show-main").css({
                  "left": freezenLeft + offLeft,
                  "width": postil_width - (freezenLeft + offLeft - postil_left)
                });
                $(e).show().find(".formulaInputFocus").css("margin-left", -(freezenLeft + offLeft - postil_left));
                $(e).show().find(".arrowCanvas").hide();
                show2 = false;
              }
            } else {
              $(e).show().find(".luckysheet-postil-show-main").css({
                "left": postil_left,
                "width": postil_width
              });
              $(e).show().find(".formulaInputFocus").css("margin-left", 0);
              $(e).show().find(".arrowCanvas").css("left", size[0]);
              // luckysheetPostil.buildPs(r, c, postil);
            }
          }
        } else {
          $(e).show().find(".luckysheet-postil-show-main").css("left", postil_left + offLeft);
          $(e).show().find(".arrowCanvas").css("left", size[0] + offLeft);
        }
        if (!show) {
          $(e).hide();
        }
        if (show && show2) {
          $(e).show().find(".arrowCanvas").show();
        }
      });
    } else if (_this.freezenhorizontaldata != null) {
      let freezenTop = _this.freezenhorizontaldata[0];
      let offTop = scrollTop - _this.freezenhorizontaldata[2];
      $("#luckysheet-postil-showBoxs .luckysheet-postil-show").each(function (i, e) {
        let id = $(e).attr("id");
        let r = id.split("luckysheet-postil-show_")[1].split("_")[0];
        let c = id.split("luckysheet-postil-show_")[1].split("_")[1];
        let postil = Store.flowdata[r][c].ps;
        let row = Store.visibledatarow[r],
          row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c],
          col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];
        let margeset = menuButton.mergeborer(Store.flowdata, r, c);
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
        if (r >= _this.freezenhorizontaldata[1]) {
          if (postil_top + postil_height < freezenTop) {
            $(e).show().find(".luckysheet-postil-show-main").css("top", postil_top + offTop);
            $(e).show().find(".arrowCanvas").css("top", size[1] + offTop);
          } else {
            if (postil_top < freezenTop + offTop) {
              if (postil_top + postil_height <= freezenTop + offTop) {
                $(e).hide();
              } else {
                $(e).show().find(".luckysheet-postil-show-main").css({
                  "top": freezenTop + offTop,
                  "height": postil_height - (freezenTop + offTop - postil_top)
                });
                $(e).show().find(".formulaInputFocus").css("margin-top", -(freezenTop + offTop - postil_top));
                $(e).show().find(".arrowCanvas").hide();
              }
            } else {
              luckysheetPostil.buildPs(r, c, postil);
            }
          }
        } else {
          $(e).show().find(".luckysheet-postil-show-main").css("top", postil_top + offTop);
          $(e).show().find(".arrowCanvas").css("top", size[1] + offTop);
        }
      });
    } else if (_this.freezenverticaldata != null) {
      let freezenLeft = _this.freezenverticaldata[0];
      let offLeft = scrollLeft - _this.freezenverticaldata[2];
      $("#luckysheet-postil-showBoxs .luckysheet-postil-show").each(function (i, e) {
        let id = $(e).attr("id");
        let r = id.split("luckysheet-postil-show_")[1].split("_")[0];
        let c = id.split("luckysheet-postil-show_")[1].split("_")[1];
        let postil = Store.flowdata[r][c].ps;
        let row = Store.visibledatarow[r],
          row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c],
          col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];
        let margeset = menuButton.mergeborer(Store.flowdata, r, c);
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
        if (c >= _this.freezenverticaldata[1]) {
          if (postil_left + postil_width < freezenLeft) {
            $(e).show().find(".luckysheet-postil-show-main").css("left", postil_left + offLeft);
            $(e).show().find(".arrowCanvas").css("left", size[0] + offLeft);
          } else {
            if (postil_left < freezenLeft + offLeft) {
              if (postil_left + postil_width <= freezenLeft + offLeft) {
                $(e).hide();
              } else {
                $(e).show().find(".luckysheet-postil-show-main").css({
                  "left": freezenLeft + offLeft,
                  "width": postil_width - (freezenLeft + offLeft - postil_left)
                });
                $(e).show().find(".formulaInputFocus").css("margin-left", -(freezenLeft + offLeft - postil_left));
                $(e).show().find(".arrowCanvas").hide();
              }
            } else {
              luckysheetPostil.buildPs(r, c, postil);
            }
          }
        } else {
          $(e).show().find(".luckysheet-postil-show-main").css("left", postil_left + offLeft);
          $(e).show().find(".arrowCanvas").css("left", size[0] + offLeft);
        }
      });
    } else {
      $("#luckysheet-postil-showBoxs .luckysheet-postil-show").each(function (i, e) {
        let id = $(e).attr("id");
        let r = id.split("luckysheet-postil-show_")[1].split("_")[0];
        let c = id.split("luckysheet-postil-show_")[1].split("_")[1];
        let postil = Store.flowdata[r][c].ps;
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
    if (_this.freezenhorizontaldata != null && _this.freezenverticaldata != null) {
      let scroll = getScrollPosition();
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let offsetRow = luckysheet_searcharray(_this.freezenhorizontaldata[3], scroll.scrollTop - _this.freezenhorizontaldata[2]);
      let freezen_colindex = _this.freezenverticaldata[1];
      let offsetColumn = luckysheet_searcharray(_this.freezenverticaldata[3], scroll.scrollLeft - _this.freezenverticaldata[2]);
      if (row_index >= freezen_rowindex && col_index >= freezen_colindex) {
        if (row_index < freezen_rowindex + offsetRow - 1 || col_index < freezen_colindex + offsetColumn - 1) {
          $("#luckysheet-dropCell-icon").hide();
        } else {
          $("#luckysheet-dropCell-icon").show();
        }
      } else if (row_index >= freezen_rowindex) {
        if (row_index < freezen_rowindex + offsetRow - 1) {
          $("#luckysheet-dropCell-icon").hide();
        } else {
          let col = colLocationByIndex(col_index + offsetColumn)[1];
          $("#luckysheet-dropCell-icon").show().css("left", col);
        }
      } else if (col_index >= freezen_colindex) {
        if (col_index < freezen_colindex + offsetColumn - 1) {
          $("#luckysheet-dropCell-icon").hide();
        } else {
          let row = rowLocationByIndex(row_index + offsetRow)[1];
          $("#luckysheet-dropCell-icon").show().css("top", row);
        }
      } else {
        let row = rowLocationByIndex(row_index + offsetRow)[1],
          col = colLocationByIndex(col_index + offsetColumn)[1];
        $("#luckysheet-dropCell-icon").show().css({
          "left": col,
          "top": row
        });
      }
    } else if (_this.freezenhorizontaldata != null) {
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let offsetRow = luckysheet_searcharray(_this.freezenhorizontaldata[3], getScrollPosition().scrollTop - _this.freezenhorizontaldata[2]);
      if (row_index >= freezen_rowindex) {
        if (row_index < freezen_rowindex + offsetRow - 1) {
          $("#luckysheet-dropCell-icon").hide();
        } else {
          $("#luckysheet-dropCell-icon").show();
        }
      } else {
        let row = rowLocationByIndex(row_index + offsetRow)[1];
        $("#luckysheet-dropCell-icon").show().css("top", row);
      }
    } else if (_this.freezenverticaldata != null) {
      let freezen_colindex = _this.freezenverticaldata[1];
      let offsetColumn = luckysheet_searcharray(_this.freezenverticaldata[3], getScrollPosition().scrollLeft - _this.freezenverticaldata[2]);
      if (col_index >= freezen_colindex) {
        if (col_index < freezen_colindex + offsetColumn - 1) {
          $("#luckysheet-dropCell-icon").hide();
        } else {
          $("#luckysheet-dropCell-icon").show();
        }
      } else {
        let col = colLocationByIndex(col_index + offsetColumn)[1];
        $("#luckysheet-dropCell-icon").show().css("left", col);
      }
    } else {
      let row = rowLocationByIndex(row_index)[1],
        col = colLocationByIndex(col_index)[1];
      $("#luckysheet-dropCell-icon").show().css({
        "left": col,
        "top": row
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
      $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").each(function (i, e) {
        let row_index = $(e).data("str");
        let top = row_index - 1 == -1 ? 0 : Store.visibledatarow[row_index - 1];
        let col_index = $(e).data("cindex");
        if (row_index >= freezen_rowindex && col_index >= freezen_colindex) {
          if (top < freezen_top || col_index < freezen_colindex + offsetColumn) {
            $(e).hide();
          } else {
            $(e).show();
          }
        } else if (row_index >= freezen_rowindex) {
          if (top < freezen_top) {
            $(e).hide();
          } else {
            let left = Store.visibledatacolumn[col_index + offsetColumn] - 20;
            $(e).show().css("left", left);
          }
        } else if (col_index >= freezen_colindex) {
          if (col_index < freezen_colindex + offsetColumn) {
            $(e).hide();
          } else {
            $(e).show().css("top", top + scroll.scrollTop);
          }
        } else {
          let left = Store.visibledatacolumn[col_index + offsetColumn] - 20;
          $(e).show().css({
            "left": left,
            "top": top + scroll.scrollTop
          });
        }
      });
    } else if (_this.freezenhorizontaldata != null) {
      let freezen_rowindex = _this.freezenhorizontaldata[1];
      let freezen_top = _this.freezenhorizontaldata[0] + getScrollPosition().scrollTop;
      $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").each(function (i, e) {
        let row_index = $(e).data("str");
        let top = row_index - 1 == -1 ? 0 : Store.visibledatarow[row_index - 1];
        if (row_index >= freezen_rowindex) {
          if (top < freezen_top) {
            $(e).hide();
          } else {
            $(e).show();
          }
        } else {
          $(e).show().css("top", top + getScrollPosition().scrollTop);
        }
      });
    } else if (_this.freezenverticaldata != null) {
      let freezen_colindex = _this.freezenverticaldata[1];
      let offsetColumn = luckysheet_searcharray(_this.freezenverticaldata[3], getScrollPosition().scrollLeft - _this.freezenverticaldata[2]);
      $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").each(function (i, e) {
        let col_index = $(e).data("cindex");
        if (col_index >= freezen_colindex) {
          if (col_index < freezen_colindex + offsetColumn) {
            $(e).hide();
          } else {
            $(e).show();
          }
        } else {
          let left = Store.visibledatacolumn[col_index + offsetColumn] - 20;
          $(e).show().css("left", left);
        }
      });
    } else {
      $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex).empty();
      createFilterOptions(getCurrentFile().filter_select);
    }
  }
};
export default scrollAdaptModule;