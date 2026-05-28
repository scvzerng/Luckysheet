import editor from '../../../global/editor';
import tooltip from '../../../global/tooltip';
import { checkIsAllowEdit, isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import alternateformat from '../../alternateformat';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';

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
          $("#" + menuButtonId).find(".luckysheet-color-selected").spectrum({
            showPalette: true,
            showPaletteOnly: true,
            preferredFormat: "hex",
            clickoutFiresChange: false,
            showInitial: true,
            showInput: true,
            flat: true,
            hideAfterPaletteSelect: true,
            showSelectionPalette: true,
            maxPaletteSize: 8,
            maxSelectionSize: 8,
            color: luckysheetConfigsetting.defaultCellColor,
            cancelText: locale_button.cancel,
            chooseText: locale_button.confirm,
            togglePaletteMoreText: locale_toolbar.customColor,
            togglePaletteLessText: locale_toolbar.collapse,
            togglePaletteOnly: true,
            clearText: locale_toolbar.clearText,
            noColorSelectedText: locale_toolbar.noColorSelectedText,
            localStorageKey: "spectrum.bgcolor" + luckysheetConfigsetting.gridKey,
            palette: [["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"], ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"], ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"], ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"], ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"], ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"], ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"], ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]],
            change: function (color) {
              let $input = $(this);
              if (color != null) {
                color = color.toHexString();
              } else {
                color = "#fff";
              }
              let oldcolor = null;
              // $("#luckysheet-icon-cell-color .luckysheet-color-menu-button-indicator").css("border-bottom-color", color);
              // 下边框换成了一个DIV
              $("#luckysheet-icon-cell-color .text-color-bar").css("background-color", color);
              $("#luckysheet-icon-cell-color").attr("color", color);
              let d = editor.deepCopyFlowData(Store.flowdata);
              _this.updateFormat(d, "bg", color);
              $menuButton.hide();
              luckysheetContainerFocus();
            }
          });
          $menuButton.find(".luckysheet-color-reset").click(function () {
            $menuButton.hide();
            luckysheetContainerFocus();
            let $input = $("#" + menuButtonId).find(".luckysheet-color-selected");
            $input.val("#ffffff");
            $("#luckysheet-icon-cell-color").attr("color", null);
            $input.spectrum("set", "#ffffff");
            $("#luckysheet-icon-cell-color .luckysheet-color-menu-button-indicator").css("border-bottom-color", "#ffffff");
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
            let range = $.extend(true, {}, Store.luckysheet_select_save[0]);
            let isExists = alternateformat.rangeIsExists(range)[0];
            if (!isExists) {
              alternateformat.modelfocusIndex = 0;
              alternateformat.new(range);
            }
            alternateformat.init();
            alternateformat.perfect();
          });
          $("#" + menuButtonId).find(".luckysheet-color-selected").val("#fff");
        }
        let userlen = $(this).outerWidth();
        let tlen = $menuButton.outerWidth();
        let menuleft = $(this).offset().left;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        let offsetTop = $(this).offset().top + 26;
        setTimeout(function () {
          let $input = $("#" + menuButtonId).find(".luckysheet-color-selected");
          $input.spectrum("set", $input.val());
          mouseclickposition($menuButton, menuleft - 28, offsetTop, "lefttop");
        }, 1);
      });
}
