import dayjs from 'dayjs';

//选区下拉
const mathUtilsModule = {
  isEqualDiff: function (arr) {
    let diff = true;
    let step = arr[1] - arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] - arr[i - 1] != step) {
        diff = false;
        break;
      }
    }
    return diff;
  },
  isEqualRatio: function (arr) {
    let ratio = true;
    let step = arr[1] / arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] / arr[i - 1] != step) {
        ratio = false;
        break;
      }
    }
    return ratio;
  },
  getXArr: function (len) {
    let xArr = [];
    for (let i = 1; i <= len; i++) {
      xArr.push(i);
    }
    return xArr;
  },
  forecast: function (x, yArr, xArr) {
    function getAverage(arr) {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
      }
      return sum / arr.length;
    }
    let ax = getAverage(xArr); //x数组 平均值
    let ay = getAverage(yArr); //y数组 平均值

    let sum_d = 0,
      sum_n = 0;
    for (let j = 0; j < xArr.length; j++) {
      //分母和
      sum_d += (xArr[j] - ax) * (yArr[j] - ay);
      //分子和
      sum_n += (xArr[j] - ax) * (xArr[j] - ax);
    }
    let b;
    if (sum_n == 0) {
      b = 1;
    } else {
      b = sum_d / sum_n;
    }
    let a = ay - b * ax;
    return Math.round((a + b * x) * 100000) / 100000;
  },
  judgeDate: function (data) {
    let isSameDay = true,
      isSameMonth = true,
      isEqualDiffDays = true,
      isEqualDiffMonths = true,
      isEqualDiffYears = true;
    let sameDay = dayjs(data[0]["m"]).date(),
      sameMonth = dayjs(data[0]["m"]).month();
    let equalDiffDays = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
    let equalDiffMonths = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
    let equalDiffYears = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years");
    for (let i = 1; i < data.length; i++) {
      //日是否一样
      if (dayjs(data[i]["m"]).date() != sameDay) {
        isSameDay = false;
      }
      //月是否一样
      if (dayjs(data[i]["m"]).month() != sameMonth) {
        isSameMonth = false;
      }
      //日差是否是 等差数列
      if (dayjs(data[i]["m"]).diff(dayjs(data[i - 1]["m"]), "days") != equalDiffDays) {
        isEqualDiffDays = false;
      }
      //月差是否是 等差数列
      if (dayjs(data[i]["m"]).diff(dayjs(data[i - 1]["m"]), "months") != equalDiffMonths) {
        isEqualDiffMonths = false;
      }
      //年差是否是 等差数列
      if (dayjs(data[i]["m"]).diff(dayjs(data[i - 1]["m"]), "years") != equalDiffYears) {
        isEqualDiffYears = false;
      }
    }
    if (equalDiffDays == 0) {
      isEqualDiffDays = false;
    }
    if (equalDiffMonths == 0) {
      isEqualDiffMonths = false;
    }
    if (equalDiffYears == 0) {
      isEqualDiffYears = false;
    }
    return [isSameDay, isSameMonth, isEqualDiffDays, isEqualDiffMonths, isEqualDiffYears];
  }
};
export default mathUtilsModule;