import { sortSelection } from '../../../global/sort';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import { createFilter } from '../../filter';

export function initAutofilter(_this) {
      //过滤和排�?
      document.getElementById("luckysheet-icon-autofilter")?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        if (menuButton == null) {
          const _locale = locale();
          const locale_sort = _locale.sort;
          const locale_filter = _locale.filter;
          let itemdata = [{
            text: locale_sort.asc,
            value: "asc",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-shengxu" aria-hidden="true"></i>'
          }, {
            text: locale_sort.desc,
            value: "desc",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-jiangxu" aria-hidden="true"></i>'
          }, {
            text: locale_sort.custom + "...",
            value: "diysort",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-zidingyipaixu" aria-hidden="true"></i>'
          }, {
            text: "",
            value: "split",
            example: ""
          }, {
            text: locale_filter.filter,
            value: "filter",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-shaixuan2" aria-hidden="true"></i>'
          }, {
            text: locale_filter.clearFilter,
            value: "clearfilter",
            example: '<i class="iconfont-luckysheet luckysheet-iconfont-qingchushaixuan" aria-hidden="true"></i>'
          }];
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "autofilter",
            item: itemset,
            subclass: "",
            sub: ""
          });
          document.body.insertAdjacentHTML('beforeend', menu);
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "150px";
          menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
              if (itemvalue == "diysort") {
                document.getElementById("luckysheetorderby")?.click();
              } else if (itemvalue == "asc") {
                sortSelection(true);
              } else if (itemvalue == "desc") {
                sortSelection(false);
              } else if (itemvalue == "filter") {
                if (document.getElementById("luckysheet-filter-options-sheet" + Store.currentSheetIndex) != null) {
                  document.getElementById("luckysheet-filter-initial")?.click();
                } else {
                  createFilter();
                }
              } else if (itemvalue == "clearfilter") {
                document.getElementById("luckysheet-filter-initial")?.click();
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
