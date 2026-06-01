import { hideMenuByCancel } from '../../../global/cursorPos';
import editor from '../../../global/editor';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow, isInputBoxActive } from '../../../utils/domUtils.js';

export function initFontSize(_this) {
      //字体大小
      let luckysheet_fs_setTimeout = null;
      let fontSizeEl = document.getElementById("luckysheet-icon-font-size");
      fontSizeEl?.addEventListener("mousedown", function (e) {
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
      });
      fontSizeEl?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        if (menuButton == null) {
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
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "150px";
          _this.focus(menuButton, 10);
          menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
              let input = document.querySelector("#luckysheet-icon-font-size input");
              document.getElementById("luckysheet-icon-font-size")?.setAttribute("itemvalue", itemvalue);
              _this.focus(menuButton, itemvalue);
              if (input) input.value = itemvalue;
              let d = editor.deepCopyFlowData(Store.sheetData);
              _this.updateFormat(d, "fs", itemvalue);
              clearTimeout(luckysheet_fs_setTimeout);
            });
          });
        }
        let userlen = this.offsetWidth;
        let tlen = menuButton.offsetWidth;
        let defualtvalue = document.getElementById("luckysheet-icon-font-size")?.getAttribute("itemvalue");
        if (defualtvalue == null) {
          defualtvalue = 10;
        }
        _this.focus(menuButton, defualtvalue);
        let menuleft = this.getBoundingClientRect().left + window.pageXOffset;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition(menuButton, menuleft, this.getBoundingClientRect().top + window.pageYOffset + 25, "lefttop");
      });
      fontSizeEl?.querySelector("input.luckysheet-toolbar-textinput")?.addEventListener("keydown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      });
      fontSizeEl?.querySelector("input.luckysheet-toolbar-textinput")?.addEventListener("keyup", function (e) {
        if (e.keyCode != 13) {
          return;
        }
        let self = this;
        let itemvalue = parseInt(self.value);
        let menuButton = document.getElementById("luckysheet-icon-font-size-menuButton");
        _this.focus(menuButton, itemvalue);
        let d = editor.deepCopyFlowData(Store.sheetData);
        _this.updateFormat(d, "fs", itemvalue);
        luckysheet_fs_setTimeout = setTimeout(function () {
          menuButton.style.display = "none";
          self.blur();
        }, 200);
      });
}
