import { onNS, offNS } from '../../../utils/migrationHelpers.js';
import tooltip from '../../../global/tooltip';
import { isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import { getluckysheetfile, getSheetIndex } from '../../../methods/get';
import { setluckysheetfile } from '../../../methods/set';
import Store from '../../../store';
import { luckysheetContainerFocus, mouseclickposition, replaceHtml } from '../../../utils/util';
import { checkMenuOverflow } from '../../../utils/domUtils.js';
import conditionformat from '../../conditionformat';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';
import sheetmanage from '../../sheetmanage';

export function initConditionformat(_this) {
      //条件格式
      document.getElementById("luckysheet-icon-conditionformat")?.addEventListener("click", function () {
        let menuButtonId = this.getAttribute("id") + "-menuButton";
        let menuButton = document.getElementById(menuButtonId);
        const conditionformat_text = locale().conditionformat;
        if (menuButton == null) {
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
  
          //项目选取规则子菜�?
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
  
          //清除规则子菜�?
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
          document.body.insertAdjacentHTML('beforeend', menu + submenu + submenu2 + submenu3 + submenu4 + submenu6);
          menuButton = document.getElementById(menuButtonId);
          menuButton.style.width = "190px";
          const _elHighlight = document.getElementById("luckysheet-icon-highlightCellRule-menuButton"); if (_elHighlight) _elHighlight.style.width = "160px";
          const _elProject = document.getElementById("luckysheet-icon-projectSelectRule-menuButton"); if (_elProject) _elProject.style.width = "180px";
          menuButton.querySelectorAll(".luckysheet-cols-menuitem").forEach(function (item) {
            item.addEventListener("click", function () {
              menuButton.style.display = "none";
              luckysheetContainerFocus();
              let itemvalue = this.getAttribute("itemvalue");
            if (itemvalue == "icons") {
              if (Store.selections.length == 0) {
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
              if (Store.selections.length == 0) {
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
                fetch(loadSheetUrl, {
                  method: 'POST',
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: new URLSearchParams({
                    gridKey: luckysheetConfigsetting.gridKey,
                    index: sheetindex.join(",")
                  }).toString()
                }).then(function(response) { return response.text(); }).then(function (d) {
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
                  conditionformat.fileClone = structuredClone(file);
                  conditionformat.administerRuleDialog();
                  conditionformat.init();
                });
              } else {
                conditionformat.fileClone = structuredClone(file);
                conditionformat.administerRuleDialog();
                conditionformat.init();
              }
            }
            });
          });
  
          //突出显示单元格规则子菜单点击事件
          offNS("CFhighlightCellRule");
          onNS(document, "click.CFhighlightCellRule", "#luckysheet-icon-highlightCellRule-menuButton .luckysheet-cols-menuitem", function () {
            menuButton.style.display = "none";
            const _elHighlight = document.getElementById("luckysheet-icon-highlightCellRule-menuButton"); if (_elHighlight) _elHighlight.style.display = 'none';
            luckysheetContainerFocus();
            let itemvalue = this.getAttribute("itemvalue");
            if (Store.selections.length == 0) {
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
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_greaterThan_title}�?/div>
                                                  <div class="inpbox range">
                                                      <input id="conditionVal" class="formulaInputFocus"/>
                                                      <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                  </div>
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAs}�?/div> 
                                                  ${textCellColorHtml} 
                                              </div>`;
                  break;
                case "lessThan":
                  title = conditionformat_text.conditionformat_lessThan;
                  content = `<div class="box" data-itemvalue="lessThan">
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_lessThan_title}�?/div>
                                                  <div class="inpbox range">
                                                      <input id="conditionVal" class="formulaInputFocus"/>
                                                      <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                  </div>
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAs}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
                case "betweenness":
                  title = conditionformat_text.conditionformat_betweenness;
                  content = `<div class="box" data-itemvalue="betweenness">
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_betweenness_title}�?/div>
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
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAs}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
                case "equal":
                  title = conditionformat_text.conditionformat_equal;
                  content = `<div class="box" data-itemvalue="equal">
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_equal_title}�?/div>
                                                  <div class="inpbox range">
                                                      <input id="conditionVal" class="formulaInputFocus"/>
                                                      <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                  </div>
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAs}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
                case "textContains":
                  title = conditionformat_text.conditionformat_textContains;
                  content = `<div class="box" data-itemvalue="textContains">
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_textContains_title}�?/div>
                                                  <div class="inpbox range">
                                                      <input id="conditionVal" class="formulaInputFocus"/>
                                                      <i class="fa fa-table" aria-hidden="true" title="${conditionformat_text.selectCell}"></i>
                                                  </div>
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAs}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
                case "occurrenceDate":
                  title = conditionformat_text.conditionformat_occurrenceDate;
                  content = `<div class="box" data-itemvalue="occurrenceDate">
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_occurrenceDate_title}�?/div>
                                                  <div class="inpbox">
                                                      <input id="daterange-btn" class="formulaInputFocus" readonly="readonly" placeholder="${conditionformat_text.pleaseSelectADate}"/>
                                                  </div>
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAs}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
                case "duplicateValue":
                  title = conditionformat_text.conditionformat_duplicateValue;
                  content = `<div class="box" data-itemvalue="duplicateValue">
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_duplicateValue_title}�?/div>
                                                  <select id="conditionVal" class="selectbox">
                                                      <option value="0">${conditionformat_text.duplicateValue}</option>
                                                      <option value="1">${conditionformat_text.uniqueValue}</option>
                                                  </select>
                                                  <div style="margin:5px 0;">${conditionformat_text.setAs}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
              }
              conditionformat.conditionformatDialog(title, content);
            }
          });
  
          //项目选取规则子菜单点击事�?
          offNS("CFprojectSelectRule");
          onNS(document, "click.CFprojectSelectRule", "#luckysheet-icon-projectSelectRule-menuButton .luckysheet-cols-menuitem", function () {
            menuButton.style.display = "none";
            const _elProject = document.getElementById("luckysheet-icon-projectSelectRule-menuButton"); if (_elProject) _elProject.style.display = 'none';
            luckysheetContainerFocus();
            let itemvalue = this.getAttribute("itemvalue");
            if (Store.selections.length == 0) {
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
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_top10_title}�?/div>
                                                  <div style="height: 30px;line-height: 30px;">
                                                      <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.top}</div>
                                                      <div class="inpbox2">
                                                          <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                      </div>
                                                      <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.oneself}</div>
                                                  </div>
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAs}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
                case "top10%":
                  title = conditionformat_text.conditionformat_top10_percent;
                  content = `<div class="box" data-itemvalue="top10%">
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_top10_title}�?/div>
                                                  <div style="height: 30px;line-height: 30px;">
                                                      <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.top}</div>
                                                      <div class="inpbox2">
                                                          <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                      </div>
                                                      <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">%</div>
                                                  </div>
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAs}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
                case "last10":
                  title = conditionformat_text.conditionformat_last10;
                  content = `<div class="box" data-itemvalue="last10">
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_last10_title}�?/div>
                                                  <div style="height: 30px;line-height: 30px;">
                                                      <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.last}</div>
                                                      <div class="inpbox2">
                                                          <input id="conditionVal" class="formulaInputFocus" type="number" value="10"/>
                                                      </div>
                                                      <div style="float: left;height: 30px;line-height: 30px;margin: 0 5px;">${conditionformat_text.oneself}</div>
                                                  </div>
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAs}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
                case "last10%":
                  title = conditionformat_text.conditionformat_last10_percent;
                  content = `<div class="box" data-itemvalue="last10%">
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_last10_title}�?/div>
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
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_AboveAverage_title}�?/div>
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAsByArea}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
                case "SubAverage":
                  title = conditionformat_text.conditionformat_SubAverage;
                  content = `<div class="box" data-itemvalue="SubAverage">
                                                  <div class="boxTitleOne">${conditionformat_text.conditionformat_SubAverage_title}�?/div>
                                                  <div style="margin: 5px 0;">${conditionformat_text.setAsByArea}�?/div>
                                                  ${textCellColorHtml}
                                              </div>`;
                  break;
              }
              conditionformat.conditionformatDialog(title, content);
            }
          });
  
          //数据条子菜单点击事件
          offNS("CFdataBar");
          onNS(document, "click.CFdataBar", "#luckysheet-icon-dataBar-menuButton .luckysheet-cols-menuitem", function () {
            menuButton.style.display = "none";
            const _elDataBar = document.getElementById("luckysheet-icon-dataBar-menuButton"); if (_elDataBar) _elDataBar.style.display = 'none';
            luckysheetContainerFocus();
            let itemvalue = this.getAttribute("itemvalue");
            if (Store.selections.length > 0) {
              let cellrange = structuredClone(Store.selections);
              let format = conditionformat.dataBarList[itemvalue]["format"];
              conditionformat.updateItem("dataBar", cellrange, format);
            }
          });
  
          //色阶子菜单点击事�?
          offNS("CFcolorGradation");
          onNS(document, "click.CFcolorGradation", "#luckysheet-icon-colorGradation-menuButton .luckysheet-cols-menuitem", function () {
            menuButton.style.display = "none";
            const _elColorGrad = document.getElementById("luckysheet-icon-colorGradation-menuButton"); if (_elColorGrad) _elColorGrad.style.display = 'none';
            luckysheetContainerFocus();
            let itemvalue = this.getAttribute("itemvalue");
            if (Store.selections.length > 0) {
              let cellrange = structuredClone(Store.selections);
              let format = conditionformat.colorGradationList[itemvalue]["format"];
              conditionformat.updateItem("colorGradation", cellrange, format);
            }
          });
  
          //清除规则子菜单点击事�?
          offNS("CFdeleteRule");
          onNS(document, "click.CFdeleteRule", "#luckysheet-icon-deleteRule-menuButton .luckysheet-cols-menuitem", function () {
            menuButton.style.display = "none";
            const _elDeleteRule = document.getElementById("luckysheet-icon-deleteRule-menuButton"); if (_elDeleteRule) _elDeleteRule.style.display = 'none';
            luckysheetContainerFocus();
            let itemvalue = this.getAttribute("itemvalue");
            if (itemvalue == "delSheet") {
              conditionformat.updateItem("delSheet");
            }
          });
        }
        let userlen = this.offsetWidth;
        let tlen = menuButton.offsetWidth;
        let menuleft = this.getBoundingClientRect().left + window.pageXOffset;
        if (checkMenuOverflow(tlen, userlen, menuleft)) {
          menuleft = menuleft - tlen + userlen;
        }
        mouseclickposition(menuButton, menuleft, this.getBoundingClientRect().top + window.pageYOffset + 25, "lefttop");
      });
}
