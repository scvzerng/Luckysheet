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
    document.querySelectorAll("#luckysheet-sheet-area div.luckysheet-sheets-item").forEach(function (el, a) {
      let index = el.dataset.index;
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
    document.querySelectorAll("#luckysheet-sheet-area div.luckysheet-sheets-item").forEach(function (el, a) {
      let index = el.dataset.index;
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
    let $cursheet = sheetContainer.getActiveSheetItem();
    let scrollLeftpx = 0;
    let c_width = 0;
    document.querySelectorAll("#luckysheet-sheet-area div.luckysheet-sheets-item").forEach(function (el) {
      if (el.offsetWidth > 0) {
        if (el.classList.contains("luckysheet-sheets-item-active")) {
          scrollLeftpx = c_width;
        }
        c_width += el.offsetWidth;
      }
    });
    setTimeout(function () {
      sheetContainer.setScrollLeft(scrollLeftpx - 10);
      if (luckysheetConfigsetting.showsheetbarConfig.sheet) {
        let containerWidth = sheetContainer.getWidth();
        let scrollWidth = sheetContainer.getScrollWidth();
        if (scrollWidth > containerWidth) {
          document.querySelectorAll("#luckysheet-sheet-area .luckysheet-sheets-scroll").forEach(el => el.style.display = 'inline-block');
          document.querySelectorAll("#luckysheet-sheet-container .docs-sheet-fade-left").forEach(el => el.style.display = '');
        } else {
          document.querySelectorAll("#luckysheet-sheet-area .luckysheet-sheets-scroll").forEach(el => el.style.display = 'none');
          document.querySelectorAll("#luckysheet-sheet-container .docs-sheet-fade-left").forEach(el => el.style.display = 'none');
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
        document.querySelectorAll("#luckysheet-sheet-area .luckysheet-sheets-scroll").forEach(el => el.style.display = 'inline-block');
        document.querySelectorAll("#luckysheet-sheet-container .docs-sheet-fade-left").forEach(el => el.style.display = '');
      }
    } else {
      document.querySelectorAll("#luckysheet-sheet-area .luckysheet-sheets-scroll").forEach(el => el.style.display = 'none');
      document.querySelectorAll("#luckysheet-sheet-container .docs-sheet-fade-left").forEach(el => el.style.display = 'none');
    }
  },
  // *显示sheet栏左右的灰色
  sheetBarShowAndHide(index) {
    if (index != null) {
      const _elSheet = document.getElementById("luckysheet-sheets-item" + index);
      if (_elSheet) {
        let scrollLeftpx = 0;
        let c_width = 0;
        document.querySelectorAll("#luckysheet-sheet-area div.luckysheet-sheets-item").forEach(function (el) {
          if (el.offsetWidth > 0) {
            if (el.id === "luckysheet-sheets-item" + index) {
              scrollLeftpx = c_width;
            }
            c_width += el.offsetWidth;
          }
        });
        sheetContainer.setScrollLeft(scrollLeftpx - 10);
      }
    }
    let c_width = sheetContainer.getWidth(),
      c_srollwidth = sheetContainer.getScrollWidth(),
      scrollLeft = sheetContainer.getScrollLeft();
    if (scrollLeft <= 0) {
      document.querySelectorAll("#luckysheet-sheet-container .docs-sheet-fade-left").forEach(el => el.style.display = 'none');
    } else {
      document.querySelectorAll("#luckysheet-sheet-container .docs-sheet-fade-left").forEach(el => el.style.display = '');
    }
    if (c_width + scrollLeft >= c_srollwidth) {
      document.querySelectorAll("#luckysheet-sheet-container .docs-sheet-fade-right").forEach(el => el.style.display = 'none');
    } else {
      document.querySelectorAll("#luckysheet-sheet-container .docs-sheet-fade-right").forEach(el => el.style.display = '');
    }
  }
};
export default sheetLayoutModule;