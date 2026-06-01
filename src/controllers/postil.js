﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { rowLocation, colLocation, mouseposition } from '../global/location';
import editor from '../global/editor';
import { luckysheetRangeLast } from '../global/cursorPos';
import { luckysheetrefreshgrid } from '../global/refresh';
import { setluckysheet_scroll_status } from '../methods/set';
import { syncDataToStore } from '../utils/storeAccess.js';
import { getObjType } from '../utils/util';
import { getScrollPosition } from '../utils/domUtils.js';
import luckysheetFreezen from './freezen';
import menuButton from './menuButton';
import Store from '../store';
import cellMain from '../ui/cellMain.js';
import method from '../global/method';

//批注
const luckysheetPostil = {
    defaultWidth: 144,
    defaultHeight: 84,
    currentObj: null,
    currentWinW: null,
    currentWinH: null,
    resize: null,
    resizeXY: null,
    move: false,
    moveXY: null,
    init: function(){
        let _this = this;

        //点击批注框 聚焦
        document.getElementById("luckysheet-postil-showBoxs")?.addEventListener("mousedown", function(event){
            let _target = event.target.closest(".luckysheet-postil-show");
            if (!_target) return;
            _this.currentObj = _target.querySelector(".luckysheet-postil-show-main");

            if(_target.classList.contains("luckysheet-postil-show-active")){
                event.stopPropagation();
                return;
            }

            _this.removeActivePs();

            _target.classList.add("luckysheet-postil-show-active");
            const _resizeEl1 = _target.querySelector(".luckysheet-postil-dialog-resize"); if (_resizeEl1) _resizeEl1.style.display = 'block';
            const _arrowEl1 = _target.querySelector(".arrowCanvas"); if (_arrowEl1) _arrowEl1.style.zIndex = 200;
            const _mainEl1 = _target.querySelector(".luckysheet-postil-show-main"); if (_mainEl1) _mainEl1.style.zIndex = 200;

            event.stopPropagation();
        });
        document.getElementById("luckysheet-postil-showBoxs").addEventListener("mouseup", function(event){
            let _target = event.target.closest(".luckysheet-postil-show");
            if (!_target) return;
            if(event.which == "3"){
                event.stopPropagation();
            }
        });

        //批注框 改变大小
        document.getElementById("luckysheet-postil-showBoxs").addEventListener("mousedown", function(event){
            let _target = event.target.closest(".luckysheet-postil-show .luckysheet-postil-dialog-resize .luckysheet-postil-dialog-resize-item");
            if (!_target) return;
            _this.currentObj = _target.closest(".luckysheet-postil-show-main");
            _this.currentWinW = cellMain.getScrollWidth();
            _this.currentWinH = cellMain.getScrollHeight();

            _this.resize = _target.dataset.type;

            let scroll = getScrollPosition();
            let mouse = mouseposition(event.pageX, event.pageY);
            let x = mouse[0] + scroll.scrollLeft;
            let y = mouse[1] + scroll.scrollTop;

            let position = {top: _this.currentObj.offsetTop, left: _this.currentObj.offsetLeft};
            let width = _this.currentObj.offsetWidth;
            let height = _this.currentObj.offsetHeight;

            _this.resizeXY = [
                x,
                y,
                width,
                height,
                position.left + scroll.scrollLeft,
                position.top + scroll.scrollTop,
                scroll.scrollLeft,
                scroll.scrollTop
            ];

            setluckysheet_scroll_status(true);

            if(_target.closest(".luckysheet-postil-show")?.classList.contains("luckysheet-postil-show-active")){
                event.stopPropagation();
                return;
            }

            _this.removeActivePs();

            const _psShow1 = _target.closest(".luckysheet-postil-show");
            _psShow1?.classList.add("luckysheet-postil-show-active");
            if (_psShow1) {
                const _resize1 = _psShow1.querySelector(".luckysheet-postil-dialog-resize"); if (_resize1) _resize1.style.display = 'block';
                const _arrow1 = _psShow1.querySelector(".arrowCanvas"); if (_arrow1) _arrow1.style.zIndex = 200;
                const _main1 = _psShow1.querySelector(".luckysheet-postil-show-main"); if (_main1) _main1.style.zIndex = 200;
            }

            event.stopPropagation();
        });

        //批注框 移动
        document.getElementById("luckysheet-postil-showBoxs")?.addEventListener("mousedown", function(event){
            let _target = event.target.closest(".luckysheet-postil-show .luckysheet-postil-dialog-move .luckysheet-postil-dialog-move-item");
            if (!_target) return;
            _this.currentObj = _target.closest(".luckysheet-postil-show-main");
            _this.currentWinW = cellMain.getScrollWidth();
            _this.currentWinH = cellMain.getScrollHeight();

            _this.move = true;

            let scroll = getScrollPosition();

            let offset = _this.currentObj.getBoundingClientRect();
            let position = {top: _this.currentObj.offsetTop, left: _this.currentObj.offsetLeft};

            _this.moveXY = [
                event.pageX - offset.left,
                event.pageY - offset.top,
                position.left,
                position.top,
                scroll.scrollLeft,
                scroll.scrollTop
            ];

            setluckysheet_scroll_status(true);

            if(_target.closest(".luckysheet-postil-show")?.classList.contains("luckysheet-postil-show-active")){
                event.stopPropagation();
                return;
            }

            _this.removeActivePs();

            const _psShow2 = _target.closest(".luckysheet-postil-show");
            _psShow2?.classList.add("luckysheet-postil-show-active");
            if (_psShow2) {
                const _resize2 = _psShow2.querySelector(".luckysheet-postil-dialog-resize"); if (_resize2) _resize2.style.display = 'block';
                const _arrow2 = _psShow2.querySelector(".arrowCanvas"); if (_arrow2) _arrow2.style.zIndex = 200;
                const _main2 = _psShow2.querySelector(".luckysheet-postil-show-main"); if (_main2) _main2.style.zIndex = 200;
            }

            event.stopPropagation();
        });
    },
    overshow: function(event){
        let _this = this;

        document.getElementById("luckysheet-postil-overshow")?.remove();

        if(!cellMain.el || !cellMain.el.contains(event.target)){
            return;
        }

        let mouse = mouseposition(event.pageX, event.pageY);
        let scroll = getScrollPosition();
        let x = mouse[0];
        let y = mouse[1];
        let offsetX = 0;
        let offsetY = 0;

        if(luckysheetFreezen.freezenverticaldata != null && mouse[0] < (luckysheetFreezen.freezenverticaldata[0] - luckysheetFreezen.freezenverticaldata[2])){
            offsetX = scroll.scrollLeft;
        } else {
            x += scroll.scrollLeft;
        }

        if(luckysheetFreezen.freezenhorizontaldata != null && mouse[1] < (luckysheetFreezen.freezenhorizontaldata[0] - luckysheetFreezen.freezenhorizontaldata[2])){
            offsetY = scroll.scrollTop;
        } else {
            y += scroll.scrollTop;
        }

        let row_index = rowLocation(y)[2];
        let col_index = colLocation(x)[2];

        let margeset = menuButton.mergeborer(Store.sheetData, row_index, col_index);
        if(margeset){
            row_index = margeset.row[2];
            col_index = margeset.column[2];
        }

        if(Store.sheetData[row_index] == null || Store.sheetData[row_index][col_index] == null || Store.sheetData[row_index][col_index].ps == null){
            return;
        }

        let postil = Store.sheetData[row_index][col_index].ps;

        if(postil["isshow"] || document.querySelector("#luckysheet-postil-show_"+ row_index +"_"+ col_index) !== null){
            return;
        }

        let value = postil["value"] == null ? "" : postil["value"];

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

        let toX = col + offsetX;
        let toY = row_pre + offsetY;

        let fromX = toX + 18 * Store.zoomRatio;
        let fromY = toY - 18 * Store.zoomRatio;

        if(fromY < 0){
            fromY = 2;
        }

        let width = postil["width"] == null ? _this.defaultWidth * Store.zoomRatio : postil["width"] * Store.zoomRatio;
        let height = postil["height"] == null ? _this.defaultHeight * Store.zoomRatio : postil["height"] * Store.zoomRatio;

        let size = _this.getArrowCanvasSize(fromX, fromY, toX, toY);

        let commentDivs = '';
        let valueLines = value.split('\n');
        for (let line of valueLines) {
            commentDivs += '<div>' + _this.htmlEscape(line) + '</div>';
        }

        let html =  '<div id="luckysheet-postil-overshow">' +
                        '<canvas class="arrowCanvas" width="'+ size[2] +'" height="'+ size[3] +'" style="position:absolute;left:'+ size[0] +'px;top:'+ size[1] +'px;z-index:100;pointer-events:none;"></canvas>' +
                        '<div style="width:'+ (width - 12) +'px;min-height:'+ (height - 12) +'px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:'+ fromX +'px;top:'+ fromY +'px;z-index:100;">'+ commentDivs +'</div>' +
                    '</div>';

        cellMain.append(html);

        let ctx = document.querySelector("#luckysheet-postil-overshow .arrowCanvas")?.getContext("2d");

        if (ctx) _this.drawArrow(ctx, size[4], size[5], size[6], size[7]);
    },
    getArrowCanvasSize: function(fromX, fromY, toX, toY){
        let left = toX - 5;
        
        if(fromX < toX){
            left = fromX - 5;
        }

        let top = toY - 5;
        
        if(fromY < toY){
            top = fromY - 5;
        }

        let width = Math.abs(fromX - toX) + 10;
        let height = Math.abs(fromY - toY) + 10;

        let x1 = width - 5;
        let x2 = 5;
        
        if(fromX < toX){
            x1 = 5;
            x2 = width - 5;
        }

        let y1 = height - 5;
        let y2 = 5;

        if(fromY < toY){
            y1 = 5;
            y2 = height - 5;
        }

        return [left, top, width, height, x1, y1, x2, y2];
    },
    drawArrow: function(ctx, fromX, fromY, toX, toY, theta, headlen, width, color){
        theta = getObjType(theta) == "undefined" ? 30 : theta;
        headlen = getObjType(headlen) == "undefined" ? 6 : headlen;
        width = getObjType(width) == "undefined" ? 1 : width;
        color = getObjType(color) == "undefined" ? "#000" : color;

        // 计算各角度和对应的P2,P3坐标
        let angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI, 
            angle1 = (angle + theta) * Math.PI / 180, 
            angle2 = (angle - theta) * Math.PI / 180, 
            topX = headlen * Math.cos(angle1), 
            topY = headlen * Math.sin(angle1), 
            botX = headlen * Math.cos(angle2), 
            botY = headlen * Math.sin(angle2);

        ctx.save();
        ctx.beginPath();

        let arrowX = fromX - topX,
            arrowY = fromY - topY;

        ctx.moveTo(arrowX, arrowY); 
        ctx.moveTo(fromX, fromY); 
        ctx.lineTo(toX, toY); 
        
        ctx.lineWidth = width;
        ctx.strokeStyle = color; 
        ctx.stroke();

        arrowX = toX + topX; 
        arrowY = toY + topY; 
        ctx.moveTo(arrowX, arrowY); 
        ctx.lineTo(toX, toY); 
        arrowX = toX + botX; 
        arrowY = toY + botY; 
        ctx.lineTo(arrowX, arrowY); 
        
        ctx.fillStyle = color;
        ctx.fill(); 
        ctx.restore();
    },
    buildAllPs: function(data){
        let _this = this;

        const _el = cellMain.find("#luckysheet-postil-showBoxs"); if (_el) _el.innerHTML = '';

        for(let r = 0; r < data.length; r++){
            for(let c = 0; c < data[0].length; c++){
                if(data[r][c] != null && data[r][c].ps != null){
                    let postil = data[r][c].ps;
                    _this.buildPs(r, c, postil);
                }
            }
        }

        _this.init();
    },
    buildPs: function(r, c, postil){
        document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c)?.remove();

        if(postil == null){
            return;
        }

        let _this = this;
        let isshow = postil["isshow"] == null ? false : postil["isshow"];

        if(isshow){
            let row = Store.visibledatarow[r], 
                row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
            let col = Store.visibledatacolumn[c], 
                col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];

            let margeset = menuButton.mergeborer(Store.sheetData, r, c);
            if(margeset){
                row = margeset.row[1];
                row_pre = margeset.row[0];
                
                col = margeset.column[1];
                col_pre = margeset.column[0];
            }

            let toX = col;
            let toY = row_pre;

            let left = postil["left"] == null ? toX + 18 * Store.zoomRatio : postil["left"] * Store.zoomRatio;
            let top = postil["top"] == null ? toY - 18 * Store.zoomRatio : postil["top"] * Store.zoomRatio;
            let width = postil["width"] == null ? _this.defaultWidth * Store.zoomRatio : postil["width"] * Store.zoomRatio;
            let height = postil["height"] == null ? _this.defaultHeight * Store.zoomRatio : postil["height"] * Store.zoomRatio;
            let value = postil["value"] == null ? "" : postil["value"];

            if(top < 0){
                top = 2;
            }

            let size = _this.getArrowCanvasSize(left, top, toX, toY);

            let commentDivs = '';
            let valueLines = value.split('\n');
            for (let line of valueLines) {
                commentDivs += '<div>' + _this.htmlEscape(line) + '</div>';
            }

            let html =  '<div id="luckysheet-postil-show_'+ r +'_'+ c +'" class="luckysheet-postil-show">' +
                            '<canvas class="arrowCanvas" width="'+ size[2] +'" height="'+ size[3] +'" style="position:absolute;left:'+ size[0] +'px;top:'+ size[1] +'px;z-index:100;pointer-events:none;"></canvas>' +
                            '<div class="luckysheet-postil-show-main" style="width:'+ width +'px;height:'+ height +'px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:'+ left +'px;top:'+ top +'px;box-sizing:border-box;z-index:100;">' +
                                '<div class="luckysheet-postil-dialog-move">' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-t" data-type="t"></div>' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-r" data-type="r"></div>' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-b" data-type="b"></div>' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-l" data-type="l"></div>' +
                                '</div>' +
                                '<div class="luckysheet-postil-dialog-resize" style="display:none;">' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lt" data-type="lt"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-mt" data-type="mt"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lm" data-type="lm"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rm" data-type="rm"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rt" data-type="rt"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lb" data-type="lb"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-mb" data-type="mb"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rb" data-type="rb"></div>' +
                                '</div>' +
                                '<div style="width:100%;height:100%;overflow:hidden;">' + 
                                    '<div class="formulaInputFocus" style="width:'+ (width - 12) +'px;height:'+ (height - 12) +'px;line-height:20px;box-sizing:border-box;text-align: center;;word-break:break-all;" spellcheck="false" contenteditable="true">' +
                                        commentDivs +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';

            cellMain.find("#luckysheet-postil-showBoxs")?.insertAdjacentHTML('beforeend', html);

            let ctx = document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c +" .arrowCanvas")?.getContext("2d");

            if (ctx) _this.drawArrow(ctx, size[4], size[5], size[6], size[7]);
        }
    },
    newPs: function(r, c){
        // Hook function
        if(!method.createHookFunction('commentInsertBefore',r,c, )){
            return;
        }

        let _this = this;

        let row = Store.visibledatarow[r], 
            row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c], 
            col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];

        let margeset = menuButton.mergeborer(Store.sheetData, r, c);
        if(margeset){
            row = margeset.row[1];
            row_pre = margeset.row[0];
            
            col = margeset.column[1];
            col_pre = margeset.column[0];
        }

        let toX = col;
        let toY = row_pre;

        let fromX = toX + 18 * Store.zoomRatio;
        let fromY = toY - 18 * Store.zoomRatio;

        if(fromY < 0){
            fromY = 2;
        }

        let width = _this.defaultWidth * Store.zoomRatio;
        let height = _this.defaultHeight * Store.zoomRatio;

        let size = _this.getArrowCanvasSize(fromX, fromY, toX, toY);

        let html =  '<div id="luckysheet-postil-show_'+ r +'_'+ c +'" class="luckysheet-postil-show luckysheet-postil-show-active">' +
                        '<canvas class="arrowCanvas" width="'+ size[2] +'" height="'+ size[3] +'" style="position:absolute;left:'+ size[0] +'px;top:'+ size[1] +'px;z-index:100;pointer-events:none;"></canvas>' +
                        '<div class="luckysheet-postil-show-main" style="width:'+ width +'px;height:'+ height +'px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:'+ fromX +'px;top:'+ fromY +'px;box-sizing:border-box;z-index:100;">' +
                            '<div class="luckysheet-postil-dialog-move">' +
                                '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-t" data-type="t"></div>' +
                                '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-r" data-type="r"></div>' +
                                '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-b" data-type="b"></div>' +
                                '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-l" data-type="l"></div>' +
                            '</div>' +
                            '<div class="luckysheet-postil-dialog-resize">' +
                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lt" data-type="lt"></div>' +
                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-mt" data-type="mt"></div>' +
                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lm" data-type="lm"></div>' +
                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rm" data-type="rm"></div>' +
                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rt" data-type="rt"></div>' +
                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lb" data-type="lb"></div>' +
                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-mb" data-type="mb"></div>' +
                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rb" data-type="rb"></div>' +
                            '</div>' +
                            '<div style="width:100%;height:100%;overflow:hidden;">' + 
                                '<div class="formulaInputFocus" style="width:132px;height:72px;line-height:20px;box-sizing:border-box;text-align: center;word-break:break-all;" spellcheck="false" contenteditable="true">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

        cellMain.find("#luckysheet-postil-showBoxs")?.insertAdjacentHTML('beforeend', html);

        let ctx2 = document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c +" .arrowCanvas")?.getContext("2d");

        if (ctx2) _this.drawArrow(ctx2, size[4], size[5], size[6], size[7]);

        document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c +" .formulaInputFocus")?.focus();

        _this.init();

        let d = editor.deepCopyFlowData(Store.sheetData);
        let rc = [];

        if(d[r][c] == null){
            d[r][c] = {};
        }

        d[r][c].ps = { "left": null, "top": null, "width": null, "height": null, "value": "", "isshow": false };
        rc.push(r + "_" + c);

        _this.ref(d, rc);

        // Hook function
        setTimeout(() => {
            method.createHookFunction('commentInsertAfter',r,c, d[r][c])
        }, 0);
    },
    editPs: function(r, c){
        let _this = this;

        if(document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c) !== null){
            const _elPostil = document.getElementById("luckysheet-postil-show_"+ r +"_"+ c); if (_elPostil) _elPostil.style.display = 'block';
            document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c)?.classList.add("luckysheet-postil-show-active");
            const _resizeEl2 = document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c +" .luckysheet-postil-dialog-resize"); if (_resizeEl2) _resizeEl2.style.display = 'block';
        }
        else{
            let postil = Store.sheetData[r][c].ps;

            let row = Store.visibledatarow[r], 
                row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
            let col = Store.visibledatacolumn[c], 
                col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];

            let margeset = menuButton.mergeborer(Store.sheetData, r, c);
            if(margeset){
                row = margeset.row[1];
                row_pre = margeset.row[0];
                
                col = margeset.column[1];
                col_pre = margeset.column[0];
            }

            let toX = col;
            let toY = row_pre;

            let left = postil["left"] == null ? toX + 18 * Store.zoomRatio : postil["left"] * Store.zoomRatio;
            let top = postil["top"] == null ? toY - 18 * Store.zoomRatio : postil["top"] * Store.zoomRatio;
            let width = postil["width"] == null ? _this.defaultWidth * Store.zoomRatio : postil["width"] * Store.zoomRatio;
            let height = postil["height"] == null ? _this.defaultHeight * Store.zoomRatio : postil["height"] * Store.zoomRatio;
            let value = postil["value"] == null ? "" : postil["value"];

            if(top < 0){
                top = 2;
            }

            let size = _this.getArrowCanvasSize(left, top, toX, toY);

            let commentDivs = '';
            let valueLines = value.split('\n');
            for (let line of valueLines) {
                commentDivs += '<div>' + _this.htmlEscape(line) + '</div>';
            }

            let html =  '<div id="luckysheet-postil-show_'+ r +'_'+ c +'" class="luckysheet-postil-show luckysheet-postil-show-active">' +
                            '<canvas class="arrowCanvas" width="'+ size[2] +'" height="'+ size[3] +'" style="position:absolute;left:'+ size[0] +'px;top:'+ size[1] +'px;z-index:100;pointer-events:none;"></canvas>' +
                            '<div class="luckysheet-postil-show-main" style="width:'+ width +'px;height:'+ height +'px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:'+ left +'px;top:'+ top +'px;box-sizing:border-box;z-index:100;">' +
                                '<div class="luckysheet-postil-dialog-move">' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-t" data-type="t"></div>' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-r" data-type="r"></div>' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-b" data-type="b"></div>' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-l" data-type="l"></div>' +
                                '</div>' +
                                '<div class="luckysheet-postil-dialog-resize">' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lt" data-type="lt"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-mt" data-type="mt"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lm" data-type="lm"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rm" data-type="rm"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rt" data-type="rt"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lb" data-type="lb"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-mb" data-type="mb"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rb" data-type="rb"></div>' +
                                '</div>' +
                                '<div style="width:100%;height:100%;overflow:hidden;">' + 
                                    '<div class="formulaInputFocus" style="width:'+ (width - 12) +'px;height:'+ (height - 12) +'px;line-height:20px;box-sizing:border-box;text-align: center;;word-break:break-all;" spellcheck="false" contenteditable="true">' +
                                        commentDivs +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';

            cellMain.find("#luckysheet-postil-showBoxs")?.insertAdjacentHTML('beforeend', html);

            let ctx3 = document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c +" .arrowCanvas")?.getContext("2d");

            if (ctx3) _this.drawArrow(ctx3, size[4], size[5], size[6], size[7]);
        }

        document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c +" .formulaInputFocus")?.focus();
        const _formulaInput = document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c +" .formulaInputFocus");
        if (_formulaInput) luckysheetRangeLast(_formulaInput);

        _this.init();
    },
    delPs: function(r, c){
        // Hook function
        if(!method.createHookFunction('commentDeleteBefore',r,c,Store.sheetData[r][c])){
            return;
        }

        if(document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c) !== null){
            document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c)?.remove();
        }

        let d = editor.deepCopyFlowData(Store.sheetData);
        let rc = [];

        delete d[r][c].ps;
        rc.push(r + "_" + c);

        this.ref(d, rc);

        // Hook function
        setTimeout(() => {
            method.createHookFunction('commentDeleteAfter',r,c, Store.sheetData[r][c])
        }, 0);
    },
    showHidePs: function(r, c){
        let _this = this;

        let postil = Store.sheetData[r][c].ps;
        let isshow = postil["isshow"];

        let d = editor.deepCopyFlowData(Store.sheetData);
        let rc = [];

        if(isshow){
            d[r][c].ps.isshow = false;

            document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c)?.remove();
        }
        else{
            d[r][c].ps.isshow = true;

            let row = Store.visibledatarow[r], 
                row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
            let col = Store.visibledatacolumn[c], 
                col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];

            let margeset = menuButton.mergeborer(Store.sheetData, r, c);
            if(margeset){
                row = margeset.row[1];
                row_pre = margeset.row[0];
                
                col = margeset.column[1];
                col_pre = margeset.column[0];
            }

            let scroll = getScrollPosition();

            let toX = col;
            let toY = row_pre;

            if(luckysheetFreezen.freezenverticaldata != null && toX < (luckysheetFreezen.freezenverticaldata[0] - luckysheetFreezen.freezenverticaldata[2])){
                toX += scroll.scrollLeft;
            }
            if(luckysheetFreezen.freezenhorizontaldata != null && toY < (luckysheetFreezen.freezenhorizontaldata[0] - luckysheetFreezen.freezenhorizontaldata[2])){
                toY += scroll.scrollTop;
            }

            let left = postil["left"] == null ? toX + 18 * Store.zoomRatio : postil["left"] * Store.zoomRatio;
            let top = postil["top"] == null ? toY - 18 * Store.zoomRatio : postil["top"] * Store.zoomRatio;
            let width = postil["width"] == null ? _this.defaultWidth * Store.zoomRatio : postil["width"] * Store.zoomRatio;
            let height = postil["height"] == null ? _this.defaultHeight * Store.zoomRatio : postil["height"] * Store.zoomRatio;
            let value = postil["value"] == null ? "" : postil["value"];

            if(top < 0){
                top = 2;
            }

            let size = _this.getArrowCanvasSize(left, top, toX, toY);
            let commentDivs = '';
            let valueLines = value.split('\n');
            for (let line of valueLines) {
                commentDivs += '<div>' + _this.htmlEscape(line) + '</div>';
            }
            let html =  '<div id="luckysheet-postil-show_'+ r +'_'+ c +'" class="luckysheet-postil-show">' +
                            '<canvas class="arrowCanvas" width="'+ size[2] +'" height="'+ size[3] +'" style="position:absolute;left:'+ size[0] +'px;top:'+ size[1] +'px;z-index:100;pointer-events:none;"></canvas>' +
                            '<div class="luckysheet-postil-show-main" style="width:'+ width +'px;height:'+ height +'px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:'+ left +'px;top:'+ top +'px;box-sizing:border-box;z-index:100;">' +
                                '<div class="luckysheet-postil-dialog-move">' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-t" data-type="t"></div>' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-r" data-type="r"></div>' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-b" data-type="b"></div>' +
                                    '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-l" data-type="l"></div>' +
                                '</div>' +
                                '<div class="luckysheet-postil-dialog-resize" style="display:none;">' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lt" data-type="lt"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-mt" data-type="mt"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lm" data-type="lm"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rm" data-type="rm"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rt" data-type="rt"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lb" data-type="lb"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-mb" data-type="mb"></div>' +
                                    '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rb" data-type="rb"></div>' +
                                '</div>' +
                                '<div style="width:100%;height:100%;overflow:hidden;">' + 
                                    '<div class="formulaInputFocus" style="width:'+ (width - 12) +'px;height:'+ (height - 12) +'px;line-height:20px;box-sizing:border-box;text-align: center;;word-break:break-all;" spellcheck="false" contenteditable="true">' +
                                        commentDivs +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';

            cellMain.find("#luckysheet-postil-showBoxs")?.insertAdjacentHTML('beforeend', html);

            let ctx4 = document.querySelector("#luckysheet-postil-show_"+ r +"_"+ c +" .arrowCanvas")?.getContext("2d");

            if (ctx4) _this.drawArrow(ctx4, size[4], size[5], size[6], size[7]);

            _this.init();
        }

        rc.push(r + "_" + c);

        _this.ref(d, rc);
    },
    showHideAllPs: function(){
        let _this = this;

        let d = editor.deepCopyFlowData(Store.sheetData);

        let isAllShow = true;
        let allPs = [];

        for(let r = 0; r < d.length; r++){
            for(let c = 0; c < d[0].length; c++){
                if(d[r] != null && d[r][c] != null && d[r][c].ps != null){
                    allPs.push(r + "_" + c);

                    if(!d[r][c].ps.isshow){
                        isAllShow = false;
                    }
                }
            }
        }

        let rc = [];
        if(allPs !== null){
            if(isAllShow){ //全部显示，操作为隐藏所有批注
                const _el = cellMain.find("#luckysheet-postil-showBoxs"); if (_el) _el.innerHTML = '';

                for(let i = 0; i < allPs.length; i++){
                    let rowIndex = allPs[i].split("_")[0];
                    let colIndex = allPs[i].split("_")[1];

                    let postil = d[rowIndex][colIndex].ps;

                    if(postil["isshow"]){
                        d[rowIndex][colIndex].ps.isshow = false;
                        rc.push(allPs[i]);
                    }
                }
            }
            else{ //部分显示或全部隐藏，操作位显示所有批注
                for(let i = 0; i < allPs.length; i++){
                    let rowIndex = allPs[i].split("_")[0];
                    let colIndex = allPs[i].split("_")[1];

                    let postil = d[rowIndex][colIndex].ps;

                    if(!postil["isshow"]){
                        let row = Store.visibledatarow[rowIndex], 
                            row_pre = rowIndex - 1 == -1 ? 0 : Store.visibledatarow[rowIndex - 1];
                        let col = Store.visibledatacolumn[colIndex], 
                            col_pre = colIndex - 1 == -1 ? 0 : Store.visibledatacolumn[colIndex - 1];

                        let margeset = menuButton.mergeborer(Store.sheetData, rowIndex, colIndex);
                        if(margeset){
                            row = margeset.row[1];
                            row_pre = margeset.row[0];
                            
                            col = margeset.column[1];
                            col_pre = margeset.column[0];
                        }

                        let scroll = getScrollPosition();
            
                        let toX = col;
                        let toY = row_pre;
            
                        if(luckysheetFreezen.freezenverticaldata != null && toX < (luckysheetFreezen.freezenverticaldata[0] - luckysheetFreezen.freezenverticaldata[2])){
                            toX += scroll.scrollLeft;
                        }
                        if(luckysheetFreezen.freezenhorizontaldata != null && toY < (luckysheetFreezen.freezenhorizontaldata[0] - luckysheetFreezen.freezenhorizontaldata[2])){
                            toY += scroll.scrollTop;
                        }

                        let left = postil["left"] == null ? toX + 18 * Store.zoomRatio : postil["left"] * Store.zoomRatio;
                        let top = postil["top"] == null ? toY - 18 * Store.zoomRatio : postil["top"] * Store.zoomRatio;
                        let width = postil["width"] == null ? _this.defaultWidth * Store.zoomRatio : postil["width"] * Store.zoomRatio;
                        let height = postil["height"] == null ? _this.defaultHeight * Store.zoomRatio : postil["height"] * Store.zoomRatio;
                        let value = postil["value"] == null ? "" : postil["value"];

                        if(top < 0){
                            top = 2;
                        }

                        let size = _this.getArrowCanvasSize(left, top, toX, toY);

                        let commentDivs = '';
                        let valueLines = value.split('\n');
                        for (let line of valueLines) {
                            commentDivs += '<div>' + _this.htmlEscape(line) + '</div>';
                        }

                        let html =  '<div id="luckysheet-postil-show_'+ rowIndex +'_'+ colIndex +'" class="luckysheet-postil-show">' +
                                        '<canvas class="arrowCanvas" width="'+ size[2] +'" height="'+ size[3] +'" style="position:absolute;left:'+ size[0] +'px;top:'+ size[1] +'px;z-index:100;pointer-events:none;"></canvas>' +
                                        '<div class="luckysheet-postil-show-main" style="width:'+ width +'px;height:'+ height +'px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:'+ left +'px;top:'+ top +'px;box-sizing:border-box;z-index:100;">' +
                                            '<div class="luckysheet-postil-dialog-move">' +
                                                '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-t" data-type="t"></div>' +
                                                '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-r" data-type="r"></div>' +
                                                '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-b" data-type="b"></div>' +
                                                '<div class="luckysheet-postil-dialog-move-item luckysheet-postil-dialog-move-item-l" data-type="l"></div>' +
                                            '</div>' +
                                            '<div class="luckysheet-postil-dialog-resize" style="display:none;">' +
                                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lt" data-type="lt"></div>' +
                                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-mt" data-type="mt"></div>' +
                                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lm" data-type="lm"></div>' +
                                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rm" data-type="rm"></div>' +
                                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rt" data-type="rt"></div>' +
                                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-lb" data-type="lb"></div>' +
                                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-mb" data-type="mb"></div>' +
                                                '<div class="luckysheet-postil-dialog-resize-item luckysheet-postil-dialog-resize-item-rb" data-type="rb"></div>' +
                                            '</div>' +
                                            '<div style="width:100%;height:100%;overflow:hidden;">' + 
                                                '<div class="formulaInputFocus" style="width:'+ (width - 12) +'px;height:'+ (height - 12) +'px;line-height:20px;box-sizing:border-box;text-align: center;;word-break:break-all;" spellcheck="false" contenteditable="true">' +
                                                    commentDivs +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';

                        cellMain.find("#luckysheet-postil-showBoxs")?.insertAdjacentHTML('beforeend', html);

                        let ctx5 = document.querySelector("#luckysheet-postil-show_"+ rowIndex +"_"+ colIndex +" .arrowCanvas")?.getContext("2d");

                        if (ctx5) _this.drawArrow(ctx5, size[4], size[5], size[6], size[7]);

                        d[rowIndex][colIndex].ps.isshow = true;
                        rc.push(allPs[i]);
                    }
                }
            }
        }

        _this.ref(d, rc);
        _this.init();
    },
    removeActivePs: function(){
        const _activePs = document.querySelector("#luckysheet-postil-showBoxs .luckysheet-postil-show-active");
        if(_activePs !== null){

            let id = _activePs.getAttribute("id");
            let r = id.split("luckysheet-postil-show_")[1].split("_")[0];
            let c = id.split("luckysheet-postil-show_")[1].split("_")[1];

            let value = document.getElementById(id)?.querySelector(".formulaInputFocus")?.innerHTML?.replaceAll('<div>', '\n').replaceAll(/<(.*)>.*?|<(.*) \/>/g, '').trim() || "";
            // Hook function
            if(!method.createHookFunction('commentUpdateBefore',r,c,value)){
                if (!Store.sheetData[r][c].ps.isshow) {
                    document.getElementById(id)?.remove();
                }
                return;
            }

            const previousCell = structuredClone(Store.sheetData[r][c]);

            const _activeEl = document.getElementById(id);
            if (_activeEl) {
                _activeEl.classList.remove("luckysheet-postil-show-active");
                const _resizeEl3 = _activeEl.querySelector(".luckysheet-postil-dialog-resize"); if (_resizeEl3) _resizeEl3.style.display = 'none';
                const _arrowEl2 = _activeEl.querySelector(".arrowCanvas"); if (_arrowEl2) _arrowEl2.style.zIndex = 100;
                const _mainEl2 = _activeEl.querySelector(".luckysheet-postil-show-main"); if (_mainEl2) _mainEl2.style.zIndex = 100;
            }

            let d = editor.deepCopyFlowData(Store.sheetData);
            let rc = [];

            d[r][c].ps.value = value;
            rc.push(r + "_" + c);

            this.ref(d, rc);

            if(!d[r][c].ps.isshow){
                document.getElementById(id)?.remove();
            }
            // Hook function
            setTimeout(() => {
                method.createHookFunction('commentUpdateAfter',r,c, previousCell, d[r][c])
            }, 0);
        }
    },
    ref: function(data, rc){
        if (Store.clearjfundo) {
            Store.jfundo.length  = 0;
            
            Store.jfredo.push({ 
                "type": "postil", 
                "data": Store.sheetData, 
                "curdata": data, 
                "sheetIndex": Store.currentSheetIndex,
                "rc": rc 
            });
        }

        //flowdata
        Store.sheetData = data;
        editor.webWorkerFlowDataCache(Store.sheetData);//worker存数据

        syncDataToStore();

        //刷新表格
        setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1);
    },
    positionSync: function(){
        let _this = this;

        document.querySelectorAll("#luckysheet-postil-showBoxs .luckysheet-postil-show").forEach(function(e) {
            let id = e.getAttribute("id");

            let r = id.split("luckysheet-postil-show_")[1].split("_")[0];
            let c = id.split("luckysheet-postil-show_")[1].split("_")[1];

            let cell = Store.sheetData[r][c];
            
            if(cell != null && cell.ps != null){
                _this.buildPs(r, c, cell.ps);
            }
            else{
                const _elPostilHide = document.getElementById(id); if (_elPostilHide) _elPostilHide.style.display = 'none';
            }
        });
    },
    htmlEscape: function(text){
        return text.replace(/[<>"&]/g, function(match, pos, originalText){
            console.log(match, pos, originalText)
            switch(match){
                case '<': {
                    return '&lt';
                }
                case '>': {
                    return '&gt';
                }
                case '&': {
                    return '&amp';
                }
                case '\"': {
                    return '&quot;';
                }
            }
        })
    }
}

export default luckysheetPostil;
