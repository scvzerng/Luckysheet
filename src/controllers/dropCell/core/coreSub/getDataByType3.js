

export function getDataByType3(_this, data, len, direction, dataType) {
  let applyData = [];
        //不带格式填充
        let dataArr = _this.getDataByType(data, len, direction, "1", dataType);
        applyData = _this.FillWithoutFormat(dataArr);
  return applyData;
}
