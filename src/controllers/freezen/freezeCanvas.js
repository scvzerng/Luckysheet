import Store from "../../store";
import gridWindow from "../../ui/gridWindow.js";
import canvasContext from "../../ui/canvasContext.js";
const freezeCanvasModule = {
  createAssistCanvas: function () {
    let _this = this;
    _this.removeAssistCanvas();
    if (_this.freezenverticaldata != null || _this.freezenhorizontaldata != null) {
      let freezen_horizon_px, freezen_horizon_ed, freezen_horizon_scrollTop;
      let freezen_vertical_px, freezen_vertical_ed, freezen_vertical_scrollTop;
      let drawWidth = Store.luckysheetTableContentHW[0],
        drawHeight = Store.luckysheetTableContentHW[1];

      //双向freezen
      if (_this.freezenverticaldata != null && _this.freezenhorizontaldata != null) {
        freezen_horizon_px = _this.freezenhorizontaldata[0];
        freezen_horizon_ed = _this.freezenhorizontaldata[1];
        freezen_horizon_scrollTop = _this.freezenhorizontaldata[2];
        freezen_vertical_px = _this.freezenverticaldata[0];
        freezen_vertical_ed = _this.freezenverticaldata[1];
        freezen_vertical_scrollTop = _this.freezenverticaldata[2];

        //3
        _this.createCanvas("freezen_3", freezen_vertical_px - freezen_vertical_scrollTop, freezen_horizon_px - freezen_horizon_scrollTop + 1, Store.rowHeaderWidth - 1, Store.columnHeaderHeight - 1);
        //4
        _this.createCanvas("freezen_4", drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, freezen_horizon_px - freezen_horizon_scrollTop + 1, freezen_vertical_px - freezen_vertical_scrollTop + Store.rowHeaderWidth - 1, Store.columnHeaderHeight - 1);
        //7
        _this.createCanvas("freezen_7", freezen_vertical_px - freezen_vertical_scrollTop, drawHeight - freezen_horizon_px + freezen_horizon_scrollTop - Store.columnHeaderHeight, Store.rowHeaderWidth - 1, freezen_horizon_px - freezen_horizon_scrollTop + Store.columnHeaderHeight - 1);
      }
      //水平freezen
      else if (_this.freezenhorizontaldata != null) {
        freezen_horizon_px = _this.freezenhorizontaldata[0];
        freezen_horizon_ed = _this.freezenhorizontaldata[1];
        freezen_horizon_scrollTop = _this.freezenhorizontaldata[2];
        _this.createCanvas("freezen_h", drawWidth, freezen_horizon_px - freezen_horizon_scrollTop + 1, Store.rowHeaderWidth - 1, Store.columnHeaderHeight - 1);
      }
      //垂直freezen
      else if (_this.freezenverticaldata != null) {
        freezen_vertical_px = _this.freezenverticaldata[0];
        freezen_vertical_ed = _this.freezenverticaldata[1];
        freezen_vertical_scrollTop = _this.freezenverticaldata[2];
        _this.createCanvas("freezen_v", freezen_vertical_px - freezen_vertical_scrollTop, drawHeight, Store.rowHeaderWidth - 1, Store.columnHeaderHeight - 1);
      }
      _this.scrollAdapt();
    }
  },
  createCanvas: function (id, width, height, left, top) {
    let c = document.createElement("canvas");
    c.id = id;
    c.width = Math.ceil(width * Store.devicePixelRatio);
    c.height = Math.ceil(height * Store.devicePixelRatio);
    Object.assign(c.style, {
      "user-select": "none",
      "postion": "absolute",
      "left": left + "px",
      "top": top + "px",
      "width": width + "px",
      "height": height + "px",
      "z-index": "10",
      "pointer-events": "none"
    });
    gridWindow.el.appendChild(c);
  },
  removeAssistCanvas: function () {
    gridWindow.removeCanvasExcept(canvasContext.el);
    const _elCellSelected = document.getElementById("luckysheet-cell-selected"); if (_elCellSelected) _elCellSelected.style.zIndex = 15;
  }
};
export default freezeCanvasModule;
