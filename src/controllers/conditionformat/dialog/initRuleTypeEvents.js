

import { onNS, offNS } from '../../../utils/migrationHelpers.js';


export function initRuleTypeEvents(_this) {
      offNS("CFnewEditorRuleItem");
      onNS(document, "click.CFnewEditorRuleItem", ".luckysheet-newEditorRule-dialog .ruleTypeItem", function () {
        $(this).addClass("on").siblings().removeClass("on");
        let index = $(this).index();
        $(this).parents(".luckysheet-newEditorRule-dialog").find(".ruleExplainBox").html(_this.getRuleExplain(index));
        _this.colorSelectInit();
      });
      offNS("CFnewEditorRuleType1");
      onNS(document, "change.CFnewEditorRuleType1", ".luckysheet-newEditorRule-dialog #type1", function () {
        let optionVal = $(this).find("option:selected").val();
        if (optionVal == "dataBar" || optionVal == "colorGradation" || optionVal == "icons" || optionVal == "number" || optionVal == "text" || optionVal == "date") {
          $(this).parents(".luckysheet-newEditorRule-dialog").find("." + optionVal + "Box").show().siblings().hide();
        }
        if (optionVal == "date") {
          _this.daterangeInit($(this).parents(".luckysheet-newEditorRule-dialog").attr("id"));
        }
      });
      offNS("CFnewEditorRuleType2");
      onNS(document, "change.CFnewEditorRuleType2", ".luckysheet-newEditorRule-dialog #type2", function () {
        let type1 = $(this).parents(".luckysheet-newEditorRule-dialog").find("#type1 option:selected").val();
        if (type1 == "colorGradation") {
          let type2 = $(this).find("option:selected").val();
          if (type2 == "threeColor") {
            $(this).parents(".luckysheet-newEditorRule-dialog").find(".midVal").show();
          } else {
            $(this).parents(".luckysheet-newEditorRule-dialog").find(".midVal").hide();
          }
        } else if (type1 == "number") {
          let type2 = $(this).find("option:selected").val();
          if (type2 == "betweenness") {
            $(this).parents(".luckysheet-newEditorRule-dialog").find(".txt").show();
            $(this).parents(".luckysheet-newEditorRule-dialog").find("#conditionVal2").show();
          } else {
            $(this).parents(".luckysheet-newEditorRule-dialog").find(".txt").hide();
            $(this).parents(".luckysheet-newEditorRule-dialog").find("#conditionVal2").hide();
          }
        }
      });
      offNS("CFiconsShowbox");
      onNS(document, "click.CFiconsShowbox", ".luckysheet-newEditorRule-dialog .iconsBox .showbox", function () {
        $(this).parents(".iconsBox").find("ul").toggle();
      });
      offNS("CFiconsLi");
      onNS(document, "click.CFiconsLi", ".luckysheet-newEditorRule-dialog .iconsBox li", function () {
        let len = $(this).find("div").attr("data-len");
        let leftmin = $(this).find("div").attr("data-leftmin");
        let top = $(this).find("div").attr("data-top");
        let title = $(this).find("div").attr("title");
        let position = $(this).find("div").css("background-position");
        $(this).parents(".iconsBox").find(".showbox .model").css("background-position", position);
        $(this).parents(".iconsBox").find(".showbox .model").attr("data-len", len);
        $(this).parents(".iconsBox").find(".showbox .model").attr("data-leftmin", leftmin);
        $(this).parents(".iconsBox").find(".showbox .model").attr("data-top", top);
        $(this).parents(".iconsBox").find(".showbox .model").attr("title", title);
        $(this).parents("ul").hide();
      });
}
