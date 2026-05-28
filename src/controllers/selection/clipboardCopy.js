import {  selectionCopyShow  } from "../select";
import menuButton from "../menuButton";
import editor from "../../global/editor";
import { getBorderInfoCompute } from "../../global/border";
import {  getcellvalue } from "../../global/getdata";
import {  replaceHtml,  getObjType } from "../../utils/util";
import Store from "../../store";
const clipboardCopyModule = {
  clearcopy: function (e) {
    let clipboardData = e && e.originalEvent && e.originalEvent.clipboardData;
    let cpdata = " ";
    Store.luckysheet_selection_range = [];
    selectionCopyShow();
    // Store.luckysheet_copy_save = {};

    if (!clipboardData) {
      let textarea = $("#luckysheet-copy-content").css("visibility", "hidden");
      textarea.val(cpdata);
      textarea.focus();
      textarea.select();
      // 等50毫秒，keyPress事件发生了再去处理数据
      setTimeout(function () {
        textarea.blur().css("visibility", "visible");
      }, 10);
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
        if (Store.config["rowhidden"] != null && Store.config["rowhidden"][copyR] != null) {
          continue;
        }
        if (!rowIndexArr.includes(copyR)) {
          rowIndexArr.push(copyR);
        }
        if (Store.config["rowlen"] != null && copyR in Store.config["rowlen"]) {
          RowlChange = true;
        }
        for (let copyC = c1; copyC <= c2; copyC++) {
          if (Store.config["colhidden"] != null && Store.config["colhidden"][copyC] != null) {
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
    if (Store.config["borderInfo"] && Store.config["borderInfo"].length > 0) {
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
      if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null) {
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
        if (Store.config["colhidden"] != null && Store.config["colhidden"][c] != null) {
          continue;
        }
        let column = '<td ${span} style="${style}">';
        if (d[r] != null && d[r][c] != null) {
          let style = "",
            span = "";
          let reg = /^(w|W)((0?)|(0\.0+))$/;
          let c_value;
          if (d[r][c].ct != null && d[r][c].ct.fa != null && d[r][c].ct.fa.match(reg)) {
            c_value = getcellvalue(r, c, d);
          } else {
            c_value = getcellvalue(r, c, d, "m");
          }
          style += menuButton.getStyleByCell(d, r, c);
          if (getObjType(d[r][c]) == "object" && "mc" in d[r][c]) {
            if ("rs" in d[r][c]["mc"]) {
              span = 'rowspan="' + d[r][c]["mc"].rs + '" colspan="' + d[r][c]["mc"].cs + '"';

              //边框
              if (borderInfoCompute && borderInfoCompute[r + "_" + c]) {
                let bl_obj = {
                    color: {},
                    style: {}
                  },
                  br_obj = {
                    color: {},
                    style: {}
                  },
                  bt_obj = {
                    color: {},
                    style: {}
                  },
                  bb_obj = {
                    color: {},
                    style: {}
                  };
                for (let bd_r = r; bd_r < r + d[r][c]["mc"].rs; bd_r++) {
                  for (let bd_c = c; bd_c < c + d[r][c]["mc"].cs; bd_c++) {
                    if (bd_r == r && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].t) {
                      let linetype = borderInfoCompute[bd_r + "_" + bd_c].t.style;
                      let bcolor = borderInfoCompute[bd_r + "_" + bd_c].t.color;
                      if (bt_obj["style"][linetype] == null) {
                        bt_obj["style"][linetype] = 1;
                      } else {
                        bt_obj["style"][linetype] = bt_obj["style"][linetype] + 1;
                      }
                      if (bt_obj["color"][bcolor] == null) {
                        bt_obj["color"][bcolor] = 1;
                      } else {
                        bt_obj["color"][bcolor] = bt_obj["color"][bcolor] + 1;
                      }
                    }
                    if (bd_r == r + d[r][c]["mc"].rs - 1 && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].b) {
                      let linetype = borderInfoCompute[bd_r + "_" + bd_c].b.style;
                      let bcolor = borderInfoCompute[bd_r + "_" + bd_c].b.color;
                      if (bb_obj["style"][linetype] == null) {
                        bb_obj["style"][linetype] = 1;
                      } else {
                        bb_obj["style"][linetype] = bb_obj["style"][linetype] + 1;
                      }
                      if (bb_obj["color"][bcolor] == null) {
                        bb_obj["color"][bcolor] = 1;
                      } else {
                        bb_obj["color"][bcolor] = bb_obj["color"][bcolor] + 1;
                      }
                    }
                    if (bd_c == c && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].l) {
                      let linetype = borderInfoCompute[r + "_" + c].l.style;
                      let bcolor = borderInfoCompute[bd_r + "_" + bd_c].l.color;
                      if (bl_obj["style"][linetype] == null) {
                        bl_obj["style"][linetype] = 1;
                      } else {
                        bl_obj["style"][linetype] = bl_obj["style"][linetype] + 1;
                      }
                      if (bl_obj["color"][bcolor] == null) {
                        bl_obj["color"][bcolor] = 1;
                      } else {
                        bl_obj["color"][bcolor] = bl_obj["color"][bcolor] + 1;
                      }
                    }
                    if (bd_c == c + d[r][c]["mc"].cs - 1 && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].r) {
                      let linetype = borderInfoCompute[bd_r + "_" + bd_c].r.style;
                      let bcolor = borderInfoCompute[bd_r + "_" + bd_c].r.color;
                      if (br_obj["style"][linetype] == null) {
                        br_obj["style"][linetype] = 1;
                      } else {
                        br_obj["style"][linetype] = br_obj["style"][linetype] + 1;
                      }
                      if (br_obj["color"][bcolor] == null) {
                        br_obj["color"][bcolor] = 1;
                      } else {
                        br_obj["color"][bcolor] = br_obj["color"][bcolor] + 1;
                      }
                    }
                  }
                }
                let rowlen = d[r][c]["mc"].rs,
                  collen = d[r][c]["mc"].cs;
                if (JSON.stringify(bl_obj).length > 23) {
                  let bl_color = null,
                    bl_style = null;
                  for (let x in bl_obj.color) {
                    if (bl_obj.color[x] >= rowlen / 2) {
                      bl_color = x;
                    }
                  }
                  for (let x in bl_obj.style) {
                    if (bl_obj.style[x] >= rowlen / 2) {
                      bl_style = x;
                    }
                  }
                  if (bl_color != null && bl_style != null) {
                    style += "border-left:" + _this.getHtmlBorderStyle(bl_style, bl_color);
                  }
                }
                if (JSON.stringify(br_obj).length > 23) {
                  let br_color = null,
                    br_style = null;
                  for (let x in br_obj.color) {
                    if (br_obj.color[x] >= rowlen / 2) {
                      br_color = x;
                    }
                  }
                  for (let x in br_obj.style) {
                    if (br_obj.style[x] >= rowlen / 2) {
                      br_style = x;
                    }
                  }
                  if (br_color != null && br_style != null) {
                    style += "border-right:" + _this.getHtmlBorderStyle(br_style, br_color);
                  }
                }
                if (JSON.stringify(bt_obj).length > 23) {
                  let bt_color = null,
                    bt_style = null;
                  for (let x in bt_obj.color) {
                    if (bt_obj.color[x] >= collen / 2) {
                      bt_color = x;
                    }
                  }
                  for (let x in bt_obj.style) {
                    if (bt_obj.style[x] >= collen / 2) {
                      bt_style = x;
                    }
                  }
                  if (bt_color != null && bt_style != null) {
                    style += "border-top:" + _this.getHtmlBorderStyle(bt_style, bt_color);
                  }
                }
                if (JSON.stringify(bb_obj).length > 23) {
                  let bb_color = null,
                    bb_style = null;
                  for (let x in bb_obj.color) {
                    if (bb_obj.color[x] >= collen / 2) {
                      bb_color = x;
                    }
                  }
                  for (let x in bb_obj.style) {
                    if (bb_obj.style[x] >= collen / 2) {
                      bb_style = x;
                    }
                  }
                  if (bb_color != null && bb_style != null) {
                    style += "border-bottom:" + _this.getHtmlBorderStyle(bb_style, bb_color);
                  }
                }
              }
            } else {
              continue;
            }
          } else {
            //边框
            if (borderInfoCompute && borderInfoCompute[r + "_" + c]) {
              //左边框
              if (borderInfoCompute[r + "_" + c].l) {
                let linetype = borderInfoCompute[r + "_" + c].l.style;
                let bcolor = borderInfoCompute[r + "_" + c].l.color;
                style += "border-left:" + _this.getHtmlBorderStyle(linetype, bcolor);
              }

              //右边框
              if (borderInfoCompute[r + "_" + c].r) {
                let linetype = borderInfoCompute[r + "_" + c].r.style;
                let bcolor = borderInfoCompute[r + "_" + c].r.color;
                style += "border-right:" + _this.getHtmlBorderStyle(linetype, bcolor);
              }

              //下边框
              if (borderInfoCompute[r + "_" + c].b) {
                let linetype = borderInfoCompute[r + "_" + c].b.style;
                let bcolor = borderInfoCompute[r + "_" + c].b.color;
                style += "border-bottom:" + _this.getHtmlBorderStyle(linetype, bcolor);
              }

              //上边框
              if (borderInfoCompute[r + "_" + c].t) {
                let linetype = borderInfoCompute[r + "_" + c].t.style;
                let bcolor = borderInfoCompute[r + "_" + c].t.color;
                style += "border-top:" + _this.getHtmlBorderStyle(linetype, bcolor);
              }
            }
          }
          column = replaceHtml(column, {
            style: style,
            span: span
          });
          if (c_value == null) {
            c_value = getcellvalue(r, c, d);
          }
          if (c_value == null && d[r][c] && d[r][c].ct && d[r][c].ct.t == "inlineStr") {
            c_value = d[r][c].ct.s.map(val => {
              const brDom = $('<br style="mso-data-placement:same-cell;">');
              const splitValue = val.v.split("\r\n");
              return splitValue.map(item => {
                if (!item) {
                  return "";
                }
                const font = $("<font></font>");
                val.fs && font.css("font-size", `${val.fs}pt`); //  字号
                val.bl && font.css("font-weight", "bold"); //  加粗
                val.it && font.css("font-style", "italic"); //  斜体
                val.un && font.css("text-decoration", "underline"); // 下划线
                val.fc && font.css("color", val.fc); //  字体颜色
                if (val.cl) {
                  // 判断删除线
                  font.append(`<s>${item}</s>`);
                } else {
                  font.text(item);
                }
                return font[0].outerHTML;
              }).join(brDom[0].outerHTML);
            }).join("");
          }
          if (c_value == null) {
            c_value = "";
          }

          // c_value = formula.ltGtSignDeal(c_value)

          column += c_value;
        } else {
          let style = "";

          //边框
          if (borderInfoCompute && borderInfoCompute[r + "_" + c]) {
            //左边框
            if (borderInfoCompute[r + "_" + c].l) {
              let linetype = borderInfoCompute[r + "_" + c].l.style;
              let bcolor = borderInfoCompute[r + "_" + c].l.color;
              style += "border-left:" + _this.getHtmlBorderStyle(linetype, bcolor);
            }

            //右边框
            if (borderInfoCompute[r + "_" + c].r) {
              let linetype = borderInfoCompute[r + "_" + c].r.style;
              let bcolor = borderInfoCompute[r + "_" + c].r.color;
              style += "border-right:" + _this.getHtmlBorderStyle(linetype, bcolor);
            }

            //下边框
            if (borderInfoCompute[r + "_" + c].b) {
              let linetype = borderInfoCompute[r + "_" + c].b.style;
              let bcolor = borderInfoCompute[r + "_" + c].b.color;
              style += "border-bottom:" + _this.getHtmlBorderStyle(linetype, bcolor);
            }

            //上边框
            if (borderInfoCompute[r + "_" + c].t) {
              let linetype = borderInfoCompute[r + "_" + c].t.style;
              let bcolor = borderInfoCompute[r + "_" + c].t.color;
              style += "border-top:" + _this.getHtmlBorderStyle(linetype, bcolor);
            }
          }
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
      let textarea = $("#luckysheet-copy-content");
      textarea.html(cpdata);
      textarea.focus();
      textarea.select();
      document.execCommand("selectAll");
      document.execCommand("Copy");

      // 等50毫秒，keyPress事件发生了再去处理数据
      setTimeout(function () {
        $("#luckysheet-copy-content").blur();
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
      let textarea = $("#luckysheet-copy-content");
      textarea.text(cpdata);
      textarea.focus();
      textarea.select();
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