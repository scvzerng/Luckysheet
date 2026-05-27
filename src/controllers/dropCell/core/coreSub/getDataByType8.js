

export function getDataByType8(_this, data, len, direction, dataType) {
  let applyData = [];
        //以中文小写数字序列填充
        if (data.length == 1) {
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }
          applyData = _this.FillChnNumber(data, len, step);
        } else {
          let dataNumArr = [];
          for (let i = 0; i < data.length; i++) {
            dataNumArr.push(_this.ChineseToNumber(data[i]["m"]));
          }
          if (direction == "up" || direction == "left") {
            data.reverse();
            dataNumArr.reverse();
          }
          if (_this.isEqualDiff(dataNumArr)) {
            let step = dataNumArr[1] - dataNumArr[0];
            applyData = _this.FillChnNumber(data, len, step);
          } else {
            //不是等差数列，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
  return applyData;
}
