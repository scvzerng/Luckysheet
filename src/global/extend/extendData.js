import editor from "../editor";
import {  jfrefreshgrid_rhcw  } from "../refresh";
import {  datagridgrowth } from "../getdata";
import { setcellvalue } from "../setdata";
import { syncConfigToStore, syncDataToStore, getDataSize } from "../../utils/storeAccess.js";
import Store from "../../store";

/**
 * 增加行列
 * @param {string} type 行或列 ['row', 'column'] 之一
 * @param {number} index 插入的位置 index
 * @param {number} value 插入 多少 行（列）
 * @param {string} direction 哪个方向插入 ['lefttop','rightbottom'] 之一
 * @param {string | number} sheetIndex 操作的 sheet 的 index 属性
 * @returns
 */

function luckysheetextendData(rowlen, newData) {
  let d = editor.deepCopyFlowData(Store.sheetData);
  let cfg = structuredClone(Store.config);
  if (cfg["merge"] == null) {
    cfg["merge"] = {};
  }
  let collen = d[0].length;
  let addNullData = datagridgrowth([], rowlen, collen);
  d = d.concat(addNullData);
  for (let i = 0; i < newData.length; i++) {
    let r = newData[i].r,
      c = newData[i].c,
      v = newData[i].v;
    setcellvalue(r, c, d, v);
    if (v != null && v.mc != null && v.mc.rs != null) {
      cfg["merge"][v.mc.r + "_" + v.mc.c] = structuredClone(v.mc);
    }
  }

  //luckysheet.flowdata
  Store.sheetData = d;
  editor.webWorkerFlowDataCache(Store.sheetData);
  syncDataToStore();

  //config
  Store.config = cfg;
  syncConfigToStore();

  //行高、列宽刷新
  let _dataSize = getDataSize();
  jfrefreshgrid_rhcw(_dataSize.rowCount, _dataSize.colCount);
}

//删除行列
export { luckysheetextendData };