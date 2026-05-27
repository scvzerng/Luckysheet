import luckysheetConfigsetting from "../../../controllers/luckysheetConfigsetting";
import { luckysheet_getcelldata, luckysheet_parseData, luckysheet_getValue, luckysheet_calcADPMM } from "../../func";
import { inverse } from "../../matrix_methods";
import { getSheetIndex, getluckysheetfile, getRangetxt } from "../../../methods/get";
import menuButton from "../../../controllers/menuButton";
import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import editor from "../../../global/editor";
import { isdatetime, diff, isdatatype } from "../../../global/datecontroll";
import { isRealNum, isRealNull, valueIsError, error } from "../../../global/validate";
import { jfrefreshgrid, jfrefreshgridall } from "../../../global/refresh";
import { genarate, update } from "../../../global/format";
import { orderbydata } from "../../../global/sort";
import { getcellvalue, datagridgrowth } from "../../../global/getdata";
import { getObjType, ABCatNum, chatatABC, numFormat } from "../../../utils/util";
import Store from "../../../store";
import dayjs from 'dayjs';
import numeral from 'numeral';
import { getAirTable, companyTargetData, companyTargetData10, companyTargetData11, companyTargetData12, excelToLuckyArray, excelToArray, askAIData } from "../../../demoData/getTargetData";
import { setcellvalue } from "../../../global/setdata";
import jStat from 'jstat';

const statisticalDistribution = {
  "HYPGEOMDIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //样本中成功的次数
      var sample_s = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(sample_s)) {
        return sample_s;
      }
      if (!isRealNum(sample_s)) {
        return formula.error.v;
      }
      sample_s = parseInt(sample_s);

      //样本量
      var number_sample = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(number_sample)) {
        return number_sample;
      }
      if (!isRealNum(number_sample)) {
        return formula.error.v;
      }
      number_sample = parseInt(number_sample);

      //总体中成功的次数
      var population_s = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(population_s)) {
        return population_s;
      }
      if (!isRealNum(population_s)) {
        return formula.error.v;
      }
      population_s = parseInt(population_s);

      //总体大小
      var number_pop = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(number_pop)) {
        return number_pop;
      }
      if (!isRealNum(number_pop)) {
        return formula.error.v;
      }
      number_pop = parseInt(number_pop);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[4]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (sample_s < 0 || sample_s > Math.min(number_sample, population_s) || sample_s < Math.max(0, number_sample - number_pop + population_s)) {
        return formula.error.nm;
      }
      if (number_sample <= 0 || number_sample > number_pop) {
        return formula.error.nm;
      }
      if (population_s <= 0 || population_s > number_pop) {
        return formula.error.nm;
      }
      if (number_pop <= 0) {
        return formula.error.nm;
      }

      //计算
      function pdf(x, n, M, N) {
        var a = func_methods.factorial(M) / (func_methods.factorial(x) * func_methods.factorial(M - x));
        var b = func_methods.factorial(N - M) / (func_methods.factorial(n - x) * func_methods.factorial(N - M - n + x));
        var c = func_methods.factorial(N) / (func_methods.factorial(n) * func_methods.factorial(N - n));
        return a * b / c;
      }
      function cdf(x, n, M, N) {
        var sum = 0;
        for (var i = 0; i <= x; i++) {
          sum += pdf(i, n, M, N);
        }
        return sum;
      }
      return cumulative ? cdf(sample_s, number_sample, population_s, number_pop) : pdf(sample_s, number_sample, population_s, number_pop);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "WEIBULL_DIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //WEIBULL 分布函数的输入值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //Weibull 分布函数的形状参数
      var alpha = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(alpha)) {
        return alpha;
      }
      if (!isRealNum(alpha)) {
        return formula.error.v;
      }
      alpha = parseFloat(alpha);

      //Weibull 分布函数的尺度参数
      var beta = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(beta)) {
        return beta;
      }
      if (!isRealNum(beta)) {
        return formula.error.v;
      }
      beta = parseFloat(beta);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (x < 0 || alpha <= 0 || beta <= 0) {
        return formula.error.nm;
      }
      return cumulative ? 1 - Math.exp(-Math.pow(x / beta, alpha)) : Math.pow(x, alpha - 1) * Math.exp(-Math.pow(x / beta, alpha)) * alpha / Math.pow(beta, alpha);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "BINOM_DIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //试验的成功次数
      var number_s = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number_s)) {
        return number_s;
      }
      if (!isRealNum(number_s)) {
        return formula.error.v;
      }
      number_s = parseInt(number_s);

      //独立检验的次数
      var trials = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(trials)) {
        return trials;
      }
      if (!isRealNum(trials)) {
        return formula.error.v;
      }
      trials = parseInt(trials);

      //任一给定检验的成功概率
      var probability_s = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(probability_s)) {
        return probability_s;
      }
      if (!isRealNum(probability_s)) {
        return formula.error.v;
      }
      probability_s = parseFloat(probability_s);

      //是否使用二项式累积分布
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (number_s < 0 || number_s > trials) {
        return formula.error.nm;
      }
      if (probability_s < 0 || probability_s > 1) {
        return formula.error.nm;
      }
      return cumulative ? jStat.binomial.cdf(number_s, trials, probability_s) : jStat.binomial.pdf(number_s, trials, probability_s);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "BINOM_INV": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //贝努利试验次数
      var trials = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(trials)) {
        return trials;
      }
      if (!isRealNum(trials)) {
        return formula.error.v;
      }
      trials = parseInt(trials);

      //任一次给定检验的成功概率
      var probability_s = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(probability_s)) {
        return probability_s;
      }
      if (!isRealNum(probability_s)) {
        return formula.error.v;
      }
      probability_s = parseFloat(probability_s);

      //期望的临界概率
      var alpha = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(alpha)) {
        return alpha;
      }
      if (!isRealNum(alpha)) {
        return formula.error.v;
      }
      alpha = parseFloat(alpha);
      if (trials < 0) {
        return formula.error.nm;
      }
      if (probability_s < 0 || probability_s > 1) {
        return formula.error.nm;
      }
      if (alpha < 0 || alpha > 1) {
        return formula.error.nm;
      }

      //计算
      var x = 0;
      while (x <= trials) {
        if (jStat.binomial.cdf(x, trials, probability_s) >= alpha) {
          return x;
        }
        x++;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CONFIDENCE_NORM": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //置信水平
      var alpha = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(alpha)) {
        return alpha;
      }
      if (!isRealNum(alpha)) {
        return formula.error.v;
      }
      alpha = parseFloat(alpha);

      //数据区域的总体标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        return formula.error.v;
      }
      standard_dev = parseFloat(standard_dev);

      //样本总量的大小
      var size = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(size)) {
        return size;
      }
      if (!isRealNum(size)) {
        return formula.error.v;
      }
      size = parseInt(size);
      if (alpha <= 0 || alpha >= 1) {
        return formula.error.nm;
      }
      if (standard_dev <= 0) {
        return formula.error.nm;
      }
      if (size < 1) {
        return formula.error.nm;
      }
      return jStat.normalci(1, alpha, standard_dev, size)[1] - 1;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "EXPON_DIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //指数分布函数的输入值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //用于指定指数分布函数的 lambda 值
      var lambda = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(lambda)) {
        return lambda;
      }
      if (!isRealNum(lambda)) {
        return formula.error.v;
      }
      lambda = parseFloat(lambda);

      //是否使用指数累积分布
      var cumulative = func_methods.getCellBoolen(arguments[2]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (x < 0) {
        return formula.error.nm;
      }
      if (lambda < 0) {
        return formula.error.nm;
      }
      return cumulative ? jStat.exponential.cdf(x, lambda) : jStat.exponential.pdf(x, lambda);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NORM_S_INV": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //对应于正态分布的概率
      var probability = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(probability)) {
        return probability;
      }
      if (!isRealNum(probability)) {
        return formula.error.v;
      }
      probability = parseFloat(probability);
      if (probability <= 0 || probability >= 1) {
        return formula.error.nm;
      }
      return jStat.normal.inv(probability, 0, 1);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NORM_S_DIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //需要计算其分布的数值
      var z = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(z)) {
        return z;
      }
      if (!isRealNum(z)) {
        return formula.error.v;
      }
      z = parseFloat(z);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[1]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      return cumulative ? jStat.normal.cdf(z, 0, 1) : jStat.normal.pdf(z, 0, 1);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NORM_INV": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //对应于正态分布的概率
      var probability = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(probability)) {
        return probability;
      }
      if (!isRealNum(probability)) {
        if (getObjType(probability) == "boolean") {
          if (probability.toString().toLowerCase() == "true") {
            probability = 1;
          } else if (probability.toString().toLowerCase() == "false") {
            probability = 0;
          }
        } else {
          return formula.error.v;
        }
      }
      probability = parseFloat(probability);

      //分布的算术平均值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        if (getObjType(mean) == "boolean") {
          if (mean.toString().toLowerCase() == "true") {
            mean = 1;
          } else if (mean.toString().toLowerCase() == "false") {
            mean = 0;
          }
        } else {
          return formula.error.v;
        }
      }
      mean = parseFloat(mean);

      //分布的标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        if (getObjType(standard_dev) == "boolean") {
          if (standard_dev.toString().toLowerCase() == "true") {
            standard_dev = 1;
          } else if (standard_dev.toString().toLowerCase() == "false") {
            standard_dev = 0;
          }
        } else {
          return formula.error.v;
        }
      }
      standard_dev = parseFloat(standard_dev);
      if (probability <= 0 || probability >= 1) {
        return formula.error.nm;
      }
      if (standard_dev <= 0) {
        return formula.error.nm;
      }

      //计算
      return jStat.normal.inv(probability, mean, standard_dev);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NORM_DIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //需要计算其分布的数值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        if (getObjType(x) == "boolean") {
          if (x.toString().toLowerCase() == "true") {
            x = 1;
          } else if (x.toString().toLowerCase() == "false") {
            x = 0;
          }
        } else {
          return formula.error.v;
        }
      }
      x = parseFloat(x);

      //分布的算术平均值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        return formula.error.v;
      }
      mean = parseFloat(mean);

      //分布的标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        return formula.error.v;
      }
      standard_dev = parseFloat(standard_dev);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (standard_dev <= 0) {
        return formula.error.nm;
      }
      return cumulative ? jStat.normal.cdf(x, mean, standard_dev) : jStat.normal.pdf(x, mean, standard_dev);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NEGBINOM_DIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //要模拟的失败次数
      var number_f = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number_f)) {
        return number_f;
      }
      if (!isRealNum(number_f)) {
        return formula.error.v;
      }
      number_f = parseInt(number_f);

      //要模拟的成功次数
      var number_s = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(number_s)) {
        return number_s;
      }
      if (!isRealNum(number_s)) {
        return formula.error.v;
      }
      number_s = parseInt(number_s);

      //任一次给定检验的成功概率
      var probability_s = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(probability_s)) {
        return probability_s;
      }
      if (!isRealNum(probability_s)) {
        return formula.error.v;
      }
      probability_s = parseFloat(probability_s);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (probability_s < 0 || probability_s > 1) {
        return formula.error.nm;
      }
      if (number_f < 0 || number_s < 1) {
        return formula.error.nm;
      }
      return cumulative ? jStat.negbin.cdf(number_f, number_s, probability_s) : jStat.negbin.pdf(number_f, number_s, probability_s);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LOGNORM_INV": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //与对数分布相关的概率
      var probability = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(probability)) {
        return probability;
      }
      if (!isRealNum(probability)) {
        return formula.error.v;
      }
      probability = parseFloat(probability);

      //ln(x) 的平均值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        return formula.error.v;
      }
      mean = parseFloat(mean);

      //ln(x) 的标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        return formula.error.v;
      }
      standard_dev = parseFloat(standard_dev);
      if (probability <= 0 || probability >= 1) {
        return formula.error.nm;
      }
      if (standard_dev <= 0) {
        return formula.error.nm;
      }
      return jStat.lognormal.inv(probability, mean, standard_dev);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LOGNORM_DIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //与对数分布相关的概率
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //ln(x) 的平均值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        return formula.error.v;
      }
      mean = parseFloat(mean);

      //ln(x) 的标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        return formula.error.v;
      }
      standard_dev = parseFloat(standard_dev);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (x <= 0 || standard_dev <= 0) {
        return formula.error.nm;
      }
      return cumulative ? jStat.lognormal.cdf(x, mean, standard_dev) : jStat.lognormal.pdf(x, mean, standard_dev);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "POISSON_DIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //事件数
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseInt(x);

      //期望值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        return formula.error.v;
      }
      mean = parseFloat(mean);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[2]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (x < 0 || mean < 0) {
        return formula.error.nm;
      }
      return cumulative ? jStat.poisson.cdf(x, mean) : jStat.poisson.pdf(x, mean);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "T_DIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //T-分布函数的输入
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //自由度数值
      var degrees_freedom = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(degrees_freedom)) {
        return degrees_freedom;
      }
      if (!isRealNum(degrees_freedom)) {
        return formula.error.v;
      }
      degrees_freedom = parseInt(degrees_freedom);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[2]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (degrees_freedom < 1) {
        return formula.error.nm;
      }
      return cumulative ? jStat.studentt.cdf(x, degrees_freedom) : jStat.studentt.pdf(x, degrees_freedom);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "T_DIST_2T": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //T-分布函数的输入
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //自由度数值
      var degrees_freedom = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(degrees_freedom)) {
        return degrees_freedom;
      }
      if (!isRealNum(degrees_freedom)) {
        return formula.error.v;
      }
      degrees_freedom = parseInt(degrees_freedom);
      if (x < 0 || degrees_freedom < 1) {
        return formula.error.nm;
      }
      return (1 - jStat.studentt.cdf(x, degrees_freedom)) * 2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "T_DIST_RT": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //T-分布函数的输入
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //自由度数值
      var degrees_freedom = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(degrees_freedom)) {
        return degrees_freedom;
      }
      if (!isRealNum(degrees_freedom)) {
        return formula.error.v;
      }
      degrees_freedom = parseInt(degrees_freedom);
      if (degrees_freedom < 1) {
        return formula.error.nm;
      }
      return 1 - jStat.studentt.cdf(x, degrees_freedom);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "T_INV": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //与学生的 t 分布相关的概率
      var probability = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(probability)) {
        return probability;
      }
      if (!isRealNum(probability)) {
        return formula.error.v;
      }
      probability = parseFloat(probability);

      //自由度数值
      var deg_freedom = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(deg_freedom)) {
        return deg_freedom;
      }
      if (!isRealNum(deg_freedom)) {
        return formula.error.v;
      }
      deg_freedom = parseInt(deg_freedom);
      if (probability <= 0 || probability > 1) {
        return formula.error.nm;
      }
      if (deg_freedom < 1) {
        return formula.error.nm;
      }
      return jStat.studentt.inv(probability, deg_freedom);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "T_INV_2T": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //与学生的 t 分布相关的概率
      var probability = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(probability)) {
        return probability;
      }
      if (!isRealNum(probability)) {
        return formula.error.v;
      }
      probability = parseFloat(probability);

      //自由度数值
      var deg_freedom = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(deg_freedom)) {
        return deg_freedom;
      }
      if (!isRealNum(deg_freedom)) {
        return formula.error.v;
      }
      deg_freedom = parseInt(deg_freedom);
      if (probability <= 0 || probability > 1) {
        return formula.error.nm;
      }
      if (deg_freedom < 1) {
        return formula.error.nm;
      }
      return Math.abs(jStat.studentt.inv(probability / 2, deg_freedom));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "F_DIST": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //用来计算函数的值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //分子自由度
      var degrees_freedom1 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(degrees_freedom1)) {
        return degrees_freedom1;
      }
      if (!isRealNum(degrees_freedom1)) {
        return formula.error.v;
      }
      degrees_freedom1 = parseInt(degrees_freedom1);

      //分母自由度
      var degrees_freedom2 = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(degrees_freedom2)) {
        return degrees_freedom2;
      }
      if (!isRealNum(degrees_freedom2)) {
        return formula.error.v;
      }
      degrees_freedom2 = parseInt(degrees_freedom2);

      //用于确定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (x < 0) {
        return formula.error.nm;
      }
      if (degrees_freedom1 < 1) {
        return formula.error.nm;
      }
      if (degrees_freedom2 < 1) {
        return formula.error.nm;
      }
      return cumulative ? jStat.centralF.cdf(x, degrees_freedom1, degrees_freedom2) : jStat.centralF.pdf(x, degrees_freedom1, degrees_freedom2);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "F_DIST_RT": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //用来计算函数的值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //分子自由度
      var degrees_freedom1 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(degrees_freedom1)) {
        return degrees_freedom1;
      }
      if (!isRealNum(degrees_freedom1)) {
        return formula.error.v;
      }
      degrees_freedom1 = parseInt(degrees_freedom1);

      //分母自由度
      var degrees_freedom2 = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(degrees_freedom2)) {
        return degrees_freedom2;
      }
      if (!isRealNum(degrees_freedom2)) {
        return formula.error.v;
      }
      degrees_freedom2 = parseInt(degrees_freedom2);
      if (x < 0) {
        return formula.error.nm;
      }
      if (degrees_freedom1 < 1) {
        return formula.error.nm;
      }
      if (degrees_freedom2 < 1) {
        return formula.error.nm;
      }
      return 1 - jStat.centralF.cdf(x, degrees_freedom1, degrees_freedom2);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
};

export default statisticalDistribution;
