import dayjs from 'dayjs';

export function getDataByType1(_this, data, len, direction, dataType) {
  let applyData = [];
        //填充序列
        if (dataType == "number") {
          //数据类型是 数字
          applyData = _this.FillSeries(data, len, direction);
        } else if (dataType == "extendNumber") {
          //扩展数字
          if (data.length == 1) {
            let step;
            if (direction == "down" || direction == "right") {
              step = 1;
            } else if (direction == "up" || direction == "left") {
              step = -1;
            }
            applyData = _this.FillExtendNumber(data, len, step);
          } else {
            let dataNumArr = [];
            for (let i = 0; i < data.length; i++) {
              let txt = data[i]["m"];
              dataNumArr.push(Number(_this.isExtendNumber(txt)[1]));
            }
            if (direction == "up" || direction == "left") {
              data.reverse();
              dataNumArr.reverse();
            }
            if (_this.isEqualDiff(dataNumArr)) {
              //等差数列，以等差为step
              let step = dataNumArr[1] - dataNumArr[0];
              applyData = _this.FillExtendNumber(data, len, step);
            } else {
              //不是等差数列，复制数据
              applyData = _this.FillCopy(data, len);
            }
          }
        } else if (dataType == "date") {
          //数据类型是 日期
          if (data.length == 1) {
            //以一天为step
            let step;
            if (direction == "down" || direction == "right") {
              step = 1;
            } else if (direction == "up" || direction == "left") {
              step = -1;
            }
            applyData = _this.FillDays(data, len, step);
          } else {
            if (direction == "up" || direction == "left") {
              data.reverse();
            }
            let judgeDate = _this.judgeDate(data);
            if (judgeDate[0] && judgeDate[3]) {
              //日一样，月差为等差数列，以月差为step
              let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
              applyData = _this.FillMonths(data, len, step);
            } else if (!judgeDate[0] && judgeDate[2]) {
              //日不一样，日差为等差数列，以日差为step
              let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
              applyData = _this.FillDays(data, len, step);
            } else {
              //其它，复制数据
              applyData = _this.FillCopy(data, len);
            }
          }
        } else if (dataType == "chnNumber") {
          //数据类型是 中文小写数字
          if (data.length == 1) {
            if (data[0]["m"] == "日" || _this.ChineseToNumber(data[0]["m"]) < 7) {
              //数字小于7，以周一~周日序列填充
              let step;
              if (direction == "down" || direction == "right") {
                step = 1;
              } else if (direction == "up" || direction == "left") {
                step = -1;
              }
              applyData = _this.FillChnWeek(data, len, step);
            } else {
              //数字大于7，以中文小写数字序列填充
              let step;
              if (direction == "down" || direction == "right") {
                step = 1;
              } else if (direction == "up" || direction == "left") {
                step = -1;
              }
              applyData = _this.FillChnNumber(data, len, step);
            }
          } else {
            let hasweek = false;
            for (let i = 0; i < data.length; i++) {
              if (data[i]["m"] == "日") {
                hasweek = true;
                break;
              }
            }
            let dataNumArr = [];
            let weekIndex = 0;
            for (let i = 0; i < data.length; i++) {
              if (data[i]["m"] == "日") {
                if (i == 0) {
                  dataNumArr.push(0);
                } else {
                  weekIndex++;
                  dataNumArr.push(weekIndex * 7);
                }
              } else if (hasweek && _this.ChineseToNumber(data[i]["m"]) > 0 && _this.ChineseToNumber(data[i]["m"]) < 7) {
                dataNumArr.push(_this.ChineseToNumber(data[i]["m"]) + weekIndex * 7);
              } else {
                dataNumArr.push(_this.ChineseToNumber(data[i]["m"]));
              }
            }
            if (direction == "up" || direction == "left") {
              data.reverse();
              dataNumArr.reverse();
            }
            if (_this.isEqualDiff(dataNumArr)) {
              if (hasweek || dataNumArr[dataNumArr.length - 1] < 6 && dataNumArr[0] > 0 || dataNumArr[0] < 6 && dataNumArr[dataNumArr.length - 1] > 0) {
                //以周一~周日序列填充
                let step = dataNumArr[1] - dataNumArr[0];
                applyData = _this.FillChnWeek(data, len, step);
              } else {
                //以中文小写数字序列填充
                let step = dataNumArr[1] - dataNumArr[0];
                applyData = _this.FillChnNumber(data, len, step);
              }
            } else {
              //不是等差数列，复制数据
              applyData = _this.FillCopy(data, len);
            }
          }
        } else if (dataType == "chnWeek2") {
          //周一~周日
          if (data.length == 1) {
            let step;
            if (direction == "down" || direction == "right") {
              step = 1;
            } else if (direction == "up" || direction == "left") {
              step = -1;
            }
            applyData = _this.FillChnWeek2(data, len, step);
          } else {
            let dataNumArr = [];
            let weekIndex = 0;
            for (let i = 0; i < data.length; i++) {
              let lastTxt = data[i]["m"].substr(data[i]["m"].length - 1, 1);
              if (data[i]["m"] == "周日") {
                if (i == 0) {
                  dataNumArr.push(0);
                } else {
                  weekIndex++;
                  dataNumArr.push(weekIndex * 7);
                }
              } else {
                dataNumArr.push(_this.ChineseToNumber(lastTxt) + weekIndex * 7);
              }
            }
            if (direction == "up" || direction == "left") {
              data.reverse();
              dataNumArr.reverse();
            }
            if (_this.isEqualDiff(dataNumArr)) {
              //等差数列，以等差为step
              let step = dataNumArr[1] - dataNumArr[0];
              applyData = _this.FillChnWeek2(data, len, step);
            } else {
              //不是等差数列，复制数据
              applyData = _this.FillCopy(data, len);
            }
          }
        } else if (dataType == "chnWeek3") {
          //星期一~星期日
          if (data.length == 1) {
            let step;
            if (direction == "down" || direction == "right") {
              step = 1;
            } else if (direction == "up" || direction == "left") {
              step = -1;
            }
            applyData = _this.FillChnWeek3(data, len, step);
          } else {
            let dataNumArr = [];
            let weekIndex = 0;
            for (let i = 0; i < data.length; i++) {
              let lastTxt = data[i]["m"].substr(data[i]["m"].length - 1, 1);
              if (data[i]["m"] == "星期日") {
                if (i == 0) {
                  dataNumArr.push(0);
                } else {
                  weekIndex++;
                  dataNumArr.push(weekIndex * 7);
                }
              } else {
                dataNumArr.push(_this.ChineseToNumber(lastTxt) + weekIndex * 7);
              }
            }
            if (direction == "up" || direction == "left") {
              data.reverse();
              dataNumArr.reverse();
            }
            if (_this.isEqualDiff(dataNumArr)) {
              //等差数列，以等差为step
              let step = dataNumArr[1] - dataNumArr[0];
              applyData = _this.FillChnWeek3(data, len, step);
            } else {
              //不是等差数列，复制数据
              applyData = _this.FillCopy(data, len);
            }
          }
        } else {
          //数据类型是 其它
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          applyData = _this.FillCopy(data, len);
        }
  return applyData;
}
