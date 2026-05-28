import { isRealNum } from "../../global/validate";
import Store from "../../store";
import locale from "../../locale/locale";
const sheetUtilsModule = {
  generateRandomSheetIndex: function (prefix) {
    if (prefix == null) {
      prefix = "Sheet";
    }
    let userAgent = window.navigator.userAgent.replace(/[^a-zA-Z0-9]/g, "").split("");
    let mid = "";
    for (let i = 0; i < 12; i++) {
      mid += userAgent[Math.round(Math.random() * (userAgent.length - 1))];
    }
    let time = new Date().getTime();
    return prefix + "_" + mid + "_" + time;
  },
  generateRandomSheetName: function (file) {
    let index = file.length;
    for (let i = 0; i < file.length; i++) {
      if (file[i].name.indexOf("Sheet") > -1) {
        let suffix = parseFloat(file[i].name.replace("Sheet", ""));
        if (suffix != "NaN" && Math.ceil(suffix) > index) {
          index = Math.ceil(suffix);
        }
      }
    }
    return "Sheet" + (index + 1);
  },
  generateCopySheetName: function (file, name) {
    let _locale = locale();
    let locale_info = _locale.info;
    let copyWord = "(" + locale_info.copy;
    const copy_i = name.toString().indexOf(copyWord);
    if (~copy_i) {
      name = name.toString().substring(0, copy_i);
    }
    let index = "";
    let nameCopy = name + copyWord;
    const sheetNames = [];
    for (let i = 0; i < file.length; i++) {
      let fileName = file[i].name.toString();
      sheetNames.push(fileName);
      let st_i = fileName.indexOf(nameCopy);
      if (st_i === 0) {
        index = index || 2;
        let ed_i = fileName.indexOf(")", st_i + nameCopy.length);
        let num = fileName.substring(st_i + nameCopy.length, ed_i);
        if (isRealNum(num)) {
          if (parseInt(num) >= index) {
            index = parseInt(num) + 1;
          }
        }
      }
    }
    let sheetCopyName;
    do {
      let postfix = copyWord + index + ")";
      const lengthLimit = 31 - postfix.length;
      sheetCopyName = name;
      if (sheetCopyName.length > lengthLimit) {
        sheetCopyName = sheetCopyName.slice(0, lengthLimit - 1) + "…";
      }
      sheetCopyName = sheetCopyName + postfix;
    } while (~sheetNames.indexOf(sheetCopyName) && (index = (index || 1) + 1));
    return sheetCopyName;
  },
  getSheetByIndex: function (index) {
    let _this = this;
    if (index == null) {
      index = Store.currentSheetIndex;
    }
    let i = _this.getSheetIndex(index);
    return Store.luckysheetfile[i];
  },
  getSheetByName: function (name) {
    let _this = this;
    if (name == null) {
      return null;
    }
    for (let i = 0; i < Store.luckysheetfile.length; i++) {
      let file = Store.luckysheetfile[i];
      if (file.name == name) {
        return file;
      }
    }
    return null;
  },
  getSheetIndex: function (index) {
    for (let i = 0; i < Store.luckysheetfile.length; i++) {
      if (Store.luckysheetfile[i]["index"] == index) {
        return i;
      }
    }
    return null;
  },
  getSheetName: function (sheetIndex) {
    if (sheetIndex == null) {
      sheetIndex = Store.currentSheetIndex;
    }
    return Store.luckysheetfile[this.getSheetIndex(sheetIndex)].name;
  },
  getCustomSheet() {
    //设置自定义luckysheet 配置项。
    if (!this.Luckysheet_custom_sheet) return {};
    return JSON.parse(JSON.stringify(this.Luckysheet_custom_sheet)); //每次都返回一个自定义sheet新对象
  },
  setCustomSheet(luckysheet_custom_sheet) {
    this.Luckysheet_custom_sheet = luckysheet_custom_sheet;
  }
};
export default sheetUtilsModule;