

import { onNS, offNS } from '../../../utils/migrationHelpers.js';


export function initRuleTypeEvents(_this) {
      offNS("CFnewEditorRuleItem");
      onNS(document, "click.CFnewEditorRuleItem", ".luckysheet-newEditorRule-dialog .ruleTypeItem", function () {
        this.classList.add("on"); Array.from(this.parentElement.children).filter(s => s !== this).forEach(s => s.classList.remove("on"));
        let index = Array.from(this.parentElement.children).indexOf(this);
        this.closest(".luckysheet-newEditorRule-dialog").querySelector(".ruleExplainBox").innerHTML = _this.getRuleExplain(index);
        _this.colorSelectInit();
      });
      offNS("CFnewEditorRuleType1");
      onNS(document, "change.CFnewEditorRuleType1", ".luckysheet-newEditorRule-dialog #type1", function () {
        let optionVal = this.value;
        if (optionVal == "dataBar" || optionVal == "colorGradation" || optionVal == "icons" || optionVal == "number" || optionVal == "text" || optionVal == "date") {
          let _dialog = this.closest(".luckysheet-newEditorRule-dialog");
          let _optionBox = _dialog.querySelector("." + optionVal + "Box");
          if (_optionBox) _optionBox.style.display = '';
          Array.from(_optionBox.parentElement.children).filter(s => s !== _optionBox).forEach(s => s.style.display = 'none');
        }
        if (optionVal == "date") {
          _this.daterangeInit(this.closest(".luckysheet-newEditorRule-dialog").id);
        }
      });
      offNS("CFnewEditorRuleType2");
      onNS(document, "change.CFnewEditorRuleType2", ".luckysheet-newEditorRule-dialog #type2", function () {
        let _dialog = this.closest(".luckysheet-newEditorRule-dialog");
        let type1 = _dialog.querySelector("#type1")?.value;
        if (type1 == "colorGradation") {
          let type2 = this.value;
          if (type2 == "threeColor") {
            _dialog.querySelectorAll(".midVal").forEach(el => el.style.display = '');
          } else {
            _dialog.querySelectorAll(".midVal").forEach(el => el.style.display = 'none');
          }
        } else if (type1 == "number") {
          let type2 = this.value;
          if (type2 == "betweenness") {
            _dialog.querySelectorAll(".txt").forEach(el => el.style.display = '');
            _dialog.querySelectorAll("#conditionVal2").forEach(el => el.style.display = '');
          } else {
            _dialog.querySelectorAll(".txt").forEach(el => el.style.display = 'none');
            _dialog.querySelectorAll("#conditionVal2").forEach(el => el.style.display = 'none');
          }
        }
      });
      offNS("CFiconsShowbox");
      onNS(document, "click.CFiconsShowbox", ".luckysheet-newEditorRule-dialog .iconsBox .showbox", function () {
        let _ul = this.closest(".iconsBox").querySelector("ul");
        if (_ul) _ul.style.display = _ul.style.display === 'none' ? '' : 'none';
      });
      offNS("CFiconsLi");
      onNS(document, "click.CFiconsLi", ".luckysheet-newEditorRule-dialog .iconsBox li", function () {
        let _div = this.querySelector("div");
        let len = _div?.getAttribute("data-len");
        let leftmin = _div?.getAttribute("data-leftmin");
        let top = _div?.getAttribute("data-top");
        let title = _div?.getAttribute("title");
        let position = _div ? getComputedStyle(_div).backgroundPosition : '';
        let _iconsBox = this.closest(".iconsBox");
        let _model = _iconsBox.querySelector(".showbox .model");
        if (_model) {
          _model.style.backgroundPosition = position;
          _model.setAttribute("data-len", len);
          _model.setAttribute("data-leftmin", leftmin);
          _model.setAttribute("data-top", top);
          _model.setAttribute("title", title);
        }
        let _ul = this.closest("ul");
        if (_ul) _ul.style.display = 'none';
      });
}
