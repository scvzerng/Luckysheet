import { genarate } from '../../../../global/format';
import dayjs from 'dayjs';

export function getDataByType7(_this, data, len, direction, dataType) {
  let applyData = [];
        //以年填充
        if (data.length == 1) {
          //以一年为step
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }
          applyData = _this.FillYears(data, len, step);
        } else if (data.length == 2) {
          if (dayjs(data[1]["m"]).date() == dayjs(data[0]["m"]).date() && dayjs(data[1]["m"]).month() == dayjs(data[0]["m"]).month() && dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years") != 0) {
            //日月一样，且年差大于一年，以年差为step
            if (direction == "up" || direction == "left") {
              data.reverse();
            }
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years");
            applyData = _this.FillYears(data, len, step);
          } else {
            //以一年为step
            let step_year;
            if (direction == "down" || direction == "right") {
              step_year = 1;
            } else if (direction == "up" || direction == "left") {
              step_year = -1;
              data.reverse();
            }
            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = $.extend(true, {}, data[index]);
              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"]).add(step_year * num, "years").diff(dayjs(d["m"]), "days");
              }
              let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          }
        } else {
          let judgeDate = _this.judgeDate(data);
          if (judgeDate[0] && judgeDate[1] && judgeDate[4]) {
            //日月一样，且年差为等差数列，以年差为step
            if (direction == "up" || direction == "left") {
              data.reverse();
            }
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years");
            applyData = _this.FillYears(data, len, step);
          } else if (judgeDate[0] && judgeDate[3] || judgeDate[2]) {
            //日一样且月差为等差数列，或天差为等差数列，以一年为step
            let step_year;
            if (direction == "down" || direction == "right") {
              step_year = 1;
            } else if (direction == "up" || direction == "left") {
              step_year = -1;
              data.reverse();
            }
            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = $.extend(true, {}, data[index]);
              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"]).add(step_year * num, "years").diff(dayjs(d["m"]), "days");
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
