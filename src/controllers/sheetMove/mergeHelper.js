import { getObjType } from "../../utils/util";
import formula from "../../global/formula";
import { isRealNull } from "../../global/validate";
import { countfunc } from "../../global/count";
import menuButton from "../menuButton";
import { selectHightlightShow } from "../select";
import Store from "../../store";
//shift + 方向键 / ctrl + shift + 方向键 功能
function rowHasMerge(r, c1, c2) {
  let rowHasMerge = false;
  for (let c = c1; c <= c2; c++) {
    let cell = Store.flowdata[r][c];
    if (getObjType(cell) == "object" && "mc" in cell) {
      rowHasMerge = true;
      break;
    }
  }
  return rowHasMerge;
}
function colHasMerge(c, r1, r2) {
  let colHasMerge = false;
  for (let r = r1; r <= r2; r++) {
    let cell = Store.flowdata[r][c];
    if (getObjType(cell) == "object" && "mc" in cell) {
      colHasMerge = true;
      break;
    }
  }
  return colHasMerge;
}
function getRowMerge(rIndex, c1, c2) {
  let r1 = 0,
    r2 = Store.flowdata.length - 1;
  let str = null;
  if (rIndex > r1) {
    for (let r = rIndex; r >= r1; r--) {
      for (let c = c1; c <= c2; c++) {
        let cell = Store.flowdata[r][c];
        if (getObjType(cell) == "object" && "mc" in cell) {
          let mc = Store.config["merge"][cell["mc"].r + "_" + cell["mc"].c];
          if (str == null || mc.r < str) {
            str = mc.r;
          }
        }
      }
      if (rowHasMerge(str - 1, c1, c2) && str > r1) {
        r = str;
      } else {
        break;
      }
    }
  } else {
    str = r1;
  }
  let end = null;
  if (rIndex < r2) {
    for (let r = rIndex; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        let cell = Store.flowdata[r][c];
        if (getObjType(cell) == "object" && "mc" in cell) {
          let mc = Store.config["merge"][cell["mc"].r + "_" + cell["mc"].c];
          if (end == null || mc.r + mc.rs - 1 > end) {
            end = mc.r + mc.rs - 1;
          }
        }
      }
      if (rowHasMerge(end + 1, c1, c2) && end < r2) {
        r = end;
      } else {
        break;
      }
    }
  } else {
    end = r2;
  }
  return [str, end];
}
function getColMerge(cIndex, r1, r2) {
  let c1 = 0,
    c2 = Store.flowdata[0].length - 1;
  let str = null;
  if (cIndex > c1) {
    for (let c = cIndex; c >= c1; c--) {
      for (let r = r1; r <= r2; r++) {
        let cell = Store.flowdata[r][c];
        if (getObjType(cell) == "object" && "mc" in cell) {
          let mc = Store.config["merge"][cell["mc"].r + "_" + cell["mc"].c];
          if (str == null || mc.c < str) {
            str = mc.c;
          }
        }
      }
      if (colHasMerge(str - 1, r1, r2) && str > c1) {
        c = str;
      } else {
        break;
      }
    }
  } else {
    str = c1;
  }
  let end = null;
  if (cIndex < c2) {
    for (let c = cIndex; c <= c2; c++) {
      for (let r = r1; r <= r2; r++) {
        let cell = Store.flowdata[r][c];
        if (getObjType(cell) == "object" && "mc" in cell) {
          let mc = Store.config["merge"][cell["mc"].r + "_" + cell["mc"].c];
          if (end == null || mc.c + mc.cs - 1 > end) {
            end = mc.c + mc.cs - 1;
          }
        }
      }
      if (colHasMerge(end + 1, r1, r2) && end < c2) {
        c = end;
      } else {
        break;
      }
    }
  } else {
    end = c2;
  }
  return [str, end];
}
export { rowHasMerge, colHasMerge, getRowMerge, getColMerge };