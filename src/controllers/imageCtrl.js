import { onNS, offNS } from '../utils/migrationHelpers.js';
import { mouseposition } from '../global/location';
import luckysheetsizeauto from './resize';
import { modelHTML } from './constant';
import { getCurrentFile, getLastSelection, getFocusCell, getHeaderTotalHeight } from '../utils/storeAccess.js';
import { setluckysheet_scroll_status } from '../methods/set';
import { replaceHtml } from '../utils/util';
import { showModalMask, hideModalMask, getScrollPosition } from '../utils/domUtils.js';
import Store from '../store';
import locale from '../locale/locale';
import tooltip from '../global/tooltip';
import method from '../global/method';
import { createColorPicker, getPicker, STANDARD_PALETTE } from '../components/ColorPicker';
import '../components/ColorPicker/colorPicker.css';
import imageDialog from '../ui/imageDialog.js';
import cellMain from '../ui/cellMain.js';

const imageCtrl = {
    imgItem: {
        type: '3',  //1移动并调整单元格大小 2移动并且不调整单元格的大小 3不要移动单元格并调整其大小
        src: '',  //图片url
        originWidth: null,  //图片原始宽度
        originHeight: null,  //图片原始高度
        default: {
            width: null,  //图片 宽度
            height: null,  //图片 高度
            left: null,  //图片离表格左边的 位置
            top: null,  //图片离表格顶部的 位置
        },
        crop: {
            width: null,  //图片裁剪后 宽度
            height: null,  //图片裁剪后 高度
            offsetLeft: 0,  //图片裁剪后离未裁剪时 左边的位移
            offsetTop: 0,  //图片裁剪后离未裁剪时 顶部的位移
        },
        isFixedPos: false,  //固定位置
        fixedLeft: null,  //固定位置 左位移
        fixedTop: null,  //固定位置 右位移
        border: {
            width: 0,  //边框宽度
            radius: 0,  //边框半径
            style: 'solid',  //边框类型
            color: '#000',  //边框颜色
        }
    },
    images: null,
    currentImgId: null,
    currentWinW: null,
    currentWinH: null,
    resize: null,  
    resizeXY: null,
    move: false,
    moveXY: null,
    cropChange: null,  
    cropChangeXY: null,
    cropChangeObj: null,
    copyImgItemObj: null,
    insertImg: function (file) {
        const uploadImage = Store.toJsonOptions && Store.toJsonOptions['uploadImage'];
        if (typeof uploadImage === 'function') {
            // 上传形式
            uploadImage(file).then(url => {
                imageCtrl._insertImg(url);
            }).catch(error => {
                tooltip.info('<i class="fa fa-exclamation-triangle"></i>', '图片上传失败');
            });
        } else {
            // 内部base64形式
            let render = new FileReader();
            render.readAsDataURL(file);

            render.onload = function(event){
                let src = event.target.result;
                imageCtrl._insertImg(src);
                const _imgUpload = document.getElementById("luckysheet-imgUpload"); if (_imgUpload) _imgUpload.value = "";
            }
        }
    },

    _insertImg: function(src){
        let _this = this;
        
        let last = getLastSelection();
        let _focus = getFocusCell();
        let rowIndex = _focus.row || 0;
        let colIndex = _focus.col || 0;
        let left = colIndex == 0 ? 0 : Store.visibledatacolumn[colIndex - 1];
        let top = rowIndex == 0 ? 0 : Store.visibledatarow[rowIndex - 1];

        let image = new Image();
        image.onload = function(){
            let width = image.width,
                height = image.height;

            let img = {
                src: src,
                left: left,
                top: top,
                originWidth: width,
                originHeight: height
            }

            _this.addImgItem(img);
        }
        let imageUrlHandle = Store.toJsonOptions && Store.toJsonOptions['imageUrlHandle'];
        image.src = typeof imageUrlHandle === 'function' ? imageUrlHandle(src) : src;
    },
    generateRandomId: function(prefix) {
        if(prefix == null){
            prefix = "img";
        }

        let userAgent = window.navigator.userAgent.replace(/[^a-zA-Z0-9]/g, "").split("");

        let mid = "";

        for(let i = 0; i < 12; i++){
            mid += userAgent[Math.round(Math.random() * (userAgent.length - 1))];
        }

        let time = new Date().getTime();

        return prefix + "_" + mid + "_" + time;
    },
    modelHtml: function(id, imgItem) {
        let _this = this;

        let imageUrlHandle = Store.toJsonOptions && Store.toJsonOptions['imageUrlHandle'];
        let src = typeof imageUrlHandle === 'function' ? imageUrlHandle(imgItem.src) : imgItem.src;
        let imgItemParam = _this.getImgItemParam(imgItem);

        let width = imgItemParam.width;
        let height = imgItemParam.height;
        let left = imgItemParam.left;
        let top = imgItemParam.top;
        let position = imgItemParam.position;

        let borderWidth = imgItem.border.width;

        return  `<div id="${id}" class="luckysheet-modal-dialog luckysheet-modal-dialog-image" style="width:${width}px;height:${height}px;padding:0;position:${position};left:${left}px;top:${top}px;z-index:200;">
                    <div class="luckysheet-modal-dialog-content" style="width:100%;height:100%;overflow:hidden;position:relative;">
                        <img src="${src}" style="position:absolute;width:${imgItem.default.width * Store.zoomRatio}px;height:${imgItem.default.height * Store.zoomRatio}px;left:${-imgItem.crop.offsetLeft * Store.zoomRatio}px;top:${-imgItem.crop.offsetTop * Store.zoomRatio}px;" />
                    </div>
                    <div class="luckysheet-modal-dialog-border" style="border:${borderWidth}px ${imgItem.border.style} ${imgItem.border.color};border-radius:${imgItem.border.radius * Store.zoomRatio}px;position:absolute;left:${-borderWidth}px;right:${-borderWidth}px;top:${-borderWidth}px;bottom:${-borderWidth}px;"></div>
                </div>`;
    },
    getSliderHtml: function() {
        let imageText = locale().imageText;

        return `<div id="luckysheet-modal-dialog-slider-imageCtrl" class="luckysheet-modal-dialog-slider luckysheet-modal-dialog-slider-imageCtrl" style="display:block;">
                    <div class="luckysheet-modal-dialog-slider-title">
                        <span>${imageText.imageSetting}</span>
                        <span class="luckysheet-model-close-btn" title="${imageText.close}">
                            <i class="fa fa-times" aria-hidden="true"></i>
                        </span>
                    </div>
                    <div class="luckysheet-modal-dialog-slider-content">
                        <div class="slider-box">
                            <div class="slider-box-title">${imageText.conventional}</div>
                            <div class="slider-box-radios">
                                <div class="radio-item">
                                    <input type="radio" id="imgItemType1" name="imgItemType" value="1">
                                    <label for="imgItemType1">${imageText.moveCell1}</label>
                                </div>
                                <div class="radio-item">
                                    <input type="radio" id="imgItemType2" name="imgItemType" value="2">
                                    <label for="imgItemType2">${imageText.moveCell2}</label>
                                </div>
                                <div class="radio-item">
                                    <input type="radio" id="imgItemType3" name="imgItemType" value="3">
                                    <label for="imgItemType3">${imageText.moveCell3}</label>
                                </div>
                            </div>
                            <div class="slider-box-checkbox">
                                <input type="checkbox" id="imgItemIsFixedPos">
                                <label for="imgItemIsFixedPos">${imageText.fixedPos}</label>
                            </div>
                        </div>
                        <div class="slider-box">
                            <div class="slider-box-title">${imageText.border}</div>
                            <div class="slider-box-borderConfig">
                                <div class="border-item">
                                    <label>${imageText.width}</label>
                                    <input type="number" id="imgItemBorderWidth" min="0">
                                </div>
                                <div class="border-item">
                                    <label>${imageText.radius}</label>
                                    <input type="number" id="imgItemBorderRadius" min="0">
                                </div>
                                <div class="border-item">
                                    <label>${imageText.style}</label>
                                    <select id="imgItemBorderStyle">
                                        <option value="solid">${imageText.solid}</option>
                                        <option value="dashed">${imageText.dashed}</option>
                                        <option value="dotted">${imageText.dotted}</option>
                                        <option value="double">${imageText.double}</option>
                                    </select>
                                </div>
                                <div class="border-item">
                                    <label>${imageText.color}</label>
                                    <div id="imgItemBorderColor" class="imgItemBorderColor">
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
    },
    sliderHtmlShow: function() {
        let _this = this;

        imageDialog.slider.el.remove();

        let sliderHtml = _this.getSliderHtml();
        document.body.insertAdjacentHTML('beforeend', sliderHtml);
        luckysheetsizeauto();

        let imgItem = _this.images[_this.currentImgId];

        //类型
        let type = imgItem.type;
        const _typeRadio = imageDialog.slider.el?.querySelector("#imgItemType" + type); if (_typeRadio) _typeRadio.checked = true;

        let isFixedPos = imgItem.isFixedPos;
        const _fixedPosCheck = imageDialog.slider.el?.querySelector("#imgItemIsFixedPos"); if (_fixedPosCheck) _fixedPosCheck.checked = isFixedPos;

        let border = imgItem.border;
        const _borderWidthInput = imageDialog.slider.el?.querySelector("#imgItemBorderWidth"); if (_borderWidthInput) _borderWidthInput.value = border.width;
        const _borderRadiusInput = imageDialog.slider.el?.querySelector("#imgItemBorderRadius"); if (_borderRadiusInput) _borderRadiusInput.value = border.radius;
        const _borderStyleSelect = imageDialog.slider.el?.querySelector("#imgItemBorderStyle"); if (_borderStyleSelect) _borderStyleSelect.value = border.style;
        const _borderColorSpan = imageDialog.slider.el?.querySelector("#imgItemBorderColor span");
        if (_borderColorSpan) {
            _borderColorSpan.style.backgroundColor = border.color;
            _borderColorSpan.title = border.color;
        }
    
        _this.init();
    },
    colorSelectDialog: function(currenColor){
        const _locale = locale();
        const locale_button = _locale.button;
        const locale_toolbar = _locale.toolbar;
        const locale_imageCtrl = _locale.imageCtrl;

        showModalMask();
        const _colorDlgOld = document.getElementById("luckysheet-imageCtrl-colorSelect-dialog");
        if (_colorDlgOld) _colorDlgOld.remove();

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
            "id": "luckysheet-imageCtrl-colorSelect-dialog", 
            "addclass": "luckysheet-imageCtrl-colorSelect-dialog", 
            "title": locale_imageCtrl.borderTile, 
            "content": `<div class="currenColor">
                            ${locale_imageCtrl.borderCur}:<span title="${currenColor}" style="background-color:${currenColor}"></span>
                        </div>
                        <div class="colorshowbox"></div>`, 
            "botton":  `<button id="luckysheet-imageCtrl-colorSelect-dialog-confirm" class="btn btn-primary">${locale_button.confirm}</button>
                        <button class="btn btn-default luckysheet-model-close-btn">${locale_button.cancel}</button>`, 
            "style": "z-index:100003" 
        }));
        const _colorDlg = document.getElementById("luckysheet-imageCtrl-colorSelect-dialog");
        _colorDlg.querySelector(".luckysheet-modal-dialog-content").style.minWidth = '300px';
        const myh = _colorDlg.offsetHeight;
        const myw = _colorDlg.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        _colorDlg.style.left = (winw + scrollLeft - myw) / 2 + 'px';
        _colorDlg.style.top = (winh + scrollTop - myh) / 3 + 'px';
        _colorDlg.style.display = 'block';
        
        //初始化选择颜色插件
        createColorPicker(_colorDlg.querySelector(".colorshowbox"), {
            showPalette: true,
            showPaletteOnly: true,
            preferredFormat: "hex",
            clickoutFiresChange: false,
            showInitial: true,
            showInput: true,
            flat: true,
            hideAfterPaletteSelect: true,
            showSelectionPalette: true,
            showButtons: false,
            maxPaletteSize: 8,
            maxSelectionSize: 8,
            color: currenColor,
            cancelText: locale_button.cancel,
            chooseText: locale_toolbar.confirmColor,
            togglePaletteMoreText: locale_toolbar.customColor,
            togglePaletteLessText: locale_toolbar.collapse,
            togglePaletteOnly: true,
            clearText: locale_toolbar.clearText,
            noColorSelectedText: locale_toolbar.noColorSelectedText,
            palette: STANDARD_PALETTE,
            move: function(color){
                if (color != null) {
                    color = color.toHexString();
                }
                else {
                    color = "#000";
                }

                const _curColorSpan = _colorDlg.querySelector(".currenColor span");
                _curColorSpan.style.backgroundColor = color;
                _curColorSpan.title = color;
            }
        });
    },
    init: function() {
        let _this = this;

        //关闭
        imageDialog.slider.el?.querySelector(".luckysheet-model-close-btn")?.addEventListener("click", function () {
            imageDialog.slider.hide();
            luckysheetsizeauto();
        });

        //常规
        offNS("radio");
        onNS(imageDialog.slider.el, "change.radio", ".radio-item input[type=radio][name=imgItemType]", function() {
            _this.configChange("type", this.value);
        })

        //固定位置
        offNS("checkbox");
        onNS(imageDialog.slider.el, "change.checkbox", ".slider-box-checkbox input[type=checkbox]", function() {
            _this.configChange("fixedPos", this.checked);
        })

        //边框宽度
        offNS("borderWidth");
        onNS(imageDialog.slider.el, "change.borderWidth", "#imgItemBorderWidth", function() {
            _this.configChange("border-width", this.valueAsNumber);
        })

        //边框半径
        offNS("borderRadius");
        onNS(imageDialog.slider.el, "change.borderRadius", "#imgItemBorderRadius", function() {
            _this.configChange("border-radius", this.valueAsNumber);
        })

        //边框样式
        offNS("borderStyle");
        onNS(imageDialog.slider.el, "change.borderStyle", "#imgItemBorderStyle", function() {
            _this.configChange("border-style", this.value);
        })

        //边框颜色 选择
        offNS("color");
        onNS(imageDialog.slider.el, "click.color", "#imgItemBorderColor", function() {
            let currenColor = this.querySelector("span").getAttribute("title");
            _this.colorSelectDialog(currenColor);
        })

        //边框选择颜色 确定 
        offNS("selectColorConfirm");
        onNS(document, "click.selectColorConfirm", "#luckysheet-imageCtrl-colorSelect-dialog-confirm", function(){
            let parentEl = this.closest("#luckysheet-imageCtrl-colorSelect-dialog");
            hideModalMask();
            if (parentEl) parentEl.style.display = 'none';

            let currenColor = parentEl?.querySelector(".currenColor span")?.getAttribute("title");
            const _borderSpan = imageDialog.slider.el?.querySelector("#imgItemBorderColor span");
            if (_borderSpan && currenColor != null) {
                _borderSpan.style.backgroundColor = currenColor;
                _borderSpan.title = currenColor;
            }

            _this.configChange("border-color", currenColor);            
        });

        //image active
        offNS("active");
        onNS(document.getElementById("luckysheet-image-showBoxs"), "mousedown.active", ".luckysheet-modal-dialog-image", function(e) {            this.style.display = 'none';
            let id = this.id;

            if(_this.currentImgId != null && _this.currentImgId != id){
                _this.cancelActiveImgItem();
            }

            _this.currentImgId = id;

            let item = _this.images[id];
            let imgItemParam = _this.getImgItemParam(item);

            let width = imgItemParam.width;
            let height = imgItemParam.height;
            let left = imgItemParam.left;
            let top = imgItemParam.top;
            let position = imgItemParam.position;
        
            imageDialog.active.showAt({
                "width": width,
                "height": height,
                "left": left,
                "top": top,
                "position": position
            });
            let imageUrlHandle = Store.toJsonOptions && Store.toJsonOptions['imageUrlHandle'];
            let imgUrl = typeof imageUrlHandle === 'function' ? imageUrlHandle(item.src) : item.src;
            const _activeContent = imageDialog.active.el?.querySelector(".luckysheet-modal-dialog-content");
            if (_activeContent) Object.assign(_activeContent.style, {
                backgroundImage: "url(" + imgUrl + ")",
                backgroundSize: item.default.width * Store.zoomRatio + "px " + item.default.height * Store.zoomRatio + "px",
                backgroundPosition: -item.crop.offsetLeft * Store.zoomRatio + "px " + -item.crop.offsetTop * Store.zoomRatio + "px"
            })

            const _activeBorder = imageDialog.active.el?.querySelector(".luckysheet-modal-dialog-border");
            if (_activeBorder) Object.assign(_activeBorder.style, {
                borderWidth: item.border.width * Store.zoomRatio + 'px',
                borderStyle: item.border.style,
                borderColor: item.border.color,
                borderRadius: item.border.radius * Store.zoomRatio + 'px',
                left: -item.border.width * Store.zoomRatio + 'px',
                right: -item.border.width * Store.zoomRatio + 'px',
                top: -item.border.width * Store.zoomRatio + 'px',
                bottom: -item.border.width * Store.zoomRatio + 'px',
            })

            _this.sliderHtmlShow();

            e.stopPropagation();
        })

        //image move
        offNS("move");
        onNS(imageDialog.active.el, "mousedown.move", ".luckysheet-modal-dialog-content", function(e) {
            
            if(!imageDialog.slider.isVisible()){
                _this.sliderHtmlShow();
            }
            
            _this.move = true;
            
            _this.currentWinW = cellMain.getScrollWidth();
            _this.currentWinH = cellMain.getScrollHeight();

            let offset = imageDialog.active.getOffset();

            _this.moveXY = [
                e.pageX - offset.left, 
                e.pageY - offset.top, 
            ];

            setluckysheet_scroll_status(true);

            e.stopPropagation();
        })

        //image resize
        offNS("resize");
        onNS(imageDialog.active.el, "mousedown.resize", ".luckysheet-modal-dialog-resize-item", function(e) {
            
            _this.currentWinW = cellMain.getScrollWidth();
            _this.currentWinH = cellMain.getScrollHeight();

            _this.resize = this.dataset.type;

            let scroll = getScrollPosition();
            let mouse = mouseposition(e.pageX, e.pageY);
            let x = mouse[0] + scroll.scrollLeft;
            let y = mouse[1] + scroll.scrollTop;

            let position = imageDialog.active.getPosition();
            let width = imageDialog.active.getWidth();
            let height = imageDialog.active.getHeight();

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
            
            e.stopPropagation();
        })

        //image croppingEnter
        offNS("croppingEnter");
        onNS(imageDialog.active.el, "mousedown.croppingEnter", ".luckysheet-modal-controll-crop", function(e) {
            _this.croppingEnter();
            e.stopPropagation();
        })

        //image croppingExit
        offNS("croppingExit");
        onNS(imageDialog.cropping.el, "mousedown.croppingExit", ".luckysheet-modal-controll-crop", function(e) {
            _this.croppingExit();
            e.stopPropagation();
        })

        //image crop change
        offNS("cropChange");
        onNS(imageDialog.cropping.el, "mousedown.cropChange", ".resize-item", function(e) {
            _this.cropChange = this.dataset.type;

            let scroll = getScrollPosition();
            let mouse = mouseposition(e.pageX, e.pageY);
            let x = mouse[0] + scroll.scrollLeft;
            let y = mouse[1] + scroll.scrollTop;

            _this.cropChangeXY = [
                x, 
                y
            ];

            setluckysheet_scroll_status(true);
            
            e.stopPropagation();
        })

        //image restore
        offNS("restore");
        const _showBoxs = document.getElementById("luckysheet-image-showBoxs");
        onNS(_showBoxs, "mousedown.restore", ".luckysheet-modal-controll-restore", function(e) {
            _this.restoreImgItem();
            e.stopPropagation();
        })

        //image delete
        offNS("delete");
        onNS(_showBoxs, "mousedown.delete", ".luckysheet-modal-controll-del", function(e) {
            _this.removeImgItem();
            e.stopPropagation();
        })
    },
    configChange: function(type, value){
        let _this = this;

        let imgItem = _this.images[_this.currentImgId];

        switch(type){
            case "type":
                imgItem.type = value;
                break;
            case "fixedPos":
                imgItem.isFixedPos = value;

                let imgItemParam = _this.getImgItemParam(imgItem);
                let width = imgItemParam.width;
                let height = imgItemParam.height;
                let left = imgItemParam.left;
                let top = imgItemParam.top;
                let position = imgItemParam.position;
            
                imageDialog.active.showAt({
                    "width": width,
                    "height": height,
                    "left": left,
                    "top": top,
                    "position": position
                });
                break;
            case "border-width":
                imgItem.border.width = value;
                const _borderEl1 = imageDialog.active.el?.querySelector(".luckysheet-modal-dialog-border");
                if (_borderEl1) Object.assign(_borderEl1.style, {
                    borderWidth: value + 'px',
                    left: -value + 'px',
                    right: -value + 'px',
                    top: -value + 'px',
                    bottom: -value + 'px'
                });
                break;
            case "border-radius":
                imgItem.border.radius = value;
                const _borderEl2 = imageDialog.active.el?.querySelector(".luckysheet-modal-dialog-border"); if (_borderEl2) _borderEl2.style.borderRadius = value + 'px';
                break;
            case "border-style":
                imgItem.border.style = value;
                const _borderEl3 = imageDialog.active.el?.querySelector(".luckysheet-modal-dialog-border"); if (_borderEl3) _borderEl3.style.borderStyle = value;
                break;
            case "border-color":
                imgItem.border.color = value;
                const _borderEl4 = imageDialog.active.el?.querySelector(".luckysheet-modal-dialog-border"); if (_borderEl4) _borderEl4.style.borderColor = value;
                break;
        }
        
        _this.ref();
    },
    getImgItemParam(imgItem){
        let isFixedPos = imgItem.isFixedPos;

        let width = imgItem.default.width * Store.zoomRatio,
            height = imgItem.default.height * Store.zoomRatio,
            left = imgItem.default.left * Store.zoomRatio,
            top = imgItem.default.top * Store.zoomRatio;

        if(imgItem.crop.width != width || imgItem.crop.height != height){
            width = imgItem.crop.width * Store.zoomRatio;
            height = imgItem.crop.height * Store.zoomRatio;
            left += imgItem.crop.offsetLeft * Store.zoomRatio;
            top += imgItem.crop.offsetTop * Store.zoomRatio;
        }

        let position = 'absolute';
        if(isFixedPos){
            position = 'fixed';
            left = imgItem.fixedLeft + imgItem.crop.offsetLeft;
            top = imgItem.fixedTop + imgItem.crop.offsetTop;

            // only need to scale the distance relative to the main area, otherwise it will continue to shift and overflow the main area.
            // Note: After scaling here, there is no need to scale again when using this position externally
            // fix #174
            const operateAreaWidth = Store.rowHeaderWidth;
            const operateAreaHeight = getHeaderTotalHeight();
            left = (left - operateAreaWidth) * Store.zoomRatio + operateAreaWidth
            top = (top - operateAreaHeight) * Store.zoomRatio + operateAreaHeight
        }

        return {
            width: width,
            height: height,
            left: left,
            top: top,
            position: position
        }
    },
    cancelActiveImgItem: function(){
        let _this = this;

        imageDialog.active.hide();
        imageDialog.cropping.hide();
        imageDialog.slider.hide();

        let imgItem = _this.images[_this.currentImgId];
        let imgItemParam = _this.getImgItemParam(imgItem);

        let width = imgItemParam.width;
        let height = imgItemParam.height;
        let left = imgItemParam.left;
        let top = imgItemParam.top;
        let position = imgItemParam.position;

        const _elImgShow = document.getElementById(_this.currentImgId);
        if (_elImgShow) {
            _elImgShow.style.display = 'block';
            _elImgShow.style.width = width + 'px';
            _elImgShow.style.height = height + 'px';
            _elImgShow.style.left = left + 'px';
            _elImgShow.style.top = top + 'px';
            _elImgShow.style.position = position;
            _elImgShow.querySelector("img").style.width = imgItem.default.width * Store.zoomRatio + 'px';
            _elImgShow.querySelector("img").style.height = imgItem.default.height * Store.zoomRatio + 'px';
            _elImgShow.querySelector("img").style.left = -imgItem.crop.offsetLeft * Store.zoomRatio + 'px';
            _elImgShow.querySelector("img").style.top = -imgItem.crop.offsetTop * Store.zoomRatio + 'px';
            Object.assign(_elImgShow.querySelector(".luckysheet-modal-dialog-border").style, {
                borderWidth: imgItem.border.width * Store.zoomRatio + 'px',
                borderStyle: imgItem.border.style,
                borderColor: imgItem.border.color,
                borderRadius: imgItem.border.radius * Store.zoomRatio + 'px',
                left: -imgItem.border.width * Store.zoomRatio + 'px',
                right: -imgItem.border.width * Store.zoomRatio + 'px',
                top: -imgItem.border.width * Store.zoomRatio + 'px',
                bottom: -imgItem.border.width * Store.zoomRatio + 'px',
            });
        }

        _this.currentImgId = null;
    },
    addImgItem: function(img) {
        let _this = this;

        let width, height;
        let max = 400;

        if(img.originHeight < img.originWidth){
            height = Math.round(img.originHeight * (max / img.originWidth));
            width = max;
        }
        else{
            width = Math.round(img.originWidth * (max / img.originHeight));
            height = max;
        }

        if(_this.images == null){
            _this.images = {};
        }

        let imgItem = structuredClone(_this.imgItem);
        imgItem.src = img.src;
        imgItem.originWidth = img.originWidth;
        imgItem.originHeight = img.originHeight;
        imgItem.default.width = width;
        imgItem.default.height = height;
        imgItem.default.left = img.left;
        imgItem.default.top = img.top;
        imgItem.crop.width = width;
        imgItem.crop.height = height;

        let scroll = getScrollPosition();

        imgItem.fixedLeft = img.left - scroll.scrollLeft + Store.rowHeaderWidth;
        imgItem.fixedTop = img.top - scroll.scrollTop + getHeaderTotalHeight();

        let id = _this.generateRandomId();
        let modelHtml = _this.modelHtml(id, imgItem);

        const _imgList = document.querySelector("#luckysheet-image-showBoxs .img-list"); _imgList?.insertAdjacentHTML('beforeend', modelHtml);

        _this.images[id] = imgItem;
        _this.ref();

        _this.init();
    },
    moveImgItem: function() {
        let _this = this;

        _this.move = false;

        let obj = imageDialog.active.el;
        let item = _this.images[_this.currentImgId];

		var zoomRatio = Store.zoomRatio;
		
        if(item.isFixedPos){
			
            item.fixedLeft = (obj.offsetLeft - item.crop.offsetLeft) / zoomRatio;
            item.fixedTop = (obj.offsetTop - item.crop.offsetTop) / zoomRatio;
        }
        else{
            item.default.left = (obj.offsetLeft - item.crop.offsetLeft) / zoomRatio;
            item.default.top = (obj.offsetTop - item.crop.offsetTop) / zoomRatio;
        }

        _this.ref();
    },
    resizeImgItem: function() {
        let _this = this;

        _this.resize = null;
		
		var zoomRatio = Store.zoomRatio;

        let obj = imageDialog.active.el;

        let item = _this.images[_this.currentImgId];
        let scaleX = obj.clientWidth / item.crop.width;
        let scaleY = obj.clientHeight / item.crop.height;

        item.default.width = Math.round(item.default.width * scaleX / zoomRatio);
        item.default.height = Math.round(item.default.height * scaleY / zoomRatio);

        item.crop.width = Math.round(item.crop.width * scaleX / zoomRatio);
        item.crop.height = Math.round(item.crop.height * scaleY / zoomRatio);
        item.crop.offsetLeft = Math.round(item.crop.offsetLeft * scaleX / zoomRatio);
        item.crop.offsetTop = Math.round(item.crop.offsetTop * scaleY / zoomRatio);

        if(item.isFixedPos){
            item.fixedLeft = obj.offsetLeft / zoomRatio;
            item.fixedTop = obj.offsetTop / zoomRatio;
        }
        else{
            item.default.left = (obj.offsetLeft - item.crop.offsetLeft) / zoomRatio;
            item.default.top = (obj.offsetTop - item.crop.offsetTop) / zoomRatio;
        }

        _this.ref();
    },
    croppingEnter: function() {
        let _this = this;
        _this.cropping = true;

        imageDialog.active.hide();
        imageDialog.slider.hide();

        let item = _this.images[_this.currentImgId];
        let imgItemParam = _this.getImgItemParam(item);

        let width = imgItemParam.width;
        let height = imgItemParam.height;
        let left = imgItemParam.left;
        let top = imgItemParam.top;
        let position = imgItemParam.position;
    
        imageDialog.cropping.showAt({
            "width": width,
            "height": height,
            "left": left,
            "top": top,
            "position": position
        });

        let imageUrlHandle = Store.toJsonOptions && Store.toJsonOptions['imageUrlHandle'];
        let imgSrc = typeof imageUrlHandle === 'function' ? imageUrlHandle(item.src) : item.src;

        const _cropMask = imageDialog.cropping.el?.querySelector(".cropping-mask");
        if (_cropMask) Object.assign(_cropMask.style, {
            width: item.default.width + 'px',
            height: item.default.height + 'px',
            backgroundImage: "url(" + imgSrc + ")",
            left: -item.crop.offsetLeft + 'px',
            top: -item.crop.offsetTop + 'px'
        })

        const _cropContent = imageDialog.cropping.el?.querySelector(".cropping-content");
        if (_cropContent) Object.assign(_cropContent.style, {
            backgroundImage: "url(" + imgSrc + ")",
            backgroundSize: item.default.width + "px " + item.default.height + "px",
            backgroundPosition: -item.crop.offsetLeft + "px " + -item.crop.offsetTop + "px"
        })

        const _cropBorder = imageDialog.cropping.el?.querySelector(".luckysheet-modal-dialog-border");
        if (_cropBorder) Object.assign(_cropBorder.style, {
            borderWidth: item.border.width + 'px',
            borderStyle: item.border.style,
            borderColor: item.border.color,
            borderRadius: item.border.radius + 'px',
            left: -item.border.width + 'px',
            right: -item.border.width + 'px',
            top: -item.border.width + 'px',
            bottom: -item.border.width + 'px',
        })
    },
    croppingExit: function() {
        let _this = this;
        _this.cropping = false;

        imageDialog.cropping.hide();

        let item = _this.images[_this.currentImgId];
        let imgItemParam = _this.getImgItemParam(item);

        let width = imgItemParam.width;
        let height = imgItemParam.height;
        let left = imgItemParam.left;
        let top = imgItemParam.top;
        let position = imgItemParam.position;

        imageDialog.active.showAt({
            "width": width,
            "height": height,
            "left": left,
            "top": top,
            "position": position
        });
        let imageUrlHandle = Store.toJsonOptions && Store.toJsonOptions['imageUrlHandle'];
        let imgSrc = typeof imageUrlHandle === 'function' ? imageUrlHandle(item.src) : item.src;

        const _exitContent = imageDialog.active.el?.querySelector(".luckysheet-modal-dialog-content");
        if (_exitContent) Object.assign(_exitContent.style, {
            backgroundImage: "url(" + imgSrc + ")",
            backgroundSize: item.default.width + "px " + item.default.height + "px",
            backgroundPosition: -item.crop.offsetLeft + "px " + -item.crop.offsetTop + "px"
        })
    },
    cropChangeImgItem: function() {
        let _this = this;

        _this.cropChange = null;

        let item = _this.images[_this.currentImgId];
        item.crop.width = _this.cropChangeObj.width;
        item.crop.height = _this.cropChangeObj.height;
        item.crop.offsetLeft = _this.cropChangeObj.offsetLeft;
        item.crop.offsetTop = _this.cropChangeObj.offsetTop;

        _this.ref();
    },
    restoreImgItem: function() {
        let _this = this;
        let imgItem = _this.images[_this.currentImgId];

        imgItem.default.width = imgItem.originWidth;
        imgItem.default.height = imgItem.originHeight;

        imgItem.crop.width = imgItem.originWidth;
        imgItem.crop.height = imgItem.originHeight;
        imgItem.crop.offsetLeft = 0;
        imgItem.crop.offsetTop = 0;

        let imgItemParam = _this.getImgItemParam(imgItem);

        let width = imgItemParam.width;
        let height = imgItemParam.height;
        let left = imgItemParam.left;
        let top = imgItemParam.top;
        let position = imgItemParam.position;
        
        imageDialog.active.showAt({
            "width": width,
            "height": height,
            "left": left,
            "top": top,
            "position": position
        });

        let imageUrlHandle = Store.toJsonOptions && Store.toJsonOptions['imageUrlHandle'];
        let imgSrc = typeof imageUrlHandle === 'function' ? imageUrlHandle(imgItem.src) : imgItem.src;

        const _restoreContent = imageDialog.active.el?.querySelector(".luckysheet-modal-dialog-content");
        if (_restoreContent) Object.assign(_restoreContent.style, {
            backgroundImage: "url(" + imgSrc + ")",
            backgroundSize: imgItem.default.width + "px " + imgItem.default.height + "px",
            backgroundPosition: -imgItem.crop.offsetLeft + "px " + -imgItem.crop.offsetTop + "px"
        })

        _this.ref();
    },
    removeImgItem: function() {
        let _this = this;
        let imgItem = _this.images[_this.currentImgId];

        // 钩子 imageDeleteBefore
        if(!method.createHookFunction('imageDeleteBefore', imgItem)){
            return;
        }
        
        imageDialog.active.hide();
        imageDialog.cropping.hide();
        imageDialog.slider.hide();
        const _elRemove = document.getElementById(_this.currentImgId);
        if (_elRemove) _elRemove.remove();


        delete _this.images[_this.currentImgId];
        _this.currentImgId = null;

        // 钩子 imageDeleteAfter
        method.createHookFunction('imageDeleteAfter', imgItem);
        _this.ref();
    },
    copyImgItem: function(e) {
        let _this = this;

        _this.copyImgItemObj = structuredClone(_this.images[_this.currentImgId]);

        let clipboardData = e.originalEvent && e.originalEvent.clipboardData;

        let cpdata = '<table data-type="luckysheet_copy_action_image"><tr><td><td></tr></table>';

        if (!clipboardData) {
            let textarea = document.getElementById("luckysheet-copy-content");
            if (textarea) {
                textarea.innerHTML = cpdata;
                textarea.focus();
                const range3 = document.createRange();
                range3.selectNodeContents(textarea);
                const sel3 = window.getSelection();
                sel3.removeAllRanges();
                sel3.addRange(range3);
            }
            document.execCommand("selectAll");
            document.execCommand("Copy");
            setTimeout(function () {
                document.getElementById("luckysheet-copy-content")?.blur();
            }, 10);
        }
        else {
            clipboardData.setData('Text', cpdata);
            return false;//否则设不生效
        }
    },
    pasteImgItem: function() {
        let _this = this;

        if(_this.images == null){
            _this.images = {};
        }

        let rowIndex = Store.luckysheet_select_save[0].row_focus || 0;
        let colIndex = Store.luckysheet_select_save[0].column_focus || 0;
        let left = colIndex == 0 ? 0 : Store.visibledatacolumn[colIndex - 1];
        let top = rowIndex == 0 ? 0 : Store.visibledatarow[rowIndex - 1];

        let img = structuredClone(_this.copyImgItemObj);
        
        img.default.left = left - img.crop.offsetLeft;
        img.default.top = top - img.crop.offsetTop;

        let scroll = getScrollPosition();

        img.fixedLeft = img.default.left - scroll.scrollLeft + Store.rowHeaderWidth;
        img.fixedTop = img.default.top - scroll.scrollTop + getHeaderTotalHeight();

        let id = _this.generateRandomId();
        let modelHtml = _this.modelHtml(id, img);

        const _imgList2 = document.querySelector("#luckysheet-image-showBoxs .img-list"); _imgList2?.insertAdjacentHTML('beforeend', modelHtml);

        _this.images[id] = imgItem;
        _this.ref();

        _this.init();
    },
    allImagesShow: function() {
        let _this = this;
        
        imageDialog.active.hide();
        imageDialog.cropping.hide();
        imageDialog.slider.hide();
        const _el = document.querySelector("#luckysheet-image-showBoxs .img-list"); if (_el) _el.innerHTML = '';

        if(_this.images == null){
            return;
        }

        for(let imgId in _this.images){
            let imgItem = _this.images[imgId];
            let modelHtml = _this.modelHtml(imgId, imgItem);
            const _imgList3 = document.querySelector("#luckysheet-image-showBoxs .img-list"); _imgList3?.insertAdjacentHTML('beforeend', modelHtml);
        }
    },
    moveChangeSize: function(rc, index, size) {
        let _this = this;
        let images = structuredClone(_this.images);

        if(rc == "row"){
            let row = Store.visibledatarow[index], 
                row_pre = index - 1 == -1 ? 0 : Store.visibledatarow[index - 1];
            let changeSize = size - (row - row_pre - 1);
            
            for(let imgId in images){
                let imgItem = images[imgId];
                let imgItemParam = _this.getImgItemParam(imgItem);
                let type = imgItem.type;

                if(type == "1"){
                    if(imgItemParam.top >= row){
                        imgItem.default.top = imgItemParam.top + changeSize - imgItem.crop.offsetTop;
                    }
                    else{
                        if(imgItemParam.top + imgItemParam.height >= row-2){
                            if(imgItemParam.top < row + changeSize){
                                let scaleY = (imgItemParam.height + changeSize) / imgItemParam.height;
                                imgItem.default.height = Math.round(imgItem.default.height * scaleY);
                                imgItem.crop.height = Math.round(imgItem.crop.height * scaleY);
                                imgItem.crop.offsetTop = Math.round(imgItem.crop.offsetTop * scaleY);
                            }
                            else{
                                let scaleY = (imgItemParam.top + imgItemParam.height - row) / imgItemParam.height;
                                imgItem.default.height = Math.round(imgItem.default.height * scaleY);
                                imgItem.crop.height = Math.round(imgItem.crop.height * scaleY);
                                imgItem.crop.offsetTop = Math.round(imgItem.crop.offsetTop * scaleY);
                                imgItem.default.top = row + changeSize - imgItem.crop.offsetTop;
                            }
                        }
                        else{
                            if(imgItemParam.top > row + changeSize){
                                let scaleY = 1 / imgItemParam.height;
                                imgItem.default.height = Math.round(imgItem.default.height * scaleY);
                                imgItem.crop.height = Math.round(imgItem.crop.height * scaleY);
                                imgItem.crop.offsetTop = Math.round(imgItem.crop.offsetTop * scaleY);
                                imgItem.default.top = row + changeSize - imgItem.crop.offsetTop;
                            }
                            else if(imgItemParam.top + imgItemParam.height > row + changeSize){
                                let scaleY = (row + changeSize - imgItemParam.top) / imgItemParam.height;
                                imgItem.default.height = Math.round(imgItem.default.height * scaleY);
                                imgItem.crop.height = Math.round(imgItem.crop.height * scaleY);
                                imgItem.crop.offsetTop = Math.round(imgItem.crop.offsetTop * scaleY);
                            }
                        }
                    }
                }
                else if(type == "2"){
                    if(imgItemParam.top >= row){
                        imgItem.default.top = imgItemParam.top + changeSize - imgItem.crop.offsetTop;
                    }
                    else if(imgItemParam.top > row + changeSize){
                        imgItem.default.top = row + changeSize - imgItem.crop.offsetTop;
                    }
                }
            }
        }
        else if(rc == "column"){
            let col = Store.visibledatacolumn[index], 
                col_pre = index - 1 == -1 ? 0 : Store.visibledatacolumn[index - 1];
            let changeSize = size - (col - col_pre - 1);

            for(let imgId in images){
                let imgItem = images[imgId];
                let imgItemParam = _this.getImgItemParam(imgItem);
                let type = imgItem.type;

                if(type == "1"){
                    if(imgItemParam.left >= col){
                        imgItem.default.left = imgItemParam.left + changeSize - imgItem.crop.offsetLeft;
                    }
                    else{
                        if(imgItemParam.left + imgItemParam.width >= col-2){
                            if(imgItemParam.left < col + changeSize){
                                let scaleX = (imgItemParam.width + changeSize) / imgItemParam.width;
                                imgItem.default.width = Math.round(imgItem.default.width * scaleX);
                                imgItem.crop.width = Math.round(imgItem.crop.width * scaleX);
                                imgItem.crop.offsetLeft = Math.round(imgItem.crop.offsetLeft * scaleX);
                            }
                            else{
                                let scaleX = (imgItemParam.left + imgItemParam.width - col) / imgItemParam.width;
                                imgItem.default.width = Math.round(imgItem.default.width * scaleX);
                                imgItem.crop.width = Math.round(imgItem.crop.width * scaleX);
                                imgItem.crop.offsetLeft = Math.round(imgItem.crop.offsetLeft * scaleX);
                                imgItem.default.left = col + changeSize - imgItem.crop.offsetLeft;
                            }
                        }
                        else{
                            if(imgItemParam.left > col + changeSize){
                                let scaleX = 1 / imgItemParam.width;
                                imgItem.default.width = Math.round(imgItem.default.width * scaleX);
                                imgItem.crop.width = Math.round(imgItem.crop.width * scaleX);
                                imgItem.crop.offsetLeft = Math.round(imgItem.crop.offsetLeft * scaleX);
                                imgItem.default.left = col + changeSize - imgItem.crop.offsetLeft;
                            }
                            else if(imgItemParam.left + imgItemParam.width > col + changeSize){
                                let scaleX = (col + changeSize - imgItemParam.left) / imgItemParam.width;
                                imgItem.default.width = Math.round(imgItem.default.width * scaleX);
                                imgItem.crop.width = Math.round(imgItem.crop.width * scaleX);
                                imgItem.crop.offsetLeft = Math.round(imgItem.crop.offsetLeft * scaleX);
                            }
                        }
                    }
                }
                else if(type == "2"){
                    if(imgItemParam.left >= col){
                        imgItem.default.left = imgItemParam.left + changeSize - imgItem.crop.offsetLeft;
                    }
                    else if(imgItemParam.left > col + changeSize){
                        imgItem.default.left = col + changeSize - imgItem.crop.offsetLeft;
                    }
                }
            }
        }

        return images;
    },
    ref: function() {
        let _this = this;

        let file = getCurrentFile();
        let images = _this.images;

        if (Store.clearjfundo) {
            Store.jfundo.length  = 0;

            Store.jfredo.push({
                "type": "imageCtrl",
                "sheetIndex": Store.currentSheetIndex,
                "images": file.images == null ? null : structuredClone(file.images),
                "curImages": images
            });
        }

        file.images = structuredClone(images);
    },
}

export default imageCtrl;
