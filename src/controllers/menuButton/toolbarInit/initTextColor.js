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
      let textColorEl = document.getElementById("luckysheet-icon-text-color");
      textColorEl?.addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      });
      textColorEl?.addEventListener("click", function () {
        let d = editor.deepCopyFlowData(Store.sheetData);
        let color = this.getAttribute("color");
        if (color == null) {
          color = "#000000";
        }
        _this.updateFormat(d, "fc", color);
      });
      let textColorMenuEl = document.getElementById("luckysheet-icon-text-color-menu");
      textColorMenuEl?.addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      });
      textColorMenuEl?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        if (menuButton == null) {
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
              const _elTextColorBar = document.querySelector("#luckysheet-icon-text-color .text-color-bar"); if (_elTextColorBar) _elTextColorBar.style.backgroundColor = hexColor;
              document.getElementById("luckysheet-icon-text-color")?.setAttribute("color", hexColor);
              let d = editor.deepCopyFlowData(Store.sheetData);
              _this.updateFormat(d, "fc", hexColor);
              menuButton.style.display = "none";
              luckysheetContainerFocus();
            }
          });
          menuButton.querySelectorAll(".luckysheet-color-reset").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
            let input = document.querySelector("#" + menuButtonId + " .luckysheet-color-selected");
            input.value = "#000000";
            document.getElementById("luckysheet-icon-text-color")?.removeAttribute("color");
            getPicker(input)?.set("#000000");
            const _elIndicator = document.querySelector("#luckysheet-icon-text-color .luckysheet-color-menu-button-indicator"); if (_elIndicator) _elIndicator.style.borderBottomColor = "#000000";
            const _elBar = document.querySelector("#luckysheet-icon-text-color .text-color-bar"); if (_elBar) _elBar.style.backgroundColor = "#000000";
            let d = editor.deepCopyFlowData(Store.sheetData);
            _this.updateFormat(d, "fc", null);
            });
          });

          menuButton.querySelectorAll(".luckysheet-icon-alternateformat").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
            if (Store.selections.length > 1) {
              if (isEditMode()) {
                alert(locale_alternatingColors.errorInfo);
              } else {
                tooltip.info(locale_alternatingColors.errorInfo, "");
              }
              return;
            }
            let range = structuredClone(Store.selections[0]);
            let isExists = alternateformat.rangeIsExists(range)[0];
            if (!isExists) {
              alternateformat.modelfocusIndex = 0;
              alternateformat.new(range);
            }
            alternateformat.init();
            alternateformat.perfect();
            });
          });
        }
        let userlen = this.offsetWidth;
        let tlen = menuButton.offsetWidth;
        let menuleft = this.getBoundingClientRect().left + window.pageXOffset;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        let offsetTop = this.getBoundingClientRect().top + window.pageYOffset + 26;
        setTimeout(function () {
          let input = document.querySelector("#" + menuButtonId + " .luckysheet-color-selected");
          getPicker(input)?.set(input.value);
          getPicker(input)?.resetView();
          mouseclickposition(menuButton, menuleft - 28, offsetTop, "lefttop");
        }, 1);
      });
}
