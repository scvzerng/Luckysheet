import { selectionCopyShow, selectIsOverlap } from "../select";
import { luckyColor, iconfontObjects } from "../constant";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetMoreFormat from "../moreFormat";
import alternateformat from "../alternateformat";
import conditionformat from "../conditionformat";
import { luckysheet_searcharray } from "../sheetSearch";
import luckysheetFreezen from "../freezen";
import luckysheetsizeauto from "../resize";
import { createFilter } from "../filter";
import luckysheetSearchReplace from "../searchReplace";
import luckysheetLocationCell from "../locationCell";
import ifFormulaGenerator from "../ifFormulaGenerator";
import { luckysheetupdateCell } from "../updateCell";
import insertFormula from "../insertFormula";
import sheetmanage from "../sheetmanage";
import luckysheetPostil from "../postil";
import { isRealNum, isRealNull, isEditMode, hasPartMC, checkIsAllowEdit } from "../../global/validate";
import tooltip from "../../global/tooltip";
import editor from "../../global/editor";
import { genarate, update, is_date } from "../../global/format";
import { jfrefreshgrid, luckysheetrefreshgrid } from "../../global/refresh";
import { sortSelection } from "../../global/sort";
import luckysheetformula from "../../global/formula";
import { rowLocationByIndex, colLocationByIndex } from "../../global/location";
import { isdatatypemulti } from "../../global/datecontroll";
import { rowlenByRange, getCellTextSplitArr } from "../../global/getRowlen";
import { setcellvalue } from "../../global/setdata";
import { getFontStyleByCell, checkstatusByCell } from "../../global/getdata";
import { countfunc } from "../../global/count";
import { hideMenuByCancel } from "../../global/cursorPos";
import { getSheetIndex, getRangetxt, getluckysheetfile } from "../../methods/get";
import { setluckysheetfile } from "../../methods/set";
import { isInlineStringCell, isInlineStringCT, updateInlineStringFormat, convertCssToStyleList, inlineStyleAffectAttribute, updateInlineStringFormatOutside } from "../inlineString";
import { replaceHtml, getObjType, rgbTohex, mouseclickposition, luckysheetfontformat, luckysheetContainerFocus } from "../../utils/util";
import Store from "../../store";
import locale from "../../locale/locale";
import { checkTheStatusOfTheSelectedCells, frozenFirstRow, frozenFirstColumn } from "../../global/api";
const toolbarInitModule = {
  initialMenuButton: function () {
    let _this = this;

    //格式刷
    $("#luckysheet-icon-paintformat").click(function (e) {
      // *如果禁止前台编辑，则中止下一步操作
      if (!checkIsAllowEdit()) {
        return;
      }
      e.stopPropagation();
      let _locale = locale();
      let locale_paint = _locale.paint;
      if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
        if (isEditMode()) {
          alert(locale_paint.tipSelectRange);
        } else {
          tooltip.info("", locale_paint.tipSelectRange);
        }
        return;
      } else if (Store.luckysheet_select_save.length > 1) {
        if (isEditMode()) {
          alert(locale_paint.tipNotMulti);
        } else {
          tooltip.info("", locale_paint.tipNotMulti);
        }
        return;
      }

      // *增加了对选区范围是否为部分合并单元格的校验，如果为部分合并单元格，就阻止格式刷的下一步
      // TODO 这里也可以改为：判断到是合并单元格的一部分后，格式刷执行黏贴格式后删除范围单元格的 mc 值

      let has_PartMC = false;
      let r1 = Store.luckysheet_select_save[0].row[0],
        r2 = Store.luckysheet_select_save[0].row[1];
      let c1 = Store.luckysheet_select_save[0].column[0],
        c2 = Store.luckysheet_select_save[0].column[1];
      has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);
      if (has_PartMC) {
        // *提示后中止下一步
        tooltip.info(_locale.merge.partiallyError, "");
        return;
      }
      tooltip.popover("<i class='fa fa-paint-brush'></i> " + locale_paint.start + "", "topCenter", true, null, locale_paint.end, function () {
        _this.cancelPaintModel();
      });
      $("#luckysheet-sheettable_0").addClass("luckysheetPaintCursor");
      Store.luckysheet_selection_range = [{
        row: Store.luckysheet_select_save[0].row,
        column: Store.luckysheet_select_save[0].column
      }];
      selectionCopyShow();
      let RowlChange = false,
        HasMC = false;
      for (let r = Store.luckysheet_select_save[0].row[0]; r <= Store.luckysheet_select_save[0].row[1]; r++) {
        if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null) {
          continue;
        }
        if (Store.config["rowlen"] != null && r in Store.config["rowlen"]) {
          RowlChange = true;
        }
        for (let c = Store.luckysheet_select_save[0].column[0]; c <= Store.luckysheet_select_save[0].column[1]; c++) {
          let cell = Store.flowdata[r][c];
          if (getObjType(cell) == "object" && "mc" in cell && cell.mc.rs != null) {
            HasMC = true;
          }
        }
      }
      Store.luckysheet_copy_save = {
        dataSheetIndex: Store.currentSheetIndex,
        copyRange: [{
          row: Store.luckysheet_select_save[0].row,
          column: Store.luckysheet_select_save[0].column
        }],
        RowlChange: RowlChange,
        HasMC: HasMC
      };
      _this.luckysheetPaintModelOn = true;
      _this.luckysheetPaintSingle = true;
    });
    $("#luckysheet-icon-paintformat").dblclick(function () {
      // *如果禁止前台编辑，则中止下一步操作
      if (!checkIsAllowEdit()) {
        return;
      }
      let _locale = locale();
      let locale_paint = _locale.paint;
      if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
        if (isEditMode()) {
          alert(locale_paint.tipSelectRange);
        } else {
          tooltip.info("", locale_paint.tipSelectRange);
        }
        return;
      } else if (Store.luckysheet_select_save.length > 1) {
        if (isEditMode()) {
          alert(locale_paint.tipNotMulti);
        } else {
          tooltip.info("", locale_paint.tipNotMulti);
        }
        return;
      }
      tooltip.popover("<i class='fa fa-paint-brush'></i> " + locale_paint.start, "topCenter", true, null, locale_paint.end, function () {
        _this.cancelPaintModel();
      });
      $("#luckysheet-sheettable_0").addClass("luckysheetPaintCursor");
      Store.luckysheet_selection_range = [{
        row: Store.luckysheet_select_save[0].row,
        column: Store.luckysheet_select_save[0].column
      }];
      selectionCopyShow();
      let RowlChange = false,
        HasMC = false;
      for (let r = Store.luckysheet_select_save[0].row[0]; r <= Store.luckysheet_select_save[0].row[1]; r++) {
        if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null) {
          continue;
        }
        if (Store.config["rowlen"] != null && r in Store.config["rowlen"]) {
          RowlChange = true;
        }
        for (let c = Store.luckysheet_select_save[0].column[0]; c <= Store.luckysheet_select_save[0].column[1]; c++) {
          let cell = Store.flowdata[r][c];
          if (getObjType(cell) == "object" && "mc" in cell && cell.mc.rs != null) {
            HasMC = true;
          }
        }
      }
      Store.luckysheet_copy_save = {
        dataSheetIndex: Store.currentSheetIndex,
        copyRange: [{
          row: Store.luckysheet_select_save[0].row,
          column: Store.luckysheet_select_save[0].column
        }],
        RowlChange: RowlChange,
        HasMC: HasMC
      };
      _this.luckysheetPaintModelOn = true;
      _this.luckysheetPaintSingle = false;
    });

    //货币格式
    $("#luckysheet-icon-currency").click(function () {
      let d = editor.deepCopyFlowData(Store.flowdata); //取数据

      _this.updateFormat(d, "ct", "¥ #.00");
    });

    //百分比
    $("#luckysheet-icon-percent").click(function () {
      let d = editor.deepCopyFlowData(Store.flowdata); //取数据

      _this.updateFormat(d, "ct", "0.00%");
    });

    //减少小数位数
    $("#luckysheet-icon-fmt-decimal-decrease").click(function () {
      let d = editor.deepCopyFlowData(Store.flowdata); //取数据
      let row_index = Store.luckysheet_select_save[0]["row_focus"],
        col_index = Store.luckysheet_select_save[0]["column_focus"];
      let foucsStatus = _this.checkstatus(d, row_index, col_index, "ct");
      let cell = d[row_index][col_index];
      if (foucsStatus == null || foucsStatus.t != "n") {
        return;
      }
      if (foucsStatus.fa == "General") {
        let mask = genarate(cell.v);
        foucsStatus = mask[1];
      }

      //万亿格式
      let reg = /^(w|W)((0?)|(0\.0+))$/;
      if (reg.test(foucsStatus.fa)) {
        if (foucsStatus.fa.indexOf(".") > -1) {
          if (foucsStatus.fa.substr(-2) == ".0") {
            _this.updateFormat(d, "ct", foucsStatus.fa.split(".")[0]);
          } else {
            _this.updateFormat(d, "ct", foucsStatus.fa.substr(0, foucsStatus.fa.length - 1));
          }
        } else {
          _this.updateFormat(d, "ct", foucsStatus.fa);
        }
        return;
      }
      //Uncaught ReferenceError: Cannot access 'fa' before initialization
      let prefix = "",
        main = "",
        fa = [];
      if (foucsStatus.fa.indexOf(".") > -1) {
        fa = foucsStatus.fa.split(".");
        prefix = fa[0];
        main = fa[1];
      } else {
        return;
      }
      fa = main.split("");
      let tail = "";
      for (let i = fa.length - 1; i >= 0; i--) {
        let c = fa[i];
        if (c != "#" && c != "0" && c != "," && isNaN(parseInt(c))) {
          tail = c + tail;
        } else {
          break;
        }
      }
      let fmt = "";
      if (foucsStatus.fa.indexOf(".") > -1) {
        let suffix = main;
        if (tail.length > 0) {
          suffix = main.replace(tail, "");
        }
        let pos = suffix.replace(/#/g, "0");
        pos = pos.substr(0, pos.length - 1);
        if (pos == "") {
          fmt = prefix + tail;
        } else {
          fmt = prefix + "." + pos + tail;
        }
      }
      _this.updateFormat(d, "ct", fmt);
    });

    //增加小数位数
    $("#luckysheet-icon-fmt-decimal-increase").click(function () {
      let d = editor.deepCopyFlowData(Store.flowdata); //取数据
      let row_index = Store.luckysheet_select_save[0]["row_focus"],
        col_index = Store.luckysheet_select_save[0]["column_focus"];
      let foucsStatus = _this.checkstatus(d, row_index, col_index, "ct");
      let cell = d[row_index][col_index];
      if (foucsStatus == null || foucsStatus.t != "n") {
        return;
      }
      if (foucsStatus.fa == "General") {
        let mask = genarate(cell.v);
        foucsStatus = mask[1];
      }
      if (foucsStatus.fa == "General") {
        _this.updateFormat(d, "ct", "#.0");
        return;
      }

      //万亿格式
      let reg = /^(w|W)((0?)|(0\.0+))$/;
      if (reg.test(foucsStatus.fa)) {
        if (foucsStatus.fa.indexOf(".") > -1) {
          _this.updateFormat(d, "ct", foucsStatus.fa + "0");
        } else {
          if (foucsStatus.fa.substr(-1) == "0") {
            _this.updateFormat(d, "ct", foucsStatus.fa + ".0");
          } else {
            _this.updateFormat(d, "ct", foucsStatus.fa + "0.0");
          }
        }
        return;
      }

      //Uncaught ReferenceError: Cannot access 'fa' before initialization
      let prefix = "",
        main = "",
        fa = [];
      if (foucsStatus.fa.indexOf(".") > -1) {
        fa = foucsStatus.fa.split(".");
        prefix = fa[0];
        main = fa[1];
      } else {
        main = foucsStatus.fa;
      }
      fa = main.split("");
      let tail = "";
      for (let i = fa.length - 1; i >= 0; i--) {
        let c = fa[i];
        if (c != "#" && c != "0" && c != "," && isNaN(parseInt(c))) {
          tail = c + tail;
        } else {
          break;
        }
      }
      let fmt = "";
      if (foucsStatus.fa.indexOf(".") > -1) {
        let suffix = main;
        if (tail.length > 0) {
          suffix = main.replace(tail, "");
        }
        let pos = suffix.replace(/#/g, "0");
        pos += "0";
        fmt = prefix + "." + pos + tail;
      } else {
        if (tail.length > 0) {
          fmt = main.replace(tail, "") + ".0" + tail;
        } else {
          fmt = main + ".0" + tail;
        }
      }
      _this.updateFormat(d, "ct", fmt);
    });

    //更多格式
    $("#luckysheet-icon-fmt-other").click(function () {
      const _locale = locale();
      const locale_format = _locale.format;
      const locale_defaultFmt = _locale.defaultFmt;
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      if ($menuButton.length == 0) {
        let itemdata = locale_defaultFmt;
        let itemset = _this.createButtonMenu(itemdata);

        // luckysheet-menuButton-sub
        let menu = replaceHtml(_this.menu, {
          id: "fmt-other",
          item: itemset,
          subclass: "",
          sub: ""
        });
        let subitemdata = [{
          text: locale_format.moreCurrency + "...",
          value: "morecurrency",
          example: ""
        }, {
          text: locale_format.moreDateTime + "...",
          value: "moredatetime",
          example: ""
        }, {
          text: locale_format.moreNumber + "...",
          value: "moredigit",
          example: ""
        }];
        let subitemset = _this.createButtonMenu(subitemdata);
        let submenu = replaceHtml(_this.menu, {
          id: "fmtOtherSelf",
          item: subitemset,
          subclass: "luckysheet-menuButton-sub"
        });

        //luckysheet-icon-fmt-other-menuButton_sub
        $("body").append(menu + submenu);
        $menuButton = $("#" + menuButtonId).width(250);
        _this.focus($menuButton);
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue"),
            itemname = $t.attr("itemname");
          $("#luckysheet-icon-fmt-other").find(".luckysheet-toolbar-menu-button-caption").html(" " + itemname + " ");
          if (itemvalue == "fmtOtherSelf") {
            return;
          }
          let d = editor.deepCopyFlowData(Store.flowdata); //取数据
          _this.focus($menuButton, itemvalue);
          _this.updateFormat(d, "ct", itemvalue);
        });

        //更多格式
        $("#luckysheet-icon-fmtOtherSelf-menuButton").find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          $("#luckysheet-icon-fmtOtherSelf-menuButton").hide();
          luckysheetContainerFocus();
          let itemvalue = $(this).attr("itemvalue");
          luckysheetMoreFormat.createDialog(itemvalue);
          luckysheetMoreFormat.init();
        });
      } else {
        const text = $(this).find(".luckysheet-toolbar-menu-button-caption").text().trim();
        const format = locale_defaultFmt.find(f => f.text === text);
        if (format) {
          _this.focus($menuButton, format.value);
        }
      }
      let userlen = $(this).outerWidth();
      let tlen = $menuButton.outerWidth();
      let menuleft = $(this).offset().left;
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
    });

    //字体设置
    $("#luckysheet-icon-font-family").mousedown(function (e) {
      hideMenuByCancel(e);
      e.stopPropagation();
    }).click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      if ($menuButton.length == 0) {
        // const locale_fontarray = locale().fontarray;
        // let itemdata = [];

        // for(let a=0;a<locale_fontarray.length;a++){
        //     let fItem = locale_fontarray[a];
        //     let ret = {};
        //     ret.value = a;
        //     ret.text = "<span class='luckysheet-mousedown-cancel' style='font-size:11px;font-family:"+fItem+"'>"+fItem+"</span>";
        //     ret.example = "";
        //     itemdata.push(ret);
        // }

        let itemset = _this.createButtonMenu(_this.fontSelectList);
        let menu = replaceHtml(_this.menu, {
          id: "font-family",
          item: itemset,
          subclass: "",
          sub: ""
        });
        $("body").append(menu);
        $menuButton = $("#" + menuButtonId).width(200);
        _this.focus($menuButton);
        $menuButton.on("click", ".luckysheet-cols-menuitem", function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue"),
            itemname = $t.attr("itemname");
          _this.focus($menuButton, itemvalue);
          $("#luckysheet-icon-font-family").find(".luckysheet-toolbar-menu-button-caption").html(" " + itemname + " ");
          let d = editor.deepCopyFlowData(Store.flowdata);
          _this.updateFormat(d, "ff", itemvalue);
        });
      }
      let userlen = $(this).outerWidth();
      let tlen = $menuButton.outerWidth();
      let menuleft = $(this).offset().left;
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
    });

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
          cancelText: locale_button.cancel,
          chooseText: locale_button.confirm,
          togglePaletteMoreText: locale_toolbar.customColor,
          togglePaletteLessText: locale_toolbar.collapse,
          togglePaletteOnly: true,
          clearText: locale_toolbar.clearText,
          color: luckysheetConfigsetting.defaultTextColor,
          noColorSelectedText: locale_toolbar.noColorSelectedText,
          localStorageKey: "spectrum.textcolor" + luckysheetConfigsetting.gridKey,
          palette: [["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"], ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"], ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"], ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"], ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"], ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"], ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"], ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]],
          change: function (color) {
            let $input = $(this);
            if (color != null) {
              color = color.toHexString();
            } else {
              color = "#000";
            }
            let oldcolor = null;
            // $("#luckysheet-icon-text-color .luckysheet-color-menu-button-indicator").css("border-bottom-color", color);
            // 下边框换成了一个DIV
            $("#luckysheet-icon-text-color .text-color-bar").css("background-color", color);
            $("#luckysheet-icon-text-color").attr("color", color);
            let d = editor.deepCopyFlowData(Store.flowdata);
            _this.updateFormat(d, "fc", color);
            $menuButton.hide();
            luckysheetContainerFocus();
          }
        });
        $menuButton.find(".luckysheet-color-reset").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $input = $("#" + menuButtonId).find(".luckysheet-color-selected");
          $input.val("#000000");
          $("#luckysheet-icon-text-color").attr("color", null);
          $input.spectrum("set", "#000000");
          $("#luckysheet-icon-text-color .luckysheet-color-menu-button-indicator").css("border-bottom-color", "#000000");
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
          let range = $.extend(true, {}, Store.luckysheet_select_save[0]);
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
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      let offsetTop = $(this).offset().top + 26;
      setTimeout(function () {
        let $input = $("#" + menuButtonId).find(".luckysheet-color-selected");
        $input.spectrum("set", $input.val());
        mouseclickposition($menuButton, menuleft - 28, offsetTop, "lefttop");
      }, 1);
    });

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
          // *如果禁止前台编辑，则中止下一步操作
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
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      let offsetTop = $(this).offset().top + 26;
      setTimeout(function () {
        let $input = $("#" + menuButtonId).find(".luckysheet-color-selected");
        $input.spectrum("set", $input.val());
        mouseclickposition($menuButton, menuleft - 28, offsetTop, "lefttop");
      }, 1);
    });

    //字体大小
    let luckysheet_fs_setTimeout = null;
    $("#luckysheet-icon-font-size").mousedown(function (e) {
      if (parseInt($("#luckysheet-input-box").css("top")) > 0) {
        let w = window.getSelection();
        if (w.type != "None") {
          let range = w.getRangeAt(0);
          if (!range.collapsed) {
            Store.inlineStringEditRange = range.cloneRange();
          }
        }
      }
      hideMenuByCancel(e);
      e.stopPropagation();
    }).click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      if ($menuButton.length == 0) {
        let itemdata = [{
          text: "9",
          value: "9",
          example: ""
        }, {
          text: "10",
          value: "10",
          example: ""
        }, {
          text: "11",
          value: "11",
          example: ""
        }, {
          text: "12",
          value: "12",
          example: ""
        }, {
          text: "14",
          value: "14",
          example: ""
        }, {
          text: "16",
          value: "16",
          example: ""
        }, {
          text: "18",
          value: "18",
          example: ""
        }, {
          text: "20",
          value: "20",
          example: ""
        }, {
          text: "22",
          value: "22",
          example: ""
        }, {
          text: "24",
          value: "24",
          example: ""
        }, {
          text: "26",
          value: "26",
          example: ""
        }, {
          text: "28",
          value: "28",
          example: ""
        }, {
          text: "36",
          value: "36",
          example: ""
        }, {
          text: "48",
          value: "48",
          example: ""
        }, {
          text: "72",
          value: "72",
          example: ""
        }];
        let itemset = _this.createButtonMenu(itemdata);
        let menu = replaceHtml(_this.menu, {
          id: "font-size",
          item: itemset,
          subclass: "",
          sub: ""
        });
        $("body").append(menu);
        $menuButton = $("#" + menuButtonId).width(150);
        _this.focus($menuButton, 10);
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue"),
            $input = $("#luckysheet-icon-font-size input");
          $("#luckysheet-icon-font-size").attr("itemvalue", itemvalue);
          _this.focus($menuButton, itemvalue);
          $input.val(itemvalue);
          let d = editor.deepCopyFlowData(Store.flowdata);
          _this.updateFormat(d, "fs", itemvalue);
          clearTimeout(luckysheet_fs_setTimeout);
        });
      }
      let userlen = $(this).outerWidth();
      let tlen = $menuButton.outerWidth();
      let defualtvalue = $("#luckysheet-icon-font-size").attr("itemvalue");
      if (defualtvalue == null) {
        defualtvalue = 10;
      }
      _this.focus($menuButton, defualtvalue);
      let menuleft = $(this).offset().left;
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
    }).find("input.luckysheet-toolbar-textinput").keydown(function (e) {
      hideMenuByCancel(e);
      e.stopPropagation();
    }).keyup(function (e) {
      if (e.keyCode != 13) {
        //Enter
        return;
      }
      let $this = $(this);
      let itemvalue = parseInt($this.val());
      let $menuButton = $("#luckysheet-icon-font-size-menuButton");
      _this.focus($menuButton, itemvalue);
      let d = editor.deepCopyFlowData(Store.flowdata);
      _this.updateFormat(d, "fs", itemvalue);
      luckysheet_fs_setTimeout = setTimeout(function () {
        $menuButton.hide();
        $this.blur();
      }, 200);
    });

    //边框设置
    $("#luckysheet-icon-border-all").click(function () {
      // *如果禁止前台编辑，则中止下一步操作
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
          // *如果禁止前台编辑，则中止下一步操作
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

    //合并单元格
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
        $("body").append(menu);
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
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft - 28, $(this).offset().top + 25, "lefttop");
    });

    //水平对齐
    $("#luckysheet-icon-align").click(function () {
      let itemvalue = $("#luckysheet-icon-align").attr("type");
      if (itemvalue == null) {
        itemvalue = "left";
      }
      let d = editor.deepCopyFlowData(Store.flowdata);
      _this.updateFormat(d, "ht", itemvalue);
    });
    $("#luckysheet-icon-align-menu").click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      if ($menuButton.length == 0) {
        const _locale = locale();
        const locale_align = _locale.align;
        let itemdata = [{
          text: locale_align.left,
          value: "left",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-left iconfont-luckysheet luckysheet-iconfont-wenbenzuoduiqi" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_align.center,
          value: "center",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-center iconfont-luckysheet luckysheet-iconfont-wenbenjuzhongduiqi" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_align.right,
          value: "right",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-right iconfont-luckysheet luckysheet-iconfont-wenbenyouduiqi" style="user-select: none;"> </div> </div>'
        }];

        // itemvalue to iconfont
        const iconfontObject = iconfontObjects.align;
        let itemset = _this.createButtonMenu(itemdata);
        let menu = replaceHtml(_this.menu, {
          id: "align-menu",
          item: itemset,
          subclass: "",
          sub: ""
        });
        $("body").append(menu);
        $menuButton = $("#" + menuButtonId).width(120);
        _this.focus($menuButton);
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          _this.focus($menuButton, itemvalue);
          let $icon = $("#luckysheet-icon-align").attr("type", itemvalue).find(".luckysheet-icon-img-container");

          // add iconfont
          $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-" + itemvalue + iconfontObject[itemvalue]);
          let d = editor.deepCopyFlowData(Store.flowdata);
          _this.updateFormat(d, "ht", itemvalue);
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

    //垂直对齐
    $("#luckysheet-icon-valign").click(function () {
      let itemvalue = $("#luckysheet-icon-valign").attr("type");
      if (itemvalue == null) {
        itemvalue = "bottom";
      }
      let d = editor.deepCopyFlowData(Store.flowdata);
      _this.updateFormat(d, "vt", itemvalue);
    });
    $("#luckysheet-icon-valign-menu").click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      const _locale = locale();
      const locale_align = _locale.align;
      if ($menuButton.length == 0) {
        let itemdata = [{
          text: locale_align.top,
          value: "top",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-top iconfont-luckysheet luckysheet-iconfont-dingbuduiqi" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_align.middle,
          value: "middle",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-middle iconfont-luckysheet luckysheet-iconfont-shuipingduiqi" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_align.bottom,
          value: "bottom",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-bottom iconfont-luckysheet luckysheet-iconfont-dibuduiqi" style="user-select: none;"> </div> </div>'
        }];

        // itemvalue to iconfont
        const iconfontObject = iconfontObjects.align;
        let itemset = _this.createButtonMenu(itemdata);
        let menu = replaceHtml(_this.menu, {
          id: "valign-menu",
          item: itemset,
          subclass: "",
          sub: ""
        });
        $("body").append(menu);
        $menuButton = $("#" + menuButtonId).width(120);
        _this.focus($menuButton, "bottom");
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          _this.focus($menuButton, itemvalue);
          let $icon = $("#luckysheet-icon-valign").attr("type", itemvalue).find(".luckysheet-icon-img-container");

          // add iconfont
          $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-valign-" + itemvalue + iconfontObject[itemvalue]);
          let d = editor.deepCopyFlowData(Store.flowdata);
          _this.updateFormat(d, "vt", itemvalue);
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

    //文本换行
    $("#luckysheet-icon-textwrap-menu").click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      if ($menuButton.length == 0) {
        const _locale = locale();
        const locale_textWrap = _locale.textWrap;
        let itemdata = [{
          text: locale_textWrap.overflow,
          value: "overflow",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-overflow iconfont-luckysheet luckysheet-iconfont-yichu1" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_textWrap.wrap,
          value: "wrap",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-wrap iconfont-luckysheet luckysheet-iconfont-zidonghuanhang" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_textWrap.clip,
          value: "clip",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-clip iconfont-luckysheet luckysheet-iconfont-jieduan" style="user-select: none;"> </div> </div>'
        }];

        // itemvalue to iconfont
        const iconfontObject = iconfontObjects.textWrap;
        let itemset = _this.createButtonMenu(itemdata);
        let menu = replaceHtml(_this.menu, {
          id: "textwrap-menu",
          item: itemset,
          subclass: "",
          sub: ""
        });
        $("body").append(menu);
        $menuButton = $("#" + menuButtonId).width(120);
        _this.focus($menuButton, "clip");
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          _this.focus($menuButton, itemvalue);
          let $icon = $("#luckysheet-icon-textwrap").attr("type", itemvalue).find(".luckysheet-icon-img-container");

          // add iconfont
          $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-textwrap-" + itemvalue + iconfontObject[itemvalue]);
          let d = editor.deepCopyFlowData(Store.flowdata);
          _this.updateFormat(d, "tb", itemvalue);
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

    //文本旋转
    $("#luckysheet-icon-rotation-menu").click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      if ($menuButton.length == 0) {
        const _locale = locale();
        const locale_rotation = _locale.rotation;
        let itemdata = [{
          text: locale_rotation.none,
          value: "none",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-none iconfont-luckysheet luckysheet-iconfont-wuxuanzhuang" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_rotation.angleup,
          value: "angleup",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-angleup iconfont-luckysheet luckysheet-iconfont-xiangshangqingxie" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_rotation.angledown,
          value: "angledown",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-angledown iconfont-luckysheet luckysheet-iconfont-xiangxiaqingxie" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_rotation.vertical,
          value: "vertical",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-vertical iconfont-luckysheet luckysheet-iconfont-shupaiwenzi" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_rotation.rotationUp,
          value: "rotation-up",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-rotation-up iconfont-luckysheet luckysheet-iconfont-wenbenxiangshang" style="user-select: none;"> </div> </div>'
        }, {
          text: locale_rotation.rotationDown,
          value: "rotation-down",
          example: '<div class="luckysheet-icon luckysheet-inline-block" style="user-select: none;opacity:1;"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-rotation-down iconfont-luckysheet luckysheet-iconfont-xiangxia90" style="user-select: none;"> </div> </div>'
        }];

        // itemvalue to iconfont
        const iconfontObject = iconfontObjects.rotation;
        let itemset = _this.createButtonMenu(itemdata);
        let menu = replaceHtml(_this.menu, {
          id: "rotation-menu",
          item: itemset,
          subclass: "",
          sub: ""
        });
        $("body").append(menu);

        // 文字旋转总 Stack Vertically 太长了，拉宽到160
        $menuButton = $("#" + menuButtonId).width(160);
        _this.focus($menuButton);
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          _this.focus($menuButton, itemvalue);
          let $icon = $("#luckysheet-icon-rotation").attr("type", itemvalue).find(".luckysheet-icon-img-container");

          // add iconfont
          $icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-rotation-" + itemvalue + iconfontObject[itemvalue]);
          let d = editor.deepCopyFlowData(Store.flowdata);
          _this.updateFormat(d, "tr", itemvalue);
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

    //冻结行列
    $("#luckysheet-icon-freezen-menu").click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      if ($menuButton.length == 0) {
        const _locale = locale();
        const locale_freezen = _locale.freezen;
        let itemdata = [{
          text: locale_freezen.freezenRow,
          value: "freezenRow",
          example: ""
        }, {
          text: locale_freezen.freezenColumn,
          value: "freezenColumn",
          example: ""
        }, {
          text: locale_freezen.freezenRC,
          value: "freezenRC",
          example: ""
        }, {
          text: "",
          value: "split",
          example: ""
        }, {
          text: locale_freezen.freezenRowRange,
          value: "freezenRowRange",
          example: ""
        }, {
          text: locale_freezen.freezenColumnRange,
          value: "freezenColumnRange",
          example: ""
        }, {
          text: locale_freezen.freezenRCRange,
          value: "freezenRCRange",
          example: ""
        }, {
          text: "",
          value: "split",
          example: ""
        }, {
          text: locale_freezen.freezenCancel,
          value: "freezenCancel",
          example: ""
        }];
        let itemset = _this.createButtonMenu(itemdata);
        let menu = replaceHtml(_this.menu, {
          id: "freezen-menu",
          item: itemset,
          subclass: "",
          sub: ""
        });
        $("body").append(menu);
        $menuButton = $("#" + menuButtonId).width(170);
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          _this.focus($menuButton, itemvalue);
          if (itemvalue === "freezenCancel") {
            $menuButton.find(".fa.fa-check").remove();
          }

          // store frozen
          luckysheetFreezen.saveFrozen(itemvalue);
          if (itemvalue == "freezenRow") {
            //首行冻结
            frozenFirstRow();
            // let scrollTop = $("#luckysheet-cell-main").scrollTop();
            // let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
            // if(row_st == -1){
            //     row_st = 0;
            // }
            // let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
            // let freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
            // luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

            // if (luckysheetFreezen.freezenverticaldata != null) {
            //     luckysheetFreezen.cancelFreezenVertical();
            //     luckysheetFreezen.createAssistCanvas();
            //     luckysheetrefreshgrid();
            // }

            // luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
            // luckysheetFreezen.createAssistCanvas();
            // luckysheetrefreshgrid();
          } else if (itemvalue == "freezenColumn") {
            //首列冻结
            frozenFirstColumn();
            // let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
            // let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
            // if(col_st == -1){
            //     col_st = 0;
            // }
            // let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
            // let freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
            // luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

            // if (luckysheetFreezen.freezenhorizontaldata != null) {
            //     luckysheetFreezen.cancelFreezenHorizontal();
            //     luckysheetFreezen.createAssistCanvas();
            //     luckysheetrefreshgrid();
            // }

            // luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
            // luckysheetFreezen.createAssistCanvas();
            // luckysheetrefreshgrid();
          } else if (itemvalue == "freezenRC") {
            //首行列冻结
            if (luckysheetFreezen.freezenRealFirstRowColumn) {
              let row_st = 0;
              let top = Store.visibledatarow[row_st] - 2 + Store.columnHeaderHeight;
              let freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
              luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
              luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
              let col_st = 0;
              let left = Store.visibledatacolumn[col_st] - 2 + Store.rowHeaderWidth;
              let freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
              luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
              luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
            } else {
              let scrollTop = $("#luckysheet-cell-main").scrollTop();
              let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
              if (row_st == -1) {
                row_st = 0;
              }
              let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
              let freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
              luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
              luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
              let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
              let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
              if (col_st == -1) {
                col_st = 0;
              }
              let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
              let freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
              luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
              luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
            }
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
          } else if (itemvalue == "freezenRowRange") {
            //选区行冻结

            if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
              if (isEditMode()) {
                alert(locale_freezen.noSeletionError);
              } else {
                tooltip.info(locale_freezen.noSeletionError, "");
              }
              return;
            }
            // 固定超出屏幕范围
            let rangeTop = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1].top;
            if (luckysheetFreezen.freezenRealFirstRowColumn && rangeTop > $("#luckysheet-cell-main").height()) {
              return tooltip.info(locale_freezen.rangeRCOverErrorTitle, locale_freezen.rangeRCOverError);
            }
            let scrollTop = $("#luckysheet-cell-main").scrollTop();
            let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
            let row_focus = last["row_focus"] == null ? last["row"][0] : last["row_focus"];
            row_st = Math.max(row_st - 1, row_focus - 1, 0);
            let top, freezenhorizontaldata;
            if (luckysheetFreezen.freezenRealFirstRowColumn) {
              top = Store.visibledatarow[row_st] - 2 + Store.columnHeaderHeight;
              freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
            } else {
              top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
              freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
            }
            luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
            if (luckysheetFreezen.freezenverticaldata != null) {
              luckysheetFreezen.cancelFreezenVertical();
              luckysheetFreezen.createAssistCanvas();
              luckysheetrefreshgrid();
            }
            luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
          } else if (itemvalue == "freezenColumnRange") {
            //选区列冻结
            if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
              if (isEditMode()) {
                alert(locale_freezen.noSeletionError);
              } else {
                tooltip.info(locale_freezen.noSeletionError, "");
              }
              return;
            }
            // 固定超出屏幕范围
            let rangeLeft = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1].left;
            if (luckysheetFreezen.freezenRealFirstRowColumn && rangeLeft > $("#luckysheet-cell-main").width()) {
              return tooltip.info(locale_freezen.rangeRCOverErrorTitle, locale_freezen.rangeRCOverError);
            }
            let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
            let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
            let column_focus = last["column_focus"] == null ? last["column"][0] : last["column_focus"];
            col_st = Math.max(col_st - 1, column_focus - 1, 0);
            let left, freezenverticaldata;
            if (luckysheetFreezen.freezenRealFirstRowColumn) {
              left = Store.visibledatacolumn[col_st] - 2 + Store.rowHeaderWidth;
              freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
            } else {
              left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
              freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
            }
            luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
            if (luckysheetFreezen.freezenhorizontaldata != null) {
              luckysheetFreezen.cancelFreezenHorizontal();
              luckysheetFreezen.createAssistCanvas();
              luckysheetrefreshgrid();
            }
            luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
          } else if (itemvalue == "freezenRCRange") {
            //选区行列冻结
            if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
              if (isEditMode()) {
                alert(locale_freezen.noSeletionError);
              } else {
                tooltip.info(locale_freezen.noSeletionError, "");
              }
              return;
            }

            // 固定超出屏幕范围
            let rangeTop = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1].top;
            let rangeLeft = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1].left;
            if (luckysheetFreezen.freezenRealFirstRowColumn && (rangeTop > $("#luckysheet-cell-main").height() || rangeLeft > $("#luckysheet-cell-main").width())) {
              return tooltip.info(locale_freezen.rangeRCOverErrorTitle, locale_freezen.rangeRCOverError);
            }
            let scrollTop = $("#luckysheet-cell-main").scrollTop();
            let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
            let row_focus = last["row_focus"] == null ? last["row"][0] : last["row_focus"];
            row_st = Math.max(row_st - 1, row_focus - 1, 0);
            let top, freezenhorizontaldata;
            if (luckysheetFreezen.freezenRealFirstRowColumn) {
              top = Store.visibledatarow[row_st] - 2 + Store.columnHeaderHeight;
              freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
              luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
            } else {
              top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
              freezenhorizontaldata = [Store.visibledatarow[row_st], row_st + 1, scrollTop, luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), top];
              luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
            }
            luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
            let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
            let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
            let column_focus = last["column_focus"] == null ? last["column"][0] : last["column_focus"];
            col_st = Math.max(col_st - 1, column_focus - 1, 0);
            let left, freezenverticaldata;
            if (luckysheetFreezen.freezenRealFirstRowColumn) {
              left = Store.visibledatacolumn[col_st] - 2 + Store.rowHeaderWidth;
              freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, 0, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
            } else {
              left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
              freezenverticaldata = [Store.visibledatacolumn[col_st], col_st + 1, scrollLeft, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), left];
            }
            luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
            luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
          } else if (itemvalue == "freezenCancel") {
            //Cancel freezen
            if (luckysheetFreezen.freezenverticaldata != null) {
              luckysheetFreezen.cancelFreezenVertical();
              luckysheetFreezen.createAssistCanvas();
              luckysheetrefreshgrid();
            }
            if (luckysheetFreezen.freezenhorizontaldata != null) {
              luckysheetFreezen.cancelFreezenHorizontal();
              luckysheetFreezen.createAssistCanvas();
              luckysheetrefreshgrid();
            }
            luckysheetFreezen.scrollAdapt();
          }
          setTimeout(function () {
            luckysheetsizeauto();
          }, 0);
        });
      }
      let userlen = $(this).outerWidth();
      let tlen = $menuButton.outerWidth();
      let menuleft = $(this).offset().left;
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft - 68, $(this).offset().top + 25, "lefttop");
    });

    //过滤和排序
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
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
    });

    //查找和替换
    $("#luckysheet-icon-seachmore").click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      const _locale = locale();
      const locale_findAndReplace = _locale.findAndReplace;
      if ($menuButton.length == 0) {
        let itemdata = [{
          text: locale_findAndReplace.find + " ...",
          value: "search",
          example: '<i class="iconfont-luckysheet luckysheet-iconfont-sousuo" aria-hidden="true"></i>'
        }, {
          text: locale_findAndReplace.replace + " ...",
          value: "replace",
          example: '<i class="iconfont-luckysheet luckysheet-iconfont-tihuan" aria-hidden="true"></i>'
        },
        // {"text": locale_findAndReplace.goto+" ...", "value": "goto", "example": '<i class="iconfont-luckysheet luckysheet-iconfont-zhuandao1" aria-hidden="true"></i>'},
        {
          text: "",
          value: "split",
          example: ""
        }, {
          text: locale_findAndReplace.location + " ...",
          value: "location",
          example: '<i class="iconfont-luckysheet luckysheet-iconfont-dingwei" aria-hidden="true"></i>'
        }, {
          text: locale_findAndReplace.formula,
          value: "locationFormula",
          example: locale_findAndReplace.locationExample
        }, {
          text: locale_findAndReplace.date,
          value: "locationConstantDate",
          example: locale_findAndReplace.locationExample
        }, {
          text: locale_findAndReplace.number,
          value: "locationConstantNumber",
          example: locale_findAndReplace.locationExample
        }, {
          text: locale_findAndReplace.string,
          value: "locationConstantString",
          example: locale_findAndReplace.locationExample
        }, {
          text: locale_findAndReplace.error,
          value: "locationConstantError",
          example: locale_findAndReplace.locationExample
        }, {
          text: locale_findAndReplace.condition,
          value: "locationCF",
          example: locale_findAndReplace.locationExample
        }, {
          text: locale_findAndReplace.rowSpan,
          value: "locationStepRow",
          example: locale_findAndReplace.locationExample
        }, {
          text: locale_findAndReplace.columnSpan,
          value: "locationStepColumn",
          example: locale_findAndReplace.locationExample
        }];
        let itemset = _this.createButtonMenu(itemdata);
        let menu = replaceHtml(_this.menu, {
          id: "seachmore",
          item: itemset,
          subclass: "",
          sub: ""
        });
        $("body").append(menu);
        $menuButton = $("#" + menuButtonId).width(180);
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          if (itemvalue == "search" || itemvalue == "replace") {
            //查找替换
            if (itemvalue == "search") {
              luckysheetSearchReplace.createDialog(0);
            } else if (itemvalue == "replace") {
              luckysheetSearchReplace.createDialog(1);
            }
            luckysheetSearchReplace.init();
            $("#luckysheet-search-replace #searchInput input").focus();
          } else if (itemvalue == "location") {
            //定位条件
            luckysheetLocationCell.createDialog();
            luckysheetLocationCell.init();
          } else if (itemvalue == "locationFormula" || itemvalue == "locationConstantDate" || itemvalue == "locationConstantNumber" || itemvalue == "locationConstantString" || itemvalue == "locationConstantError" || itemvalue == "locationCF") {
            let last = Store.luckysheet_select_save[0];
            let range;
            if (Store.luckysheet_select_save.length == 0 || Store.luckysheet_select_save.length == 1 && last.row[0] == last.row[1] && last.column[0] == last.column[1]) {
              //单个单元格
              range = [{
                row: [0, Store.flowdata.length - 1],
                column: [0, Store.flowdata[0].length - 1]
              }];
            } else {
              range = $.extend(true, [], Store.luckysheet_select_save);
            }
            if (itemvalue == "locationFormula") {
              //公式
              luckysheetLocationCell.apply(range, "locationFormula", "all");
            } else if (itemvalue == "locationConstantDate") {
              //日期
              luckysheetLocationCell.apply(range, "locationConstant", "d");
            } else if (itemvalue == "locationConstantNumber") {
              //数字
              luckysheetLocationCell.apply(range, "locationConstant", "n");
            } else if (itemvalue == "locationConstantString") {
              //字符
              luckysheetLocationCell.apply(range, "locationConstant", "s,g");
            } else if (itemvalue == "locationConstantError") {
              //错误
              luckysheetLocationCell.apply(range, "locationConstant", "e");
            } else if (itemvalue == "locationCF") {
              //条件格式
              luckysheetLocationCell.apply(range, "locationCF");
            }
          } else if (itemvalue == "locationStepRow") {
            //间隔行
            if (Store.luckysheet_select_save.length == 0 || Store.luckysheet_select_save.length == 1 && Store.luckysheet_select_save[0].row[0] == Store.luckysheet_select_save[0].row[1]) {
              if (isEditMode()) {
                alert(locale_findAndReplace.lessTwoRowTip);
              } else {
                tooltip.info("", locale_findAndReplace.lessTwoRowTip);
              }
              return;
            }
            let range = $.extend(true, [], Store.luckysheet_select_save);
            luckysheetLocationCell.apply(range, "locationStepRow");
          } else if (itemvalue == "locationStepColumn") {
            //间隔列
            if (Store.luckysheet_select_save.length == 0 || Store.luckysheet_select_save.length == 1 && Store.luckysheet_select_save[0].column[0] == Store.luckysheet_select_save[0].column[1]) {
              if (isEditMode()) {
                alert(locale_findAndReplace.lessTwoColumnTip);
              } else {
                tooltip.info("", locale_findAndReplace.lessTwoColumnTip);
              }
              return;
            }
            let range = $.extend(true, [], Store.luckysheet_select_save);
            luckysheetLocationCell.apply(range, "locationStepColumn");
          }
        });
      }
      let userlen = $(this).outerWidth();
      let tlen = $menuButton.outerWidth();
      let menuleft = $(this).offset().left;
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
    });

    //公式
    $("#luckysheet-icon-function").click(function () {
      _this.autoSelectionFormula("SUM");
    });

    //公式菜单
    $("#luckysheet-icon-function-menu").click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      const _locale = locale();
      const locale_formula = _locale.formula;
      if ($menuButton.length == 0) {
        let itemdata = [{
          text: locale_formula.sum,
          value: "SUM",
          example: "SUM"
        }, {
          text: locale_formula.average,
          value: "AVERAGE",
          example: "AVERAGE"
        }, {
          text: locale_formula.count,
          value: "COUNT",
          example: "COUNT"
        }, {
          text: locale_formula.max,
          value: "MAX",
          example: "MAX"
        }, {
          text: locale_formula.min,
          value: "MIN",
          example: "MIN"
        }, {
          text: "",
          value: "split",
          example: ""
        }, {
          text: locale_formula.ifGenerate,
          value: "if",
          example: "IF"
        }, {
          text: locale_formula.find + " ...",
          value: "formula",
          example: ""
        }];
        let itemset = _this.createButtonMenu(itemdata);
        let menu = replaceHtml(_this.menu, {
          id: "function-menu",
          item: itemset,
          subclass: "",
          sub: ""
        });
        $("body").append(menu);
        $menuButton = $("#" + menuButtonId).width(180);
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          if (itemvalue == "if") {
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
            let r = last["row_focus"] == null ? last["row"][0] : last["row_focus"];
            let c = last["column_focus"] == null ? last["column"][0] : last["column_focus"];
            if (!!Store.flowdata[r] && !!Store.flowdata[r][c] && !!Store.flowdata[r][c]["f"]) {
              let fp = Store.flowdata[r][c]["f"].toString();
              if (fp.indexOf("=if(") != -1) {
                ifFormulaGenerator.ifFormulaDialog(fp);
              } else {
                if (isEditMode()) {
                  alert(locale_formula.tipNotBelongToIf);
                } else {
                  tooltip.info(locale_formula.tipNotBelongToIf, "");
                }
                return;
              }
            } else {
              ifFormulaGenerator.ifFormulaDialog();
            }
            ifFormulaGenerator.init();
          } else if (itemvalue == "formula") {
            //点击函数查找弹出框
            if (Store.luckysheet_select_save.length == 0) {
              if (isEditMode()) {
                alert(locale_formula.tipSelectCell);
              } else {
                tooltip.info(locale_formula.tipSelectCell, "");
              }
              return;
            }
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
            let row_index = last["row_focus"],
              col_index = last["column_focus"];
            luckysheetupdateCell(row_index, col_index, Store.flowdata);
            let cell = Store.flowdata[row_index][col_index];
            if (cell != null && cell.f != null) {
              //单元格有计算
              let functionStr = luckysheetformula.getfunctionParam(cell.f);
              if (functionStr.fn != null) {
                //有函数公式
                insertFormula.formulaParmDialog(functionStr.fn, functionStr.param);
              } else {
                //无函数公式
                insertFormula.formulaListDialog();
              }
            } else {
              //单元格无计算
              $("#luckysheet-rich-text-editor").html('<span dir="auto" class="luckysheet-formula-text-color">=</span>');
              $("#luckysheet-functionbox-cell").html($("#luckysheet-rich-text-editor").html());
              insertFormula.formulaListDialog();
            }
            insertFormula.init();
          } else {
            _this.autoSelectionFormula(itemvalue);
          }
        });
      }
      let userlen = $(this).outerWidth();
      let tlen = $menuButton.outerWidth();
      let menuleft = $(this).offset().left;
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft - 48, $(this).offset().top + 25, "lefttop");
    });

    //加粗
    $("#luckysheet-icon-bold").mousedown(function (e) {
      hideMenuByCancel(e);
      e.stopPropagation();
    }).click(function (e) {
      let d = editor.deepCopyFlowData(Store.flowdata);
      let flag = checkTheStatusOfTheSelectedCells("bl", 1);
      let foucsStatus = flag ? 0 : 1;
      _this.updateFormat(d, "bl", foucsStatus);
    });

    //斜体
    $("#luckysheet-icon-italic").mousedown(function (e) {
      hideMenuByCancel(e);
      e.stopPropagation();
    }).click(function () {
      let d = editor.deepCopyFlowData(Store.flowdata);
      let flag = checkTheStatusOfTheSelectedCells("it", 1);
      let foucsStatus = flag ? 0 : 1;
      _this.updateFormat(d, "it", foucsStatus);
    });

    //删除线
    $("#luckysheet-icon-strikethrough").mousedown(function (e) {
      hideMenuByCancel(e);
      e.stopPropagation();
    }).click(function () {
      let d = editor.deepCopyFlowData(Store.flowdata);
      let flag = checkTheStatusOfTheSelectedCells("cl", 1);
      let foucsStatus = flag ? 0 : 1;
      _this.updateFormat(d, "cl", foucsStatus);
    });

    //下划线
    $("#luckysheet-icon-underline").mousedown(function (e) {
      hideMenuByCancel(e);
      e.stopPropagation();
    }).click(function () {
      let d = editor.deepCopyFlowData(Store.flowdata);
      let flag = checkTheStatusOfTheSelectedCells("un", 1);
      let foucsStatus = flag ? 0 : 1;
      _this.updateFormat(d, "un", foucsStatus);
    });

    //条件格式
    $("#luckysheet-icon-conditionformat").click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      const conditionformat_text = locale().conditionformat;
      if ($menuButton.length == 0) {
        let itemdata = [{
          text: conditionformat_text.highlightCellRules,
          value: "highlightCellRule",
          example: "more"
        }, {
          text: conditionformat_text.itemSelectionRules,
          value: "projectSelectRule",
          example: "more"
        }, {
          text: conditionformat_text.dataBar,
          value: "dataBar",
          example: "more"
        }, {
          text: conditionformat_text.colorGradation,
          value: "colorGradation",
          example: "more"
        }, {
          text: conditionformat_text.icons,
          value: "icons",
          example: ""
        }, {
          text: "",
          value: "split",
          example: ""
        }, {
          text: conditionformat_text.newRule,
          value: "newRule",
          example: ""
        }, {
          text: conditionformat_text.deleteRule,
          value: "deleteRule",
          example: "more"
        }, {
          text: conditionformat_text.manageRules,
          value: "administerRule",
          example: ""
        }];
        let itemset = _this.createButtonMenu(itemdata);
        let menu = replaceHtml(_this.menu, {
          id: "conditionformat",
          item: itemset,
          subclass: "",
          sub: ""
        });

        //突出显示单元格规则子菜单
        let subitemdata = [{
          text: conditionformat_text.greaterThan,
          value: "greaterThan",
          example: ">"
        }, {
          text: conditionformat_text.lessThan,
          value: "lessThan",
          example: "<"
        }, {
          text: conditionformat_text.between,
          value: "betweenness",
          example: "[]"
        }, {
          text: conditionformat_text.equal,
          value: "equal",
          example: "="
        }, {
          text: conditionformat_text.textContains,
          value: "textContains",
          example: "()"
        }, {
          text: conditionformat_text.occurrence,
          value: "occurrenceDate",
          example: conditionformat_text.yesterday
        }, {
          text: conditionformat_text.duplicateValue,
          value: "duplicateValue",
          example: "##"
        }];
        let subitemset = _this.createButtonMenu(subitemdata);
        let submenu = replaceHtml(_this.menu, {
          id: "highlightCellRule",
          item: subitemset,
          subclass: "luckysheet-menuButton-sub"
        });

        //项目选取规则子菜单
        let subitemdata2 = [{
          text: conditionformat_text.top10,
          value: "top10",
          example: conditionformat_text.top10
        }, {
          text: conditionformat_text.top10_percent,
          value: "top10%",
          example: conditionformat_text.top10_percent
        }, {
          text: conditionformat_text.last10,
          value: "last10",
          example: conditionformat_text.last10
        }, {
          text: conditionformat_text.last10_percent,
          value: "last10%",
          example: conditionformat_text.last10_percent
        }, {
          text: conditionformat_text.aboveAverage,
          value: "AboveAverage",
          example: conditionformat_text.above
        }, {
          text: conditionformat_text.belowAverage,
          value: "SubAverage",
          example: conditionformat_text.below
        }];
        let subitemset2 = _this.createButtonMenu(subitemdata2);
        let submenu2 = replaceHtml(_this.menu, {
          id: "projectSelectRule",
          item: subitemset2,
          subclass: "luckysheet-menuButton-sub"
        });

        //数据条子菜单
        let submenu3 = `<div id="luckysheet-icon-dataBar-menuButton" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-menuButton luckysheet-menuButton-sub luckysheet-mousedown-cancel" style="width: 126px;padding: 5px;top: 118.5px;left: 1321.48px;display: none;">
                                    <div itemvalue="0" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: 0 0;" title="${conditionformat_text.gradientDataBar_1}"></div>
                                    </div>
                                    <div itemvalue="1" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -38px 0;" title="${conditionformat_text.gradientDataBar_2}"></div>
                                    </div>
                                    <div itemvalue="2" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -76px 0;" title="${conditionformat_text.gradientDataBar_3}"></div>
                                    </div>
                                    <div itemvalue="3" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: 0 -36px;" title="${conditionformat_text.gradientDataBar_4}"></div>
                                    </div>
                                    <div itemvalue="4" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -38px -36px;" title="${conditionformat_text.gradientDataBar_5}"></div>
                                    </div>
                                    <div itemvalue="5" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -76px -36px;" title="${conditionformat_text.gradientDataBar_6}"></div>
                                    </div>
                                    <div itemvalue="6" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: 0 -72px;" title="${conditionformat_text.solidColorDataBar_1}"></div>
                                    </div>
                                    <div itemvalue="7" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -38px -72px;" title="${conditionformat_text.solidColorDataBar_2}"></div>
                                    </div>
                                    <div itemvalue="8" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -76px -72px;" title="${conditionformat_text.solidColorDataBar_3}"></div>
                                    </div>
                                    <div itemvalue="9" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: 0 -108px;" title="${conditionformat_text.solidColorDataBar_4}"></div>
                                    </div>
                                    <div itemvalue="10" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -38px -108px;" title="${conditionformat_text.solidColorDataBar_5}"></div>
                                    </div>
                                    <div itemvalue="11" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -76px -108px;" title="${conditionformat_text.solidColorDataBar_6}"></div>
                                    </div>
                                </div>`;

        //色阶
        let submenu4 = `<div id="luckysheet-icon-colorGradation-menuButton" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-menuButton luckysheet-menuButton-sub luckysheet-mousedown-cancel" style="width: 126px;padding: 5px;top: 143.5px;left: 1321.48px;display: none;">
                                    <div itemvalue="0" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: 0 0;" title="${conditionformat_text.colorGradation_1}"></div>
                                    </div>
                                    <div itemvalue="1" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -38px 0;" title="${conditionformat_text.colorGradation_2}"></div>
                                    </div>
                                    <div itemvalue="2" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -76px 0;" title="${conditionformat_text.colorGradation_3}"></div>
                                    </div>
                                    <div itemvalue="3" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -114px 0;" title="${conditionformat_text.colorGradation_4}"></div>
                                    </div>
                                    <div itemvalue="4" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: 0 -36px;" title="${conditionformat_text.colorGradation_5}"></div>
                                    </div>
                                    <div itemvalue="5" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -38px -36px;" title="${conditionformat_text.colorGradation_6}"></div>
                                    </div>
                                    <div itemvalue="6" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -76px -36px;" title="${conditionformat_text.colorGradation_7}"></div>
                                    </div>
                                    <div itemvalue="7" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -114px -36px;" title="${conditionformat_text.colorGradation_8}"></div>
                                    </div>
                                    <div itemvalue="8" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: 0 -72px;" title="${conditionformat_text.colorGradation_9}"></div>
                                    </div>
                                    <div itemvalue="9" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -38px -72px;" title="${conditionformat_text.colorGradation_10}"></div>
                                    </div>
                                    <div itemvalue="10" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -76px -72px;" title="${conditionformat_text.colorGradation_11}"></div>
                                    </div>
                                    <div itemvalue="11" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="width: 28px; height: 26px;padding: 5px;float: left;">
                                        <div class="luckysheet-mousedown-cancel bgImgBox" style="background-position: -114px -72px;" title="${conditionformat_text.colorGradation_12}"></div>
                                    </div>
                                </div>`;

        //清除规则子菜单
        let subitemdata6 = [{
          text: conditionformat_text.deleteSheetRule,
          value: "delSheet",
          example: ""
        }];
        let subitemset6 = _this.createButtonMenu(subitemdata6);
        let submenu6 = replaceHtml(_this.menu, {
          id: "deleteRule",
          item: subitemset6,
          subclass: "luckysheet-menuButton-sub"
        });
        $("body").append(menu + submenu + submenu2 + submenu3 + submenu4 + submenu6);
        $menuButton = $("#" + menuButtonId).width(190);
        $("#luckysheet-icon-highlightCellRule-menuButton").width(160);
        $("#luckysheet-icon-projectSelectRule-menuButton").width(180);
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          if (itemvalue == "icons") {
            if (Store.luckysheet_select_save.length == 0) {
              if (isEditMode()) {
                alert(conditionformat_text.pleaseSelectRange);
              } else {
                tooltip.info(conditionformat_text.pleaseSelectRange, "");
              }
              return;
            }
            conditionformat.CFiconsDialog();
            conditionformat.init();
          } else if (itemvalue == "newRule") {
            if (Store.luckysheet_select_save.length == 0) {
              if (isEditMode()) {
                alert(conditionformat_text.pleaseSelectRange);
              } else {
                tooltip.info(conditionformat_text.pleaseSelectRange, "");
              }
              return;
            }
            conditionformat.newConditionRuleDialog(0);
            conditionformat.init();
          } else if (itemvalue == "administerRule") {
            let loadSheetUrl = luckysheetConfigsetting.loadSheetUrl;
            let file = getluckysheetfile();
            if (loadSheetUrl != "" && loadSheetUrl != null) {
              let sheetindex = [];
              for (let i = 0; i < file.length; i++) {
                sheetindex.push(file[i].index);
              }
              $.post(loadSheetUrl, {
                gridKey: luckysheetConfigsetting.gridKey,
                index: sheetindex.join(",")
              }, function (d) {
                let dataset = new Function("return " + d)();
                setTimeout(function () {
                  Store.loadingObj.close();
                }, 500);
                for (let item in dataset) {
                  if (item == Store.currentSheetIndex) {
                    continue;
                  }
                  let otherfile = file[getSheetIndex(item)];
                  otherfile.celldata = dataset[item.toString()];
                  otherfile["data"] = sheetmanage.buildGridData(otherfile);
                }
                setluckysheetfile(file);
                conditionformat.fileClone = $.extend(true, [], file);
                conditionformat.administerRuleDialog();
                conditionformat.init();
              });
            } else {
              conditionformat.fileClone = $.extend(true, [], file);
              conditionformat.administerRuleDialog();
              conditionformat.init();
            }
          }
        });

        //突出显示单元格规则子菜单点击事件
        $(document).off("click.CFhighlightCellRule").on("click.CFhighlightCellRule", "#luckysheet-icon-highlightCellRule-menuButton .luckysheet-cols-menuitem", function () {
          $menuButton.hide();
          $("#luckysheet-icon-highlightCellRule-menuButton").hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          if (Store.luckysheet_select_save.length == 0) {
            if (isEditMode()) {
              alert(conditionformat_text.pleaseSelectRange);
            } else {
              tooltip.info(conditionformat_text.pleaseSelectRange, "");
            }
            return;
          } else {
            let textCellColorHtml = conditionformat.textCellColorHtml();
            let title, content;
            switch (itemvalue) {
              case "greaterThan":
                title = conditionformat_text.conditionformat_greaterThan;
                content = `<div class="box" data-itemvalue="greaterThan">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_greaterThan_title}：</div>
                                                <div class="inpbox range">
                                                    <input id="conditionVal" class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div> 
                                                ${textCellColorHtml} 
                                            </div>`;
                break;
              case "lessThan":
                title = conditionformat_text.conditionformat_lessThan;
                content = `<div class="box" data-itemvalue="lessThan">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_lessThan_title}：</div>
                                                <div class="inpbox range">
                                                    <input id="conditionVal" class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
              case "betweenness":
                title = conditionformat_text.conditionformat_betweenness;
                content = `<div class="box" data-itemvalue="betweenness">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_betweenness_title}：</div>
                                                <div style="height: 30px;line-height: 30px;">
                                                    <div class="inpbox2 range">
                                                        <input id="conditionVal" class="formulaInputFocus"/>
                                                        <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                    </div>
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.to}</div>
                                                    <div class="inpbox2 range">
                                                        <input id="conditionVal2" class="formulaInputFocus"/>
                                                        <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                    </div>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
              case "equal":
                title = conditionformat_text.conditionformat_equal;
                content = `<div class="box" data-itemvalue="equal">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_equal_title}：</div>
                                                <div class="inpbox range">
                                                    <input id="conditionVal" class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
              case "textContains":
                title = conditionformat_text.conditionformat_textContains;
                content = `<div class="box" data-itemvalue="textContains">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_textContains_title}：</div>
                                                <div class="inpbox range">
                                                    <input id="conditionVal" class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
              case "occurrenceDate":
                title = conditionformat_text.conditionformat_occurrenceDate;
                content = `<div class="box" data-itemvalue="occurrenceDate">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_occurrenceDate_title}：</div>
                                                <div class="inpbox">
                                                    <input id="daterange-btn" class="formulaInputFocus" readonly="readonly" placeholder="${conditionformat_text.pleaseSelectADate}"/>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
              case "duplicateValue":
                title = conditionformat_text.conditionformat_duplicateValue;
                content = `<div class="box" data-itemvalue="duplicateValue">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_duplicateValue_title}：</div>
                                                <select id="conditionVal" class="selectbox">
                                                    <option value="0">${conditionformat_text.duplicateValue}</option>
                                                    <option value="1">${conditionformat_text.uniqueValue}</option>
                                                </select>
                                                <div style="margin:5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
            }
            conditionformat.conditionformatDialog(title, content);
          }
        });

        //项目选取规则子菜单点击事件
        $(document).off("click.CFprojectSelectRule").on("click.CFprojectSelectRule", "#luckysheet-icon-projectSelectRule-menuButton .luckysheet-cols-menuitem", function () {
          $menuButton.hide();
          $("#luckysheet-icon-projectSelectRule-menuButton").hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          if (Store.luckysheet_select_save.length == 0) {
            if (isEditMode()) {
              alert(conditionformat_text.pleaseSelectRange);
            } else {
              tooltip.info(conditionformat_text.pleaseSelectRange, "");
            }
            return;
          } else {
            let textCellColorHtml = conditionformat.textCellColorHtml();
            let title, content;
            switch (itemvalue) {
              case "top10":
                title = conditionformat_text.conditionformat_top10;
                content = `<div class="box" data-itemvalue="top10">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_top10_title}：</div>
                                                <div style="height: 30px;line-height: 30px;">
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.top}</div>
                                                    <div class="inpbox2">
                                                        <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                    </div>
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.oneself}</div>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
              case "top10%":
                title = conditionformat_text.conditionformat_top10_percent;
                content = `<div class="box" data-itemvalue="top10%">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_top10_title}：</div>
                                                <div style="height: 30px;line-height: 30px;">
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.top}</div>
                                                    <div class="inpbox2">
                                                        <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                    </div>
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">%</div>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
              case "last10":
                title = conditionformat_text.conditionformat_last10;
                content = `<div class="box" data-itemvalue="last10">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_last10_title}：</div>
                                                <div style="height: 30px;line-height: 30px;">
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.last}</div>
                                                    <div class="inpbox2">
                                                        <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                    </div>
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.oneself}</div>
                                                </div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAs}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
              case "last10%":
                title = conditionformat_text.conditionformat_last10_percent;
                content = `<div class="box" data-itemvalue="last10%">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_last10_title}：</div>
                                                <div style="height: 30px;line-height: 30px;">
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.last}</div>
                                                    <div class="inpbox2">
                                                        <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                    </div>
                                                    <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">%</div>
                                                </div>
                                                <div style="margin:5px 0;">设置为：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
              case "AboveAverage":
                title = conditionformat_text.conditionformat_AboveAverage;
                content = `<div class="box" data-itemvalue="AboveAverage">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_AboveAverage_title}：</div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAsByArea}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
              case "SubAverage":
                title = conditionformat_text.conditionformat_SubAverage;
                content = `<div class="box" data-itemvalue="SubAverage">
                                                <div class="boxTitleOne">${conditionformat_text.conditionformat_SubAverage_title}：</div>
                                                <div style="margin: 5px 0;">${conditionformat_text.setAsByArea}：</div>
                                                ${textCellColorHtml}
                                            </div>`;
                break;
            }
            conditionformat.conditionformatDialog(title, content);
          }
        });

        //数据条子菜单点击事件
        $(document).off("click.CFdataBar").on("click.CFdataBar", "#luckysheet-icon-dataBar-menuButton .luckysheet-cols-menuitem", function () {
          $menuButton.hide();
          $("#luckysheet-icon-dataBar-menuButton").hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          if (Store.luckysheet_select_save.length > 0) {
            let cellrange = $.extend(true, [], Store.luckysheet_select_save);
            let format = conditionformat.dataBarList[itemvalue]["format"];
            conditionformat.updateItem("dataBar", cellrange, format);
          }
        });

        //色阶子菜单点击事件
        $(document).off("click.CFcolorGradation").on("click.CFcolorGradation", "#luckysheet-icon-colorGradation-menuButton .luckysheet-cols-menuitem", function () {
          $menuButton.hide();
          $("#luckysheet-icon-colorGradation-menuButton").hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          if (Store.luckysheet_select_save.length > 0) {
            let cellrange = $.extend(true, [], Store.luckysheet_select_save);
            let format = conditionformat.colorGradationList[itemvalue]["format"];
            conditionformat.updateItem("colorGradation", cellrange, format);
          }
        });

        //清除规则子菜单点击事件
        $(document).off("click.CFdeleteRule").on("click.CFdeleteRule", "#luckysheet-icon-deleteRule-menuButton .luckysheet-cols-menuitem", function () {
          $menuButton.hide();
          $("#luckysheet-icon-deleteRule-menuButton").hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          if (itemvalue == "delSheet") {
            conditionformat.updateItem("delSheet");
          }
        });
      }
      let userlen = $(this).outerWidth();
      let tlen = $menuButton.outerWidth();
      let menuleft = $(this).offset().left;
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
    });

    //批注
    $("#luckysheet-icon-postil").click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      const locale_comment = locale().comment;
      $menuButton.remove();

      // if($menuButton.length == 0){
      luckysheetPostil.removeActivePs();
      let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
      let row_index = last["row_focus"];
      if (row_index == null) {
        row_index = last["row"][0];
      }
      let col_index = last["column_focus"];
      if (col_index == null) {
        col_index = last["column"][0];
      }
      let itemdata;
      if (Store.flowdata[row_index][col_index] != null && Store.flowdata[row_index][col_index].ps != null) {
        itemdata = [{
          text: locale_comment.edit,
          value: "editPs",
          example: ""
        }, {
          text: locale_comment.delete,
          value: "delPs",
          example: ""
        }, {
          text: "",
          value: "split",
          example: ""
        }, {
          text: locale_comment.showOne,
          value: "showHidePs",
          example: ""
        }, {
          text: locale_comment.showAll,
          value: "showHideAllPs",
          example: ""
        }];
      } else {
        itemdata = [{
          text: locale_comment.insert,
          value: "newPs",
          example: ""
        }, {
          text: "",
          value: "split",
          example: ""
        }, {
          text: locale_comment.showAll,
          value: "showHideAllPs",
          example: ""
        }];
      }
      let itemset = _this.createButtonMenu(itemdata);
      let menu = replaceHtml(_this.menu, {
        id: "postil",
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
        if (itemvalue == "newPs") {
          luckysheetPostil.newPs(row_index, col_index);
        } else if (itemvalue == "editPs") {
          luckysheetPostil.editPs(row_index, col_index);
        } else if (itemvalue == "delPs") {
          luckysheetPostil.delPs(row_index, col_index);
        } else if (itemvalue == "showHidePs") {
          luckysheetPostil.showHidePs(row_index, col_index);
        } else if (itemvalue == "showHideAllPs") {
          luckysheetPostil.showHideAllPs();
        }
      });
      // }

      let userlen = $(this).outerWidth();
      let tlen = $menuButton.outerWidth();
      let menuleft = $(this).offset().left;
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
    });

    //print
    $("#luckysheet-icon-print").click(function () {
      let menuButtonId = $(this).attr("id") + "-menuButton";
      let $menuButton = $("#" + menuButtonId);
      const _locale = locale();
      const locale_print = _locale.print;
      if ($menuButton.length == 0) {
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
        $("body").append(menu);
        $menuButton = $("#" + menuButtonId).width(180);
        $menuButton.find(".luckysheet-cols-menuitem").click(function () {
          $menuButton.hide();
          luckysheetContainerFocus();
          let $t = $(this),
            itemvalue = $t.attr("itemvalue");
          if (itemvalue == "print") {
            //Print config
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
      }
      let userlen = $(this).outerWidth();
      let tlen = $menuButton.outerWidth();
      let menuleft = $(this).offset().left;
      if (tlen > userlen && tlen + menuleft > $("#" + Store.container).width()) {
        menuleft = menuleft - tlen + userlen;
      }
      mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
    });
    $("body").on("mouseover mouseleave", ".luckysheet-menuButton .luckysheet-cols-submenu", function (e) {
      let $t = $(this),
        attrid = $t.attr("itemvalue"),
        $attr = $("#luckysheet-icon-" + attrid + "-menuButton");
      if (e.type === "mouseover") {
        let $con = $t.parent();
        let winW = $(window).width(),
          winH = $(window).height();
        let menuW = $con.width(),
          attrH = $attr.height() + 25,
          attrW = $attr.width() + 5;
        let offset = $t.offset();
        let top = offset.top,
          left = offset.left + menuW;
        if (left + attrW > winW) {
          left = offset.left - attrW;
        }
        if (top + attrH > winH) {
          top = winH - attrH;
        }
        $attr.css({
          top: top,
          left: left
        }).show();
        _this.rightclickmenu = $t;
      } else {
        clearTimeout(_this.submenuhide[$attr.attr("id")]);
        _this.submenuhide[$attr.attr("id")] = setTimeout(function () {
          $attr.hide();
        }, 200);
      }
    }).on("mouseover mouseleave", ".luckysheet-menuButton-sub", function (e) {
      if (e.type === "mouseover") {
        _this.rightclickmenu.addClass("luckysheet-cols-menuitem-hover");
        clearTimeout(_this.submenuhide[$(this).attr("id")]);
      } else {
        _this.rightclickmenu.removeClass("luckysheet-cols-menuitem-hover");
        $(this).hide();
      }
    });
  }
};
export default toolbarInitModule;