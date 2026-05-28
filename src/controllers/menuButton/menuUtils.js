import { isdatatypemulti } from "../../global/datecontroll";
import {  replaceHtml } from "../../utils/util";
import locale from "../../locale/locale";
const menuUtilsModule = {
  rightclickmenu: null,
  submenuhide: {},
  focus: function ($obj, value) {
    if ($obj.attr("id") == "luckysheet-icon-font-family-menuButton") {
      if (isdatatypemulti(value)["num"]) {
        let _locale = locale();
        const locale_fontarray = _locale.fontarray;
        value = locale_fontarray[parseInt(value)];
        if (value == null) {
          value = this.defualtFont[itemvalue];
        }
      }
    }
    $obj.find(".luckysheet-cols-menuitem").find("span.icon").html("");
    if (value == null) {
      $obj.find(".luckysheet-cols-menuitem").eq(0).find("span.icon").html('<i class="fa fa-check luckysheet-mousedown-cancel"></i>');
    } else {
      $obj.find(".luckysheet-cols-menuitem[itemvalue='" + value + "']").find("span.icon").html('<i class="fa fa-check luckysheet-mousedown-cancel"></i>');
    }
  },
  createButtonMenu: function (itemdata) {
    let itemset = "";
    let _this = this;
    for (let i = 0; i < itemdata.length; i++) {
      let item = itemdata[i];
      if (item.value == "split") {
        itemset += _this.split;
      } else {
        if (item.example == "more") {
          // itemset += replaceHtml(_this.item, {"value": item.value, "name": item.text, "example": "►", "sub": "luckysheet-cols-submenu"});
          itemset += replaceHtml(_this.item, {
            value: item.value,
            name: item.text,
            example: "",
            sub: "luckysheet-cols-submenu",
            iconClass: "iconfont-luckysheet luckysheet-iconfont-youjiantou"
          });
        } else {
          itemset += replaceHtml(_this.item, {
            value: item.value,
            name: item.text,
            example: item.example,
            sub: "",
            iconClass: ""
          });
        }
      }
    }
    return itemset;
  }
};
export default menuUtilsModule;