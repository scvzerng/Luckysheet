import { sortSelection } from '../../../global/sort';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import { createFilter } from '../../filter';

export function initAutofilter(_this) {
      //过滤和排�?
      $("#luckysheet-icon-autofilter").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        if ($menuButton.length == 0) {
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
          $("body").append(menu);
          $menuButton = $("#" + menuButtonId).width(150);
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            if (itemvalue == "diysort") {
              $("#luckysheetorderby").click();
            } else if (itemvalue == "asc") {
              sortSelection(true);
            } else if (itemvalue == "desc") {
              sortSelection(false);
            } else if (itemvalue == "filter") {
              if ($("#luckysheet-filter-options-sheet" + Store.currentSheetIndex).length > 0) {
                $("#luckysheet-filter-initial").click();
              } else {
                createFilter();
              }
            } else if (itemvalue == "clearfilter") {
              $("#luckysheet-filter-initial").click();
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
