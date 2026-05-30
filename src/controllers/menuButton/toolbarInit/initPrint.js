import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';

export function initPrint(_this) {
      //print
      document.getElementById("luckysheet-icon-print")?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        const _locale = locale();
        const locale_print = _locale.print;
        if (menuButton == null) {
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
          document.body.insertAdjacentHTML('beforeend', menu);
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "180px";
          menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
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
          });
        }
        let userlen = this.offsetWidth;
        let tlen = menuButton.offsetWidth;
        let menuleft = this.getBoundingClientRect().left + window.pageXOffset;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition(menuButton, menuleft, this.getBoundingClientRect().top + window.pageYOffset + 25, "lefttop");
      });
}
