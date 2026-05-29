import editor from '../../../global/editor';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import { iconfontObjects } from '../../constant';

export function initTextWrap(_this) {
      //文本换行
      document.getElementById("luckysheet-icon-textwrap-menu").addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        if (menuButton == null) {
          const _locale = locale();
          const locale_textWrap = _locale.textWrap;
          let itemdata = [{
            text: locale_textWrap.overflow,
            value: "overflow",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-overflow iconfont-luckysheet luckysheet-iconfont-yichu1" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_textWrap.wrap,
            value: "wrap",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-wrap iconfont-luckysheet luckysheet-iconfont-zidonghuanhang" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_textWrap.clip,
            value: "clip",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-clip iconfont-luckysheet luckysheet-iconfont-jieduan" style="user-select: none;"> </div> </div>'
          }];
  
          // itemvalue to iconfont
          const iconfontObject = iconfontObjects.textWrap;
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "textwrap-menu",
            item: itemset,
            subclass: "",
            sub: ""
          });
          document.body.insertAdjacentHTML('beforeend', menu);
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "120px";
          _this.focus(menuButton, "clip");
          menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
              _this.focus(menuButton, itemvalue);
              let textwrapEl = document.getElementById("luckysheet-icon-textwrap");
              textwrapEl.setAttribute("type", itemvalue);
              let icon = textwrapEl.querySelector(".luckysheet-icon-img-container");

              icon.className = "luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-" + itemvalue + iconfontObject[itemvalue];
              let d = editor.deepCopyFlowData(Store.flowdata);
              _this.updateFormat(d, "tb", itemvalue);
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
