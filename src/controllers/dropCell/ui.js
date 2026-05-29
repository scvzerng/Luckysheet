import { onNS, offNS } from '../../utils/migrationHelpers.js';
import { rowLocationByIndex, colLocationByIndex } from "../../global/location";
import { countfunc } from "../../global/count";
import { getObjType, replaceHtml } from "../../utils/util";
import Store from "../../store";
import locale from "../../locale/locale";
import cellMain from '../../ui/cellMain.js';

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
    let _elDropCellIcon = document.getElementById("luckysheet-dropCell-icon");
    if (_elDropCellIcon) _elDropCellIcon.remove();
    cellMain.append(_this.iconHtml);
    _elDropCellIcon = document.getElementById("luckysheet-dropCell-icon");
    if (_elDropCellIcon) {
      Object.assign(_elDropCellIcon.style, {
        "left": col + "px",
        "top": row + "px"
      });
    }

    _elDropCellIcon.addEventListener("mouseover", function () {
      this.style.backgroundColor = "#ffe8e8";
    });
    _elDropCellIcon.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "#f1f1f1";
    });
    _elDropCellIcon.addEventListener("mousedown", function (event) {
      let _elDropTypeList = document.getElementById("luckysheet-dropCell-typeList");
      if (_elDropTypeList) _elDropTypeList.remove();
      const _locale = locale();
      const locale_dropCell = _locale.dropCell;
      document.body.insertAdjacentHTML('beforeend', replaceHtml(_this.typeListHtml, {
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
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=1]").forEach(el => el.style.display = 'none');
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=4]").forEach(el => el.style.display = 'none');
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=5]").forEach(el => el.style.display = 'none');
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=6]").forEach(el => el.style.display = 'none');
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=7]").forEach(el => el.style.display = 'none');
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=8]").forEach(el => el.style.display = 'none');
      }
      if (!typeItemHide[2]) {
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=4]").forEach(el => el.style.display = 'none');
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=5]").forEach(el => el.style.display = 'none');
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=6]").forEach(el => el.style.display = 'none');
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=7]").forEach(el => el.style.display = 'none');
      }
      if (!typeItemHide[3]) {
        document.querySelectorAll("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type=8]").forEach(el => el.style.display = 'none');
      }
      let rect = this.getBoundingClientRect();
      let left = rect.left + window.pageXOffset;
      let top = rect.top + window.pageYOffset + 25;
      let winH = document.documentElement.clientHeight,
        winW = document.documentElement.clientWidth;
      _elDropTypeList = document.getElementById("luckysheet-dropCell-typeList");
      let menuW = _elDropTypeList ? _elDropTypeList.offsetWidth : 0,
        menuH = _elDropTypeList ? _elDropTypeList.offsetHeight : 0;
      if (left + menuW > winW) {
        left = left - menuW;
      }
      if (top + menuH > winH) {
        top = top - menuH - 38;
      }
      if (top < 0) {
        top = 0;
      }
      if (_elDropTypeList) {
        Object.assign(_elDropTypeList.style, {
          "left": left + "px",
          "top": top + "px"
        });
        _elDropTypeList.style.display = '';
      }
      let _elIcon2 = document.getElementById("luckysheet-dropCell-icon");
      if (_elIcon2) {
        _elIcon2.addEventListener("mouseleave", function () {
          this.style.backgroundColor = "#ffe8e8";
        });
      }
      let type = _this.applyType;
      let _elActiveType = document.querySelector("#luckysheet-dropCell-typeList .luckysheet-cols-menuitem[data-type='" + type + "'] span");
      if (_elActiveType) {
        _elActiveType.insertAdjacentHTML('beforeend', '<i class="fa fa-check luckysheet-mousedown-cancel"></i>');
      }
      event.stopPropagation();
    });

    offNS("dCtypeList");
    onNS(document, "click.dCtypeList", "#luckysheet-dropCell-typeList .luckysheet-cols-menuitem", function () {
      let _elFaCheck = document.querySelector("#luckysheet-dropCell-typeList .fa-check");
      if (_elFaCheck) _elFaCheck.remove();
      let _span = this.querySelector("span");
      if (_span) _span.insertAdjacentHTML('beforeend', '<i class="fa fa-check luckysheet-mousedown-cancel"></i>');
      let type = this.getAttribute("data-type");
      _this.applyType = type;
      _this.update();
      let _elDropTypeList2 = document.getElementById("luckysheet-dropCell-typeList");
      if (_elDropTypeList2) _elDropTypeList2.style.display = 'none';
      let _elIcon3 = document.getElementById("luckysheet-dropCell-icon");
      if (_elIcon3) _elIcon3.style.backgroundColor = "#f1f1f1";
      if (_elIcon3) {
        _elIcon3.addEventListener("mouseleave", function () {
          this.style.backgroundColor = "#f1f1f1";
        });
      }
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
