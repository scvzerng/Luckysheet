import editor from '../../../global/editor';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import { iconfontObjects } from '../../constant';

export function initRotation(_this) {
      //文本旋转
      document.getElementById("luckysheet-icon-rotation-menu")?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        if (menuButton == null) {
          const _locale = locale();
          const locale_rotation = _locale.rotation;
          let itemdata = [{
            text: locale_rotation.none,
            value: "none",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-none iconfont-luckysheet luckysheet-iconfont-wuxuanzhuang" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_rotation.angleup,
            value: "angleup",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-angleup iconfont-luckysheet luckysheet-iconfont-xiangshangqingxie" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_rotation.angledown,
            value: "angledown",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-angledown iconfont-luckysheet luckysheet-iconfont-xiangxiaqingxie" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_rotation.vertical,
            value: "vertical",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-vertical iconfont-luckysheet luckysheet-iconfont-shupaiwenzi" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_rotation.rotationUp,
            value: "rotation-up",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-rotation-up iconfont-luckysheet luckysheet-iconfont-wenbenxiangshang" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_rotation.rotationDown,
            value: "rotation-down",
            example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-rotation-down iconfont-luckysheet luckysheet-iconfont-xiangxia90" style="user-select: none;"> </div> </div>'
          }];
  
          // itemvalue to iconfont
          const iconfontObject = iconfontObjects.rotation;
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "rotation-menu",
            item: itemset,
            subclass: "",
            sub: ""
          });
          document.body.insertAdjacentHTML('beforeend', menu);
  
          // 文字旋转�?Stack Vertically 太长了，拉宽�?60
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "160px";
          _this.focus(menuButton);
          menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
              _this.focus(menuButton, itemvalue);
              let rotationEl = document.getElementById("luckysheet-icon-rotation");
              if (rotationEl) rotationEl.setAttribute("type", itemvalue);
              let icon = rotationEl?.querySelector(".luckysheet-icon-img-container");

              if (icon) icon.className = "luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-" + itemvalue + iconfontObject[itemvalue];
              let d = editor.deepCopyFlowData(Store.flowdata);
              _this.updateFormat(d, "tr", itemvalue);
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
