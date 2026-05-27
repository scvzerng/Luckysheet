import { frozenFirstColumn, frozenFirstRow } from '../../../global/api';
import { luckysheetrefreshgrid } from '../../../global/refresh';
import tooltip from '../../../global/tooltip';
import { isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import luckysheetFreezen from '../../freezen';
import luckysheetsizeauto from '../../resize';
import { luckysheet_searcharray } from '../../sheetSearch';

export function initFreezen(_this) {
      //冻结行列
      $("#luckysheet-icon-freezen-menu").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        if ($menuButton.length == 0) {
          const _locale = locale();
          const locale_freezen = _locale.freezen;
          let itemdata = [{
            text: locale_freezen.freezenRow,
            value: "freezenRow",
            example: ""
          }, {
            text: locale_freezen.freezenColumn,
            value: "freezenColumn",
            example: ""
          }, {
            text: locale_freezen.freezenRC,
            value: "freezenRC",
            example: ""
          }, {
            text: "",
            value: "split",
            example: ""
          }, {
            text: locale_freezen.freezenRowRange,
            value: "freezenRowRange",
            example: ""
          }, {
            text: locale_freezen.freezenColumnRange,
            value: "freezenColumnRange",
            example: ""
          }, {
            text: locale_freezen.freezenRCRange,
            value: "freezenRCRange",
            example: ""
          }, {
            text: "",
            value: "split",
            example: ""
          }, {
            text: locale_freezen.freezenCancel,
            value: "freezenCancel",
            example: ""
          }];
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "freezen-menu",
            item: itemset,
            subclass: "",
            sub: ""
          });
          $("body").append(menu);
          $menuButton = $("#" + menuButtonId).width(170);
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            _this.focus($menuButton, itemvalue);
            if (itemvalue === "freezenCancel") {
              $menuButton.find(".fa.fa-check").remove();
            }
  
            // store frozen
            luckysheetFreezen.saveFrozen(itemvalue);
            if (itemvalue == "freezenRow") {
              //首行冻结
              frozenFirstRow();
              // let scrollTop = $("#luckysheet-cell-main").scrollTop();
              // let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
              // if(row_st == -1){
              //     row_st = 0;
              // }
              // let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
              // let freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
              // luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
  
              // if (luckysheetFreezen.freezenverticaldata != null) {
              //     luckysheetFreezen.cancelFreezenVertical();
              //     luckysheetFreezen.createAssistCanvas();
              //     luckysheetrefreshgrid();
              // }
  
              // luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
              // luckysheetFreezen.createAssistCanvas();
              // luckysheetrefreshgrid();
            } else if (itemvalue == "freezenColumn") {
              //首列冻结
              frozenFirstColumn();
              // let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
              // let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
              // if(col_st == -1){
              //     col_st = 0;
              // }
              // let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
              // let freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
              // luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
  
              // if (luckysheetFreezen.freezenhorizontaldata != null) {
              //     luckysheetFreezen.cancelFreezenHorizontal();
              //     luckysheetFreezen.createAssistCanvas();
              //     luckysheetrefreshgrid();
              // }
  
              // luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
              // luckysheetFreezen.createAssistCanvas();
              // luckysheetrefreshgrid();
            } else if (itemvalue == "freezenRC") {
              //首行列冻�?
              if (luckysheetFreezen.freezenRealFirstRowColumn) {
                let row_st = 0;
                let top = Store.visibledatarow[row_st] - 2 + Store.columnHeaderHeight;
                let freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
                luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
                luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
                let col_st = 0;
                let left = Store.visibledatacolumn[col_st] - 2 + Store.rowHeaderWidth;
                let freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
                luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
                luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
              } else {
                let scrollTop = $("#luckysheet-cell-main").scrollTop();
                let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
                if (row_st == -1) {
                  row_st = 0;
                }
                let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
                let freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
                luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
                luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
                let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
                let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
                if (col_st == -1) {
                  col_st = 0;
                }
                let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
                let freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
                luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
                luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
              }
              luckysheetFreezen.createAssistCanvas();
              luckysheetrefreshgrid();
            } else if (itemvalue == "freezenRowRange") {
              //选区行冻�?
  
              if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
                if (isEditMode()) {
                  alert(locale_freezen.noSeletionError);
                } else {
                  tooltip.info(locale_freezen.noSeletionError, "");
                }
                return;
              }
              // 固定超出屏幕范围
              let rangeTop = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1].top;
              if (luckysheetFreezen.freezenRealFirstRowColumn && rangeTop > $("#luckysheet-cell-main").height()) {
                return tooltip.info(locale_freezen.rangeRCOverErrorTitle, locale_freezen.rangeRCOverError);
              }
              let scrollTop = $("#luckysheet-cell-main").scrollTop();
              let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
              let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
              let row_focus = last["row_focus"] == null ? last["row"][0] : last["row_focus"];
              row_st = Math.max(row_st - 1, row_focus - 1, 0);
              let top, freezenhorizontaldata;
              if (luckysheetFreezen.freezenRealFirstRowColumn) {
                top = Store.visibledatarow[row_st] - 2 + Store.columnHeaderHeight;
                freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
              } else {
                top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
                freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
              }
              luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
              if (luckysheetFreezen.freezenverticaldata != null) {
                luckysheetFreezen.cancelFreezenVertical();
                luckysheetFreezen.createAssistCanvas();
                luckysheetrefreshgrid();
              }
              luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
              luckysheetFreezen.createAssistCanvas();
              luckysheetrefreshgrid();
            } else if (itemvalue == "freezenColumnRange") {
              //选区列冻�?
              if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
                if (isEditMode()) {
                  alert(locale_freezen.noSeletionError);
                } else {
                  tooltip.info(locale_freezen.noSeletionError, "");
                }
                return;
              }
              // 固定超出屏幕范围
              let rangeLeft = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1].left;
              if (luckysheetFreezen.freezenRealFirstRowColumn && rangeLeft > $("#luckysheet-cell-main").width()) {
                return tooltip.info(locale_freezen.rangeRCOverErrorTitle, locale_freezen.rangeRCOverError);
              }
              let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
              let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
              let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
              let column_focus = last["column_focus"] == null ? last["column"][0] : last["column_focus"];
              col_st = Math.max(col_st - 1, column_focus - 1, 0);
              let left, freezenverticaldata;
              if (luckysheetFreezen.freezenRealFirstRowColumn) {
                left = Store.visibledatacolumn[col_st] - 2 + Store.rowHeaderWidth;
                freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
              } else {
                left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
                freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
              }
              luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
              if (luckysheetFreezen.freezenhorizontaldata != null) {
                luckysheetFreezen.cancelFreezenHorizontal();
                luckysheetFreezen.createAssistCanvas();
                luckysheetrefreshgrid();
              }
              luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
              luckysheetFreezen.createAssistCanvas();
              luckysheetrefreshgrid();
            } else if (itemvalue == "freezenRCRange") {
              //选区行列冻结
              if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
                if (isEditMode()) {
                  alert(locale_freezen.noSeletionError);
                } else {
                  tooltip.info(locale_freezen.noSeletionError, "");
                }
                return;
              }
  
              // 固定超出屏幕范围
              let rangeTop = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1].top;
              let rangeLeft = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1].left;
              if (luckysheetFreezen.freezenRealFirstRowColumn && (rangeTop > $("#luckysheet-cell-main").height() || rangeLeft > $("#luckysheet-cell-main").width())) {
                return tooltip.info(locale_freezen.rangeRCOverErrorTitle, locale_freezen.rangeRCOverError);
              }
              let scrollTop = $("#luckysheet-cell-main").scrollTop();
              let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
              let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
              let row_focus = last["row_focus"] == null ? last["row"][0] : last["row_focus"];
              row_st = Math.max(row_st - 1, row_focus - 1, 0);
              let top, freezenhorizontaldata;
              if (luckysheetFreezen.freezenRealFirstRowColumn) {
                top = Store.visibledatarow[row_st] - 2 + Store.columnHeaderHeight;
                freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
                luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
              } else {
                top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
                freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
                luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
              }
              luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
              let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
              let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
              let column_focus = last["column_focus"] == null ? last["column"][0] : last["column_focus"];
              col_st = Math.max(col_st - 1, column_focus - 1, 0);
              let left, freezenverticaldata;
              if (luckysheetFreezen.freezenRealFirstRowColumn) {
                left = Store.visibledatacolumn[col_st] - 2 + Store.rowHeaderWidth;
                freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
              } else {
                left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
                freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
              }
              luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
              luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
              luckysheetFreezen.createAssistCanvas();
              luckysheetrefreshgrid();
            } else if (itemvalue == "freezenCancel") {
              //Cancel freezen
              if (luckysheetFreezen.freezenverticaldata != null) {
                luckysheetFreezen.cancelFreezenVertical();
                luckysheetFreezen.createAssistCanvas();
                luckysheetrefreshgrid();
              }
              if (luckysheetFreezen.freezenhorizontaldata != null) {
                luckysheetFreezen.cancelFreezenHorizontal();
                luckysheetFreezen.createAssistCanvas();
                luckysheetrefreshgrid();
              }
              luckysheetFreezen.scrollAdapt();
            }
            setTimeout(function () {
              luckysheetsizeauto();
            }, 0);
          });
        }
        let userlen = $(this).outerWidth();
        let tlen = $menuButton.outerWidth();
        let menuleft = $(this).offset().left;
        if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition($menuButton, menuleft - 68, $(this).offset().top + 25, "lefttop");
      });
}
