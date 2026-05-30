import {  selectionCopyShow  } from "../select";
import menuButton from "../menuButton";
import editor from "../../global/editor";
import { getBorderInfoCompute } from "../../global/border";
import {  getcellvalue } from "../../global/getdata";
import {  replaceHtml,  getObjType, isRowHidden, isColHidden } from "../../utils/util";
import { getCellHtmlValue, getCellBorderStyle, getMergedCellBorderStyle } from "./htmlTableBuilder.js";
import Store from "../../store";
const clipboardCopyModule = {
  clearcopy: function (e) {
    let clipboardData = e && e.originalEvent && e.originalEvent.clipboardData;
    let cpdata = " ";
    Store.luckysheet_selection_range = [];
    selectionCopyShow();
    // Store.luckysheet_copy_save = {};

    if (!clipboardData) {
      const _textarea = document.getElementById("luckysheet-copy-content");
      if (_textarea) {
        _textarea.style.visibility = "hidden";
        _textarea.textContent = cpdata;
        _textarea.focus();
        const range = document.createRange();
        range.selectNodeContents(_textarea);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        setTimeout(function () {
          _textarea.blur();
          _textarea.style.visibility = "visible";
        }, 10);
      }
    } else {
      clipboardData.setData("Text", cpdata);
      return false; //否则设不生效
    }
  },
  getHtmlBorderStyle: function (type, color) {
    let style = "";
    let borderType = {
      0: "none",
      1: "Thin",
      2: "Hair",
      3: "Dotted",
      4: "Dashed",
      5: "DashDot",
      6: "DashDotDot",
      7: "Double",
      8: "Medium",
      9: "MediumDashed",
      10: "MediumDashDot",
      11: "MediumDashDotDot",
      12: "SlantedDashDot",
      13: "Thick"
    };
    type = borderType[type.toString()];
    if (type.indexOf("Medium") > -1) {
      style += "1pt ";
    } else if (type == "Thick") {
      style += "1.5pt ";
    } else {
      style += "0.5pt ";
    }
    if (type == "Hair") {
      style += "double ";
    } else if (type.indexOf("DashDotDot") > -1) {
      style += "dotted ";
    } else if (type.indexOf("DashDot") > -1) {
      style += "dashed ";
    } else if (type.indexOf("Dotted") > -1) {
      style += "dotted ";
    } else if (type.indexOf("Dashed") > -1) {
      style += "dashed ";
    } else {
      style += "solid ";
    }
    return style + color + ";";
  },
  copy: function (e) {
    //copy事件
    let clipboardData = e.originalEvent && e.originalEvent.clipboardData;
    Store.luckysheet_selection_range = [];
    //copy范围
    let rowIndexArr = [],
      colIndexArr = [];
    let copyRange = [],
      RowlChange = false,
      HasMC = false;
    for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
      let range = Store.luckysheet_select_save[s];
      let r1 = range.row[0],
        r2 = range.row[1];
      let c1 = range.column[0],
        c2 = range.column[1];
      for (let copyR = r1; copyR <= r2; copyR++) {
        if (isRowHidden(copyR)) {
          continue;
        }
        if (!rowIndexArr.includes(copyR)) {
          rowIndexArr.push(copyR);
        }
        if (Store.config["rowlen"] != null && copyR in Store.config["rowlen"]) {
          RowlChange = true;
        }
        for (let copyC = c1; copyC <= c2; copyC++) {
          if (isColHidden(copyC)) {
            continue;
          }
          if (!colIndexArr.includes(copyC)) {
            colIndexArr.push(copyC);
          }
          let cell = Store.flowdata[copyR][copyC];
          if (getObjType(cell) == "object" && "mc" in cell && cell.mc.rs != null) {
            HasMC = true;
          }
        }
      }
      Store.luckysheet_selection_range.push({
        row: range.row,
        column: range.column
      });
      copyRange.push({
        row: range.row,
        column: range.column
      });
    }
    selectionCopyShow();

    //luckysheet内copy保存
    Store.luckysheet_copy_save = {
      dataSheetIndex: Store.currentSheetIndex,
      copyRange: copyRange,
      RowlChange: RowlChange,
      HasMC: HasMC
    };

    //copy范围数据拼接成table 赋给剪贴板
    let _this = this;
    let borderInfoCompute;
    if (Store.config["borderInfo"] && Store.config["borderInfo"] !== null) {
      //边框
      borderInfoCompute = getBorderInfoCompute();
    }
    let cpdata = "",
      d = editor.deepCopyFlowData(Store.flowdata);
    let colgroup = "";

    // rowIndexArr = rowIndexArr.sort();
    // colIndexArr = colIndexArr.sort();

    for (let i = 0; i < rowIndexArr.length; i++) {
      let r = rowIndexArr[i];
      if (isRowHidden(r)) {
        continue;
      }

      // 将行高绑定到 <tr> 标签上
      if (Store.config == null || Store.config["rowlen"] == null || Store.config["rowlen"][r.toString()] == null) {
        cpdata += '<tr height="19">';
      } else {
        cpdata += `<tr height="${Store.config["rowlen"][r.toString()]}">`;
      }
      for (let j = 0; j < colIndexArr.length; j++) {
        let c = colIndexArr[j];
        if (r == rowIndexArr[0]) {
          if (Store.config == null || Store.config["columnlen"] == null || Store.config["columnlen"][c.toString()] == null) {
            colgroup += '<col width="72px"></col>';
          } else {
            colgroup += '<col width="' + Store.config["columnlen"][c.toString()] + 'px"></col>';
          }
        }
        if (isColHidden(c)) {
          continue;
        }
        let column = '<td ${span} style="${style}">';
        if (d[r] != null && d[r][c] != null) {
          let style = "",
            span = "";
          let c_value = getCellHtmlValue(r, c, d);
          style += menuButton.getStyleByCell(d, r, c);
          if (getObjType(d[r][c]) == "object" && "mc" in d[r][c]) {
            if ("rs" in d[r][c]["mc"]) {
              span = 'rowspan="' + d[r][c]["mc"].rs + '" colspan="' + d[r][c]["mc"].cs + '"';
              style += getMergedCellBorderStyle(r, c, d[r][c]["mc"], borderInfoCompute, _this);
            } else {
              continue;
            }
          } else {
            style += getCellBorderStyle(r, c, borderInfoCompute, _this);
          }
          column = replaceHtml(column, {
            style: style,
            span: span
          });
          column += c_value;
        } else {
          let style = getCellBorderStyle(r, c, borderInfoCompute, _this);
          column += "";
          column = replaceHtml(column, {
            style: style,
            span: ""
          });
          column += "";
        }
        column += "</td>";
        cpdata += column;
      }
      cpdata += "</tr>";
    }
    cpdata = '<table data-type="luckysheet_copy_action_table">' + `<colgroup>${colgroup}</colgroup>` + cpdata + "</table>";
    Store.iscopyself = true;
    if (!clipboardData) {
      let textarea = document.getElementById("luckysheet-copy-content");
      textarea.innerHTML = cpdata;
      textarea.focus();
      const range1 = document.createRange();
      range1.selectNodeContents(textarea);
      const sel1 = window.getSelection();
      sel1.removeAllRanges();
      sel1.addRange(range1);
      document.execCommand("selectAll");
      document.execCommand("Copy");

      // 等50毫秒，keyPress事件发生了再去处理数据
      setTimeout(function () {
        document.getElementById("luckysheet-copy-content")?.blur();
      }, 10);

      // var oInput = document.createElement('input');
      // oInput.setAttribute('readonly', 'readonly');
      // oInput.value = cpdata;
      // document.body.appendChild(oInput);
      // oInput.select(); // 选择对象
      // document.execCommand("Copy");
      // oInput.style.display='none';
      // document.body.removeChild(oInput);
    } else {
      clipboardData.setData("Text", cpdata);
      return false; //否则设不生效
    }
  },
  copybyformat: function (e, txt) {
    //copy事件
    let clipboardData = e.originalEvent && e.originalEvent.clipboardData;
    Store.luckysheet_selection_range = [{
      row: Store.luckysheet_select_save[0].row,
      column: Store.luckysheet_select_save[0].column
    }];
    selectionCopyShow();
    let cpdata = txt;
    Store.iscopyself = true;
    if (!clipboardData) {
      let textarea = document.getElementById("luckysheet-copy-content");
      textarea.textContent = cpdata;
      textarea.focus();
      const range2 = document.createRange();
      range2.selectNodeContents(textarea);
      const sel2 = window.getSelection();
      sel2.removeAllRanges();
      sel2.addRange(range2);
      document.execCommand("selectAll");
      document.execCommand("Copy");
      // 等50毫秒，keyPress事件发生了再去处理数据
      setTimeout(function () {
        textarea.blur();
      }, 10);
    } else {
      clipboardData.setData("Text", cpdata);
      return false; //否则设不生效
    }
  }
};
export default clipboardCopyModule;