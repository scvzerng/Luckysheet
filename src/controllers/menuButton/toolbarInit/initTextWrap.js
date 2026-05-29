import editor from '../../../global/editor';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import { iconfontObjects } from '../../constant';

export function initTextWrap(_this) {
      //文本换行
      $("#luckysheet-icon-textwrap-menu").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        if ($menuButton.length == 0) {
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
          $menuButton = $("#" + menuButtonId).width(120);
          _this.focus($menuButton, "clip");
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            _this.focus($menuButton, itemvalue);
            let $icon = $("#luckysheet-icon-textwrap").attr("type", itemvalue).find(".luckysheet-icon-img-container");
  
            // add iconfont
            $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-" + itemvalue + iconfontObject[itemvalue]);
            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat(d, "tb", itemvalue);
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
