import editor from '../../../global/editor';
import tooltip from '../../../global/tooltip';
import { checkIsAllowEdit, isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import alternateformat from '../../alternateformat';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';
import { createColorPicker, getPicker, STANDARD_PALETTE } from '../../../components/ColorPicker';
import '../../../components/ColorPicker/colorPicker.css';

export function initCellColor(_this) {
      //背景颜色
      $("#luckysheet-icon-cell-color").click(function () {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let color = $(this).attr("color");
        if (color == null) {
          color = "#ffffff";
        }
        _this.updateFormat(d, "bg", color);
      });
      $("#luckysheet-icon-cell-color-menu").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        if ($menuButton.length == 0) {
          let subid = "cell-color-self";
          const _locale = locale();
          const locale_toolbar = _locale.toolbar;
          const locale_button = _locale.button;
          const locale_alternatingColors = _locale.alternatingColors;
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
            color: luckysheetConfigsetting.defaultCellColor,
            chooseText: locale_button.confirm,
            cancelText: locale_button.cancel,
            togglePaletteMoreText: locale_toolbar.customColor,
            togglePaletteLessText: locale_toolbar.collapse,
            localStorageKey: "spectrum.bgcolor" + luckysheetConfigsetting.gridKey,
            maxPaletteSize: 8,
            palette: STANDARD_PALETTE,
            change: function (color) {
              let hexColor = color != null ? color.toHexString() : "#fff";
              document.querySelector("#luckysheet-icon-cell-color .text-color-bar").style.backgroundColor = hexColor;
              document.getElementById("luckysheet-icon-cell-color").setAttribute("color", hexColor);
              let d = editor.deepCopyFlowData(Store.flowdata);
              _this.updateFormat(d, "bg", hexColor);
              $menuButton.hide();
              luckysheetContainerFocus();
            }
          });
          $menuButton.find(".luckysheet-color-reset").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let input = document.querySelector("#" + menuButtonId + " .luckysheet-color-selected");
            input.value = "#ffffff";
            document.getElementById("luckysheet-icon-cell-color").removeAttribute("color");
            getPicker(input)?.set("#ffffff");
            document.querySelector("#luckysheet-icon-cell-color .luckysheet-color-menu-button-indicator").style.borderBottomColor = "#ffffff";
            document.querySelector("#luckysheet-icon-cell-color .text-color-bar").style.backgroundColor = "#ffffff";
            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat(d, "bg", null);
          });
  
          //交替颜色
          $menuButton.find(".luckysheet-icon-alternateformat").click(function () {
            // *如果禁止前台编辑，则中止下一步操�?
            if (!checkIsAllowEdit()) {
              return;
            }
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
          document.querySelector("#" + menuButtonId + " .luckysheet-color-selected").value = "#fff";
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
