import editor from '../../../global/editor';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import { iconfontObjects } from '../../constant';

export function initAlign(_this) {
      //水平对齐
      document.getElementById("luckysheet-icon-align")?.addEventListener("click", function () {
        let itemvalue = document.getElementById("luckysheet-icon-align")?.getAttribute("type");
        if (itemvalue == null) {
          itemvalue = "left";
        }
        let d = editor.deepCopyFlowData(Store.flowdata);
        _this.updateFormat(d, "ht", itemvalue);
      });
      document.getElementById("luckysheet-icon-align-menu")?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        if (menuButton == null) {
          const _locale = locale();
          const locale_align = _locale.align;
          let itemdata = [{
            text: locale_align.left,
            value: "left",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-left iconfont-luckysheet luckysheet-iconfont-wenbenzuoduiqi" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_align.center,
            value: "center",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-center iconfont-luckysheet luckysheet-iconfont-wenbenjuzhongduiqi" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_align.right,
            value: "right",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-right iconfont-luckysheet luckysheet-iconfont-wenbenyouduiqi" style="user-select: none;"> </div> </div>'
          }];
  
          // itemvalue to iconfont
          const iconfontObject = iconfontObjects.align;
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "align-menu",
            item: itemset,
            subclass: "",
            sub: ""
          });
          document.body.insertAdjacentHTML('beforeend', menu);
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "120px";
          _this.focus(menuButton);
          menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
              _this.focus(menuButton, itemvalue);
              let alignEl = document.getElementById("luckysheet-icon-align");
              if (alignEl) alignEl.setAttribute("type", itemvalue);
              let icon = alignEl?.querySelector(".luckysheet-icon-img-container");

              if (icon) icon.className = "luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-" + itemvalue + iconfontObject[itemvalue];
              let d = editor.deepCopyFlowData(Store.flowdata);
              _this.updateFormat(d, "ht", itemvalue);
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
