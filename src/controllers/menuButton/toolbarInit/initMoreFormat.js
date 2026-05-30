import editor from '../../../global/editor';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import luckysheetMoreFormat from '../../moreFormat';

export function initMoreFormat(_this) {
      //更多格式
      document.getElementById("luckysheet-icon-fmt-other")?.addEventListener("click", function () {
        const _locale = locale();
        const locale_format = _locale.format;
        const locale_defaultFmt = _locale.defaultFmt;
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        if (menuButton == null) {
          let itemdata = locale_defaultFmt;
          let itemset = _this.createButtonMenu(itemdata);
  
          // luckysheet-menuButton-sub
          let menu = replaceHtml(_this.menu, {
            id: "fmt-other",
            item: itemset,
            subclass: "",
            sub: ""
          });
          let subitemdata = [{
            text: locale_format.moreCurrency + "...",
            value: "morecurrency",
            example: ""
          }, {
            text: locale_format.moreDateTime + "...",
            value: "moredatetime",
            example: ""
          }, {
            text: locale_format.moreNumber + "...",
            value: "moredigit",
            example: ""
          }];
          let subitemset = _this.createButtonMenu(subitemdata);
          let submenu = replaceHtml(_this.menu, {
            id: "fmtOtherSelf",
            item: subitemset,
            subclass: "luckysheet-menuButton-sub"
          });
  
          //luckysheet-icon-fmt-other-menuButton_sub
          document.body.insertAdjacentHTML('beforeend', menu + submenu);
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "250px";
          _this.focus(menuButton);
          menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
              let itemname = this.getAttribute("itemname");
              const _el = document.getElementById("luckysheet-icon-fmt-other")?.querySelector(".luckysheet-toolbar-menu-button-caption"); if (_el) _el.innerHTML = " " + itemname + " ";
              if (itemvalue == "fmtOtherSelf") {
                return;
              }
              let d = editor.deepCopyFlowData(Store.flowdata);
              _this.focus(menuButton, itemvalue);
              _this.updateFormat(d, "ct", itemvalue);
            });
          });

          document.querySelectorAll("#luckysheet-icon-fmtOtherSelf-menuButton .luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              const _elFmtOther = document.getElementById("luckysheet-icon-fmtOtherSelf-menuButton"); if (_elFmtOther) _elFmtOther.style.display = 'none';
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
              luckysheetMoreFormat.createDialog(itemvalue);
              luckysheetMoreFormat.init();
            });
          });
        } else {
          const text = this.querySelector(".luckysheet-toolbar-menu-button-caption")?.textContent?.trim();
          const format = locale_defaultFmt.find(f => f.text === text);
          if (format) {
            _this.focus(menuButton, format.value);
          }
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
