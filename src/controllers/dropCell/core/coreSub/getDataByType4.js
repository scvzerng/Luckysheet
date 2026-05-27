import dayjs from 'dayjs';

export function getDataByType4(_this, data, len, direction, dataType) {
  let applyData = [];
        //以天数填充
        if (data.length == 1) {
          //以一天为step
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }
          applyData = _this.FillDays(data, len, step);
        } else if (data.length == 2) {
          //以日差为step
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
          applyData = _this.FillDays(data, len, step);
        } else {
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          let judgeDate = _this.judgeDate(data);
          if (judgeDate[0] && judgeDate[3]) {
            //日一样，且月差为等差数列，以月差为step
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
            applyData = _this.FillMonths(data, len, step);
          } else if (!judgeDate[0] && judgeDate[2]) {
            //日不一样，且日差为等差数列，以日差为step
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
            applyData = _this.FillDays(data, len, step);
          } else {
            //日差不是等差数列，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
  return applyData;
}
