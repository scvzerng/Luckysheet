import { genarate } from '../../../../global/format';
import dayjs from 'dayjs';

export function getDataByType5(_this, data, len, direction, dataType) {
  let applyData = [];
        //以工作日填充
        if (data.length == 1) {
          //以一天为step（若那天为休息日，则跳过）
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }
          let newLen = Math.round(len * 1.5);
          for (let i = 1; i <= newLen; i++) {
            let d = structuredClone(data[0]);
            let day = dayjs(d["m"]).add(i, "days").day();
            if (day == 0 || day == 6) {
              continue;
            }
            let date = dayjs(d["m"]).add(step * i, "days").format("YYYY-MM-DD");
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
            if (applyData.length == len) {
              break;
            }
          }
        } else if (data.length == 2) {
          if (dayjs(data[1]["m"]).date() == dayjs(data[0]["m"]).date() && dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months") != 0) {
            //日一样，且月差大于一月，以月差为step（若那天为休息日，则向前取最近的工作日）
            if (direction == "up" || direction == "left") {
              data.reverse();
            }
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = structuredClone(data[index]);
              let day = dayjs(data[data.length - 1]).add(step * i, "months").day(),
                date;
              if (day == 0) {
                date = dayjs(data[data.length - 1]).add(step * i, "months").subtract(2, "days").format("YYYY-MM-DD");
              } else if (day == 6) {
                date = dayjs(data[data.length - 1]).add(step * i, "months").subtract(1, "days").format("YYYY-MM-DD");
              } else {
                date = dayjs(data[data.length - 1]).add(step * i, "months").format("YYYY-MM-DD");
              }
              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          } else {
            //日不一样
            if (Math.abs(dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]))) > 7) {
              //若日差大于7天，以一月为step（若那天是休息日，则向前取最近的工作日）
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
                let day = dayjs(d["m"]).add(step, "days").day(),
                  date;
                if (day == 0) {
                  date = dayjs(d["m"]).add(step, "days").subtract(2, "days").format("YYYY-MM-DD");
                } else if (day == 6) {
                  date = dayjs(d["m"]).add(step, "days").subtract(1, "days").format("YYYY-MM-DD");
                } else {
                  date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
                }
                d["m"] = date;
                d["v"] = genarate(date)[2];
                applyData.push(d);
              }
            } else {
              //若日差小于等于7天，以7天为step（若那天是休息日，则向前取最近的工作日）
              let step_day;
              if (direction == "down" || direction == "right") {
                step_day = 7;
              } else if (direction == "up" || direction == "left") {
                step_day = -7;
                data.reverse();
              }
              let step; //以数组第一个为对比
              for (let i = 1; i <= len; i++) {
                let index = (i - 1) % data.length;
                let d = structuredClone(data[index]);
                let num = Math.ceil(i / data.length);
                if (index == 0) {
                  step = dayjs(d["m"]).add(step_day * num, "days").diff(dayjs(d["m"]), "days");
                }
                let day = dayjs(d["m"]).add(step, "days").day(),
                  date;
                if (day == 0) {
                  date = dayjs(d["m"]).add(step, "days").subtract(2, "days").format("YYYY-MM-DD");
                } else if (day == 6) {
                  date = dayjs(d["m"]).add(step, "days").subtract(1, "days").format("YYYY-MM-DD");
                } else {
                  date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
                }
                d["m"] = date;
                d["v"] = genarate(date)[2];
                applyData.push(d);
              }
            }
          }
        } else {
          let judgeDate = _this.judgeDate(data);
          if (judgeDate[0] && judgeDate[3]) {
            //日一样，且月差为等差数列，以月差为step（若那天为休息日，则向前取最近的工作日）
            if (direction == "up" || direction == "left") {
              data.reverse();
            }
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = structuredClone(data[index]);
              let day = dayjs(data[data.length - 1]["m"]).add(step * i, "months").day(),
                date;
              if (day == 0) {
                date = dayjs(data[data.length - 1]["m"]).add(step * i, "months").subtract(2, "days").format("YYYY-MM-DD");
              } else if (day == 6) {
                date = dayjs(data[data.length - 1]["m"]).add(step * i, "months").subtract(1, "days").format("YYYY-MM-DD");
              } else {
                date = dayjs(data[data.length - 1]["m"]).add(step * i, "months").format("YYYY-MM-DD");
              }
              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          } else if (!judgeDate[0] && judgeDate[2]) {
            //日不一样，且日差为等差数列
            if (Math.abs(dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]))) > 7) {
              //若日差大于7天，以一月为step（若那天是休息日，则向前取最近的工作日）
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
                let day = dayjs(d["m"]).add(step, "days").day(),
                  date;
                if (day == 0) {
                  date = dayjs(d["m"]).add(step, "days").subtract(2, "days").format("YYYY-MM-DD");
                } else if (day == 6) {
                  date = dayjs(d["m"]).add(step, "days").subtract(1, "days").format("YYYY-MM-DD");
                } else {
                  date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
                }
                d["m"] = date;
                d["v"] = genarate(date)[2];
                applyData.push(d);
              }
            } else {
              //若日差小于等于7天，以7天为step（若那天是休息日，则向前取最近的工作日）
              let step_day;
              if (direction == "down" || direction == "right") {
                step_day = 7;
              } else if (direction == "up" || direction == "left") {
                step_day = -7;
                data.reverse();
              }
              let step; //以数组第一个为对比
              for (let i = 1; i <= len; i++) {
                let index = (i - 1) % data.length;
                let d = structuredClone(data[index]);
                let num = Math.ceil(i / data.length);
                if (index == 0) {
                  step = dayjs(d["m"]).add(step_day * num, "days").diff(dayjs(d["m"]), "days");
                }
                let day = dayjs(d["m"]).add(step, "days").day(),
                  date;
                if (day == 0) {
                  date = dayjs(d["m"]).add(step, "days").subtract(2, "days").format("YYYY-MM-DD");
                } else if (day == 6) {
                  date = dayjs(d["m"]).add(step, "days").subtract(1, "days").format("YYYY-MM-DD");
                } else {
                  date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
                }
                d["m"] = date;
                d["v"] = genarate(date)[2];
                applyData.push(d);
              }
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
