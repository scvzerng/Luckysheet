import { getObjType } from "../../utils/util";
import { isRealNull } from "../../global/validate";
import Store from "../../store";
function getNextIndex(direction, focusIndex, strIndex, endIndex) {
  let index = null;
  let stNull;
  if (direction == "down") {
    let stValue = Store.flowdata[strIndex][focusIndex];
    if (getObjType(stValue) == "object" && isRealNull(stValue.v)) {
      stNull = true;
    } else if (isRealNull(stValue)) {
      stNull = true;
    } else {
      stNull = false;
    }
    console.log(stNull, "stNull");
    let cellNull = [],
      i = 0;
    for (let r = strIndex + 1; r <= endIndex; r++) {
      let cell = Store.flowdata[r][focusIndex];
      if (getObjType(cell) == "object" && isRealNull(cell.v)) {
        cellNull.push(true);
      } else if (isRealNull(cell)) {
        cellNull.push(true);
      } else {
        cellNull.push(false);
      }
      if (cellNull.length == 1 && stNull == true && cellNull[i] == false) {
        index = strIndex + i + 1;
        break;
      } else if (cellNull.length > 1) {
        if (stNull && cellNull[i] == false) {
          //起始是空，找第一个有值的位置
          index = strIndex + i + 1;
          break;
        } else if (!stNull) {
          //起始有值，找一个有值的位置
          if (cellNull[i] == false && cellNull[i - 1] == true) {
            //前面为空
            index = strIndex + i + 1;
            break;
          } else if (cellNull[i] == true && cellNull[i - 1] == false) {
            //后面为空
            index = strIndex + i;
            break;
          }
        }
      }
      if (r == endIndex) {
        index = endIndex;
      }
      i++;
    }
  } else if (direction == "up") {
    let stValue = Store.flowdata[endIndex][focusIndex];
    if (getObjType(stValue) == "object" && isRealNull(stValue.v)) {
      stNull = true;
    } else if (isRealNull(stValue)) {
      stNull = true;
    } else {
      stNull = false;
    }
    let cellNull = [],
      i = 0;
    for (let r = endIndex - 1; r >= strIndex; r--) {
      let cell = Store.flowdata[r][focusIndex];
      if (getObjType(cell) == "object" && isRealNull(cell.v)) {
        cellNull.push(true);
      } else if (isRealNull(cell)) {
        cellNull.push(true);
      } else {
        cellNull.push(false);
      }
      if (cellNull.length == 1 && stNull && cellNull[i] == false) {
        index = endIndex - (i + 1);
        break;
      } else if (cellNull.length > 1) {
        if (stNull && cellNull[i] == false) {
          //起始是空，找第一个有值的位置
          index = endIndex - (i + 1);
          break;
        } else if (!stNull) {
          //起始有值，找一个有值的位置
          if (cellNull[i] == false && cellNull[i - 1] == true) {
            //前面为空
            index = endIndex - (i + 1);
            break;
          } else if (cellNull[i] == true && cellNull[i - 1] == false) {
            //后面为空
            index = endIndex - i;
            break;
          }
        }
      }
      if (r == strIndex) {
        index = strIndex;
      }
      i++;
    }
  } else if (direction == "right") {
    let stValue = Store.flowdata[focusIndex][strIndex];
    if (getObjType(stValue) == "object" && isRealNull(stValue.v)) {
      stNull = true;
    } else if (isRealNull(stValue)) {
      stNull = true;
    } else {
      stNull = false;
    }
    let cellNull = [],
      i = 0;
    for (let c = strIndex + 1; c <= endIndex; c++) {
      let cell = Store.flowdata[focusIndex][c];
      if (getObjType(cell) == "object" && isRealNull(cell.v)) {
        cellNull.push(true);
      } else if (isRealNull(cell)) {
        cellNull.push(true);
      } else {
        cellNull.push(false);
      }
      if (cellNull.length == 1 && stNull && cellNull[i] == false) {
        index = strIndex + i + 1;
        break;
      } else if (cellNull.length > 1) {
        if (stNull && cellNull[i] == false) {
          //起始是空，找第一个有值的位置
          index = strIndex + i + 1;
          break;
        } else if (!stNull) {
          //起始有值，找一个有值的位置
          if (cellNull[i] == false && cellNull[i - 1] == true) {
            //前面为空
            index = strIndex + i + 1;
            break;
          } else if (cellNull[i] == true && cellNull[i - 1] == false) {
            //后面为空
            index = strIndex + i;
            break;
          }
        }
      }
      if (c == endIndex) {
        index = endIndex;
      }
      i++;
    }
  } else if (direction == "left") {
    let stValue = Store.flowdata[focusIndex][endIndex];
    if (getObjType(stValue) == "object" && isRealNull(stValue.v)) {
      stNull = true;
    } else if (isRealNull(stValue)) {
      stNull = true;
    } else {
      stNull = false;
    }
    let cellNull = [],
      i = 0;
    for (let c = endIndex - 1; c >= strIndex; c--) {
      let cell = Store.flowdata[focusIndex][c];
      if (getObjType(cell) == "object" && isRealNull(cell.v)) {
        cellNull.push(true);
      } else if (isRealNull(cell)) {
        cellNull.push(true);
      } else {
        cellNull.push(false);
      }
      if (cellNull.length == 1 && stNull && cellNull[i] == false) {
        index = endIndex - (i + 1);
        break;
      } else if (cellNull.length > 1) {
        if (stNull && cellNull[i] == false) {
          //起始是空，找第一个有值的位置
          index = endIndex - (i + 1);
          break;
        } else if (!stNull) {
          //起始有值，找一个有值的位置
          if (cellNull[i] == false && cellNull[i - 1] == true) {
            //前面为空
            index = endIndex - (i + 1);
            break;
          } else if (cellNull[i] == true && cellNull[i - 1] == false) {
            //后面为空
            index = endIndex - i;
            break;
          }
        }
      }
      if (c == strIndex) {
        index = strIndex;
      }
      i++;
    }
  }
  return index;
}
export { getNextIndex };