import { hideMenuByCancel } from '../../../global/cursorPos';
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
      let cellColorEl = document.getElementById("luckysheet-icon-cell-color");
      cellColorEl?.addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      });
      cellColorEl?.addEventListener("click", function () {
        let d = editor.deepCopyFlowData(Store.sheetData);
        let color = this.getAttribute("color");
        if (color == null) {
          color = "#ffffff";
        }
        _this.updateFormat(d, "bg", color);
      });
      let cellColorMenuEl = document.getElementById("luckysheet-icon-cell-color-menu");
      cellColorMenuEl?.addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      });
      cellColorMenuEl?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        if (menuButton == null) {
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
          document.body.insertAdjacentHTML('beforeend', menu);
          menuButton = document.getElementById(menuButtonId);
          createColorPicker(document.querySelector("#" + menuButtonId + " .luckysheet-color-selected"), {
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
              const _elCellColorBar = document.querySelector("#luckysheet-icon-cell-color .text-color-bar"); if (_elCellColorBar) _elCellColorBar.style.backgroundColor = hexColor;
              document.getElementById("luckysheet-icon-cell-color")?.setAttribute("color", hexColor);
              let d = editor.deepCopyFlowData(Store.sheetData);
              _this.updateFormat(d, "bg", hexColor);
              menuButton.style.display = "none";
              luckysheetContainerFocus();
            }
          });
          menuButton.querySelectorAll(".luckysheet-color-reset").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
            let input = document.querySelector("#" + menuButtonId + " .luckysheet-color-selected");
            input.value = "#ffffff";
            document.getElementById("luckysheet-icon-cell-color")?.removeAttribute("color");
            getPicker(input)?.set("#ffffff");
            const _elIndicator = document.querySelector("#luckysheet-icon-cell-color .luckysheet-color-menu-button-indicator"); if (_elIndicator) _elIndicator.style.borderColor = "#ffffff";
            const _elBar = document.querySelector("#luckysheet-icon-cell-color .text-color-bar"); if (_elBar) _elBar.style.backgroundColor = "#ffffff";
            let d = editor.deepCopyFlowData(Store.sheetData);
            _this.updateFormat(d, "bg", null);
            });
          });

          menuButton.querySelectorAll(".luckysheet-icon-alternateformat").forEach(function (item) {
            item.addEventListener("click", function () {
              if (!checkIsAllowEdit()) {
                return;
              }
              menuButton.style.display = "none";
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
          });
          const _elColorSelected = document.querySelector("#" + menuButtonId + " .luckysheet-color-selected"); if (_elColorSelected) _elColorSelected.value = "#fff";
        }
        let userlen = this.offsetWidth;
        let tlen = menuButton.offsetWidth;
        let btnRect = this.getBoundingClientRect();
        let menuleft = btnRect.left + window.pageXOffset;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        let offsetTop = btnRect.top + window.pageYOffset + 26;
        setTimeout(function () {
          let input = document.querySelector("#" + menuButtonId + " .luckysheet-color-selected");
          getPicker(input)?.set(input.value);
          getPicker(input)?.resetView();
          mouseclickposition(menuButton, menuleft - 28, offsetTop, "lefttop");
        }, 1);
      });
}
