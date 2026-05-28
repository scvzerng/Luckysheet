import conditionformat from "../../controllers/conditionformat";
import alternateformat from "../../controllers/alternateformat";
import menuButton from "../../controllers/menuButton";
import {  luckysheetdefaultstyle,  luckysheetdefaultFont  } from "../../controllers/constant";
import { luckysheet_searcharray } from "../../controllers/sheetSearch";
import { dynamicArrayCompute } from "../dynamicArray";
import { getRealCellValue } from "../getdata";
import { getBorderInfoComputeRange } from "../border";
import { getSheetIndex } from "../../methods/get";
import {  getObjType } from "../../utils/util";
import { nullCellRender, cellRender } from "./cellRender";
import { getCellOverflowMap, cellOverflow_colIn } from "./cellOverflow";
import method from "../method";
import Store from "../../store";
import sheetmanage from "../../controllers/sheetmanage";
function luckysheetDrawMain(scrollWidth, scrollHeight, drawWidth, drawHeight, offsetLeft, offsetTop, columnOffsetCell, rowOffsetCell, mycanvas) {
  if (Store.flowdata == null) {
    return;
  }
  let sheetFile = sheetmanage.getSheetByIndex();

  // console.trace();
  clearTimeout(Store.measureTextCacheTimeOut);

  //鍙傛暟鏈畾涔夊鐞?
  if (scrollWidth == null) {
    scrollWidth = $("#luckysheet-cell-main").scrollLeft();
  }
  if (scrollHeight == null) {
    scrollHeight = $("#luckysheet-cell-main").scrollTop();
  }
  if (drawWidth == null) {
    drawWidth = Store.luckysheetTableContentHW[0];
  }
  if (drawHeight == null) {
    drawHeight = Store.luckysheetTableContentHW[1];
  }
  if (offsetLeft == null) {
    offsetLeft = Store.rowHeaderWidth;
  }
  if (offsetTop == null) {
    offsetTop = Store.columnHeaderHeight;
  }
  if (columnOffsetCell == null) {
    columnOffsetCell = 0;
  }
  if (rowOffsetCell == null) {
    rowOffsetCell = 0;
  }

  //琛ㄦ牸canvas
  let luckysheetTableContent = null;
  if (mycanvas == null) {
    luckysheetTableContent = $("#luckysheetTableContent").get(0).getContext("2d");
  } else {
    if (getObjType(mycanvas) == "object") {
      try {
        luckysheetTableContent = mycanvas.get(0).getContext("2d");
      } catch (err) {
        luckysheetTableContent = mycanvas;
      }
    } else {
      luckysheetTableContent = $("#" + mycanvas).get(0).getContext("2d");
    }
  }
  luckysheetTableContent.save();
  luckysheetTableContent.scale(Store.devicePixelRatio, Store.devicePixelRatio);
  luckysheetTableContent.clearRect(0, 0, Store.luckysheetTableContentHW[0], Store.luckysheetTableContentHW[1]);

  //琛ㄦ牸娓叉煋鍖哄煙 璧锋琛屽垪涓嬫爣
  let dataset_row_st, dataset_row_ed, dataset_col_st, dataset_col_ed;
  dataset_row_st = luckysheet_searcharray(Store.visibledatarow, scrollHeight);
  dataset_row_ed = luckysheet_searcharray(Store.visibledatarow, scrollHeight + drawHeight);
  if (dataset_row_st == -1) {
    dataset_row_st = 0;
  }
  dataset_row_st += rowOffsetCell;
  if (dataset_row_ed == -1) {
    dataset_row_ed = Store.visibledatarow.length - 1;
  }
  dataset_row_ed += rowOffsetCell;
  if (dataset_row_ed >= Store.visibledatarow.length) {
    dataset_row_ed = Store.visibledatarow.length - 1;
  }
  dataset_col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollWidth);
  dataset_col_ed = luckysheet_searcharray(Store.visibledatacolumn, scrollWidth + drawWidth);
  if (dataset_col_st == -1) {
    dataset_col_st = 0;
  }
  dataset_col_st += columnOffsetCell;
  if (dataset_col_ed == -1) {
    dataset_col_ed = Store.visibledatacolumn.length - 1;
  }
  dataset_col_ed += columnOffsetCell;
  if (dataset_col_ed >= Store.visibledatacolumn.length) {
    dataset_col_ed = Store.visibledatacolumn.length - 1;
  }

  //琛ㄦ牸娓叉煋鍖哄煙 璧锋琛屽垪鍧愭爣
  let fill_row_st, fill_row_ed, fill_col_st, fill_col_ed;
  if (dataset_row_st == 0) {
    fill_row_st = 0;
  } else {
    fill_row_st = Store.visibledatarow[dataset_row_st - 1];
  }
  fill_row_ed = Store.visibledatarow[dataset_row_ed];
  if (dataset_col_st == 0) {
    fill_col_st = 0;
  } else {
    fill_col_st = Store.visibledatacolumn[dataset_col_st - 1];
  }
  fill_col_ed = Store.visibledatacolumn[dataset_col_ed];

  //琛ㄦ牸canvas 鍒濆鍖栧鐞?
  luckysheetTableContent.fillStyle = "#ffffff";
  luckysheetTableContent.fillRect(offsetLeft - 1, offsetTop - 1, fill_col_ed - scrollWidth, fill_row_ed - scrollHeight);
  luckysheetTableContent.font = luckysheetdefaultFont();
  // luckysheetTableContent.textBaseline = "top";
  luckysheetTableContent.fillStyle = luckysheetdefaultstyle.fillStyle;

  //琛ㄦ牸娓叉煋鍖哄煙 闈炵┖鍗曞厓鏍艰鍒?璧锋鍧愭爣
  let cellupdate = [];
  let mergeCache = {};
  let borderOffset = {};
  let bodrder05 = 0.5; //Default 0.5

  // 閽╁瓙鍑芥暟
  method.createHookFunction("cellAllRenderBefore", Store.flowdata, sheetFile, luckysheetTableContent);
  for (let r = dataset_row_st; r <= dataset_row_ed; r++) {
    let start_r;
    if (r == 0) {
      start_r = -scrollHeight - 1;
    } else {
      start_r = Store.visibledatarow[r - 1] - scrollHeight - 1;
    }
    let end_r = Store.visibledatarow[r] - scrollHeight;
    if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null) {
      continue;
    }
    for (let c = dataset_col_st; c <= dataset_col_ed; c++) {
      let start_c;
      if (c == 0) {
        start_c = -scrollWidth;
      } else {
        start_c = Store.visibledatacolumn[c - 1] - scrollWidth;
      }
      let end_c = Store.visibledatacolumn[c] - scrollWidth;
      if (Store.config["colhidden"] != null && Store.config["colhidden"][c] != null) {
        continue;
      }
      let firstcolumnlen = Store.defaultcollen;
      if (Store.config["columnlen"] != null && Store.config["columnlen"][c] != null) {
        firstcolumnlen = Store.config["columnlen"][c];
      }
      if (Store.flowdata[r] != null && Store.flowdata[r][c] != null) {
        let value = Store.flowdata[r][c];
        if (getObjType(value) == "object" && "mc" in value) {
          borderOffset[r + "_" + c] = {
            start_r: start_r,
            start_c: start_c,
            end_r: end_r,
            end_c: end_c
          };
          if ("rs" in value["mc"]) {
            let key = "r" + r + "c" + c;
            mergeCache[key] = cellupdate.length;
          } else {
            let key = "r" + value["mc"].r + "c" + value["mc"].c;
            let margeMain = cellupdate[mergeCache[key]];
            if (margeMain == null) {
              mergeCache[key] = cellupdate.length;
              cellupdate.push({
                r: r,
                c: c,
                start_c: start_c,
                start_r: start_r,
                end_r: end_r,
                end_c: end_c,
                firstcolumnlen: firstcolumnlen
              });
            } else {
              if (margeMain.c == c) {
                margeMain.end_r += end_r - start_r - 1;
              }
              if (margeMain.r == r) {
                margeMain.end_c += end_c - start_c;
                margeMain.firstcolumnlen += firstcolumnlen;
              }
            }
            continue;
          }
        }
      } else {
        //绌哄崟鍏冩牸娓叉煋鍓?
        // if(!method.createHookFunction("cellRenderBefore", Store.flowdata[r][c], {
        //     r:r,
        //     c:c,
        //     "start_r": cellsize[1],
        //     "start_c":cellsize[0],
        //     "end_r": cellsize[3],
        //     "end_c": cellsize[2]
        // }, sheetFile,luckysheetTableContent)){ continue; }
      }
      cellupdate.push({
        r: r,
        c: c,
        start_r: start_r,
        start_c: start_c,
        end_r: end_r,
        end_c: end_c,
        firstcolumnlen: firstcolumnlen
      });
      borderOffset[r + "_" + c] = {
        start_r: start_r,
        start_c: start_c,
        end_r: end_r,
        end_c: end_c
      };
    }
  }

  //鍔ㄦ€佹暟缁勫叕寮忚绠?
  let dynamicArray_compute = dynamicArrayCompute(Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dynamicArray"]);

  //浜ゆ浛棰滆壊璁＄畻
  let af_compute = alternateformat.getComputeMap();

  //鏉′欢鏍煎紡璁＄畻
  let cf_compute = conditionformat.getComputeMap();

  //琛ㄦ牸娓叉煋鍖哄煙 婧㈠嚭鍗曞厓鏍奸厤缃繚瀛?
  let cellOverflowMap = getCellOverflowMap(luckysheetTableContent, dataset_col_st, dataset_col_ed, dataset_row_st, dataset_row_ed);
  let mcArr = [];
  for (let cud = 0; cud < cellupdate.length; cud++) {
    let item = cellupdate[cud];
    let r = item.r,
      c = item.c,
      start_r = item.start_r,
      start_c = item.start_c,
      end_r = item.end_r,
      end_c = item.end_c;
    let firstcolumnlen = item.firstcolumnlen;
    if (Store.flowdata[r] == null) {
      continue;
    }

    // //鏈夊€煎崟鍏冩牸娓叉煋鍓?
    // if(!method.createHookFunction("cellRenderBefore", Store.flowdata[r][c], {
    //     r:r,
    //     c:c,
    //     "start_r": cellsize[1],
    //     "start_c":cellsize[0],
    //     "end_r": cellsize[3],
    //     "end_c": cellsize[2]
    // }, sheetFile,luckysheetTableContent)){ continue; }

    if (Store.flowdata[r][c] == null) {
      //绌哄崟鍏冩牸
      nullCellRender(r, c, start_r, start_c, end_r, end_c, luckysheetTableContent, af_compute, cf_compute, offsetLeft, offsetTop, dynamicArray_compute, cellOverflowMap, dataset_col_st, dataset_col_ed, scrollHeight, scrollWidth, bodrder05);
    } else {
      let cell = Store.flowdata[r][c];
      let value = null;
      if (typeof cell == "object" && "mc" in cell) {
        mcArr.push(cellupdate[cud]);
        // continue;
      } else {
        value = getRealCellValue(r, c);
      }
      if (value == null || value.toString().length == 0) {
        nullCellRender(r, c, start_r, start_c, end_r, end_c, luckysheetTableContent, af_compute, cf_compute, offsetLeft, offsetTop, dynamicArray_compute, cellOverflowMap, dataset_col_st, dataset_col_ed, scrollHeight, scrollWidth, bodrder05);
      } else {
        if (r + "_" + c in dynamicArray_compute) {
          //鍔ㄦ€佹暟缁勫叕寮?
          value = dynamicArray_compute[r + "_" + c].v;
        }
        cellRender(r, c, start_r, start_c, end_r, end_c, value, luckysheetTableContent, af_compute, cf_compute, offsetLeft, offsetTop, dynamicArray_compute, cellOverflowMap, dataset_col_st, dataset_col_ed, scrollHeight, scrollWidth, bodrder05);
      }
    }

    // method.createHookFunction("cellRenderAfter", Store.flowdata[r][c], {
    //     r:r,
    //     c:c,
    //     "start_r": start_r,
    //     "start_c": start_c,
    //     "end_r": end_r,
    //     "end_c": end_c
    // }, sheetFile,luckysheetTableContent)
  }

  //鍚堝苟鍗曞厓鏍煎啀澶勭悊
  for (let m = 0; m < mcArr.length; m++) {
    let item = mcArr[m];
    let r = item.r,
      c = item.c,
      start_r = item.start_r,
      start_c = item.start_c,
      end_r = item.end_r - 1,
      end_c = item.end_c - 1;
    let firstcolumnlen = item.firstcolumnlen;
    let cell = Store.flowdata[r][c];
    let value = null;
    let margeMaindata = cell["mc"];
    value = getRealCellValue(margeMaindata.r, margeMaindata.c);
    r = margeMaindata.r;
    c = margeMaindata.c;
    let mainCell = Store.flowdata[r][c];
    if (c == 0) {
      start_c = -scrollWidth;
    } else {
      start_c = Store.visibledatacolumn[c - 1] - scrollWidth;
    }
    if (r == 0) {
      start_r = -scrollHeight - 1;
    } else {
      start_r = Store.visibledatarow[r - 1] - scrollHeight - 1;
    }
    end_r = Store.visibledatarow[r + mainCell["mc"].rs - 1] - scrollHeight;
    end_c = Store.visibledatacolumn[c + mainCell["mc"].cs - 1] - scrollWidth;
    if (value == null || value.toString().length == 0) {
      nullCellRender(r, c, start_r, start_c, end_r, end_c, luckysheetTableContent, af_compute, cf_compute, offsetLeft, offsetTop, dynamicArray_compute, cellOverflowMap, dataset_col_st, dataset_col_ed, scrollHeight, scrollWidth, bodrder05, true);
    } else {
      if (r + "_" + c in dynamicArray_compute) {
        //鍔ㄦ€佹暟缁勫叕寮?
        value = dynamicArray_compute[r + "_" + c].v;
      }
      cellRender(r, c, start_r, start_c, end_r, end_c, value, luckysheetTableContent, af_compute, cf_compute, offsetLeft, offsetTop, dynamicArray_compute, cellOverflowMap, dataset_col_st, dataset_col_ed, scrollHeight, scrollWidth, bodrder05, true);
    }
  }

  //鏁版嵁閫忚琛ㄨ竟妗嗘覆鏌?
  for (let r = dataset_row_st; r <= dataset_row_ed; r++) {
    let start_r;
    if (r == 0) {
      start_r = -scrollHeight - 1;
    } else {
      start_r = Store.visibledatarow[r - 1] - scrollHeight - 1;
    }
    let end_r = Store.visibledatarow[r] - scrollHeight;
    for (let c = dataset_col_st; c <= dataset_col_ed; c++) {
      let start_c;
      if (c == 0) {
        start_c = -scrollWidth;
      } else {
        start_c = Store.visibledatacolumn[c - 1] - scrollWidth;
      }
      let end_c = Store.visibledatacolumn[c] - scrollWidth;
    }
  }

  //杈规鍗曠嫭娓叉煋
  if (Store.config["borderInfo"] != null && Store.config["borderInfo"].length > 0) {
    //杈规娓叉煋
    let borderLeftRender = function (style, color, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, canvas) {
      let linetype = style;
      let m_st = start_c - 2 + bodrder05 + offsetLeft;
      let m_ed = start_r + offsetTop - 1;
      let line_st = start_c - 2 + bodrder05 + offsetLeft;
      let line_ed = end_r - 2 + bodrder05 + offsetTop;
      canvas.save();
      menuButton.setLineDash(canvas, linetype, "v", m_st, m_ed, line_st, line_ed);
      canvas.strokeStyle = color;
      canvas.stroke();
      canvas.closePath();
      canvas.restore();
    };
    let borderRightRender = function (style, color, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, canvas) {
      let linetype = style;
      let m_st = end_c - 2 + bodrder05 + offsetLeft;
      let m_ed = start_r + offsetTop - 1;
      let line_st = end_c - 2 + bodrder05 + offsetLeft;
      let line_ed = end_r - 2 + bodrder05 + offsetTop;
      canvas.save();
      menuButton.setLineDash(canvas, linetype, "v", m_st, m_ed, line_st, line_ed);
      canvas.strokeStyle = color;
      canvas.stroke();
      canvas.closePath();
      canvas.restore();
    };
    let borderBottomRender = function (style, color, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, canvas) {
      let linetype = style;
      let m_st = start_c - 2 + bodrder05 + offsetLeft;
      let m_ed = end_r - 2 + bodrder05 + offsetTop;
      let line_st = end_c - 2 + bodrder05 + offsetLeft;
      let line_ed = end_r - 2 + bodrder05 + offsetTop;
      canvas.save();
      menuButton.setLineDash(canvas, linetype, "h", m_st, m_ed, line_st, line_ed);
      canvas.strokeStyle = color;
      canvas.stroke();
      canvas.closePath();
      canvas.restore();
    };
    let borderTopRender = function (style, color, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, canvas) {
      let linetype = style;
      let m_st = start_c - 2 + bodrder05 + offsetLeft;
      let m_ed = start_r - 1 + bodrder05 + offsetTop;
      let line_st = end_c - 2 + bodrder05 + offsetLeft;
      let line_ed = start_r - 1 + bodrder05 + offsetTop;
      canvas.save();
      menuButton.setLineDash(canvas, linetype, "h", m_st, m_ed, line_st, line_ed);
      canvas.strokeStyle = color;
      canvas.stroke();
      canvas.closePath();
      canvas.restore();
    };
    let borderInfoCompute = getBorderInfoComputeRange(dataset_row_st, dataset_row_ed, dataset_col_st, dataset_col_ed);
    for (let x in borderInfoCompute) {
      //let bd_r = x.split("_")[0], bd_c = x.split("_")[1];

      let bd_r = x.substr(0, x.indexOf("_"));
      let bd_c = x.substr(x.indexOf("_") + 1);

      // if(bd_r < dataset_row_st || bd_r > dataset_row_ed || bd_c < dataset_col_st || bd_c > dataset_col_ed){
      //     continue;
      // }

      if (borderOffset[bd_r + "_" + bd_c]) {
        let start_r = borderOffset[bd_r + "_" + bd_c].start_r;
        let start_c = borderOffset[bd_r + "_" + bd_c].start_c;
        let end_r = borderOffset[bd_r + "_" + bd_c].end_r;
        let end_c = borderOffset[bd_r + "_" + bd_c].end_c;
        let cellOverflow_colInObj = cellOverflow_colIn(cellOverflowMap, bd_r, bd_c, dataset_col_st, dataset_col_ed);
        let borderLeft = borderInfoCompute[x].l;
        if (borderLeft != null && (!cellOverflow_colInObj.colIn || cellOverflow_colInObj.stc == bd_c)) {
          borderLeftRender(borderLeft.style, borderLeft.color, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, luckysheetTableContent);
        }
        let borderRight = borderInfoCompute[x].r;
        if (borderRight != null && (!cellOverflow_colInObj.colIn || cellOverflow_colInObj.colLast)) {
          borderRightRender(borderRight.style, borderRight.color, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, luckysheetTableContent);
        }
        let borderTop = borderInfoCompute[x].t;
        if (borderTop != null) {
          borderTopRender(borderTop.style, borderTop.color, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, luckysheetTableContent);
        }
        let borderBottom = borderInfoCompute[x].b;
        if (borderBottom != null) {
          borderBottomRender(borderBottom.style, borderBottom.color, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, luckysheetTableContent);
        }
      }
    }
  }

  //娓叉煋琛ㄦ牸鏃舵湁灏惧垪鏃讹紝娓呴櫎鍙宠竟鐏拌壊鍖哄煙锛岄槻姝㈣〃鏍兼湁鍊兼孩鍑?
  if (dataset_col_ed == Store.visibledatacolumn.length - 1) {
    luckysheetTableContent.clearRect(fill_col_ed - scrollWidth + offsetLeft - 1, offsetTop - 1, Store.ch_width - Store.visibledatacolumn[dataset_col_ed], fill_row_ed - scrollHeight);
  }
  luckysheetTableContent.restore();
  Store.measureTextCacheTimeOut = setTimeout(() => {
    Store.measureTextCache = {};
    Store.measureTextCellInfoCache = {};
    Store.cellOverflowMapCache = {};
  }, 100);
}

//绌虹櫧鍗曞厓鏍兼覆鏌?
export { luckysheetDrawMain };