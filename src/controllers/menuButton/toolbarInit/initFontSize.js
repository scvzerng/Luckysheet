import { hideMenuByCancel } from '../../../global/cursorPos';
import editor from '../../../global/editor';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow, isInputBoxActive } from '../../../utils/domUtils.js';

export function initFontSize(_this) {
      //字体大小
      let luckysheet_fs_setTimeout = null;
      $("#luckysheet-icon-font-size").mousedown(function (e) {
        if (isInputBoxActive()) {
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
          document.body.insertAdjacentHTML('beforeend', menu);
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
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
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
}
