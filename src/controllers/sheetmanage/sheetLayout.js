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
const sheetLayoutModule = {
  ordersheet: function (property) {
    return function (a, b) {
      let value1 = a[property];
      let value2 = b[property];
      return value1 - value2;
    };
  },
  getCurrentOrder: function () {
    let orders = {};
    $("#luckysheet-sheet-area div.luckysheet-sheets-item").each(function (a) {
      let index = $(this).data("index");
      for (let i = 0; i < Store.luckysheetfile.length; i++) {
        if (Store.luckysheetfile[i].index == index) {
          orders[index.toString()] = a;
          break;
        }
      }
    });
    return orders;
  },
  reOrderAllSheet: function () {
    let orders = {};
    $("#luckysheet-sheet-area div.luckysheet-sheets-item").each(function (a) {
      let index = $(this).data("index");
      for (let i = 0; i < Store.luckysheetfile.length; i++) {
        if (Store.luckysheetfile[i].index == index) {
          Store.luckysheetfile[i].order = a;
          orders[index.toString()] = a;
          break;
        }
      }
    });
    Store.luckysheetfile.sort((x, y) => {
      let order_x = x.order;
      let order_y = y.order;
      if (order_x != null && order_y != null) {
        return order_x - order_y;
      } else if (order_x != null) {
        return -1;
      } else if (order_y != null) {
        return 1;
      } else {
        return 1;
      }
    });
  },
  // *控制sheet栏的左右滚动按钮是否显示
  locationSheet: function () {
    let $c = $("#luckysheet-sheet-container-c"),
      winW = $("#" + Store.container).width();
    let $cursheet = $("#luckysheet-sheet-container-c > div.luckysheet-sheets-item-active").eq(0);
    let scrollLeftpx = 0;
    let c_width = 0;
    $("#luckysheet-sheet-container-c > div.luckysheet-sheets-item:visible").each(function () {
      if ($(this).hasClass("luckysheet-sheets-item-active")) {
        scrollLeftpx = c_width;
      }
      c_width += $(this).outerWidth();
    });
    setTimeout(function () {
      $c.scrollLeft(scrollLeftpx - 10);
      if (luckysheetConfigsetting.showsheetbarConfig.sheet) {
        if (c_width >= winW * 0.7) {
          $("#luckysheet-sheet-area .luckysheet-sheets-scroll").css("display", "inline-block");
          $("#luckysheet-sheet-container .docs-sheet-fade-left").show();
        } else {
          $("#luckysheet-sheet-area .luckysheet-sheets-scroll").css("display", "none");
          $("#luckysheet-sheet-container .docs-sheet-fade-left").hide();
        }
      }
    }, 1);
  },
  sheetArrowShowAndHide() {
    const $wrap = $("#luckysheet-sheet-container-c");
    if (!$wrap.length) return;
    var sw = $wrap[0].scrollWidth;
    var w = Math.ceil($wrap.width());
    if (sw > w) {
      if (luckysheetConfigsetting.showsheetbarConfig.sheet) {
        $("#luckysheet-sheet-area .luckysheet-sheets-scroll").css("display", "inline-block");
        $("#luckysheet-sheet-container .docs-sheet-fade-left").show();
      }
    } else {
      $("#luckysheet-sheet-area .luckysheet-sheets-scroll").css("display", "none");
      $("#luckysheet-sheet-container .docs-sheet-fade-left").hide();
    }
  },
  // *显示sheet栏左右的灰色
  sheetBarShowAndHide(index) {
    let $c = $("#luckysheet-sheet-container-c");
    if (index != null) {
      let $sheet = $("#luckysheet-sheets-item" + index);
      $c.scrollLeft($sheet.offset().left);
    }
    let c_width = $c.width(),
      c_srollwidth = $c[0].scrollWidth,
      scrollLeft = $c.scrollLeft();
    if (scrollLeft <= 0) {
      $("#luckysheet-sheet-container .docs-sheet-fade-left").hide();
    } else {
      $("#luckysheet-sheet-container .docs-sheet-fade-left").show();
    }
    if (c_width + scrollLeft >= c_srollwidth) {
      $("#luckysheet-sheet-container .docs-sheet-fade-right").hide();
    } else {
      $("#luckysheet-sheet-container .docs-sheet-fade-right").show();
    }
  }
};
export default sheetLayoutModule;