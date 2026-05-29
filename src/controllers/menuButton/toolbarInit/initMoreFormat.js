import editor from '../../../global/editor';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import luckysheetMoreFormat from '../../moreFormat';

export function initMoreFormat(_this) {
      //更多格式
      $("#luckysheet-icon-fmt-other").click(function () {
        const _locale = locale();
        const locale_format = _locale.format;
        const locale_defaultFmt = _locale.defaultFmt;
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        if ($menuButton.length == 0) {
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
          $menuButton = $("#" + menuButtonId).width(250);
          _this.focus($menuButton);
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue"),
              itemname = $t.attr("itemname");
            $("#luckysheet-icon-fmt-other").find(".luckysheet-toolbar-menu-button-caption").html(" " + itemname + " ");
            if (itemvalue == "fmtOtherSelf") {
              return;
            }
            let d = editor.deepCopyFlowData(Store.flowdata); //取数�?
            _this.focus($menuButton, itemvalue);
            _this.updateFormat(d, "ct", itemvalue);
          });
  
          //更多格式
          $("#luckysheet-icon-fmtOtherSelf-menuButton").find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            $("#luckysheet-icon-fmtOtherSelf-menuButton").hide();
            luckysheetContainerFocus();
            let itemvalue = $(this).attr("itemvalue");
            luckysheetMoreFormat.createDialog(itemvalue);
            luckysheetMoreFormat.init();
          });
        } else {
          const text = $(this).find(".luckysheet-toolbar-menu-button-caption").text().trim();
          const format = locale_defaultFmt.find(f => f.text === text);
          if (format) {
            _this.focus($menuButton, format.value);
          }
        }
        let userlen = $(this).outerWidth();
        let tlen = $menuButton.outerWidth();
        let menuleft = $(this).offset().left;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
      });
}
