import editor from '../../../global/editor';
import { luckysheetrefreshgrid } from '../../../global/refresh';
import { checkIsAllowEdit } from '../../../global/validate';
import locale from '../../../locale/locale';
import { getSheetIndex } from '../../../methods/get';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { iconfontObjects } from '../../constant';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';

export function initBorder(_this) {
      //边框设置
      $("#luckysheet-icon-border-all").click(function () {
        // *如果禁止前台编辑，则中止下一步操�?
        if (!checkIsAllowEdit()) {
          return;
        }
        let d = editor.deepCopyFlowData(Store.flowdata);
        let type = $(this).attr("type");
        if (type == null) {
          type = "border-all";
        }
        let subcolormenuid = "luckysheet-icon-borderColor-menuButton";
        let color = $("#" + subcolormenuid).find(".luckysheet-color-selected").val();
        let style = $("#luckysheetborderSizepreview").attr("itemvalue");
        if (color == null || color == "") {
          color = "#000";
        }
        if (style == null || style == "") {
          style = "1";
        }
        let cfg = $.extend(true, {}, Store.config);
        if (cfg["borderInfo"] == null) {
          cfg["borderInfo"] = [];
        }
        let borderInfo = {
          rangeType: "range",
          borderType: type,
          color: color,
          style: style,
          range: $.extend(true, [], Store.luckysheet_select_save)
        };
        cfg["borderInfo"].push(borderInfo);
        if (Store.clearjfundo) {
          Store.jfundo.length = 0;
          let redo = [];
          redo["type"] = "borderChange";
          redo["config"] = $.extend(true, {}, Store.config);
          redo["curconfig"] = $.extend(true, {}, cfg);
          redo["sheetIndex"] = Store.currentSheetIndex;
          Store.jfredo.push(redo);
        }
        Store.config = cfg;
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;
        setTimeout(function () {
          luckysheetrefreshgrid();
        }, 1);
      });
      $("#luckysheet-icon-border-menu").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        if ($menuButton.length == 0) {
          let canvasH = 10,
            canvasW = 120;
          const _locale = locale();
          const locale_border = _locale.border;
          const locale_toolbar = _locale.toolbar;
          const locale_button = _locale.button;
          let itemdata = [{
            text: locale_border.borderTop,
            value: "border-top",
            example: '<div class="luckysheet-icon luckysheet-inline-block luckysheet-material-icon luckysheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-border-top iconfont-luckysheet luckysheet-iconfont-shangbiankuang" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_border.borderBottom,
            value: "border-bottom",
            example: '<div class="luckysheet-icon luckysheet-inline-block luckysheet-material-icon luckysheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-border-bottom iconfont-luckysheet luckysheet-iconfont-xiabiankuang" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_border.borderLeft,
            value: "border-left",
            example: '<div class="luckysheet-icon luckysheet-inline-block luckysheet-material-icon luckysheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-border-left iconfont-luckysheet luckysheet-iconfont-zuobiankuang" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_border.borderRight,
            value: "border-right",
            example: '<div class="luckysheet-icon luckysheet-inline-block luckysheet-material-icon luckysheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-border-right iconfont-luckysheet luckysheet-iconfont-youbiankuang" style="user-select: none;"> </div> </div>'
          }, {
            text: "",
            value: "split",
            example: ""
          }, {
            text: locale_border.borderNone,
            value: "border-none",
            example: '<div class="luckysheet-icon luckysheet-inline-block luckysheet-material-icon luckysheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-border-none iconfont-luckysheet luckysheet-iconfont-wubiankuang" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_border.borderAll,
            value: "border-all",
            example: '<div class="luckysheet-icon luckysheet-inline-block luckysheet-material-icon luckysheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-border-all iconfont-luckysheet luckysheet-iconfont-quanjiabiankuang" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_border.borderOutside,
            value: "border-outside",
            example: '<div class="luckysheet-icon luckysheet-inline-block luckysheet-material-icon luckysheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-border-outside iconfont-luckysheet luckysheet-iconfont-sizhoujiabiankuang" style="user-select: none;"> </div> </div>'
          }, {
            text: "",
            value: "split",
            example: ""
          }, {
            text: locale_border.borderInside,
            value: "border-inside",
            example: '<div class="luckysheet-icon luckysheet-inline-block luckysheet-material-icon luckysheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-border-inside iconfont-luckysheet luckysheet-iconfont-neikuangxian" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_border.borderHorizontal,
            value: "border-horizontal",
            example: '<div class="luckysheet-icon luckysheet-inline-block luckysheet-material-icon luckysheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-border-horizontal iconfont-luckysheet luckysheet-iconfont-neikuanghengxian" style="user-select: none;"> </div> </div>'
          }, {
            text: locale_border.borderVertical,
            value: "border-vertical",
            example: '<div class="luckysheet-icon luckysheet-inline-block luckysheet-material-icon luckysheet-mousedown-cancel" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-border-vertical iconfont-luckysheet luckysheet-iconfont-neikuangshuxian" style="user-select: none;"> </div> </div>'
          }, {
            text: "",
            value: "split",
            example: ""
          }, {
            text: "<span id='luckysheet-icon-borderColor-linecolor' class='luckysheet-mousedown-cancel' style='border-bottom:3px solid #000;'>" + locale_border.borderColor + "</span>",
            value: "borderColor",
            example: "more"
          }, {
            text: "" + locale_border.borderSize + "<img id='luckysheetborderSizepreview' width=100 height=10 src='data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==' style='position:absolute;bottom:-5px;right:0px;width:100px;height:10px;'>",
            value: "borderSize",
            example: "more"
          }];
  
          // itemvalue to iconfont
          const iconfontObject = iconfontObjects.border;
          let itemset = _this.createButtonMenu(itemdata);
          let menu = replaceHtml(_this.menu, {
            id: "border-menu",
            item: itemset,
            subclass: "",
            sub: ""
          });
          let subitemdata = [{
            text: locale_border.borderNone,
            value: "0",
            example: ""
          }, {
            text: "<canvas type='Thin' class='border-Thin' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "1",
            example: ""
          }, {
            text: "<canvas type='Hair' class='border-Hair' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "2",
            example: ""
          }, {
            text: "<canvas type='Dotted' class='border-Dotted' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "3",
            example: ""
          }, {
            text: "<canvas type='Dashed' class='border-Dashed' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "4",
            example: ""
          }, {
            text: "<canvas type='DashDot' class='border-DashDot' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "5",
            example: ""
          }, {
            text: "<canvas type='DashDotDot' class='border-DashDotDot' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "6",
            example: ""
          },
          // {"text":"<canvas type='Double' class='border-Double' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value":"7", "example":""},
          {
            text: "<canvas type='Medium' class='border-Medium' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "8",
            example: ""
          }, {
            text: "<canvas type='MediumDashed' class='border-MediumDashed' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "9",
            example: ""
          }, {
            text: "<canvas type='MediumDashDot' class='border-MediumDashDot' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "10",
            example: ""
          }, {
            text: "<canvas type='MediumDashDotDot' class='border-MediumDashDotDot' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "11",
            example: ""
          },
          // {"text":"<canvas type='SlantedDashDot' class='border-SlantedDashDot' width="+ canvasW +" height="+ canvasH +" style='width:"+ canvasW +"px;height:"+ canvasH +"px;position:static;'></canvas>", "value":"12", "example":""},
          {
            text: "<canvas type='Thick' class='border-Thick' width=" + canvasW + " height=" + canvasH + " style='width:" + canvasW + "px;height:" + canvasH + "px;position:static;'></canvas>",
            value: "13",
            example: ""
          }];
          let subitemset = _this.createButtonMenu(subitemdata);
          let submenu = replaceHtml(_this.menu, {
            id: "borderSize",
            item: subitemset,
            subclass: "luckysheet-menuButton-sub"
          });
          let submenuid = "luckysheet-icon-borderSize-menuButton";
          let subcolormenuid = "luckysheet-icon-borderColor-menuButton";
          let colormenu = replaceHtml(_this.color, {
            id: subcolormenuid,
            coloritem: "",
            colorself: "",
            sub: "luckysheet-menuButton-sub",
            resetColor: locale_toolbar.resetColor
          });
          $("body").append(menu + colormenu + submenu);
          $menuButton = $("#" + menuButtonId).width(170);
          _this.focus($menuButton, "border-all");
          $("#" + submenuid + " canvas").each(function (i) {
            let type = $(this).attr("type");
            let itemvalue = $(this).closest(".luckysheet-cols-menuitem").attr("itemvalue");
            let canvasborder = $(this).addClass("luckysheet-mousedown-cancel").get(0).getContext("2d");
            canvasborder.translate(0.5, 0.5);
            _this.setLineDash(canvasborder, itemvalue, "h", 0, 5, 100, 5);
            canvasborder.strokeStyle = "#000000";
            canvasborder.stroke();
            canvasborder.closePath();
          });
          $("#" + submenuid + " .luckysheet-cols-menuitem").click(function () {
            $("#" + submenuid).hide();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            if (itemvalue == 0) {
              $("#luckysheetborderSizepreview").attr("src", "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==").attr("itemvalue", null);
            } else {
              let bg = $t.find("canvas").get(0).toDataURL("image/png");
              $("#luckysheetborderSizepreview").attr("src", bg).attr("itemvalue", itemvalue);
            }
            _this.focus($("#" + submenuid), itemvalue);
          });
  
          // border choose menu
          $menuButton.find(".luckysheet-cols-menuitem").click(function () {
            // *如果禁止前台编辑，则中止下一步操�?
            if (!checkIsAllowEdit()) {
              return;
            }
            $menuButton.hide();
            luckysheetContainerFocus();
            let $t = $(this),
              itemvalue = $t.attr("itemvalue");
            if (itemvalue == "borderColor" || itemvalue == "borderSize") {
              return;
            }
            let d = editor.deepCopyFlowData(Store.flowdata);
            let color = $("#" + subcolormenuid).find(".luckysheet-color-selected").val();
            let style = $("#luckysheetborderSizepreview").attr("itemvalue");
            if (color == null || color == "") {
              color = "#000";
            }
            if (style == null || style == "") {
              style = "1";
            }
            let cfg = $.extend(true, {}, Store.config);
            if (cfg["borderInfo"] == null) {
              cfg["borderInfo"] = [];
            }
            let borderInfo = {
              rangeType: "range",
              borderType: itemvalue,
              color: color,
              style: style,
              range: $.extend(true, [], Store.luckysheet_select_save)
            };
            cfg["borderInfo"].push(borderInfo);
            if (Store.clearjfundo) {
              Store.jfundo.length = 0;
              let redo = [];
              redo["type"] = "borderChange";
              redo["config"] = $.extend(true, {}, Store.config);
              redo["curconfig"] = $.extend(true, {}, cfg);
              redo["sheetIndex"] = Store.currentSheetIndex;
              Store.jfredo.push(redo);
            }
            Store.config = cfg;
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;
            setTimeout(function () {
              luckysheetrefreshgrid();
            }, 1);
            $("#luckysheet-icon-border-all").attr("type", itemvalue);
            let $icon = $("#luckysheet-icon-border-all").find(".luckysheet-icon-img-container");
  
            // add iconfont
            $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-" + itemvalue + iconfontObject[itemvalue]);
            _this.focus($menuButton, itemvalue);
          });
          $("#" + subcolormenuid).find(".luckysheet-color-selected").spectrum({
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
            color: "#000",
            cancelText: locale_button.cancel,
            chooseText: locale_button.confirm,
            togglePaletteMoreText: locale_toolbar.customColor,
            togglePaletteLessText: locale_toolbar.collapse,
            togglePaletteOnly: true,
            clearText: locale_toolbar.clearText,
            noColorSelectedText: locale_toolbar.noColorSelectedText,
            localStorageKey: "spectrum.bordercolor" + luckysheetConfigsetting.gridKey,
            palette: [["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"], ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"], ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"], ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"], ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"], ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"], ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"], ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]],
            change: function (color) {
              let $input = $(this);
              if (color != null) {
                color = color.toHexString();
              } else {
                color = "#000";
              }
              let oldcolor = null;
              $("#luckysheet-icon-borderColor-linecolor").css("border-bottom-color", color);
              $("#" + subcolormenuid).find(".luckysheet-color-selected").val(color);
            }
          });
          $("#" + subcolormenuid).find(".luckysheet-color-reset").click(function () {
            let $input = $("#" + subcolormenuid).find(".luckysheet-color-selected");
            $input.val("#000");
            $("#luckysheet-icon-cell-color").attr("color", null);
            $input.spectrum("set", "#000");
            $("#luckysheet-icon-borderColor-linecolor").css("border-bottom-color", "#000");
          });
        }
        let userlen = $(this).outerWidth();
        let tlen = $menuButton.outerWidth();
        let menuleft = $(this).offset().left;
        if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition($menuButton, menuleft - 28, $(this).offset().top + 25, "lefttop");
      });
}
