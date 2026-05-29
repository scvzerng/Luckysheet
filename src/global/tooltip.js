import { modelHTML, luckysheetToolHTML } from '../controllers/constant';
import browser from './browser';
import { replaceHtml } from '../utils/util';
import { showModalMask, hideModalMask } from '../utils/domUtils.js';
import locale from '../locale/locale';
import clipboard from 'clipboard-polyfill';

const tooltip = {
    info: function (title, content) {
        showModalMask();
        document.getElementById("luckysheet-info").remove();

        let _locale = locale();
        let locale_button = _locale.button;

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
            "id": "luckysheet-info", 
            "addclass": "", 
            "title": title, 
            "content": content, 
            "botton": '<button class="btn btn-default luckysheet-model-close-btn">&nbsp;&nbsp;'+locale_button.close+'&nbsp;&nbsp;</button>', 
            "style": "z-index:100003" 
        }));
        let _infoDialog = document.getElementById("luckysheet-info");
        _infoDialog.querySelector(".luckysheet-modal-dialog-content").style.minWidth = '300px';
        let myh = _infoDialog.offsetHeight,
            myw = _infoDialog.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        const _elInfo = document.getElementById("luckysheet-info"); if (_elInfo) { _elInfo.style.left = (winw + scrollLeft - myw) / 2; _elInfo.style.top = (winh + scrollTop - myh) / 3; _elInfo.style.display = ''; }
    },
    confirm: function (title, content, func1, func2, name1, name2) {
        showModalMask();
        document.getElementById("luckysheet-confirm").remove();

        const _locale = locale();
        const locale_button = _locale.button;
        
        if(name1 == null){
            name1 = locale_button.confirm;
        }
        if(name2 == null){
            name2 = locale_button.cancel;
        }

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
            "id": "luckysheet-confirm", 
            "addclass": "", 
            "style": "z-index:100003", 
            "title": title, 
            "content": content, 
            "botton": '<button class="btn btn-primary luckysheet-model-conform-btn">&nbsp;&nbsp;'+ name1 +'&nbsp;&nbsp;</button><button class="btn btn-default luckysheet-model-cancel-btn">&nbsp;&nbsp;'+ name2 +'&nbsp;&nbsp;</button>' 
        }));
        let _confirmDialog = document.getElementById("luckysheet-confirm");
        _confirmDialog.querySelector(".luckysheet-modal-dialog-content").style.minWidth = '300px';
        let myh = _confirmDialog.offsetHeight,
            myw = _confirmDialog.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        const _elConfirm = document.getElementById("luckysheet-confirm"); if (_elConfirm) { _elConfirm.style.left = (winw + scrollLeft - myw) / 2; _elConfirm.style.top = (winh + scrollTop - myh) / 3; _elConfirm.style.display = ''; }
        _confirmDialog.querySelector(".luckysheet-model-conform-btn").addEventListener("click", function () {
            if (typeof func1 == 'function') {
                func1();
            }
            const _elHide1 = document.getElementById("luckysheet-confirm"); if (_elHide1) _elHide1.style.display = 'none';
            hideModalMask();
        });
        _confirmDialog.querySelector(".luckysheet-model-cancel-btn").addEventListener("click", function () {
            if (typeof func2 == 'function') {
                func2();
            }
            const _elHide2 = document.getElementById("luckysheet-confirm"); if (_elHide2) _elHide2.style.display = 'none';
            hideModalMask();
        });
    },
    screenshot: function (title, content, imgurl) {

        const _locale = locale();
        const locale_screenshot = _locale.screenshot;
        showModalMask();
        document.getElementById("luckysheet-confirm").remove();
        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
            "id": "luckysheet-confirm",
            "addclass": "",
            "style": "z-index:100003",
            "title": title,
            "content": content,
            "botton": '<a style="text-decoration:none;color:#fff;" class="download btn btn-primary luckysheet-model-conform-btn">&nbsp;&nbsp;'+ locale_screenshot.downLoadBtn +'&nbsp;&nbsp;</a>&nbsp;&nbsp;<button class="btn btn-primary luckysheet-model-copy-btn">&nbsp;&nbsp;'+ locale_screenshot.downLoadCopy +'&nbsp;&nbsp;</button><button class="btn btn-default luckysheet-model-cancel-btn">&nbsp;&nbsp;'+ locale_screenshot.downLoadClose +'&nbsp;&nbsp;</button>' 
        }));
        let _screenshotDialog = document.getElementById("luckysheet-confirm");
        _screenshotDialog.querySelector(".luckysheet-modal-dialog-content").style.minWidth = '300px';
        let myh = _screenshotDialog.offsetHeight,
            myw = _screenshotDialog.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        const _elConfirm2 = document.getElementById("luckysheet-confirm"); if (_elConfirm2) { _elConfirm2.style.left = (winw + scrollLeft - myw) / 2; _elConfirm2.style.top = (winh + scrollTop - myh) / 3; _elConfirm2.style.display = ''; }
        _screenshotDialog.querySelector(".luckysheet-model-conform-btn").addEventListener("click", function () {
            let $a = document.createElement("a");
            $a.setAttribute("href", imgurl);
            $a.setAttribute("download", "luckysheet.png");
            document.body.appendChild($a);
            $a.click();
            $a.remove();
        });
        _screenshotDialog.querySelector(".luckysheet-model-cancel-btn").addEventListener("click", function () {
            const _elHide3 = document.getElementById("luckysheet-confirm"); if (_elHide3) _elHide3.style.display = 'none';
            hideModalMask();
        });

        document.querySelector('#luckysheet-confirm .luckysheet-model-copy-btn').addEventListener("click", function(){
            let dt = new clipboard.DT();
            dt.setData("text/html", "<img src='"+ imgurl +"'>");
            clipboard.write(dt);
            alert(locale_screenshot.successTip);
        });
    },
    sheetConfig: function () {

    },
    hoverTipshowState: false,
    hoverTipshowTimeOut: null,
    createHoverTip: function (obj, to) {
        let _this = this;

        obj.addEventListener("mouseover", function (e) {
            let _target = e.target.closest(to);
            if (!_target) return;
            if (_this.hoverTipshowState) {
                return;
            }

            clearTimeout(_this.hoverTipshowTimeOut);
            _this.hoverTipshowTimeOut = setTimeout(function(){
                let $t = _target,
                    toffset = $t.getBoundingClientRect(),
                    $toolup = document.getElementById("luckysheet-tooltip-up");
                
                let tips = $t.dataset.tips;
                if (tips == null || tips === null) {
                    tips = $t.previousElementSibling.dataset.tips;

                    if (tips == null || tips === null) {
                        return;
                    }
                }

                if ($toolup === null) {
                    document.body.insertAdjacentHTML('beforeend', luckysheetToolHTML);
                    $toolup = document.getElementById("luckysheet-tooltip-up");
                }

                $toolup.classList.remove("jfk-tooltip-hide");
                $toolup.querySelector("div.jfk-tooltip-contentId").innerHTML = tips;
                let toolwidth = $toolup.offsetWidth;
                $toolup.querySelector("div.jfk-tooltip-arrow").style.left = (toolwidth / 2);

                let toolleft = toffset.left + ($t.offsetWidth - toolwidth) / 2;
                if(toolleft < 2){
                    toolleft = 2;
                    $toolup.querySelector("div.jfk-tooltip-arrow").style.left = $t.offsetWidth / 2;
                }

                Object.assign($toolup.style, { "top": toffset.top + $t.offsetHeight + 1, "left": toolleft });
            }, 300);

        });
        obj.addEventListener("mouseout", function (e) {
            let _target = e.target.closest(to);
            if (!_target) return;
            _this.hoverTipshowState = false;
            clearTimeout(_this.hoverTipshowTimeOut);
            document.getElementById("luckysheet-tooltip-up").classList.add("jfk-tooltip-hide");
        });
        obj.addEventListener("click", function (e) {
            let _target = e.target.closest(to);
            if (!_target) return;
            _this.hoverTipshowState = true;
            clearTimeout(_this.hoverTipshowTimeOut);
            document.getElementById("luckysheet-tooltip-up").classList.add("jfk-tooltip-hide");
        });
    },
    popover: function(content, position, close, style, btntxt, exitsFuc){
        let _locale = locale();
        let locale_button = _locale.button;
        let locale_paint = _locale.paint;

        if(btntxt == null){
            btntxt = locale_button.close;
        }

        let htmldiv = '<div id="luckysheetpopover" class="luckysheetpopover"><div class="luckysheetpopover-content">'+locale_paint.start+'</div><div class="luckysheetpopover-btn">'+ btntxt +'</div></div>';
        document.getElementById("luckysheetpopover").remove();
        document.body.insertAdjacentHTML('beforeend', htmldiv);
        document.querySelector("#luckysheetpopover .luckysheetpopover-content").innerHTML = content;

        let w = document.getElementById("luckysheetpopover").offsetWidth,
            h = document.getElementById("luckysheetpopover").offsetHeight;
        let pcss = {};

        if(position == 'topLeft'){
            pcss.top = "20px";
            pcss.left = "20px";
        }
        else if(position == 'topCenter'){
            pcss.top = "20px";
            pcss.left = "50%";
            pcss["margin-left"] = -w/2;
        }
        else if(position == 'topRight'){
            pcss.top = "20px";
            pcss.right = "20px";
        }
        else if(position == 'midLeft'){
            pcss.top = "50%";
            pcss["margin-top"] = -h/2;
            pcss.left = "20px";
        }
        else if(position == 'center'){
            pcss.top = "50%";
            pcss["margin-top"] = -h/2;
            pcss.left = "50%";
            pcss["margin-left"] = -w/2;
        }
        else if(position == 'midRight'){
            pcss.top = "50%";
            pcss["margin-top"] = -h/2;
            pcss.right = "20px";
        }
        else if(position == 'bottomLeft'){
            pcss.bottom = "20px";
            pcss.left = "20px";
        }
        else if(position == 'bottomCenter'){
            pcss.bottom = "20px";
            pcss.left = "50%";
            pcss["margin-left"] = -w/2;
        }
        else if(position == 'bottomRight'){
            pcss.bottom = "20px";
            pcss.right = "20px";
        }
        else{
            pcss.top = "20px";
            pcss.left = "50%";
            pcss["margin-left"] = -w/2;
        }

        if(style == "white"){
            pcss.background = "rgba(255, 255, 255, 0.65)";
            pcss.color = "#000";
            Object.assign(document.querySelector("#luckysheetpopover .luckysheetpopover-btn").style, {"border": "1px solid #000"});
        }

        setTimeout(function(){
            Object.assign(document.querySelector("#luckysheetpopover .luckysheetpopover-content").style, {"margin-left": -document.querySelector("#luckysheetpopover .luckysheetpopover-btn").offsetWidth/2});
        }, 1);
        Object.assign(document.getElementById("luckysheetpopover").style, pcss);
        document.getElementById("luckysheetpopover").style.display = '';
        document.querySelector("#luckysheetpopover .luckysheetpopover-btn").addEventListener("click", function(){
            if(typeof(exitsFuc) == "function"){
                exitsFuc();
            }
        });

        if(close != null && typeof(close) == "number"){
            setTimeout(function(){
                document.getElementById("luckysheetpopover").fadeOut().remove();
                if(typeof(exitsFuc) == "function"){
                    exitsFuc();
                }
            }, close);
        }
    }
}

export default tooltip;
