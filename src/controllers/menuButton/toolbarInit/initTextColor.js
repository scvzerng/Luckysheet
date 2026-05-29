import { hideMenuByCancel } from '../../../global/cursorPos';
import editor from '../../../global/editor';
import tooltip from '../../../global/tooltip';
import { isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import alternateformat from '../../alternateformat';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';
import { createColorPicker, getPicker, STANDARD_PALETTE } from '../../../components/ColorPicker';
import '../../../components/ColorPicker/colorPicker.css';

export function initTextColor(_this) {
      //字体颜色
      $("#luckysheet-icon-text-color").mousedown(function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      }).click(function () {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let color = $(this).attr("color");
        if (color == null) {
          color = "#000000";
        }
        _this.updateFormat(d, "fc", color);
      });
      $("#luckysheet-icon-text-color-menu").mousedown(function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      }).click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        if ($menuButton.length == 0) {
          const _locale = locale();
          const locale_toolbar = _locale.toolbar;
          const locale_button = _locale.button;
          const locale_alternatingColors = _locale.alternatingColors;
          let itemdata = [{
            name: locale_toolbar.alternatingColors + "...",
            id: "luckysheet-color-alternate",
            example: ""
          }];
          let itemset = _this.createButtonMenu(itemdata);
          let subid = "text-color-self";
          let coloritem = replaceHtml(_this.coloritem, {
            class: "luckysheet-icon-alternateformat",
            name: locale_toolbar.alternatingColors + "..."
          });
          let menu = replaceHtml(_this.color, {
            id: menuButtonId,
            coloritem: coloritem,
            colorself: subid,
            sub: "",
            resetColor: locale_toolbar.resetColor
          });
          $("body").append(menu);
          $menuButton = $("#" + menuButtonId);
          createColorPicker($("#" + menuButtonId).find(".luckysheet-color-selected")[0], {
            showPaletteOnly: true,
            flat: true,
            hideAfterPaletteSelect: true,
            showButtons: true,
            showInput: true,
            showInitial: true,
            togglePaletteOnly: true,
            color: luckysheetConfigsetting.defaultTextColor,
            chooseText: locale_button.confirm,
            cancelText: locale_button.cancel,
            togglePaletteMoreText: locale_toolbar.customColor,
            togglePaletteLessText: locale_toolbar.collapse,
            localStorageKey: "spectrum.textcolor" + luckysheetConfigsetting.gridKey,
            maxPaletteSize: 8,
            palette: STANDARD_PALETTE,
            change: function (color) {
              let hexColor = color != null ? color.toHexString() : "#000";
              document.querySelector("#luckysheet-icon-text-color .text-color-bar").style.backgroundColor = hexColor;
              document.getElementById("luckysheet-icon-text-color").setAttribute("color", hexColor);
              let d = editor.deepCopyFlowData(Store.flowdata);
              _this.updateFormat(d, "fc", hexColor);
              $menuButton.hide();
              luckysheetContainerFocus();
            }
          });
          $menuButton.find(".luckysheet-color-reset").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let input = document.querySelector("#" + menuButtonId + " .luckysheet-color-selected");
            input.value = "#000000";
            document.getElementById("luckysheet-icon-text-color").removeAttribute("color");
            getPicker(input)?.set("#000000");
            document.querySelector("#luckysheet-icon-text-color .luckysheet-color-menu-button-indicator").style.borderBottomColor = "#000000";
            document.querySelector("#luckysheet-icon-text-color .text-color-bar").style.backgroundColor = "#000000";
            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat(d, "fc", null);
          });
  
          //交替颜色
          $menuButton.find(".luckysheet-icon-alternateformat").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            if (Store.luckysheet_select_save.length > 1) {
              if (isEditMode()) {
                alert(locale_alternatingColors.errorInfo);
              } else {
                tooltip.info(locale_alternatingColors.errorInfo, "");
              }
              return;
            }
            let range = structuredClone(Store.luckysheet_select_save[0]);
            let isExists = alternateformat.rangeIsExists(range)[0];
            if (!isExists) {
              alternateformat.modelfocusIndex = 0;
              alternateformat.new(range);
            }
            alternateformat.init();
            alternateformat.perfect();
          });
        }
        let userlen = $(this).outerWidth();
        let tlen = $menuButton.outerWidth();
        let menuleft = $(this).offset().left;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        let offsetTop = $(this).offset().top + 26;
        setTimeout(function () {
          let input = document.querySelector("#" + menuButtonId + " .luckysheet-color-selected");
          getPicker(input)?.set(input.value);
          getPicker(input)?.resetView();
          mouseclickposition($menuButton, menuleft - 28, offsetTop, "lefttop");
        }, 1);
      });
}
