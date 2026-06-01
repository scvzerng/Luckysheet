import { initCanvasDefaults, getRowStartEnd, getColStartEnd, resetCanvasStroke } from './drawUtils.js';
import {  luckysheetdefaultstyle,  luckysheetdefaultFont  } from "../../controllers/constant";
import { luckysheet_searcharray } from "../../controllers/sheetSearch";
import {  getMeasureText } from "../getRowlen";
import {  chatatABC, isRowHidden, isColHidden } from "../../utils/util";
import { getMaxRowIndex, getMaxColIndex } from "../../utils/storeAccess.js";
import { getScrollPosition } from '../../utils/domUtils.js';
import canvasContext from '../../ui/canvasContext.js';
import method from "../method";
import Store from "../../store";
function luckysheetDrawgridRowTitle(scrollHeight, drawHeight, offsetTop) {
  if (scrollHeight == null) {
    scrollHeight = getScrollPosition().scrollTop;
  }
  if (drawHeight == null) {
    drawHeight = Store.luckysheetTableContentHW[1];
  }
  if (offsetTop == null) {
    offsetTop = Store.columnHeaderHeight;
  }
  let luckysheetTableContent = canvasContext.getContext();
  luckysheetTableContent.save();
  luckysheetTableContent.scale(Store.devicePixelRatio, Store.devicePixelRatio);
  luckysheetTableContent.clearRect(0, offsetTop, Store.rowHeaderWidth - 1, drawHeight);
  initCanvasDefaults(luckysheetTableContent);
  let dataset_row_st, dataset_row_ed;
  dataset_row_st = luckysheet_searcharray(Store.visibleRowPositions, scrollHeight);
  dataset_row_ed = luckysheet_searcharray(Store.visibleRowPositions, scrollHeight + drawHeight);
  if (dataset_row_st == -1) {
    dataset_row_st = 0;
  }
  if (dataset_row_ed == -1) {
    dataset_row_ed = getMaxRowIndex();
  }
  luckysheetTableContent.save();
  luckysheetTableContent.beginPath();
  luckysheetTableContent.rect(0, offsetTop - 1, Store.rowHeaderWidth - 1, drawHeight - 2);
  luckysheetTableContent.clip();
  let end_r, start_r;
  let bodrder05 = 0.5; //Default 0.5
  let preEndR;
  for (let r = dataset_row_st; r <= dataset_row_ed; r++) {
    let _rowPos = getRowStartEnd(r, scrollHeight);
    start_r = _rowPos.start_r;
    end_r = _rowPos.end_r;

    //鑻ヨ秴鍑虹粯鍒跺尯鍩熺粓姝?
    // if(end_r > scrollHeight + drawHeight){
    //     break;
    // }
    let firstOffset = dataset_row_st == r ? -2 : 0;
    let lastOffset = dataset_row_ed == r ? -2 : 0;
    //鍒楁爣棰樺崟鍏冩牸娓叉煋鍓嶈Е鍙戯紝return false 鍒欎笉娓叉煋璇ュ崟鍏冩牸
    if (!method.createHookFunction("rowTitleCellRenderBefore", r + 1, {
      r: r,
      top: start_r + offsetTop + firstOffset,
      width: Store.rowHeaderWidth - 1,
      height: end_r - start_r + 1 + lastOffset - firstOffset
    }, luckysheetTableContent)) {
      continue;
    }
    if (!isRowHidden(r)) {
      luckysheetTableContent.fillStyle = "#ffffff";
      luckysheetTableContent.fillRect(0, start_r + offsetTop + firstOffset, Store.rowHeaderWidth - 1, end_r - start_r + 1 + lastOffset - firstOffset);
      luckysheetTableContent.fillStyle = "#000000";

      //琛屾爣棰樻爮搴忓垪鍙?
      luckysheetTableContent.save(); //save scale before draw text
      luckysheetTableContent.scale(Store.zoomRatio, Store.zoomRatio);
      let textMetrics = getMeasureText(r + 1, luckysheetTableContent);
      //luckysheetTableContent.measureText(r + 1);

      let horizonAlignPos = (Store.rowHeaderWidth - textMetrics.width) / 2;
      let verticalAlignPos = start_r + (end_r - start_r) / 2 + offsetTop;
      luckysheetTableContent.fillText(r + 1, horizonAlignPos / Store.zoomRatio, verticalAlignPos / Store.zoomRatio);
      luckysheetTableContent.restore(); //restore scale after draw text
    }

    //vertical
    luckysheetTableContent.beginPath();
    luckysheetTableContent.moveTo(Store.rowHeaderWidth - 2 + bodrder05, start_r + offsetTop - 2);
    luckysheetTableContent.lineTo(Store.rowHeaderWidth - 2 + bodrder05, end_r + offsetTop - 2);
    resetCanvasStroke(luckysheetTableContent);
    luckysheetTableContent.stroke();
    luckysheetTableContent.closePath();

    //琛屾爣棰樻爮妯嚎,horizen
    if (!isRowHidden(r) && isRowHidden(r + 1)) {
      luckysheetTableContent.beginPath();
      luckysheetTableContent.moveTo(-1, end_r + offsetTop - 4 + bodrder05);
      luckysheetTableContent.lineTo(Store.rowHeaderWidth - 1, end_r + offsetTop - 4 + bodrder05);
      // luckysheetTableContent.lineWidth = 1;
      // luckysheetTableContent.strokeStyle = luckysheetdefaultstyle.strokeStyle;
      luckysheetTableContent.closePath();
      luckysheetTableContent.stroke();
    } else if (!isRowHidden(r)) {
      luckysheetTableContent.beginPath();
      luckysheetTableContent.moveTo(-1, end_r + offsetTop - 2 + bodrder05);
      luckysheetTableContent.lineTo(Store.rowHeaderWidth - 1, end_r + offsetTop - 2 + bodrder05);

      // luckysheetTableContent.lineWidth = 1;
      // luckysheetTableContent.strokeStyle = luckysheetdefaultstyle.strokeStyle;
      luckysheetTableContent.closePath();
      luckysheetTableContent.stroke();
    }
    if (isRowHidden(r - 1) && preEndR != null) {
      luckysheetTableContent.beginPath();
      luckysheetTableContent.moveTo(-1, preEndR + offsetTop + bodrder05);
      luckysheetTableContent.lineTo(Store.rowHeaderWidth - 1, preEndR + offsetTop + bodrder05);
      luckysheetTableContent.closePath();
      luckysheetTableContent.stroke();
    }
    preEndR = end_r;

    //鍒楁爣棰樺崟鍏冩牸娓叉煋鍓嶈Е鍙戯紝return false 鍒欎笉娓叉煋璇ュ崟鍏冩牸
    method.createHookFunction("rowTitleCellRenderAfter", r + 1, {
      r: r,
      top: start_r + offsetTop + firstOffset,
      width: Store.rowHeaderWidth - 1,
      height: end_r - start_r + 1 + lastOffset - firstOffset
    }, luckysheetTableContent);
  }

  //琛屾爣棰樻爮绔栫嚎
  // luckysheetTableContent.beginPath();
  // luckysheetTableContent.moveTo(
  //     (Store.rowHeaderWidth - 2 + 0.5) ,
  //     (offsetTop - 1)
  // );
  // luckysheetTableContent.lineTo(
  //     (Store.rowHeaderWidth - 2 + 0.5) ,
  //     (Store.rh_height + offsetTop)
  // );
  // luckysheetTableContent.lineWidth = 1;
  // luckysheetTableContent.strokeStyle = luckysheetdefaultstyle.strokeStyle;
  // luckysheetTableContent.closePath();
  // luckysheetTableContent.stroke();

  //娓呴櫎canvas宸︿笂瑙掑尯鍩?闃叉鍒楁爣棰樻爮搴忓垪鍙锋孩鍑烘樉绀?
  // luckysheetTableContent.clearRect(0, 0, Store.rowHeaderWidth , Store.columnHeaderHeight );

  // Must be restored twice, otherwise it will be enlarged under window.devicePixelRatio = 1.5
  luckysheetTableContent.restore();
  luckysheetTableContent.restore();
}
function luckysheetDrawgridColumnTitle(scrollWidth, drawWidth, offsetLeft) {
  if (scrollWidth == null) {
    scrollWidth = getScrollPosition().scrollLeft;
  }
  if (drawWidth == null) {
    drawWidth = Store.luckysheetTableContentHW[0];
  }
  if (offsetLeft == null) {
    offsetLeft = Store.rowHeaderWidth;
  }
  let luckysheetTableContent = canvasContext.getContext();
  luckysheetTableContent.save();
  luckysheetTableContent.scale(Store.devicePixelRatio, Store.devicePixelRatio);
  luckysheetTableContent.clearRect(offsetLeft, 0, drawWidth, Store.columnHeaderHeight - 1);
  initCanvasDefaults(luckysheetTableContent);
  let dataset_col_st, dataset_col_ed;
  dataset_col_st = luckysheet_searcharray(Store.visibleColPositions, scrollWidth);
  dataset_col_ed = luckysheet_searcharray(Store.visibleColPositions, scrollWidth + drawWidth);
  if (dataset_col_st == -1) {
    dataset_col_st = 0;
  }
  if (dataset_col_ed == -1) {
    dataset_col_ed = getMaxColIndex();
  }
  luckysheetTableContent.save();
  luckysheetTableContent.beginPath();
  luckysheetTableContent.rect(offsetLeft - 1, 0, drawWidth, Store.columnHeaderHeight - 1);
  luckysheetTableContent.clip();

  // console.log(offsetLeft, 0, drawWidth, Store.columnHeaderHeight -1);

  let end_c, start_c;
  let bodrder05 = 0.5; //Default 0.5
  let preEndC;
  for (let c = dataset_col_st; c <= dataset_col_ed; c++) {
    let _colPos = getColStartEnd(c, scrollWidth);
    start_c = _colPos.start_c;
    end_c = _colPos.end_c;

    //鑻ヨ秴鍑虹粯鍒跺尯鍩熺粓姝?
    // if(end_c > scrollWidth + drawWidth+1){
    //     break;
    // }
    let abc = chatatABC(c);
    //鍒楁爣棰樺崟鍏冩牸娓叉煋鍓嶈Е鍙戯紝return false 鍒欎笉娓叉煋璇ュ崟鍏冩牸
    if (!method.createHookFunction("columnTitleCellRenderBefore", abc, {
      c: c,
      left: start_c + offsetLeft - 1,
      width: end_c - start_c,
      height: Store.columnHeaderHeight - 1
    }, luckysheetTableContent)) {
      continue;
    }
    if (!isColHidden(c)) {
      luckysheetTableContent.fillStyle = "#ffffff";
      luckysheetTableContent.fillRect(start_c + offsetLeft - 1, 0, end_c - start_c, Store.columnHeaderHeight - 1);
      luckysheetTableContent.fillStyle = "#000000";

      //鍒楁爣棰樻爮搴忓垪鍙?
      luckysheetTableContent.save(); //save scale before draw text
      luckysheetTableContent.scale(Store.zoomRatio, Store.zoomRatio);
      let textMetrics = getMeasureText(abc, luckysheetTableContent);
      //luckysheetTableContent.measureText(abc);

      let horizonAlignPos = Math.round(start_c + (end_c - start_c) / 2 + offsetLeft - textMetrics.width / 2);
      let verticalAlignPos = Math.round(Store.columnHeaderHeight / 2);
      luckysheetTableContent.fillText(abc, horizonAlignPos / Store.zoomRatio, verticalAlignPos / Store.zoomRatio);
      luckysheetTableContent.restore(); //restore scale after draw text
    }

    //鍒楁爣棰樻爮绔栫嚎 vertical
    if (!isColHidden(c) && isColHidden(c + 1)) {
      luckysheetTableContent.beginPath();
      luckysheetTableContent.moveTo(end_c + offsetLeft - 4 + bodrder05, 0);
      luckysheetTableContent.lineTo(end_c + offsetLeft - 4 + bodrder05, Store.columnHeaderHeight - 2);
      resetCanvasStroke(luckysheetTableContent);
      luckysheetTableContent.closePath();
      luckysheetTableContent.stroke();
    } else if (!isColHidden(c)) {
      luckysheetTableContent.beginPath();
      luckysheetTableContent.moveTo(end_c + offsetLeft - 2 + bodrder05, 0);
      luckysheetTableContent.lineTo(end_c + offsetLeft - 2 + bodrder05, Store.columnHeaderHeight - 2);
      resetCanvasStroke(luckysheetTableContent);
      luckysheetTableContent.closePath();
      luckysheetTableContent.stroke();
    }
    if (isColHidden(c - 1) && preEndC != null) {
      luckysheetTableContent.beginPath();
      luckysheetTableContent.moveTo(preEndC + offsetLeft + bodrder05, 0);
      luckysheetTableContent.lineTo(preEndC + offsetLeft + bodrder05, Store.columnHeaderHeight - 2);
      // luckysheetTableContent.lineWidth = 1;
      // luckysheetTableContent.strokeStyle = luckysheetdefaultstyle.strokeStyle;
      luckysheetTableContent.closePath();
      luckysheetTableContent.stroke();
    }

    //horizen
    luckysheetTableContent.beginPath();
    luckysheetTableContent.moveTo(start_c + offsetLeft - 1, Store.columnHeaderHeight - 2 + bodrder05);
    luckysheetTableContent.lineTo(end_c + offsetLeft - 1, Store.columnHeaderHeight - 2 + bodrder05);
    // luckysheetTableContent.lineWidth = 1;

    // luckysheetTableContent.strokeStyle = luckysheetdefaultstyle.strokeStyle;
    luckysheetTableContent.stroke();
    luckysheetTableContent.closePath();
    preEndC = end_c;
    method.createHookFunction("columnTitleCellRenderAfter", abc, {
      c: c,
      left: start_c + offsetLeft - 1,
      width: end_c - start_c,
      height: Store.columnHeaderHeight - 1
    }, luckysheetTableContent);
  }

  //鍒楁爣棰樻爮妯嚎
  // luckysheetTableContent.beginPath();
  // luckysheetTableContent.moveTo(
  //     (offsetLeft - 1) ,
  //     (Store.columnHeaderHeight - 2 + 0.5)
  // );
  // luckysheetTableContent.lineTo(
  //     (Store.sheetWidth + offsetLeft - 2) ,
  //     (Store.columnHeaderHeight - 2 + 0.5)
  // );
  // luckysheetTableContent.lineWidth = 1;
  // luckysheetTableContent.strokeStyle = luckysheetdefaultstyle.strokeStyle;
  // luckysheetTableContent.closePath();
  // luckysheetTableContent.stroke();

  //娓呴櫎canvas宸︿笂瑙掑尯鍩?闃叉鍒楁爣棰樻爮搴忓垪鍙锋孩鍑烘樉绀?
  // luckysheetTableContent.clearRect(0, 0, Store.rowHeaderWidth , Store.columnHeaderHeight );

  // Must be restored twice, otherwise it will be enlarged under window.devicePixelRatio = 1.5
  luckysheetTableContent.restore();
  luckysheetTableContent.restore();
}
export { luckysheetDrawgridRowTitle, luckysheetDrawgridColumnTitle };