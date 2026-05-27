import editor from '../../../global/editor';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { iconfontObjects } from '../../constant';

export function initValign(_this) {
      //垂直对齐
      $("#luckysheet-icon-valign").click(function () {
        let itemvalue = $("#luckysheet-icon-valign").attr("type");
        if (itemvalue == null) {
          itemvalue = "bottom";
        }
        let d = editor.deepCopyFlowData(Store.flowdata);
        _this.updateFormat(d, "vt", itemvalue);
      });
      $("#luckysheet-icon-valign-menu").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        const _locale = locale();
        const locale_align = _locale.align;
        if ($menuButton.length == 0) {
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
          $("body").append(menu);
          $menuButton = $("#" + menuButtonId).width(120);
          _this.focus($menuButton, "bottom");
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            _this.focus($menuButton, itemvalue);
            let $icon = $("#luckysheet-icon-valign").attr("type", itemvalue).find(".luckysheet-icon-img-container");
  
            // add iconfont
            $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-" + itemvalue + iconfontObject[itemvalue]);
            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat(d, "vt", itemvalue);
          });
        }
        let userlen = $(this).outerWidth();
        let tlen = $menuButton.outerWidth();
        let menuleft = $(this).offset().left;
        if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition($menuButton, menuleft - 28, $(this).offset().top + 25, "lefttop");
      });
}
