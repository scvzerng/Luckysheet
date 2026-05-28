import {  iconfontObjects  } from "../constant";
import { isdatatypemulti } from "../../global/datecontroll";
import {  checkstatusByCell  } from "../../global/getdata";
import {  convertCssToStyleList } from "../inlineString";
import Store from "../../store";
import locale from "../../locale/locale";
const formatStatusModule = {
  changeMenuButtonDom: function (attr, foucsStatus, _locale) {
    let _this = this;
    if (_locale == null) {
      _locale = locale();
    }
    const locale_fontarray = _locale.fontarray;
    const locale_fontjson = _locale.fontjson;
    if (attr == "bl") {
      if (foucsStatus != "0") {
        $("#luckysheet-icon-bold").addClass("luckysheet-toolbar-button-hover");
      } else {
        $("#luckysheet-icon-bold").removeClass("luckysheet-toolbar-button-hover");
      }
    } else if (attr == "it") {
      if (foucsStatus != "0") {
        $("#luckysheet-icon-italic").addClass("luckysheet-toolbar-button-hover");
      } else {
        $("#luckysheet-icon-italic").removeClass("luckysheet-toolbar-button-hover");
      }
    } else if (attr == "cl") {
      if (foucsStatus != "0") {
        $("#luckysheet-icon-strikethrough").addClass("luckysheet-toolbar-button-hover");
      } else {
        $("#luckysheet-icon-strikethrough").removeClass("luckysheet-toolbar-button-hover");
      }
    } else if (attr == "un") {
      if (foucsStatus != "0") {
        $("#luckysheet-icon-underline").addClass("luckysheet-toolbar-button-hover");
      } else {
        $("#luckysheet-icon-underline").removeClass("luckysheet-toolbar-button-hover");
      }
    } else if (attr == "ff") {
      let menuButtonId = "luckysheet-icon-font-family-menuButton";
      let $menuButton = $("#" + menuButtonId);
      // const locale_fontarray = locale().fontarray;
      let itemname = locale_fontarray[0],
        itemvalue = 0;
      if (foucsStatus != null) {
        if (isdatatypemulti(foucsStatus)["num"]) {
          itemvalue = parseInt(foucsStatus);
          itemname = locale_fontarray[itemvalue];
          if (itemname == null) {
            itemvalue = _this.defualtFont[itemvalue];
            itemname = itemvalue;
            if (itemvalue != null) {
              _this.addFontTolist(itemvalue);
            }
          }
        } else {
          foucsStatus = foucsStatus.replace(/"/g, "").replace(/'/g, "");
          itemvalue = foucsStatus;
          itemname = foucsStatus;
          _this.addFontTolist(itemvalue);
        }
      }
      _this.focus($menuButton, itemvalue);
      $("#luckysheet-icon-font-family").find(".luckysheet-toolbar-menu-button-caption").html(" " + itemname + " ");
    } else if (attr == "fs") {
      let $menuButton = $("#luckysheet-icon-font-size-menuButton");
      let itemvalue = foucsStatus,
        $input = $("#luckysheet-icon-font-size input");
      _this.focus($menuButton, itemvalue);
      $("#luckysheet-icon-font-size").attr("itemvalue", itemvalue);
      $input.val(itemvalue);
    } else if (attr == "ht") {
      let $menuButton = $("#luckysheet-icon-align-menu-menuButton");
      let $t = $("luckysheet-icon-align"),
        itemvalue = "left";
      if (foucsStatus == "0") {
        itemvalue = "center";
      } else if (foucsStatus == "2") {
        itemvalue = "right";
      }
      _this.focus($menuButton, itemvalue);

      // add iconfont
      const iconfontObject = iconfontObjects.align;
      let $icon = $("#luckysheet-icon-align").attr("type", itemvalue).find(".luckysheet-icon-img-container");
      $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-" + itemvalue + iconfontObject[itemvalue]);
      $menuButton.hide();
    } else if (attr == "vt") {
      let $menuButton = $("#luckysheet-icon-valign-menu-menuButton");
      let $t = $("luckysheet-icon-valign"),
        itemvalue = "bottom";
      if (foucsStatus == "1") {
        itemvalue = "top";
      } else if (foucsStatus == "0") {
        itemvalue = "middle";
      }
      _this.focus($menuButton, itemvalue);

      // add iconfont
      const iconfontObject = iconfontObjects.align;
      let $icon = $("#luckysheet-icon-valign").attr("type", itemvalue).find(".luckysheet-icon-img-container");
      $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-" + itemvalue + iconfontObject[itemvalue]);
      $menuButton.hide();
    } else if (attr == "tb") {
      let $menuButton = $("#luckysheet-icon-textwrap-menu-menuButton");
      let $t = $("luckysheet-icon-textwrap"),
        itemvalue = "clip";
      if (foucsStatus == "1") {
        itemvalue = "overflow";
      } else if (foucsStatus == "2") {
        itemvalue = "wrap";
      }
      _this.focus($menuButton, itemvalue);

      // add iconfont
      const iconfontObject = iconfontObjects.textWrap;
      let $icon = $("#luckysheet-icon-textwrap").attr("type", itemvalue).find(".luckysheet-icon-img-container");
      $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-" + itemvalue + iconfontObject[itemvalue]);
      $menuButton.hide();
    } else if (attr == "tr") {
      let $menuButton = $("#luckysheet-icon-rotation-menu-menuButton");
      let $t = $("luckysheet-icon-rotation"),
        itemvalue = "none";
      if (foucsStatus == "1") {
        itemvalue = "angleup";
      } else if (foucsStatus == "2") {
        itemvalue = "angledown";
      } else if (foucsStatus == "3") {
        itemvalue = "vertical";
      } else if (foucsStatus == "4") {
        itemvalue = "rotation-up";
      } else if (foucsStatus == "5") {
        itemvalue = "rotation-down";
      }
      _this.focus($menuButton, itemvalue);

      // add iconfont
      const iconfontObject = iconfontObjects.rotation;
      let $icon = $("#luckysheet-icon-rotation").attr("type", itemvalue).find(".luckysheet-icon-img-container");
      $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-" + itemvalue + iconfontObject[itemvalue]);
      $menuButton.hide();
    } else if (attr == "ct") {
      let $menuButton = $("#luckysheet-icon-fmt-other");
      const _locale = locale();
      const locale_defaultFmt = _locale.defaultFmt;
      if (!foucsStatus) {
        $menuButton.find(".luckysheet-toolbar-menu-button-caption").html(" " + locale_defaultFmt[0].text + " ");
        return;
      }
      const {
        fa
      } = foucsStatus;
      const format = locale_defaultFmt.find(f => f.value === fa);
      if (format) {
        $menuButton.find(".luckysheet-toolbar-menu-button-caption").html(" " + format.text + " ");
      } else {
        const otherFormat = locale_defaultFmt.find(f => f.value === "fmtOtherSelf");
        $menuButton.find(".luckysheet-toolbar-menu-button-caption").html(" " + otherFormat.text + " ");
      }
    }
  },
  inputMenuButtonFocus: function (focusTarget) {
    var w = window.getSelection();
    var range = w.getRangeAt(0);
    let startContainer = range.startContainer;
    Store.inlineStringEditRange = null;
    const _locale = locale();
    if (startContainer.parentNode.tagName == "SPAN") {
      let cssText = startContainer.parentNode.style.cssText;
      let stylelist = convertCssToStyleList(cssText);
      for (let key in stylelist) {
        this.changeMenuButtonDom(key, stylelist[key], _locale);
      }
    }
  },
  menuButtonFocus: function (d, r, c) {
    let _this = this;
    let foucsList = ["bl", "it", "cl", "ff", "ht", "vt", "fs", "tb", "tr", "ct", "un"];
    const _locale = locale();
    for (let i = 0; i < foucsList.length; i++) {
      let attr = foucsList[i];
      let foucsStatus = _this.checkstatus(d, r, c, attr);
      this.changeMenuButtonDom(attr, foucsStatus, _locale);
    }
  },
  checkstatus: function (d, r, c, a) {
    if (d == null || d[r] == null) {
      console.warn("It's incorrect data", r, c);
      return null;
    }
    let foucsStatus = d[r][c];
    return checkstatusByCell(foucsStatus, a);
  }
};
export default formatStatusModule;