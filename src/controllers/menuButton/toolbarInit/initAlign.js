import editor from '../../../global/editor';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import { iconfontObjects } from '../../constant';

export function initAlign(_this) {
      //水平对齐
      $("#luckysheet-icon-align").click(function () {
        let itemvalue = $("#luckysheet-icon-align").attr("type");
        if (itemvalue == null) {
          itemvalue = "left";
        }
        let d = editor.deepCopyFlowData(Store.flowdata);
        _this.updateFormat(d, "ht", itemvalue);
      });
      $("#luckysheet-icon-align-menu").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        if ($menuButton.length == 0) {
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
          $menuButton = $("#" + menuButtonId).width(120);
          _this.focus($menuButton);
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            _this.focus($menuButton, itemvalue);
            let $icon = $("#luckysheet-icon-align").attr("type", itemvalue).find(".luckysheet-icon-img-container");
  
            // add iconfont
            $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-" + itemvalue + iconfontObject[itemvalue]);
            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat(d, "ht", itemvalue);
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
