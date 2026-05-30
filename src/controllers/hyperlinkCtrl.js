import { onNS, offNS } from '../utils/migrationHelpers.js';
import { replaceHtml } from '../utils/util';
import { showModalMask, hideModalMask, getScrollPosition } from '../utils/domUtils.js';
import { getcellvalue } from '../global/getdata';
import { luckysheetrefreshgrid } from '../global/refresh';
import { rowLocation, colLocation, mouseposition } from '../global/location';
import formula from '../global/formula';
import tooltip from '../global/tooltip';
import editor from '../global/editor';
import { modelHTML } from './constant';
import { selectHightlightShow } from './select';
import sheetmanage from './sheetmanage';
import luckysheetFreezen from './freezen';
import menuButton from './menuButton';
import locale from '../locale/locale';
import Store from '../store';
import { getLastSelection, getFileBySheetIndex } from '../utils/storeAccess.js';
import scrollBarX from '../ui/scrollBarX.js';
import scrollBarY from '../ui/scrollBarY.js';
import cellMain from '../ui/cellMain.js';

const hyperlinkCtrl = {
    item: {
        linkType: 'external', //链接类型 external外部链接，internal内部链接
        linkAddress: '',  //链接地址 网页地址或工作表单元格引用
        linkTooltip: '',  //提示
    },
    hyperlink: null,
    createDialog: function(){
        let _this = this;

        const _locale = locale();
        const hyperlinkText = _locale.insertLink;
        const toolbarText = _locale.toolbar;
        const buttonText = _locale.button;

        showModalMask();
        let _elLinkDialog = document.getElementById("luckysheet-insertLink-dialog");
        if (_elLinkDialog) _elLinkDialog.remove();

        let sheetListOption = '';
        Store.luckysheetfile.forEach(item => {
            sheetListOption += `<option value="${item.name}">${item.name}</option>`;
        })

        let content =  `<div class="box">
                            <div class="box-item">
                                <label for="luckysheet-insertLink-dialog-linkText">${hyperlinkText.linkText}：</label>
                                <input type="text" id="luckysheet-insertLink-dialog-linkText"/>
                            </div>
                            <div class="box-item">
                                <label for="luckysheet-insertLink-dialog-linkType">${hyperlinkText.linkType}：</label>
                                <select id="luckysheet-insertLink-dialog-linkType">
                                    <option value="external">${hyperlinkText.external}</option>
                                    <option value="internal">${hyperlinkText.internal}</option>
                                </select>
                            </div>
                            <div class="show-box show-box-external">
                                <div class="box-item">
                                    <label for="luckysheet-insertLink-dialog-linkAddress">${hyperlinkText.linkAddress}：</label>
                                    <input type="text" id="luckysheet-insertLink-dialog-linkAddress" placeholder="${hyperlinkText.placeholder1}" />
                                </div>
                            </div>
                            <div class="show-box show-box-internal">
                                <div class="box-item">
                                    <label for="luckysheet-insertLink-dialog-linkSheet">${hyperlinkText.linkSheet}：</label>
                                    <select id="luckysheet-insertLink-dialog-linkSheet">
                                        ${sheetListOption}
                                    </select>
                                </div>
                                <div class="box-item">
                                    <label for="luckysheet-insertLink-dialog-linkCell">${hyperlinkText.linkCell}：</label>
                                    <input type="text" id="luckysheet-insertLink-dialog-linkCell" value="A1" placeholder="${hyperlinkText.placeholder2}" />
                                </div>
                            </div>
                            <div class="box-item">
                                <label for="luckysheet-insertLink-dialog-linkTooltip">${hyperlinkText.linkTooltip}：</label>
                                <input type="text" id="luckysheet-insertLink-dialog-linkTooltip" placeholder="${hyperlinkText.placeholder3}" />
                            </div>
                        </div>`;

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
            "id": "luckysheet-insertLink-dialog", 
            "addclass": "luckysheet-insertLink-dialog", 
            "title": toolbarText.insertLink, 
            "content": content, 
            "botton":  `<button id="luckysheet-insertLink-dialog-confirm" class="btn btn-primary">${buttonText.confirm}</button>
                        <button class="btn btn-default luckysheet-model-close-btn">${buttonText.cancel}</button>`, 
            "style": "z-index:100003" 
        }));
        let _elInsertLinkDialog = document.getElementById("luckysheet-insertLink-dialog");
        let _elDialogContent = _elInsertLinkDialog?.querySelector(".luckysheet-modal-dialog-content");
        if (_elDialogContent) _elDialogContent.style.minWidth = "350px";
        let myh = _elInsertLinkDialog?.offsetHeight,
            myw = _elInsertLinkDialog?.offsetWidth;
        let winw = document.documentElement.clientWidth,
            winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, 
            scrollTop = document.documentElement.scrollTop;
        if (_elInsertLinkDialog) Object.assign(_elInsertLinkDialog.style, {
            "left": ((winw + scrollLeft - myw) / 2) + "px",
            "top": ((winh + scrollTop - myh) / 3) + "px"
        });
        if (_elInsertLinkDialog) _elInsertLinkDialog.style.display = 'block';

        _this.dataAllocation();
    },
    init: function (){
        let _this = this;

        const _locale = locale();
        const hyperlinkText = _locale.insertLink;

        //链接类型
        offNS("linkType");
        onNS(document, "change.linkType", "#luckysheet-insertLink-dialog-linkType", function(e){
            let value = this.value;

            document.querySelectorAll("#luckysheet-insertLink-dialog .show-box").forEach(el => el.style.display = 'none');
            const _elShowBox = document.querySelector("#luckysheet-insertLink-dialog .show-box-" + value); if (_elShowBox) _elShowBox.style.display = 'block';
        })

        //确认按钮
        offNS("confirm");
        onNS(document, "click.confirm", "#luckysheet-insertLink-dialog-confirm", function(e){
            let last = getLastSelection();
            let rowIndex = last.row_focus || last.row[0];
            let colIndex = last.column_focus || last.column[0];

            //文本
            let linkText = document.getElementById("luckysheet-insertLink-dialog-linkText")?.value;

            let linkType = document.getElementById("luckysheet-insertLink-dialog-linkType")?.value;
            let linkAddress = document.getElementById("luckysheet-insertLink-dialog-linkAddress")?.value;
            let linkSheet = document.getElementById("luckysheet-insertLink-dialog-linkSheet")?.value;
            let linkCell = document.getElementById("luckysheet-insertLink-dialog-linkCell")?.value;
            let linkTooltip = document.getElementById("luckysheet-insertLink-dialog-linkTooltip")?.value;

            if(linkType == 'external'){
                if(!/^http[s]?:\/\//.test(linkAddress)){
                    linkAddress = 'https://' + linkAddress;
                }

                if(!/^http[s]?:\/\/([\w\-\.]+)+[\w-]*([\w\-\.\/\?%&=]+)?$/ig.test(linkAddress)){
                    tooltip.info('<i class="fa fa-exclamation-triangle"></i>', hyperlinkText.tooltipInfo1);
                    return;
                }
            }
            else{
                if(!formula.iscelldata(linkCell)){
                    tooltip.info('<i class="fa fa-exclamation-triangle"></i>', hyperlinkText.tooltipInfo2);
                    return;
                }

                linkAddress = linkSheet + "!" + linkCell;
            }

            if(linkText == null || linkText.replace(/\s/g, '') == ''){
                linkText = linkAddress;
            }

            let item = {
                linkType: linkType,
                linkAddress: linkAddress,
                linkTooltip: linkTooltip,
            }

            let historyHyperlink = structuredClone(_this.hyperlink);
            let currentHyperlink = structuredClone(_this.hyperlink);

            currentHyperlink[rowIndex + "_" + colIndex] = item;

            let d = editor.deepCopyFlowData(Store.flowdata);
            let cell = d[rowIndex][colIndex];

            if(cell == null){
                cell = {};
            }

            cell.fc = 'rgb(0, 0, 255)';
            cell.un = 1;
            cell.v = cell.m = linkText;

            d[rowIndex][colIndex] = cell;

            _this.ref(
                historyHyperlink, 
                currentHyperlink, 
                Store.currentSheetIndex, 
                d, 
                [{ row: [rowIndex, rowIndex], column: [colIndex, colIndex] }]
            );

            hideModalMask();
            const _elLinkDialog = document.getElementById("luckysheet-insertLink-dialog"); if (_elLinkDialog) _elLinkDialog.style.display = 'none';
        })
    },
    dataAllocation: function(){
        let _this = this;

        let last = getLastSelection();
        let rowIndex = last.row_focus || last.row[0];
        let colIndex = last.column_focus || last.column[0];

        let hyperlink = _this.hyperlink || {};
        let item = hyperlink[rowIndex + "_" + colIndex] || {};

        //文本
        let text = getcellvalue(rowIndex, colIndex, null, 'm');
        const _elLinkText = document.getElementById("luckysheet-insertLink-dialog-linkText"); if (_elLinkText) _elLinkText.value = text;

        let linkType = item.linkType || 'external';
        const _elLinkType = document.getElementById("luckysheet-insertLink-dialog-linkType"); if (_elLinkType) _elLinkType.value = linkType;

        document.querySelectorAll("#luckysheet-insertLink-dialog .show-box").forEach(el => el.style.display = 'none');
        const _elShowBox2 = document.querySelector("#luckysheet-insertLink-dialog .show-box-" + linkType); if (_elShowBox2) _elShowBox2.style.display = 'block';

        //链接地址
        let linkAddress = item.linkAddress || '';

        if(linkType == 'external'){
            const _elAddr = document.getElementById("luckysheet-insertLink-dialog-linkAddress"); if (_elAddr) _elAddr.value = linkAddress;
        }
        else{
            if(formula.iscelldata(linkAddress)){
                let sheettxt = linkAddress.split("!")[0];
                let rangetxt = linkAddress.split("!")[1];

                const _elSheet = document.getElementById("luckysheet-insertLink-dialog-linkSheet"); if (_elSheet) _elSheet.value = sheettxt;
                const _elCell = document.getElementById("luckysheet-insertLink-dialog-linkCell"); if (_elCell) _elCell.value = rangetxt;
            }
        }

        let linkTooltip = item.linkTooltip || '';
        const _elTooltip = document.getElementById("luckysheet-insertLink-dialog-linkTooltip"); if (_elTooltip) _elTooltip.value = linkTooltip;
    },
    cellFocus: function(r, c){
        let _this = this;

        if(_this.hyperlink == null || _this.hyperlink[r + '_' + c] == null){
            return;
        }

        let item = _this.hyperlink[r + '_' + c];

        if(item.linkType == 'external'){
            window.open(item.linkAddress);
        }
        else{
            let cellrange = formula.getcellrange(item.linkAddress);
            let sheetIndex = cellrange.sheetIndex;
            let range = [{
                row: cellrange.row,
                column: cellrange.column
            }];

            if(sheetIndex != Store.currentSheetIndex){
                document.querySelectorAll("#luckysheet-sheet-area div.luckysheet-sheets-item").forEach(function(el) {
                    el.classList.remove("luckysheet-sheets-item-active");
                });
                let _elSheetItem = document.getElementById("luckysheet-sheets-item" + sheetIndex);
                if (_elSheetItem) _elSheetItem.classList.add("luckysheet-sheets-item-active");

                sheetmanage.changeSheet(sheetIndex);
            }

            Store.luckysheet_select_save = range;
            selectHightlightShow(true);

            let row_pre = cellrange.row[0] - 1 == -1 ? 0 : Store.visibledatarow[cellrange.row[0] - 1];
            let col_pre = cellrange.column[0] - 1 == -1 ? 0 : Store.visibledatacolumn[cellrange.column[0] - 1];

            scrollBarX.setScrollLeft(col_pre);
            scrollBarY.setScrollTop(row_pre);
        }
    },
    overshow: function(event){
        let _this = this;

        let _elOvershow = document.getElementById("luckysheet-hyperlink-overshow");
        if (_elOvershow) _elOvershow.remove();

        if(!cellMain.el.contains(event.target)){
            return;
        }

        let mouse = mouseposition(event.pageX, event.pageY);
        let scroll = getScrollPosition();
        let scrollLeft = scroll.scrollLeft;
        let scrollTop = scroll.scrollTop;
        let x = mouse[0] + scrollLeft;
        let y = mouse[1] + scrollTop;

        if(luckysheetFreezen.freezenverticaldata != null && mouse[0] < (luckysheetFreezen.freezenverticaldata[0] - luckysheetFreezen.freezenverticaldata[2])){
            return;
        }

        if(luckysheetFreezen.freezenhorizontaldata != null && mouse[1] < (luckysheetFreezen.freezenhorizontaldata[0] - luckysheetFreezen.freezenhorizontaldata[2])){
            return;
        }

        let row_index = rowLocation(y)[2];
        let col_index = colLocation(x)[2];

        let margeset = menuButton.mergeborer(Store.flowdata, row_index, col_index);
        if(margeset){
            row_index = margeset.row[2];
            col_index = margeset.column[2];
        }

        if(_this.hyperlink == null || _this.hyperlink[row_index + "_" + col_index] == null){
            return;
        }

        let item = _this.hyperlink[row_index + "_" + col_index];
        let linkTooltip = item.linkTooltip;

        if(linkTooltip == null || linkTooltip.replace(/\s/g, '') == ''){
            linkTooltip = item.linkAddress;
        }

        let row = Store.visibledatarow[row_index], 
            row_pre = row_index - 1 == -1 ? 0 : Store.visibledatarow[row_index - 1];
        let col = Store.visibledatacolumn[col_index], 
            col_pre = col_index - 1 == -1 ? 0 : Store.visibledatacolumn[col_index - 1];

        if(margeset){
            row = margeset.row[1];
            row_pre = margeset.row[0];
            
            col = margeset.column[1];
            col_pre = margeset.column[0];
        }

        let html = `<div id="luckysheet-hyperlink-overshow" style="background:#fff;padding:5px 10px;border:1px solid #000;box-shadow:2px 2px #999;position:absolute;left:${col_pre}px;top:${row + 5}px;z-index:100;">
                        <div>${linkTooltip}</div>
                        <div>单击鼠标可以追踪</div>
                    </div>`;

        cellMain.append(html);
    },
    ref: function(historyHyperlink, currentHyperlink, sheetIndex, d, range){
        let _this = this;

        if (Store.clearjfundo) {
            Store.jfundo.length  = 0;

            let redo = {};
            redo["type"] = "updateHyperlink";
            redo["sheetIndex"] = sheetIndex;
            redo["historyHyperlink"] = historyHyperlink;
            redo["currentHyperlink"] = currentHyperlink;
            redo["data"] = Store.flowdata; 
            redo["curData"] = d;
            redo["range"] = range; 
            Store.jfredo.push(redo); 
        }

        _this.hyperlink = currentHyperlink;
        getFileBySheetIndex(sheetIndex).hyperlink = currentHyperlink;

        Store.flowdata = d;
        editor.webWorkerFlowDataCache(Store.flowdata);//worker存数据
        getFileBySheetIndex(sheetIndex).data = Store.flowdata;

        setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1);
    }
}

export default hyperlinkCtrl;
