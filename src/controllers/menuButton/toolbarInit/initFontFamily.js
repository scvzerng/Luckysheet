import { hideMenuByCancel } from '../../../global/cursorPos';
import editor from '../../../global/editor';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';

export function initFontFamily(_this) {
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
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition($menuButton, menuleft, $(this).offset().top + 25, "lefttop");
      });
}
