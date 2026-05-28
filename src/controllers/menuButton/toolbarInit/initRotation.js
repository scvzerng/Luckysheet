import editor from '../../../global/editor';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import { iconfontObjects } from '../../constant';

export function initRotation(_this) {
      //文本旋转
      $("#luckysheet-icon-rotation-menu").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        if ($menuButton.length == 0) {
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
          $("body").append(menu);
  
          // 文字旋转�?Stack Vertically 太长了，拉宽�?60
          $menuButton = $("#" + menuButtonId).width(160);
          _this.focus($menuButton);
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            _this.focus($menuButton, itemvalue);
            let $icon = $("#luckysheet-icon-rotation").attr("type", itemvalue).find(".luckysheet-icon-img-container");
  
            // add iconfont
            $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-" + itemvalue + iconfontObject[itemvalue]);
            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat(d, "tr", itemvalue);
          });
        }
        let userlen = $(this).outerWidth();
        let tlen = $menuButton.outerWidth();
        let menuleft = $(this).offset().left;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition($menuButton, menuleft - 28, $(this).offset().top + 25, "lefttop");
      });
}
