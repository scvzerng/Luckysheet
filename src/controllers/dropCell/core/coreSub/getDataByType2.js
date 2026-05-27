

export function getDataByType2(_this, data, len, direction, dataType) {
  let applyData = [];
        //仅填充格式
        if (direction == "up" || direction == "left") {
          data.reverse();
        }
        applyData = _this.FillOnlyFormat(data, len);
  return applyData;
}
