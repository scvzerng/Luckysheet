import {  getRangetxt  } from "../../../methods/get";
import {  replaceHtml } from "../../../utils/util";
import {  modelHTML } from "../../constant";
import { selectionCopyShow } from "../../select";
import luckysheetConfigsetting from "../../luckysheetConfigsetting";
import locale from "../../../locale/locale";
import Store from "../../../store";
import dayjs from 'dayjs';
import { createColorPicker, getPicker, STANDARD_PALETTE } from '../../../components/ColorPicker';
import '../../../components/ColorPicker/colorPicker.css';
import { showModalMask, hideModalMask } from '../../../utils/domUtils.js';
import formulaDialogs from '../../../ui/formulaDialogs.js';
import conditionformatDialog from '../../../ui/conditionformatDialog.js';

import { initAdminRuleEvents } from './initAdminRuleEvents.js';
import { initNewRuleEvents } from './initNewRuleEvents.js';
import { initEditRuleEvents } from './initEditRuleEvents.js';
import { initRuleTypeEvents } from './initRuleTypeEvents.js';
import { initConditionDialogEvents } from './initConditionDialogEvents.js';
import { initRangeAndCloseEvents } from './initRangeAndCloseEvents.js';

const dialogModule = {
  ruleTypeHtml: function () {
    const conditionformat_Text = locale().conditionformat;
    return `<div class="ruleTypeBox">
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem1}</span>
                        </div>
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem2}</span>
                        </div>
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem3}</span>
                        </div>
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem4}</span>
                        </div>
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem5}</span>
                        </div>
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem6}</span>
                        </div>
                    </div>`;
  },
  textCellColorHtml: function () {
    const conditionformat_Text = locale().conditionformat;
    return `<div id="textCellColor">
                        <div class="colorbox">
                            <input id="checkTextColor" type="checkbox" checked="checked">
                            <label for="checkTextColor">${conditionformat_Text.textColor}�?/label>
                            <input id="textcolorshow" data-tips="${conditionformat_Text.textColor}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="#9c0006" style="display: none;">
                        </div>
                        <div class="colorbox">
                            <input id="checkCellColor" type="checkbox" checked="checked">
                            <label for="checkCellColor">${conditionformat_Text.cellColor}�?/label>
                            <input id="cellcolorshow" data-tips="${conditionformat_Text.cellColor}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="#ffc7ce" style="display: none;">
                        </div>
                    </div>`;
  },
  init: function () {
    let _this = this;
    const conditionformat_Text = locale().conditionformat;
    initAdminRuleEvents(_this);
    initNewRuleEvents(_this);
    initEditRuleEvents(_this);
    initRuleTypeEvents(_this);
    initConditionDialogEvents(_this);
    initRangeAndCloseEvents(_this);
  },
    singleRangeDialog: function (source, value) {
    hideModalMask();
    formulaDialogs.singleRange.remove();
    const conditionformat_Text = locale().conditionformat;
    document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
      "id": "luckysheet-singleRange-dialog",
      "addclass": "luckysheet-singleRange-dialog",
      "title": conditionformat_Text.selectCell,
      "content": `<input readonly="readonly" placeholder="${conditionformat_Text.pleaseSelectCell}" value="${value}"/>`,
      "botton": `<button id="luckysheet-singleRange-dialog-confirm" class="btn btn-primary" data-source="${source}">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-singleRange-dialog-close" class="btn btn-default" data-source="${source}">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let _srEl = formulaDialogs.singleRange.el;
    let _srContent = _srEl.querySelector ? _srEl.querySelector(".luckysheet-modal-dialog-content") : null;
    if (_srContent) _srContent.style.minWidth = '300px';
    let myh = _srEl.offsetHeight || 0,
      myw = _srEl.offsetWidth || 0;
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    formulaDialogs.singleRange.showAt({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    });
  },
  multiRangeDialog: function (dataItem, value) {
    let _this = this;
    hideModalMask();
    formulaDialogs.multiRange.remove();
    const conditionformat_Text = locale().conditionformat;
    document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
      "id": "luckysheet-multiRange-dialog",
      "addclass": "luckysheet-multiRange-dialog",
      "title": conditionformat_Text.selectRange,
      "content": `<input readonly="readonly" placeholder="${conditionformat_Text.pleaseSelectRange}" value="${value}"/>`,
      "botton": `<button id="luckysheet-multiRange-dialog-confirm" class="btn btn-primary" data-item="${dataItem}">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-multiRange-dialog-close" class="btn btn-default">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let _mrEl = formulaDialogs.multiRange.el;
    let _mrContent = _mrEl.querySelector ? _mrEl.querySelector(".luckysheet-modal-dialog-content") : null;
    if (_mrContent) _mrContent.style.minWidth = '300px';
    let myh = _mrEl.offsetHeight || 0,
      myw = _mrEl.offsetWidth || 0;
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    formulaDialogs.multiRange.showAt({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    });
    selectionCopyShow(_this.getRangeByTxt(value));
  },
  conditionformatDialog: function (title, content) {
    let _this = this;
    showModalMask();
    conditionformatDialog.main.remove();
    const conditionformat_Text = locale().conditionformat;
    document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
      "id": "luckysheet-conditionformat-dialog",
      "addclass": "luckysheet-conditionformat-dialog",
      "title": title,
      "content": content,
      "botton": `<button id="luckysheet-conditionformat-dialog-confirm" class="btn btn-primary">${conditionformat_Text.confirm}</button>
                        <button class="btn btn-default luckysheet-model-close-btn">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:9999"
    }));
    let _cfEl = conditionformatDialog.main.el;
    let _cfContent = _cfEl.querySelector ? _cfEl.querySelector(".luckysheet-modal-dialog-content") : null;
    if (_cfContent) _cfContent.style.minWidth = '300px';
    let myh = _cfEl.offsetHeight || 0,
      myw = _cfEl.offsetWidth || 0;
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    Object.assign(_cfEl.style, {
      "left": (winw + scrollLeft - myw) / 2 + 'px',
      "top": (winh + scrollTop - myh) / 3 + 'px'
    });
    _cfEl.style.display = '';
    _this.init();
    _this.colorSelectInit();
    if (title == locale().conditionformat.conditionformat_occurrenceDate) {
      _this.daterangeInit("luckysheet-conditionformat-dialog");
    }
  },
  CFiconsDialog: function () {
    showModalMask();
    let _cfIconsEl = document.getElementById("luckysheet-CFicons-dialog");
    if (_cfIconsEl) _cfIconsEl.remove();
    const conditionformat_Text = locale().conditionformat;
    let content = `<div class="box">
                            <div style="margin-bottom: 10px;">${conditionformat_Text.pleaseSelectIcon}</div>
                            <div class="title">${conditionformat_Text.direction}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.multicolor})"><div style="background-position:0 0;"></div></div>
                                    <div class="item" data-len="3" data-leftMin="0" data-top="1" title="${conditionformat_Text.threeTriangles}"><div style="background-position:0 -20px;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="0" data-top="2" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.multicolor})"><div style="background-position:0 -40px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="0" data-top="3" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.multicolor})"><div style="background-position:0 -60px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="3" data-leftMin="5" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.grayColor})"><div style="background-position:-131px 0;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="5" data-top="1" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.grayColor})"><div style="background-position:-131px -20px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="5" data-top="2" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.grayColor})"><div style="background-position:-131px -40px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div class="title">${conditionformat_Text.shape}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.rimless})"><div style="background-position:0 -80px;"></div></div>
                                    <div class="item" data-len="3" data-leftMin="0" data-top="5" title="${conditionformat_Text.threeSigns}"><div style="background-position:0 -100px;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="0" data-top="6" title="${conditionformat_Text.greenRedBlackGradient}"><div style="background-position:0 -120px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="3" data-leftMin="5" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.bordered})"><div style="background-position:-131px -80px;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="5" data-top="5" title="${conditionformat_Text.fourColorTrafficLight}"><div style="background-position:-131px -100px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div class="title">${conditionformat_Text.mark}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.circled})"><div style="background-position:0 -140px;"></div></div>
                                    <div class="item" data-len="3" data-leftMin="0" data-top="8" title="${conditionformat_Text.tricolorFlag}"><div style="background-position:0 -160px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="3" data-leftMin="5" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.noCircle})"><div style="background-position:-131px -140px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div class="title">${conditionformat_Text.grade}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="9" title="${conditionformat_Text.threeStars}"><div style="background-position:0 -180px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="0" data-top="10" title="${conditionformat_Text.fiveQuadrantDiagram}"><div style="background-position:0 -200px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="0" data-top="11" title="${conditionformat_Text.fiveBoxes}"><div style="background-position:0 -220px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="4" data-leftMin="5" data-top="9" title="${conditionformat_Text.grade4}"><div style="background-position:-131px -180px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="5" data-top="10" title="${conditionformat_Text.grade5}"><div style="background-position:-131px -200px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                        </div>`;
    document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
      "id": "luckysheet-CFicons-dialog",
      "addclass": "luckysheet-CFicons-dialog",
      "title": conditionformat_Text.icons,
      "content": content,
      "botton": `<button class="btn btn-default luckysheet-model-close-btn">${conditionformat_Text.close}</button>`,
      "style": "z-index:100003"
    }));
    let _cfIconsEl2 = document.getElementById("luckysheet-CFicons-dialog");
    let _cfIconsContent = _cfIconsEl2?.querySelector(".luckysheet-modal-dialog-content");
    if (_cfIconsContent) _cfIconsContent.style.minWidth = '400px';
    let myh = _cfIconsEl2?.offsetHeight || 0,
      myw = _cfIconsEl2?.offsetWidth || 0;
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    Object.assign(_cfIconsEl2.style, {
      "left": (winw + scrollLeft - myw) / 2 + 'px',
      "top": (winh + scrollTop - myh) / 3 + 'px'
    });
    _cfIconsEl2.style.display = '';
  },
  administerRuleDialog: function () {
    showModalMask();
    conditionformatDialog.adminRule.remove();
    const conditionformat_Text = locale().conditionformat;

    //工作表
    let opHtml = '';
    for (let j = 0; j < Store.luckysheetfile.length; j++) {
      if (Store.luckysheetfile[j].status == "1") {
        opHtml += `<option value="${Store.luckysheetfile[j]["index"]}" selected="selected">
                                ${conditionformat_Text.currentSheet}：${Store.luckysheetfile[j]["name"]}
                            </option>`;
      } else {
        opHtml += `<option value="${Store.luckysheetfile[j]["index"]}">
                                ${conditionformat_Text.sheet}：${Store.luckysheetfile[j]["name"]}
                            </option>`;
      }
    }
    let content = `<div class="chooseSheet">
                            <label>${conditionformat_Text.showRules}：</label>
                            <select>${opHtml}</select>
                        </div>
                        <div class="ruleBox">
                            <div class="ruleBtn">
                                <button id="newConditionRule" class="btn btn-default">${conditionformat_Text.newRule}</button>
                                <button id="editorConditionRule" class="btn btn-default">${conditionformat_Text.editRule}</button>
                                <button id="deleteConditionRule" class="btn btn-default">${conditionformat_Text.deleteRule}</button>
                            </div>
                            <div class="ruleList">
                                <div class="listTitle">
                                    <span>${conditionformat_Text.rule}</span>
                                    <span>${conditionformat_Text.format}</span>
                                    <span>${conditionformat_Text.applyRange}</span>
                                </div>
                                <div class="listBox"></div>
                            </div>
                        </div>`;
    document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
      "id": "luckysheet-administerRule-dialog",
      "addclass": "luckysheet-administerRule-dialog",
      "title": conditionformat_Text.conditionformatManageRules,
      "content": content,
      "botton": `<button id="luckysheet-administerRule-dialog-confirm" class="btn btn-primary">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-administerRule-dialog-close" class="btn btn-default">${conditionformat_Text.close}</button>`,
      "style": "z-index:100003"
    }));
    let _adminEl = conditionformatDialog.adminRule.el;
    let _adminContent = _adminEl.querySelector ? _adminEl.querySelector(".luckysheet-modal-dialog-content") : null;
    if (_adminContent) _adminContent.style.minWidth = '400px';
    let myh = _adminEl.offsetHeight || 0,
      myw = _adminEl.offsetWidth || 0;
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    Object.assign(_adminEl.style, {
      "left": (winw + scrollLeft - myw) / 2 + 'px',
      "top": (winh + scrollTop - myh) / 3 + 'px'
    });
    _adminEl.style.display = '';

    //当前工作表的规则列表
    let index = conditionformatDialog.adminRule.find(".chooseSheet option:checked")?.value;
    this.getConditionRuleList(index);
  },
  newConditionRuleDialog: function (source) {
    let _this = this;
    const conditionformat_Text = locale().conditionformat;

    //规则说明
    let ruleExplainHtml = _this.getRuleExplain(0);

    //弹出层
    showModalMask();
    conditionformatDialog.adminRule.hide();
    conditionformatDialog.newRule.remove();
    let content = '<div>' + '<div class="boxTitle">' + conditionformat_Text.chooseRuleType + '：</div>' + _this.ruleTypeHtml() + '<div class="boxTitle">' + conditionformat_Text.editRuleDescription + '：</div>' + '<div class="ruleExplainBox">' + ruleExplainHtml + '</div>' + '</div>';
    document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
      "id": "luckysheet-newConditionRule-dialog",
      "addclass": "luckysheet-newEditorRule-dialog",
      "title": conditionformat_Text.newFormatRule,
      "content": content,
      "botton": `<button id="luckysheet-newConditionRule-dialog-confirm" class="btn btn-primary" data-source="${source}">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-newConditionRule-dialog-close" class="btn btn-default" data-source="${source}">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let _newRuleEl = document.getElementById("luckysheet-newConditionRule-dialog");
    let _newRuleContent = _newRuleEl?.querySelector(".luckysheet-modal-dialog-content");
    if (_newRuleContent) _newRuleContent.style.minWidth = '400px';
    let myh = _newRuleEl?.offsetHeight || 0,
      myw = _newRuleEl?.offsetWidth || 0;
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    Object.assign(_newRuleEl.style, {
      "left": (winw + scrollLeft - myw) / 2 + 'px',
      "top": (winh + scrollTop - myh) / 3 + 'px'
    });
    _newRuleEl.style.display = '';

    //index的规则类型focus
    let _firstRuleItem = _newRuleEl.querySelector(".ruleTypeBox .ruleTypeItem");
    if (_firstRuleItem) {
      _firstRuleItem.classList.add("on");
      Array.from(_firstRuleItem.parentElement.children).filter(s => s !== _firstRuleItem).forEach(s => s.classList.remove("on"));
    }
    _this.colorSelectInit();
  },
  editorConditionRuleDialog: function () {
    let _this = this;
    const conditionformat_Text = locale().conditionformat;
    let rule = _this.editorRule.data;
    if (rule == null) {
      return;
    }
    let ruleType = rule["type"],
      ruleFormat = rule["format"],
      conditionName = rule["conditionName"];
    let index, type1;
    if (ruleType == "dataBar" || ruleType == "colorGradation" || ruleType == "icons") {
      index = 0;
      type1 = ruleType;
    } else {
      if (conditionName == "greaterThan" || conditionName == "lessThan" || conditionName == "betweenness" || conditionName == "equal" || conditionName == "textContains" || conditionName == "occurrenceDate") {
        index = 1;
        if (conditionName == "greaterThan" || conditionName == "lessThan" || conditionName == "betweenness" || conditionName == "equal") {
          type1 = "number";
        } else if (conditionName == "textContains") {
          type1 = "text";
        } else if (conditionName == "occurrenceDate") {
          type1 = "date";
        }
      } else if (conditionName == "top10" || conditionName == "top10%" || conditionName == "last10" || conditionName == "last10%") {
        index = 2;
        if (conditionName == "top10" || conditionName == "top10%") {
          type1 = "top";
        } else if (conditionName == "last10" || conditionName == "last10%") {
          type1 = "last";
        }
      } else if (conditionName == "AboveAverage" || conditionName == "SubAverage") {
        index = 3;
        type1 = conditionName;
      } else if (conditionName == "duplicateValue") {
        index = 4;
        type1 = rule["conditionValue"];
      } else if (conditionName == "formula") {
        index = 5;
      }
    }

    //规则说明
    let ruleExplainHtml = _this.getRuleExplain(index);

    //弹出层
    showModalMask();
    conditionformatDialog.adminRule.hide();
    conditionformatDialog.editRule.remove();
    let content = '<div>' + '<div class="boxTitle">' + conditionformat_Text.chooseRuleType + '：</div>' + _this.ruleTypeHtml() + '<div class="boxTitle">' + conditionformat_Text.editRuleDescription + '：</div>' + '<div class="ruleExplainBox">' + ruleExplainHtml + '</div>' + '</div>';
    document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
      "id": "luckysheet-editorConditionRule-dialog",
      "addclass": "luckysheet-newEditorRule-dialog",
      "title": conditionformat_Text.editFormatRule,
      "content": content,
      "botton": `<button id="luckysheet-editorConditionRule-dialog-confirm" class="btn btn-primary">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-editorConditionRule-dialog-close" class="btn btn-default">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let _editRuleEl = document.getElementById("luckysheet-editorConditionRule-dialog");
    let _editRuleContent = _editRuleEl?.querySelector(".luckysheet-modal-dialog-content");
    if (_editRuleContent) _editRuleContent.style.minWidth = '400px';
    let myh = _editRuleEl?.offsetHeight || 0,
      myw = _editRuleEl?.offsetWidth || 0;
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    Object.assign(_editRuleEl.style, {
      "left": (winw + scrollLeft - myw) / 2 + 'px',
      "top": (winh + scrollTop - myh) / 3 + 'px'
    });
    _editRuleEl.style.display = '';
    _this.colorSelectInit();

    //规则类型focus
    let _ruleItems = _editRuleEl.querySelectorAll(".ruleTypeBox .ruleTypeItem");
    if (_ruleItems[index]) {
      _ruleItems[index].classList.add("on");
      Array.from(_ruleItems[index].parentElement.children).filter(s => s !== _ruleItems[index]).forEach(s => s.classList.remove("on"));
    }

    //type1
    let _editType1 = _editRuleEl.querySelector("#type1");
    if (_editType1) _editType1.value = type1;
    if (type1 == "dataBar" || type1 == "colorGradation" || type1 == "icons" || type1 == "number" || type1 == "text" || type1 == "date") {
      document.querySelectorAll("#luckysheet-editorConditionRule-dialog ." + type1 + "Box").forEach(el => el.style.display = '');
      let _type1Box = _editRuleEl.querySelector("." + type1 + "Box");
      if (_type1Box) {
        Array.from(_type1Box.parentElement.children).filter(s => s !== _type1Box).forEach(s => s.style.display = 'none');
      }
    }
    if (type1 == "date") {
      _this.daterangeInit("luckysheet-editorConditionRule-dialog");
    }

    //type2  format  value
    if (ruleType == "dataBar" || ruleType == "colorGradation" || ruleType == "icons") {
      if (type1 == "dataBar") {
        if (ruleFormat.length == 2) {
          let _dbType2 = _editRuleEl.querySelector(".dataBarBox #type2"); if (_dbType2) _dbType2.value = "gradient";
        } else if (ruleFormat.length == 1) {
          let _dbType2b = _editRuleEl.querySelector(".dataBarBox #type2"); if (_dbType2b) _dbType2b.value = "solid";
        }
        getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .dataBarBox .luckysheet-conditionformat-config-color"))?.set(ruleFormat[0]);
      } else if (type1 == "colorGradation") {
        if (ruleFormat.length == 3) {
          let _cgType2 = _editRuleEl.querySelector(".colorGradationBox #type2"); if (_cgType2) _cgType2.value = "threeColor";
          document.querySelectorAll("#luckysheet-editorConditionRule-dialog .colorGradationBox .midVal").forEach(el => el.style.display = '');
          getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .maxVal .luckysheet-conditionformat-config-color"))?.set(ruleFormat[0]);
          getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .midVal .luckysheet-conditionformat-config-color"))?.set(ruleFormat[1]);
          getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .minVal .luckysheet-conditionformat-config-color"))?.set(ruleFormat[2]);
        } else if (ruleFormat.length == 2) {
          let _cgType2b = _editRuleEl.querySelector(".colorGradationBox #type2"); if (_cgType2b) _cgType2b.value = "twoColor";
          document.querySelectorAll("#luckysheet-editorConditionRule-dialog .colorGradationBox .midVal").forEach(el => el.style.display = 'none');
          getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .maxVal .luckysheet-conditionformat-config-color"))?.set(ruleFormat[0]);
          getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .minVal .luckysheet-conditionformat-config-color"))?.set(ruleFormat[1]);
        }
      } else if (type1 == "icons") {
        let len = ruleFormat["len"];
        let l = ruleFormat["leftMin"];
        let t = ruleFormat["top"];
        let _iconLis = _editRuleEl.querySelectorAll(".iconsBox li");
        _iconLis.forEach(function (liEl) {
          let _div = liEl.querySelector("div");
          if (_div?.getAttribute("data-len") == len && _div?.getAttribute("data-leftmin") == l && _div?.getAttribute("data-top") == t) {
            let _model = _editRuleEl.querySelector(".iconsBox .showbox .model");
            if (_model) {
              _model.style.backgroundPosition = getComputedStyle(_div).backgroundPosition;
              _model.setAttribute("data-len", _div.getAttribute("data-len"));
              _model.setAttribute("data-leftmin", _div.getAttribute("data-leftmin"));
              _model.setAttribute("data-top", _div.getAttribute("data-leftmin"));
              _model.setAttribute("title", _div.getAttribute("title"));
            }
            return true;
          }
        });
      }
    } else {
      if (type1 == "number") {
        let _numType2 = _editRuleEl.querySelector(".numberBox #type2"); if (_numType2) _numType2.value = conditionName;
        let val1;
        if (rule.conditionRange[0] != null) {
          val1 = getRangetxt(Store.currentSheetIndex, {
            "row": rule.conditionRange[0]["row"],
            "column": rule.conditionRange[0]["column"]
          }, Store.currentSheetIndex);
        } else {
          val1 = rule.conditionValue[0];
        }
        let _condValInput = _editRuleEl.querySelector(".numberBox #conditionVal input"); if (_condValInput) _condValInput.value = val1;
        if (conditionName == "betweenness") {
          document.querySelectorAll("#luckysheet-editorConditionRule-dialog .numberBox .txt").forEach(el => el.style.display = '');
          document.querySelectorAll("#luckysheet-editorConditionRule-dialog .numberBox #conditionVal2").forEach(el => el.style.display = '');
          let val2;
          if (rule.conditionRange[1] != null) {
            val2 = getRangetxt(Store.currentSheetIndex, {
              "row": rule.conditionRange[1]["row"],
              "column": rule.conditionRange[1]["column"]
            }, Store.currentSheetIndex);
          } else {
            val2 = rule.conditionValue[1];
          }
          let _condVal2Input = _editRuleEl.querySelector(".numberBox #conditionVal2 input"); if (_condVal2Input) _condVal2Input.value = val2;
        } else {
          document.querySelectorAll("#luckysheet-editorConditionRule-dialog .numberBox .txt").forEach(el => el.style.display = 'none');
          document.querySelectorAll("#luckysheet-editorConditionRule-dialog .numberBox #conditionVal2").forEach(el => el.style.display = 'none');
        }
      } else if (type1 == "text") {
        let val1;
        if (rule.conditionRange[0] != null) {
          val1 = getRangetxt(Store.currentSheetIndex, {
            "row": rule.conditionRange[0]["row"],
            "column": rule.conditionRange[0]["column"]
          }, Store.currentSheetIndex);
        } else {
          val1 = rule.conditionValue[0];
        }
        let _textCondInput = _editRuleEl.querySelector(".textBox #conditionVal input"); if (_textCondInput) _textCondInput.value = val1;
      } else if (type1 == "date") {
        _this.daterangeInit("luckysheet-editorConditionRule-dialog");
        let val1 = rule.conditionValue[0];
        let _dateBtn = _editRuleEl.querySelector(".dateBox #daterange-btn"); if (_dateBtn) _dateBtn.value = val1;
      } else if (type1 == "top" || type1 == "last") {
        let val1 = rule.conditionValue[0];
        if (conditionName == "top10%" || conditionName == "last10%") {
            let _isPercent = _editRuleEl.querySelector("#isPercent"); if (_isPercent) _isPercent.setAttribute("checked", "checked");
        }
      } else {
        if (conditionName == "formula") {
          let val1 = rule.conditionValue[0];
          let _formulaInput = _editRuleEl.querySelector("#formulaConditionVal input"); if (_formulaInput) _formulaInput.value = val1;
        }
      }
      getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog #textcolorshow"))?.set(ruleFormat.textColor);
      getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog #cellcolorshow"))?.set(ruleFormat.cellColor);
    }
  },
  infoDialog: function (title, content) {
    showModalMask();
    let _infoEl = document.getElementById("luckysheet-conditionformat-info-dialog");
    if (_infoEl) _infoEl.remove();
    document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
      "id": "luckysheet-conditionformat-info-dialog",
      "addclass": "",
      "title": title,
      "content": content,
      "botton": `<button id="luckysheet-conditionformat-info-dialog-close" class="btn btn-default">${locale().conditionformat.close}</button>`,
      "style": "z-index:100003"
    }));
    let _infoEl2 = document.getElementById("luckysheet-conditionformat-info-dialog");
    let _infoContent = _infoEl2?.querySelector(".luckysheet-modal-dialog-content");
    if (_infoContent) _infoContent.style.minWidth = '300px';
    let myh = _infoEl2?.offsetHeight || 0,
      myw = _infoEl2?.offsetWidth || 0;
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    Object.assign(_infoEl2.style, {
      "left": (winw + scrollLeft - myw) / 2 + 'px',
      "top": (winh + scrollTop - myh) / 3 + 'px'
    });
    _infoEl2.style.display = '';
  },
  getRuleExplain: function (index) {
    const conditionformat_Text = locale().conditionformat;
    let textCellColorHtml = this.textCellColorHtml();
    let ruleExplainHtml;
    switch (index) {
      case 0:
        //基于各自值设置所有单元格的格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem1}：</div>
                                    <div style="height: 30px;margin-bottom: 5px;">
                                        <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.formatStyle}：</label>
                                        <select id="type1">
                                            <option value="dataBar">${conditionformat_Text.dataBar}</option>
                                            <option value="colorGradation">${conditionformat_Text.colorGradation}</option>
                                            <option value="icons">${conditionformat_Text.icons}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div class="type1Box dataBarBox">
                                            <div style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.fillType}：</label>
                                                <select id="type2">
                                                    <option value="gradient">${conditionformat_Text.gradient}</option>
                                                    <option value="solid">${conditionformat_Text.solid}</option>
                                                </select>
                                            </div>
                                            <div style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.color}：</label>
                                                <input data-tips="${conditionformat_Text.dataBarColor}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="#638ec6" style="display: none;"> 
                                            </div>
                                        </div>
                                        <div class="type1Box colorGradationBox" style="display: none;">
                                            <div style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.fillType}：</label>
                                                <select id="type2">
                                                    <option value="threeColor">${conditionformat_Text.tricolor}</option>
                                                    <option value="twoColor">${conditionformat_Text.twocolor}</option>
                                                </select>
                                            </div>
                                            <div class="maxVal" style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.maxValue}：</label>
                                                <input data-tips="${conditionformat_Text.maxValue} ${conditionformat_Text.color}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="rgb(99, 190, 123)" style="display: none;">
                                            </div>
                                            <div class="midVal" style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.medianValue}：</label>
                                                <input data-tips="${conditionformat_Text.medianValue} ${conditionformat_Text.color}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="rgb(255, 235, 132)" style="display: none;">
                                            </div>
                                            <div class="minVal" style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.minValue}：</label>
                                                <input data-tips="${conditionformat_Text.minValue} ${conditionformat_Text.color}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="rgb(248, 105, 107)" style="display: none;">
                                            </div>
                                        </div>
                                        <div class="type1Box iconsBox" style="display: none;">
                                            <label>${conditionformat_Text.fillType}：</label>
                                            <div class="showbox">
                                                <div class="model" data-len="3" data-leftmin="0" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 0;"></div>
                                                <span class="ui-selectmenu-icon ui-icon ui-icon-triangle-1-s" style="margin-top: 2px;"></span>
                                            </div>
                                            <ul>
                                                <li><div data-len="3" data-leftmin="0" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 0;"></div></li>
                                                <li><div data-len="3" data-leftmin="5" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.grayColor})" style="background-position: -131px 0;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="1" title="${conditionformat_Text.threeTriangles}" style="background-position: 0 -20px;"></div></li>
                                                <li><div data-len="4" data-leftmin="0" data-top="2" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 -40px;"></div></li>
                                                <li><div data-len="4" data-leftmin="5" data-top="1" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.grayColor})" style="background-position: -131px -20px;"></div></li>
                                                <li><div data-len="5" data-leftmin="0" data-top="3" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 -60px;"></div></li>
                                                <li><div data-len="5" data-leftmin="5" data-top="2" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.grayColor})" style="background-position: -131px -40px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.rimless})" style="background-position: 0 -80px;"></div></li>
                                                <li><div data-len="3" data-leftmin="5" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.bordered})" style="background-position: -131px -80px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="5" title="${conditionformat_Text.threeSigns}" style="background-position: 0 -100px;"></div></li>
                                                <li><div data-len="4" data-leftmin="5" data-top="5" title="${conditionformat_Text.fourColorTrafficLight}" style="background-position: -131px -100px;"></div></li>
                                                <li><div data-len="4" data-leftmin="0" data-top="6" title="${conditionformat_Text.greenRedBlackGradient}" style="background-position: 0 -120px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.circled})" style="background-position: 0 -140px;"></div></li>
                                                <li><div data-len="3" data-leftmin="5" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.noCircle})" style="background-position: -131px -140px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="8" title="${conditionformat_Text.tricolorFlag}" style="background-position: 0 -160px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="9" title="${conditionformat_Text.threeStars}" style="background-position: 0 -180px;"></div></li>
                                                <li><div data-len="5" data-leftmin="0" data-top="10" title="${conditionformat_Text.fiveQuadrantDiagram}" style="background-position: 0 -200px;"></div></li>
                                                <li><div data-len="5" data-leftmin="0" data-top="11" title="${conditionformat_Text.fiveBoxes}" style="background-position: 0 -220px;"></div></li>
                                                <li><div data-len="4" data-leftmin="5" data-top="9" title="${conditionformat_Text.grade4}" style="background-position: -131px -180px;"></div></li>
                                                <li><div data-len="5" data-leftmin="5" data-top="10" title="${conditionformat_Text.grade5}" style="background-position: -131px -200px;"></div></li>
                                            </ul>
                                        </div>
                                    </div>`;
        break;
      case 1:
        //只为包含以下内容的单元格设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem2_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="number">${conditionformat_Text.cellValue}</option>
                                            <option value="text">${conditionformat_Text.specificText}</option>
                                            <option value="date">${conditionformat_Text.occurrence}</option>
                                        </select>
                                        <div>
                                            <div class="type1Box numberBox">
                                                <select id="type2">
                                                    <option value="greaterThan">${conditionformat_Text.greaterThan}</option>
                                                    <option value="lessThan">${conditionformat_Text.lessThan}</option>
                                                    <option value="betweenness">${conditionformat_Text.between}</option>
                                                    <option value="equal">${conditionformat_Text.equal}</option>
                                                </select>
                                                <div class="inpbox range" id="conditionVal">
                                                    <input class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectCell}"></i>
                                                </div>
                                                <span class="txt" style="display: none;">${conditionformat_Text.in}</span>
                                                <div class="inpbox range" id="conditionVal2" style="display: none;">
                                                    <input class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectDataRange}"></i>
                                                </div>
                                            </div>
                                            <div class="type1Box textBox" style="display: none;">
                                                <select id="type2">
                                                    <option value="">${conditionformat_Text.contain}</option>
                                                </select>
                                                <div class="inpbox range" id="conditionVal">
                                                    <input class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectCell}"></i>
                                                </div>
                                            </div>
                                            <div class="type1Box dateBox" style="display: none;">
                                                <div style="width: 162px;" class="inpbox">
                                                    <input style="width: 150px;" id="daterange-btn" readonly="readonly" placeholder="${conditionformat_Text.pleaseSelectADate}"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}: </div>${textCellColorHtml}`;
        break;
      case 2:
        //仅对排名靠前或靠后的数值设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem3_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="top">${conditionformat_Text.top}</option>
                                            <option value="last">${conditionformat_Text.last}</option>
                                        </select>
                                        <div class="inpbox" id="conditionVal">
                                            <input class="formulaInputFocus" type="number" value="10"/>
                                        </div>
                                        <input id="isPercent" type="checkbox"/>
                                        <label for="isPercent" class="txt">${conditionformat_Text.selectRange_percent}</label>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}：</div>${textCellColorHtml}`;
        break;
      case 3:
        //仅对高于或低于平均值的数值设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem4_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="AboveAverage">${conditionformat_Text.above}</option>
                                            <option value="SubAverage">${conditionformat_Text.below}</option>
                                        </select>
                                        <span class="txt">${conditionformat_Text.selectRange_average}</span>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}：</div>${textCellColorHtml}`;
        break;
      case 4:
        //仅对唯一值或重复值设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.all}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="0">${conditionformat_Text.duplicateValue}</option>
                                            <option value="1">${conditionformat_Text.uniqueValue}</option>
                                        </select>
                                        <span class="txt">${conditionformat_Text.selectRange_value}</span>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}：</div>${textCellColorHtml}`;
        break;
      case 5:
        //使用公式确定要设置格式的单元格
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem2_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <div class="inpbox range" id="formulaConditionVal" style="width: 250px;">
                                            <input class="formulaInputFocus" style="width: 200px;"/>
                                            <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectCell}"></i>
                                        </div>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}: </div>${textCellColorHtml}`;
        break;
    }
    return ruleExplainHtml;
  },
  colorSelectInit: function () {
    document.querySelectorAll(".luckysheet-conditionformat-config-color").forEach(function(el) {
      createColorPicker(el, {
        palette: STANDARD_PALETTE,
        format: 'hex'
      });
    });
  },
  daterangeInit: function (id) {
    const conditionformat_Text = locale().conditionformat;
    const regexSingleDate = /^\d{4}-\d{2}-\d{2}$/; // 匹配  "YYYY-MM-DD"
    const regexStartEndDate = /^\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}$/; // 匹配 "YYYY-MM-DD to YYYY-MM-DD"
    // const regexStartEndDate = /^(\d{4}-\d{2}-\d{2})( to (\d{4}-\d{2}-\d{2}))?$/; // 

    //日期选择插件
    let _rangesUl = document.querySelector('.ranges_1 ul');
    if (_rangesUl) _rangesUl.remove();
    const daterangeBtn = document.getElementById(id)?.querySelector("#daterange-btn");
    daterangeBtn.flatpickr({
      mode: "range",
      onChange: (data, label) => {
        const [start, end] = data;
        //label:通过它来知道用户选择的是什么，传给后台进行相应的展示
        let format1 = [conditionformat_Text.yesterday, conditionformat_Text.today];
        let format2 = [conditionformat_Text.lastWeek, conditionformat_Text.thisWeek, conditionformat_Text.lastMonth, conditionformat_Text.thisMonth, conditionformat_Text.lastYear, conditionformat_Text.thisYear, conditionformat_Text.last7days, conditionformat_Text.last30days];
        if (label == conditionformat_Text.all) {
          daterangeBtn.value = '';
        } else if (format1.indexOf(label) > -1) {
          daterangeBtn.value = dayjs(start).format('YYYY/MM/DD');
        } else if (format2.indexOf(label) > -1) {
          daterangeBtn.value = dayjs(start).format('YYYY/MM/DD') + '-' + dayjs(end).format('YYYY/MM/DD');
        }

        // 匹配  "2023-05-17 to 2023-05-19"
        const isValidSingleFormat = regexSingleDate.test(label);
        const isValidStartEndFormat = regexStartEndDate.test(label);
        if (isValidSingleFormat) {
          daterangeBtn.value = dayjs(start).format('YYYY/MM/DD');
        } else if (isValidStartEndFormat) {
          daterangeBtn.value = dayjs(start).format('YYYY/MM/DD') + '-' + dayjs(end).format('YYYY/MM/DD');
        }
      }
    });
  }
};
export default dialogModule;