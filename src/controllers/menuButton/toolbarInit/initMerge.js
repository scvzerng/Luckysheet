import editor from '../../../global/editor';
import tooltip from '../../../global/tooltip';
import { hasPartMC, isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import { selectIsOverlap } from '../../select';

export function initMerge(_this) {
      //合并单元�?
      $("#luckysheet-icon-merge-button").click(function () {
        const _locale = locale();
        const locale_merge = _locale.merge;
        if (selectIsOverlap()) {
          if (isEditMode()) {
            alert(locale_merge.overlappingError);
          } else {
            tooltip.info(locale_merge.overlappingError, "");
          }
          return;
        }
        if (Store.config["merge"] != null) {
          let has_PartMC = false;
          for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
            let r1 = Store.luckysheet_select_save[s].row[0],
              r2 = Store.luckysheet_select_save[s].row[1];
            let c1 = Store.luckysheet_select_save[s].column[0],
              c2 = Store.luckysheet_select_save[s].column[1];
            has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);
            if (has_PartMC) {
              break;
            }
          }
          if (has_PartMC) {
            if (isEditMode()) {
              alert(locale_merge.partiallyError);
            } else {
              tooltip.info(locale_merge.partiallyError, "");
            }
            return;
          }
        }
        let d = editor.deepCopyFlowData(Store.flowdata);
        _this.updateFormat_mc(d, "mergeAll");
      });
      $("#luckysheet-icon-merge-menu").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        if ($menuButton.length == 0) {
          const _locale = locale();
          const locale_merge = _locale.merge;
          let itemdata = [{
            text: locale_merge.mergeAll,
            value: "mergeAll",
            example: ""
          }, {
            text: locale_merge.mergeV,
            value: "mergeV",
            example: ""
          }, {
            text: locale_merge.mergeH,
            value: "mergeH",
            example: ""
          }, {
            text: locale_merge.mergeCancel,
            value: "mergeCancel",
            example: ""
          }];
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "merge-menu",
            item: itemset,
            subclass: "",
            sub: ""
          });
          document.body.insertAdjacentHTML('beforeend', menu);
          $menuButton = $("#" + menuButtonId);
          _this.focus($menuButton);
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            if (selectIsOverlap()) {
              if (isEditMode()) {
                alert(locale_merge.overlappingError);
              } else {
                tooltip.info(locale_merge.overlappingError, "");
              }
              return;
            }
            if (Store.config["merge"] != null) {
              let has_PartMC = false;
              for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
                let r1 = Store.luckysheet_select_save[s].row[0],
                  r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0],
                  c2 = Store.luckysheet_select_save[s].column[1];
                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);
                if (has_PartMC) {
                  break;
                }
              }
              if (has_PartMC) {
                if (isEditMode()) {
                  alert(locale_merge.partiallyError);
                } else {
                  tooltip.info(locale_merge.partiallyError, "");
                }
                return;
              }
            }
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            _this.focus($menuButton, itemvalue);
            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat_mc(d, itemvalue);
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
