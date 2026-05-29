import luckysheetConfigsetting from "../luckysheetConfigsetting";
import Store from "../../store";
import sheetContainer from "../../ui/sheetContainer.js";
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
    let winW = $("#" + Store.container).width();
    let $cursheet = sheetContainer.getActiveSheetItem();
    let scrollLeftpx = 0;
    let c_width = 0;
    sheetContainer.find("div.luckysheet-sheets-item:visible").each(function () {
      if ($(this).hasClass("luckysheet-sheets-item-active")) {
        scrollLeftpx = c_width;
      }
      c_width += $(this).outerWidth();
    });
    setTimeout(function () {
      sheetContainer.setScrollLeft(scrollLeftpx - 10);
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
    if (!sheetContainer.exists()) return;
    var sw = sheetContainer.getScrollWidth();
    var w = Math.ceil(sheetContainer.getWidth());
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
    if (index != null) {
      let $sheet = $("#luckysheet-sheets-item" + index);
      sheetContainer.setScrollLeft($sheet.offset().left);
    }
    let c_width = sheetContainer.getWidth(),
      c_srollwidth = sheetContainer.getScrollWidth(),
      scrollLeft = sheetContainer.getScrollLeft();
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