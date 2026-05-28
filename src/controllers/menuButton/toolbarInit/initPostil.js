import locale from '../../../locale/locale';
import Store from '../../../store';
import { getLastSelection } from '../../../utils/storeAccess.js';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import luckysheetPostil from '../../postil';

export function initPostil(_this) {
      //批注
      $("#luckysheet-icon-postil").click(function () {
        let menuButtonId = $(this).attr("id") + "-menuButton";
        let $menuButton = $("#" + menuButtonId);
        const locale_comment = locale().comment;
        $menuButton.remove();
  
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
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
      });
}
