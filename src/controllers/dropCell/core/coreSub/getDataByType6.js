import { genarate } from '../../../../global/format';
import dayjs from 'dayjs';

export function getDataByType6(_this, data, len, direction, dataType) {
  let applyData = [];
        //以月填充
        if (data.length == 1) {
          //以一月为step
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }
          applyData = _this.FillMonths(data, len, step);
        } else if (data.length == 2) {
          if (dayjs(data[1]["m"]).date() == dayjs(data[0]["m"]).date() && dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months") != 0) {
            //日一样，且月差大于一月，以月差为step
            if (direction == "up" || direction == "left") {
              data.reverse();
            }
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
            applyData = _this.FillMonths(data, len, step);
          } else {
            //以一月为step
            let step_month;
            if (direction == "down" || direction == "right") {
              step_month = 1;
            } else if (direction == "up" || direction == "left") {
              step_month = -1;
              data.reverse();
            }
            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = structuredClone(data[index]);
              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"]).add(step_month * num, "months").diff(dayjs(d["m"]), "days");
              }
              let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          }
        } else {
          let judgeDate = _this.judgeDate(data);
          if (judgeDate[0] && judgeDate[3]) {
            //日一样，且月差为等差数列，以月差为step
            if (direction == "up" || direction == "left") {
              data.reverse();
            }
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
            applyData = _this.FillMonths(data, len, step);
          } else if (!judgeDate[0] && judgeDate[2]) {
            //日不一样，且日差为等差数列，以一月为step
            let step_month;
            if (direction == "down" || direction == "right") {
              step_month = 1;
            } else if (direction == "up" || direction == "left") {
              step_month = -1;
              data.reverse();
            }
            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = structuredClone(data[index]);
              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"]).add(step_month * num, "months").diff(dayjs(d["m"]), "days");
              }
              let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          } else {
            //日差不是等差数列，复制数据
            if (direction == "up" || direction == "left") {
              data.reverse();
            }
            applyData = _this.FillCopy(data, len);
          }
        }
  return applyData;
}
