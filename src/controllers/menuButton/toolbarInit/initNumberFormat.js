import editor from '../../../global/editor';
import { genarate } from '../../../global/format';
import Store from '../../../store';

export function initNumberFormat(_this) {
      //货币格式
      $("#luckysheet-icon-currency").click(function () {
        let d = editor.deepCopyFlowData(Store.flowdata); //取数�?
  
        _this.updateFormat(d, "ct", "¥ #.00");
      });
  
      //百分�?
      $("#luckysheet-icon-percent").click(function () {
        let d = editor.deepCopyFlowData(Store.flowdata); //取数�?
  
        _this.updateFormat(d, "ct", "0.00%");
      });
  
      //减少小数位数
      $("#luckysheet-icon-fmt-decimal-decrease").click(function () {
        let d = editor.deepCopyFlowData(Store.flowdata); //取数�?
        let row_index = Store.luckysheet_select_save[0]["row_focus"],
          col_index = Store.luckysheet_select_save[0]["column_focus"];
        let foucsStatus = _this.checkstatus(d, row_index, col_index, "ct");
        let cell = d[row_index][col_index];
        if (foucsStatus == null || foucsStatus.t != "n") {
          return;
        }
        if (foucsStatus.fa == "General") {
          let mask = genarate(cell.v);
          foucsStatus = mask[1];
        }
  
        //万亿格式
        let reg = /^(w|W)((0?)|(0\.0+))$/;
        if (reg.test(foucsStatus.fa)) {
          if (foucsStatus.fa.indexOf(".") > -1) {
            if (foucsStatus.fa.substr(-2) == ".0") {
              _this.updateFormat(d, "ct", foucsStatus.fa.split(".")[0]);
            } else {
              _this.updateFormat(d, "ct", foucsStatus.fa.substr(0, foucsStatus.fa.length - 1));
            }
          } else {
            _this.updateFormat(d, "ct", foucsStatus.fa);
          }
          return;
        }
        //Uncaught ReferenceError: Cannot access 'fa' before initialization
        let prefix = "",
          main = "",
          fa = [];
        if (foucsStatus.fa.indexOf(".") > -1) {
          fa = foucsStatus.fa.split(".");
          prefix = fa[0];
          main = fa[1];
        } else {
          return;
        }
        fa = main.split("");
        let tail = "";
        for (let i = fa.length - 1; i >= 0; i--) {
          let c = fa[i];
          if (c != "#" && c != "0" && c != "," && isNaN(parseInt(c))) {
            tail = c + tail;
          } else {
            break;
          }
        }
        let fmt = "";
        if (foucsStatus.fa.indexOf(".") > -1) {
          let suffix = main;
          if (tail.length > 0) {
            suffix = main.replace(tail, "");
          }
          let pos = suffix.replace(/#/g, "0");
          pos = pos.substr(0, pos.length - 1);
          if (pos == "") {
            fmt = prefix + tail;
          } else {
            fmt = prefix + "." + pos + tail;
          }
        }
        _this.updateFormat(d, "ct", fmt);
      });
  
      //增加小数位数
      $("#luckysheet-icon-fmt-decimal-increase").click(function () {
        let d = editor.deepCopyFlowData(Store.flowdata); //取数�?
        let row_index = Store.luckysheet_select_save[0]["row_focus"],
          col_index = Store.luckysheet_select_save[0]["column_focus"];
        let foucsStatus = _this.checkstatus(d, row_index, col_index, "ct");
        let cell = d[row_index][col_index];
        if (foucsStatus == null || foucsStatus.t != "n") {
          return;
        }
        if (foucsStatus.fa == "General") {
          let mask = genarate(cell.v);
          foucsStatus = mask[1];
        }
        if (foucsStatus.fa == "General") {
          _this.updateFormat(d, "ct", "#.0");
          return;
        }
  
        //万亿格式
        let reg = /^(w|W)((0?)|(0\.0+))$/;
        if (reg.test(foucsStatus.fa)) {
          if (foucsStatus.fa.indexOf(".") > -1) {
            _this.updateFormat(d, "ct", foucsStatus.fa + "0");
          } else {
            if (foucsStatus.fa.substr(-1) == "0") {
              _this.updateFormat(d, "ct", foucsStatus.fa + ".0");
            } else {
              _this.updateFormat(d, "ct", foucsStatus.fa + "0.0");
            }
          }
          return;
        }
  
        //Uncaught ReferenceError: Cannot access 'fa' before initialization
        let prefix = "",
          main = "",
          fa = [];
        if (foucsStatus.fa.indexOf(".") > -1) {
          fa = foucsStatus.fa.split(".");
          prefix = fa[0];
          main = fa[1];
        } else {
          main = foucsStatus.fa;
        }
        fa = main.split("");
        let tail = "";
        for (let i = fa.length - 1; i >= 0; i--) {
          let c = fa[i];
          if (c != "#" && c != "0" && c != "," && isNaN(parseInt(c))) {
            tail = c + tail;
          } else {
            break;
          }
        }
        let fmt = "";
        if (foucsStatus.fa.indexOf(".") > -1) {
          let suffix = main;
          if (tail.length > 0) {
            suffix = main.replace(tail, "");
          }
          let pos = suffix.replace(/#/g, "0");
          pos += "0";
          fmt = prefix + "." + pos + tail;
        } else {
          if (tail.length > 0) {
            fmt = main.replace(tail, "") + ".0" + tail;
          } else {
            fmt = main + ".0" + tail;
          }
        }
        _this.updateFormat(d, "ct", fmt);
      });
}
