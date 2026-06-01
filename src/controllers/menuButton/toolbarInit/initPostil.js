import locale from '../../../locale/locale';
import Store from '../../../store';
import { getLastSelection } from '../../../utils/storeAccess.js';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import luckysheetPostil from '../../postil';

export function initPostil(_this) {
      //批注
      document.getElementById("luckysheet-icon-postil")?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        const locale_comment = locale().comment;
        if (menuButton) menuButton.remove();
  
        // if($menuButton.length == 0){
        luckysheetPostil.removeActivePs();
        let last = getLastSelection();
        let row_index = last["row_focus"];
        if (row_index == null) {
          row_index = last["row"][0];
        }
        let col_index = last["column_focus"];
        if (col_index == null) {
          col_index = last["column"][0];
        }
        let itemdata;
        if (Store.sheetData[row_index][col_index] != null && Store.sheetData[row_index][col_index].ps != null) {
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
        document.body.insertAdjacentHTML('beforeend', menu);
        menuButton = document.getElementById(menuButtonId);
        menuButton.style.width = "150px";
        menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
          item.addEventListener("click", function () {
            menuButton.style.display = "none";
            luckysheetContainerFocus();
            let itemvalue = this.getAttribute("itemvalue");
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
        });

        let userlen = this.offsetWidth;
        let tlen = menuButton.offsetWidth;
        let menuleft = this.getBoundingClientRect().left + window.pageXOffset;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition(menuButton, menuleft, this.getBoundingClientRect().top + window.pageYOffset + 25, "lefttop");
      });
}
