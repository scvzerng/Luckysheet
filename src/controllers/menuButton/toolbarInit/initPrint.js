import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';

export function initPrint(_this) {
      //print
      $("#luckysheet-icon-print").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        const _locale = locale();
        const locale_print = _locale.print;
        if ($menuButton.length == 0) {
          let itemdata = [{
            text: locale_print.menuItemPrint,
            value: "print",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-dayin" aria-hidden="true"></i>'
          }, {
            text: "",
            value: "split",
            example: ""
          }, {
            text: locale_print.menuItemAreas,
            value: "areas",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-tihuan" aria-hidden="true"></i>'
          }, {
            text: locale_print.menuItemRows,
            value: "rows",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-zhuandao1" aria-hidden="true"></i>'
          }, {
            text: locale_print.menuItemColumns,
            value: "columns",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-dingwei" aria-hidden="true"></i>'
          }];
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "print",
            item: itemset,
            subclass: "",
            sub: ""
          });
          $("body").append(menu);
          $menuButton = $("#" + menuButtonId).width(180);
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            if (itemvalue == "print") {
              //Print config
              let luckysheetPrint = null;
              if (Store.luckysheetPrint) {
                luckysheetPrint = Store.luckysheetPrint;
                const plugin = Store.plugins.find(item => item.name === "print");
                if (plugin && plugin.config) {
                  luckysheetPrint.createDialog();
                  luckysheetPrint.init(plugin.config.license);
                }
              }
            } else if (itemvalue == "areas" || itemvalue == "rows" || itemvalue == "columns") {
              //range
              alert("areas");
            }
          });
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
