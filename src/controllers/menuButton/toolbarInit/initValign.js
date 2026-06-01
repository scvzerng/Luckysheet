import { hideMenuByCancel } from '../../../global/cursorPos';
import editor from '../../../global/editor';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import { iconfontObjects } from '../../constant';

export function initValign(_this) {
      //垂直对齐
      let valignEl = document.getElementById("luckysheet-icon-valign");
      valignEl?.addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      });
      valignEl?.addEventListener("click", function () {
        let itemvalue = document.getElementById("luckysheet-icon-valign")?.getAttribute("type");
        if (itemvalue == null) {
          itemvalue = "bottom";
        }
        let d = editor.deepCopyFlowData(Store.sheetData);
        _this.updateFormat(d, "vt", itemvalue);
      });
      let valignMenuEl = document.getElementById("luckysheet-icon-valign-menu");
      valignMenuEl?.addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      });
      valignMenuEl?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        const _locale = locale();
        const locale_align = _locale.align;
        if (menuButton == null) {
          let itemdata = [{
            text: locale_align.top,
            value: "top",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-top iconfont-luckysheet luckysheet-iconfont-dingbuduiqi" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_align.middle,
            value: "middle",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-middle iconfont-luckysheet luckysheet-iconfont-shuipingduiqi" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_align.bottom,
            value: "bottom",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-bottom iconfont-luckysheet luckysheet-iconfont-dibuduiqi" style="user-select: none;"> </div> </div>'
          }];
  
          // itemvalue to iconfont
          const iconfontObject = iconfontObjects.align;
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "valign-menu",
            item: itemset,
            subclass: "",
            sub: ""
          });
          document.body.insertAdjacentHTML('beforeend', menu);
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "120px";
          _this.focus(menuButton, "bottom");
          menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
              _this.focus(menuButton, itemvalue);
              let valignEl = document.getElementById("luckysheet-icon-valign");
              if (valignEl) valignEl.setAttribute("type", itemvalue);
              let icon = valignEl?.querySelector(".luckysheet-icon-img-container");

              if (icon) icon.className = "luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-" + itemvalue + iconfontObject[itemvalue];
              let d = editor.deepCopyFlowData(Store.sheetData);
              _this.updateFormat(d, "vt", itemvalue);
            });
          });
        }
        let userlen = this.offsetWidth;
        let tlen = menuButton.offsetWidth;
        let menuleft = this.getBoundingClientRect().left + window.pageXOffset;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition(menuButton, menuleft - 28, this.getBoundingClientRect().top + window.pageYOffset + 25, "lefttop");
      });
}
