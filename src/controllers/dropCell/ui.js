import { rowLocationByIndex, colLocationByIndex } from "../../global/location";
import { countfunc } from "../../global/count";
import { getObjType, replaceHtml } from "../../utils/util";
import Store from "../../store";
import locale from "../../locale/locale";

//选区下拉
const uiModule = {
  iconHtml: '<div id="luckysheet-dropCell-icon" style="position: absolute;padding: 2px;background-color: #f1f1f1;z-index: 990;cursor: pointer;">' + '<div id="icon_dropCell"></div>' + '</div>',
  typeListHtml: '<div id="luckysheet-dropCell-typeList" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-mousedown-cancel">' + '<div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-type="0">' + '<div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 2px;">' + '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span>${copyCell}' + '</div>' + '</div>' + '<div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-type="1">' + '<div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 2px;">' + '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span>${sequence}' + '</div>' + '</div>' + '<div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-type="2">' + '<div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 2px;">' + '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span>${onlyFormat}' + '</div>' + '</div>' + '<div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-type="3">' + '<div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 2px;">' + '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span>${noFormat}' + '</div>' + '</div>' + '<div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-type="4">' + '<div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 2px;">' + '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span>${day}' + '</div>' + '</div>' + '<div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-type="5">' + '<div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 2px;">' + '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span>${workDay}' + '</div>' + '</div>' + '<div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-type="6">' + '<div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 2px;">' + '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span>${month}' + '</div>' + '</div>' + '<div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-type="7">' + '<div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 2px;">' + '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span>${year}' + '</div>' + '</div>' + '<div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-type="8">' + '<div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 2px;">' + '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span>${chineseNumber}' + '</div>' + '</div>' + '</div>',
  createIcon: function () {
    let _this = this;
    let copy_r = _this.copyRange["row"][1],
      copy_c = _this.copyRange["column"][1];
    let apply_r = _this.applyRange["row"][1],
      apply_c = _this.applyRange["column"][1];
    let row_index, col_index;
    if (apply_r >= copy_r && apply_c >= copy_c) {
      row_index = apply_r;
      col_index = apply_c;
    } else {
      row_index = copy_r;
      col_index = copy_c;
    }
    let row = rowLocationByIndex(row_index)[1],
      row_pre = rowLocationByIndex(row_index)[0];
    let col = colLocationByIndex(col_index)[1],
      col_pre = colLocationByIndex(col_index)[0];
    $("#luckysheet-dropCell-icon").remove();
    $("#luckysheet-cell-main").append(_this.iconHtml);
    $("#luckysheet-dropCell-icon").css({
      "left": col,
      "top": row
    });

    //点击icon
    $("#luckysheet-dropCell-icon").mouseover(function () {
      $(this).css("background-color", "#ffe8e8");
    }).mouseleave(function () {
      $(this).css("background-color", "#f1f1f1");
    }).mousedown(function (event) {
      $("#luckysheet-dropCell-typeList").remove();
      const _locale = locale();
      const locale_dropCell = _locale.dropCell;
      $("body").append(replaceHtml(_this.typeListHtml, {
        copyCell: locale_dropCell.copyCell,
        sequence: locale_dropCell.sequence,
        onlyFormat: locale_dropCell.onlyFormat,
        noFormat: locale_dropCell.noFormat,
        day: locale_dropCell.day,
        workDay: locale_dropCell.workDay,
        month: locale_dropCell.month,
        year: locale_dropCell.year,
        chineseNumber: locale_dropCell.chineseNumber
      }));
      let typeItemHide = _this.typeItemHide();
      if (!typeItemHide[0] && !typeItemHide[1] && !typeItemHide[2] && !typeItemHide[3] && !typeItemHide[4] && !typeItemHide[5] && !typeItemHide[6]) {
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=1]").hide();
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=4]").hide();
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=5]").hide();
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=6]").hide();
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=7]").hide();
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=8]").hide();
      }
      if (!typeItemHide[2]) {
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=4]").hide();
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=5]").hide();
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=6]").hide();
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=7]").hide();
      }
      if (!typeItemHide[3]) {
        $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=8]").hide();
      }
      let left = $(this).offset().left;
      let top = $(this).offset().top + 25;
      let winH = $(window).height(),
        winW = $(window).width();
      let menuW = $("#luckysheet-dropCell-typeList").width(),
        menuH = $("#luckysheet-dropCell-typeList").height();
      if (left + menuW > winW) {
        left = left - menuW;
      }
      if (top + menuH > winH) {
        top = top - menuH - 38;
      }
      if (top < 0) {
        top = 0;
      }
      $("#luckysheet-dropCell-typeList").css({
        "left": left,
        "top": top
      }).show();
      $("#luckysheet-dropCell-icon").mouseleave(function () {
        $(this).css("backgroundColor", "#ffe8e8");
      });
      let type = _this.applyType;
      $("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=" + type + "]").find("span").append('<i class="fa fa-check luckysheet-mousedown-cancel"></i>');
      event.stopPropagation();
    });

    //点击数据填充类型
    $(document).off("click.dCtypeList").on("click.dCtypeList", "#luckysheet-dropCell-typeList .luckysheet-cols-menuitem", function () {
      $("#luckysheet-dropCell-typeList .fa-check").remove();
      $(this).find("span").append('<i class="fa fa-check luckysheet-mousedown-cancel"></i>');
      let type = $(this).attr("data-type");
      _this.applyType = type;
      _this.update();
      $("#luckysheet-dropCell-typeList").hide();
      $("#luckysheet-dropCell-icon").css("backgroundColor", "#f1f1f1");
      $("#luckysheet-dropCell-icon").mouseleave(function () {
        $(this).css("backgroundColor", "#f1f1f1");
      });
      countfunc();
    });
  },
  typeItemHide: function () {
    let _this = this;
    let copyRange = _this.copyRange;
    let str_r = copyRange["row"][0],
      end_r = copyRange["row"][1];
    let str_c = copyRange["column"][0],
      end_c = copyRange["column"][1];
    let hasNumber = false,
      hasExtendNumber = false,
      hasDate = false,
      hasChn = false,
      hasChnWeek1 = false,
      hasChnWeek2 = false,
      hasChnWeek3 = false;
    for (let r = str_r; r <= end_r; r++) {
      for (let c = str_c; c <= end_c; c++) {
        if (Store.flowdata[r][c]) {
          let cell = Store.flowdata[r][c];
          if (getObjType(cell) == "object" && cell["v"] != null && cell["f"] == null) {
            if (cell["ct"] != null && cell["ct"].t == "n") {
              hasNumber = true;
            } else if (cell["ct"] != null && cell["ct"].t == "d") {
              hasDate = true;
            } else if (_this.isExtendNumber(cell["m"])[0]) {
              hasExtendNumber = true;
            } else if (_this.isChnNumber(cell["m"]) && cell["m"] != "日") {
              hasChn = true;
            } else if (cell["m"] == "日") {
              hasChnWeek1 = true;
            } else if (_this.isChnWeek2(cell["m"])) {
              hasChnWeek2 = true;
            } else if (_this.isChnWeek3(cell["m"])) {
              hasChnWeek3 = true;
            }
          }
        }
      }
    }
    return [hasNumber, hasExtendNumber, hasDate, hasChn, hasChnWeek1, hasChnWeek2, hasChnWeek3];
  }
};
export default uiModule;