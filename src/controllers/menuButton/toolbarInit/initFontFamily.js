import { hideMenuByCancel } from '../../../global/cursorPos';
import editor from '../../../global/editor';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';

export function initFontFamily(_this) {
      //字体设置
      document.getElementById("luckysheet-icon-font-family")?.addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      });
      document.getElementById("luckysheet-icon-font-family")?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        if (menuButton == null) {
          // const locale_fontarray = locale().fontarray;
          // let itemdata = [];
  
          // for(let a=0;a<locale_fontarray.length;a++){
          //     let fItem = locale_fontarray[a];
          //     let ret = {};
          //     ret.value = a;
          //     ret.text = "<span class='luckysheet-mousedown-cancel' style='font-size:11px;font-family:"+fItem+"'>"+fItem+"</span>";
          //     ret.example = "";
          //     itemdata.push(ret);
          // }
  
          let itemset = _this.createButtonMenu(_this.fontSelectList);
          let menu = replaceHtml(_this.menu, {
            id: "font-family",
            item: itemset,
            subclass: "",
            sub: ""
          });
          document.body.insertAdjacentHTML('beforeend', menu);
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "200px";
          _this.focus(menuButton);
          menuButton.addEventListener("click", function (e) {
            if (e.target?.closest?.(".luckysheet-cols-menuitem")) {
              let item = e.target?.closest?.(".luckysheet-cols-menuitem");
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = item.getAttribute("itemvalue");
              let itemname = item.getAttribute("itemname");
              _this.focus(menuButton, itemvalue);
              const _el = document.getElementById("luckysheet-icon-font-family")?.querySelector(".luckysheet-toolbar-menu-button-caption"); if (_el) _el.innerHTML = " " + itemname + " ";
              let d = editor.deepCopyFlowData(Store.sheetData);
              _this.updateFormat(d, "ff", itemvalue);
            }
          });
        }
        let userlen = this.offsetWidth;
        let tlen = menuButton.offsetWidth;
        let menuleft = this.getBoundingClientRect().left + window.pageXOffset;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition(menuButton, menuleft, this.getBoundingClientRect().top + window.pageYOffset + 25, "lefttop");
      });
}
