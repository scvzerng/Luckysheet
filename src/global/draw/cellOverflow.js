import conditionformat from "../../controllers/conditionformat";
import alternateformat from "../../controllers/alternateformat";
import menuButton from "../../controllers/menuButton";
import { luckysheetdefaultstyle, luckysheet_CFiconsImg, luckysheetdefaultFont } from "../../controllers/constant";
import { luckysheet_searcharray } from "../../controllers/sheetSearch";
import { dynamicArrayCompute } from "../dynamicArray";
import browser from "../browser";
import { isRealNull, isRealNum } from "../validate";
import { getMeasureText, getCellTextInfo } from "../getRowlen";
import { getRealCellValue } from "../getdata";
import { getBorderInfoComputeRange } from "../border";
import { getSheetIndex } from "../../methods/get";
import { getObjType, chatatABC, luckysheetfontformat } from "../../utils/util";
import { isInlineStringCell } from "../../controllers/inlineString";
import { cellTextRender } from "./cellTextRender";
import method from "../method";
import Store from "../../store";
import locale from "../../locale/locale";
import sheetmanage from "../../controllers/sheetmanage";
//鑾峰彇琛ㄦ牸娓叉煋鑼冨洿 婧㈠嚭鍗曞厓鏍?
function getCellOverflowMap(canvas, col_st, col_ed, row_st, row_end) {
  let map = {};
  let data = Store.flowdata;
  for (let r = row_st; r <= row_end; r++) {
    if (data[r] == null) {
      continue;
    }
    if (Store.cellOverflowMapCache[r] != null) {
      map[r] = Store.cellOverflowMapCache[r];
      continue;
    }
    let hasCellOver = false;
    for (let c = 0; c < data[r].length; c++) {
      let cell = data[r][c];

      // if(Store.cellOverflowMapCache[r + '_' + c]!=null){
      //     map[r + '_' + c] = Store.cellOverflowMapCache[r + '_' + c];
      //     continue;
      // }

      if (Store.config["colhidden"] != null && Store.config["colhidden"][c] != null) {
        continue;
      }
      if (cell != null && (!isRealNull(cell.v) || isInlineStringCell(cell)) && cell.mc == null && cell.tb == "1") {
        //姘村钩瀵归綈
        let horizonAlign = menuButton.checkstatus(data, r, c, "ht");
        let textMetricsObj = getCellTextInfo(cell, canvas, {
          r: r,
          c: c
        });
        let textMetrics = 0;
        if (textMetricsObj != null) {
          textMetrics = textMetricsObj.textWidthAll;
        }

        //canvas.measureText(value).width;

        let start_c = c - 1 < 0 ? 0 : Store.visibledatacolumn[c - 1];
        let end_c = Store.visibledatacolumn[c];
        let stc, edc;
        if (end_c - start_c < textMetrics) {
          if (horizonAlign == "0") {
            //灞呬腑瀵归綈
            let trace_forward = cellOverflow_trace(r, c, c - 1, "forward", horizonAlign, textMetrics);
            let trace_backward = cellOverflow_trace(r, c, c + 1, "backward", horizonAlign, textMetrics);
            if (trace_forward.success) {
              stc = trace_forward.c;
            } else {
              stc = trace_forward.c + 1;
            }
            if (trace_backward.success) {
              edc = trace_backward.c;
            } else {
              edc = trace_backward.c - 1;
            }
          } else if (horizonAlign == "1") {
            //宸﹀榻?
            let trace = cellOverflow_trace(r, c, c + 1, "backward", horizonAlign, textMetrics);
            stc = c;
            if (trace.success) {
              edc = trace.c;
            } else {
              edc = trace.c - 1;
            }
          } else if (horizonAlign == "2") {
            //鍙冲榻?
            let trace = cellOverflow_trace(r, c, c - 1, "forward", horizonAlign, textMetrics);
            edc = c;
            if (trace.success) {
              stc = trace.c;
            } else {
              stc = trace.c + 1;
            }
          }
        } else {
          stc = c;
          edc = c;
        }

        // if(((stc >= col_st && stc <= col_ed) || (edc >= col_st && edc <= col_ed)) && stc < edc){
        if ((stc <= col_ed || edc >= col_st) && stc < edc) {
          let item = {
            r: r,
            stc: stc,
            edc: edc
          };
          if (map[r] == null) {
            map[r] = {};
          }
          map[r][c] = item;

          // Store.cellOverflowMapCache[r + '_' + c] = item;

          hasCellOver = true;
        }
      }
    }
    if (hasCellOver) {
      Store.cellOverflowMapCache[r] = map[r];
    }
  }
  return map;
}
function cellOverflow_trace(r, curC, traceC, traceDir, horizonAlign, textMetrics) {
  let data = Store.flowdata;

  //杩芥函鍗曞厓鏍煎垪瓒呭嚭鏁扮粍鑼冨洿 鍒欒拷婧粓姝?
  if (traceDir == "forward" && traceC < 0) {
    return {
      success: false,
      r: r,
      c: traceC
    };
  }
  if (traceDir == "backward" && traceC > data[r].length - 1) {
    return {
      success: false,
      r: r,
      c: traceC
    };
  }

  //杩芥函鍗曞厓鏍兼槸 闈炵┖鍗曞厓鏍兼垨鍚堝苟鍗曞厓鏍?鍒欒拷婧粓姝?
  let cell = data[r][traceC];
  if (cell != null && (!isRealNull(cell.v) || cell.mc != null)) {
    return {
      success: false,
      r: r,
      c: traceC
    };
  }
  let start_curC = curC - 1 < 0 ? 0 : Store.visibledatacolumn[curC - 1];
  let end_curC = Store.visibledatacolumn[curC];
  let w = textMetrics - (end_curC - start_curC);
  if (horizonAlign == "0") {
    //灞呬腑瀵归綈
    start_curC -= w / 2;
    end_curC += w / 2;
  } else if (horizonAlign == "1") {
    //宸﹀榻?
    end_curC += w;
  } else if (horizonAlign == "2") {
    //鍙冲榻?
    start_curC -= w;
  }
  let start_traceC = traceC - 1 < 0 ? 0 : Store.visibledatacolumn[traceC - 1];
  let end_traceC = Store.visibledatacolumn[traceC];
  if (traceDir == "forward") {
    if (start_curC < start_traceC) {
      return cellOverflow_trace(r, curC, traceC - 1, traceDir, horizonAlign, textMetrics);
    } else if (start_curC < end_traceC) {
      return {
        success: true,
        r: r,
        c: traceC
      };
    } else {
      return {
        success: false,
        r: r,
        c: traceC
      };
    }
  }
  if (traceDir == "backward") {
    if (end_curC > end_traceC) {
      return cellOverflow_trace(r, curC, traceC + 1, traceDir, horizonAlign, textMetrics);
    } else if (end_curC > start_traceC) {
      return {
        success: true,
        r: r,
        c: traceC
      };
    } else {
      return {
        success: false,
        r: r,
        c: traceC
      };
    }
  }
}
function cellOverflow_colIn(map, r, c, col_st, col_ed) {
  let colIn = false,
    //姝ゅ崟鍏冩牸 鏄惁鍦?鏌愪釜婧㈠嚭鍗曞厓鏍肩殑娓叉煋鑼冨洿
    colLast = false,
    //姝ゅ崟鍏冩牸 鏄惁鏄?鏌愪釜婧㈠嚭鍗曞厓鏍肩殑娓叉煋鑼冨洿鐨勬渶鍚庝竴鍒?
    rowIndex,
    //婧㈠嚭鍗曞厓鏍?琛屼笅鏍?
    colIndex,
    //婧㈠嚭鍗曞厓鏍?鍒椾笅鏍?
    stc,
    edc;
  for (let rkey in map) {
    for (let ckey in map[rkey]) {
      rowIndex = rkey;
      colIndex = ckey;
      // rowIndex = key.substr(0, key.indexOf('_'));
      // colIndex = key.substr(key.indexOf('_') + 1);
      let mapItem = map[rkey][ckey];
      stc = mapItem.stc;
      edc = mapItem.edc;
      if (rowIndex == r) {
        if (c >= stc && c <= edc) {
          colIn = true;
          if (c == edc || c == col_ed) {
            colLast = true;
            break;
          }
        }
      }
    }
    if (colLast) {
      break;
    }
  }
  return {
    colIn: colIn,
    colLast: colLast,
    rowIndex: rowIndex,
    colIndex: colIndex,
    stc: stc,
    edc: edc
  };
}
let cellOverflowRender = function(r, c, stc, edc, luckysheetTableContent, scrollHeight, scrollWidth, offsetLeft, offsetTop, af_compute, cf_compute) {
  let start_r;
  if (r == 0) {
    start_r = -scrollHeight - 1;
  } else {
    start_r = Store.visibledatarow[r - 1] - scrollHeight - 1;
  }
  let end_r = Store.visibledatarow[r] - scrollHeight;
  let start_c;
  if (stc == 0) {
    start_c = -scrollWidth;
  } else {
    start_c = Store.visibledatacolumn[stc - 1] - scrollWidth;
  }
  let end_c = Store.visibledatacolumn[edc] - scrollWidth;
  let cell = Store.flowdata[r][c];
  let cellWidth = end_c - start_c - 2;
  let cellHeight = end_r - start_r - 2;
  let space_width = 2, space_height = 2;
  let pos_x = start_c + offsetLeft;
  let pos_y = start_r + offsetTop + 1;
  let fontset = luckysheetfontformat(cell);
  luckysheetTableContent.font = fontset;
  luckysheetTableContent.save();
  luckysheetTableContent.beginPath();
  luckysheetTableContent.rect(pos_x, pos_y, cellWidth, cellHeight);
  luckysheetTableContent.clip();
  luckysheetTableContent.scale(Store.zoomRatio, Store.zoomRatio);
  let textInfo = getCellTextInfo(cell, luckysheetTableContent, {
    cellWidth: cellWidth,
    cellHeight: cellHeight,
    space_width: space_width,
    space_height: space_height,
    r: r,
    c: c
  });
  let checksAF = alternateformat.checksAF(r, c, af_compute);
  let checksCF = conditionformat.checksCF(r, c, cf_compute);
  luckysheetTableContent.fillStyle = menuButton.checkstatus(Store.flowdata, r, c, "fc");
  if (checksAF != null && checksAF[0] != null) {
    luckysheetTableContent.fillStyle = checksAF[0];
  }
  if (checksCF != null && checksCF["textColor"] != null) {
    luckysheetTableContent.fillStyle = checksCF["textColor"];
  }
  cellTextRender(textInfo, luckysheetTableContent, {
    pos_x: pos_x,
    pos_y: pos_y
  });
  luckysheetTableContent.restore();
};
export { getCellOverflowMap, cellOverflow_trace, cellOverflow_colIn, cellOverflowRender };