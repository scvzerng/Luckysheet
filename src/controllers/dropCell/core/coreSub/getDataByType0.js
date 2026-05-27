

export function getDataByType0(_this, data, len, direction, dataType) {
  let applyData = [];
        //复制单元格
        if (direction == "up" || direction == "left") {
          data.reverse();
        }
        applyData = _this.FillCopy(data, len);
  return applyData;
}
