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
        document.getElementById("luckysheet-icon-bold").classList.add("luckysheet-toolbar-button-hover");
      } else {
        document.getElementById("luckysheet-icon-bold").classList.remove("luckysheet-toolbar-button-hover");
      }
    } else if (attr == "it") {
      if (foucsStatus != "0") {
        document.getElementById("luckysheet-icon-italic").classList.add("luckysheet-toolbar-button-hover");
      } else {
        document.getElementById("luckysheet-icon-italic").classList.remove("luckysheet-toolbar-button-hover");
      }
    } else if (attr == "cl") {
      if (foucsStatus != "0") {
        document.getElementById("luckysheet-icon-strikethrough").classList.add("luckysheet-toolbar-button-hover");
      } else {
        document.getElementById("luckysheet-icon-strikethrough").classList.remove("luckysheet-toolbar-button-hover");
      }
    } else if (attr == "un") {
      if (foucsStatus != "0") {
        document.getElementById("luckysheet-icon-underline").classList.add("luckysheet-toolbar-button-hover");
      } else {
        document.getElementById("luckysheet-icon-underline").classList.remove("luckysheet-toolbar-button-hover");
      }
    } else if (attr == "ff") {
      let menuButtonId = "luckysheet-icon-font-family-menuButton";
      let $menuButton = document.getElementById(menuButtonId);
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
      document.getElementById("luckysheet-icon-font-family").querySelector(".luckysheet-toolbar-menu-button-caption").innerHTML = " " + itemname + " ";
    } else if (attr == "fs") {
      let $menuButton = document.getElementById("luckysheet-icon-font-size-menuButton");
      let itemvalue = foucsStatus,
        $input = document.querySelector("#luckysheet-icon-font-size input");
      _this.focus($menuButton, itemvalue);
      document.getElementById("luckysheet-icon-font-size").setAttribute("itemvalue", itemvalue);
      $input.value = itemvalue;
    } else if (attr == "ht") {
      let $menuButton = document.getElementById("luckysheet-icon-align-menu-menuButton");
      let $t = document.querySelector("luckysheet-icon-align"),
        itemvalue = "left";
      if (foucsStatus == "0") {
        itemvalue = "center";
      } else if (foucsStatus == "2") {
        itemvalue = "right";
      }
      _this.focus($menuButton, itemvalue);

      // add iconfont
      const iconfontObject = iconfontObjects.align;
      let _alignEl = document.getElementById("luckysheet-icon-align");
      _alignEl.setAttribute("type", itemvalue);
      let $icon = _alignEl.querySelector(".luckysheet-icon-img-container");
      $icon.className = "luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-" + itemvalue + iconfontObject[itemvalue];
      $menuButton.style.display = 'none';
    } else if (attr == "vt") {
      let $menuButton = document.getElementById("luckysheet-icon-valign-menu-menuButton");
      let $t = document.querySelector("luckysheet-icon-valign"),
        itemvalue = "bottom";
      if (foucsStatus == "1") {
        itemvalue = "top";
      } else if (foucsStatus == "0") {
        itemvalue = "middle";
      }
      _this.focus($menuButton, itemvalue);

      // add iconfont
      const iconfontObject = iconfontObjects.align;
      let _valignEl = document.getElementById("luckysheet-icon-valign");
      _valignEl.setAttribute("type", itemvalue);
      let $icon = _valignEl.querySelector(".luckysheet-icon-img-container");
      $icon.className = "luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-" + itemvalue + iconfontObject[itemvalue];
      $menuButton.style.display = 'none';
    } else if (attr == "tb") {
      let $menuButton = document.getElementById("luckysheet-icon-textwrap-menu-menuButton");
      let $t = document.querySelector("luckysheet-icon-textwrap"),
        itemvalue = "clip";
      if (foucsStatus == "1") {
        itemvalue = "overflow";
      } else if (foucsStatus == "2") {
        itemvalue = "wrap";
      }
      _this.focus($menuButton, itemvalue);

      // add iconfont
      const iconfontObject = iconfontObjects.textWrap;
      let _textwrapEl = document.getElementById("luckysheet-icon-textwrap");
      _textwrapEl.setAttribute("type", itemvalue);
      let $icon = _textwrapEl.querySelector(".luckysheet-icon-img-container");
      $icon.className = "luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-" + itemvalue + iconfontObject[itemvalue];
      $menuButton.style.display = 'none';
    } else if (attr == "tr") {
      let $menuButton = document.getElementById("luckysheet-icon-rotation-menu-menuButton");
      let $t = document.querySelector("luckysheet-icon-rotation"),
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
      let _rotationEl = document.getElementById("luckysheet-icon-rotation");
      _rotationEl.setAttribute("type", itemvalue);
      let $icon = _rotationEl.querySelector(".luckysheet-icon-img-container");
      $icon.className = "luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-" + itemvalue + iconfontObject[itemvalue];
      $menuButton.style.display = 'none';
    } else if (attr == "ct") {
      let $menuButton = document.getElementById("luckysheet-icon-fmt-other");
      const _locale = locale();
      const locale_defaultFmt = _locale.defaultFmt;
      if (!foucsStatus) {
        $menuButton.querySelector(".luckysheet-toolbar-menu-button-caption").innerHTML = " " + locale_defaultFmt[0].text + " ";
        return;
      }
      const {
        fa
      } = foucsStatus;
      const format = locale_defaultFmt.find(f => f.value === fa);
      if (format) {
        $menuButton.querySelector(".luckysheet-toolbar-menu-button-caption").innerHTML = " " + format.text + " ";
      } else {
        const otherFormat = locale_defaultFmt.find(f => f.value === "fmtOtherSelf");
        $menuButton.querySelector(".luckysheet-toolbar-menu-button-caption").innerHTML = " " + otherFormat.text + " ";
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