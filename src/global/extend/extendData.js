import editor from "../editor";
import {  jfrefreshgrid_rhcw  } from "../refresh";
import {  datagridgrowth } from "../getdata";
import { setcellvalue } from "../setdata";
import { getSheetIndex } from "../../methods/get";
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
  let d = editor.deepCopyFlowData(Store.flowdata);
  let cfg = $.extend(true, {}, Store.config);
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
      cfg["merge"][v.mc.r + "_" + v.mc.c] = $.extend(true, {}, v.mc);
    }
  }

  //luckysheet.flowdata
  Store.flowdata = d;
  editor.webWorkerFlowDataCache(Store.flowdata); //worker存数据
  Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].data = d;

  //config
  Store.config = cfg;
  Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

  //行高、列宽刷新
  jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
}

//删除行列
export { luckysheetextendData };