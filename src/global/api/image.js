import imageCtrl from "../../controllers/imageCtrl";
import Store from "../../store";
import { getObjType } from "../../utils/util";
import { getCurrentSheetOrder, getLastSelection, getFocusCell } from '../../utils/storeAccess.js';
import tooltip from "../tooltip";
import imageDialog from "../../ui/imageDialog.js";

export function insertImage(src, options = {}){
    let {
        order = getCurrentSheetOrder(),
        rowIndex,
        colIndex,
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    if(file.index == Store.currentSheetIndex){
        let last = getLastSelection();
        let _focus = getFocusCell();

        if(rowIndex == null){
            rowIndex = _focus.row || 0;
        }

        if(rowIndex < 0){
            rowIndex = 0;
        }

        if(rowIndex > Store.visibleRowPositions.length){
            rowIndex = Store.visibleRowPositions.length;
        }

        if(colIndex == null){
            colIndex = _focus.col || 0;
        }

        if(colIndex < 0){
            colIndex = 0;
        }

        if(colIndex > Store.visibleColPositions.length){
            colIndex = Store.visibleColPositions.length;
        }

        let left = colIndex == 0 ? 0 : Store.visibleColPositions[colIndex - 1];
        let top = rowIndex == 0 ? 0 : Store.visibleRowPositions[rowIndex - 1];

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

            imageCtrl.addImgItem(img);

            if (success && typeof success === 'function') {
                success();
            }
        }
        image.src = src;
    }
    else {
        let images = file.images || {};
        let config = file.config;
        let zoomRatio = file.zoomRatio || 1;

        let rowheight = file.row;
        let visibledatarow = file.visibledatarow || [];
        if(visibledatarow.length === 0){
            let rh_height = 0;

            for (let r = 0; r < rowheight; r++) {
                let rowlen = Store.defaultrowlen;

                if (config["rowlen"] != null && config["rowlen"][r] != null) {
                    rowlen = config["rowlen"][r];
                }

                if (config["rowhidden"] != null && config["rowhidden"][r] != null) {
                    visibledatarow.push(rh_height);
                    continue;
                }

                rh_height += Math.round((rowlen + 1) * zoomRatio);

                visibledatarow.push(rh_height); //行的临时长度分布
            }
        }

        let colwidth = file.column;
        let visibledatacolumn = file.visibledatacolumn || [];
        if(visibledatacolumn.length === 0){
            let ch_width = 0;

            for (let c = 0; c < colwidth; c++) {
                let firstcolumnlen = Store.defaultcollen;

                if (config["columnlen"] != null && config["columnlen"][c] != null) {
                    firstcolumnlen = config["columnlen"][c];
                }

                if(config["colhidden"] != null && config["colhidden"][c] != null){
                    visibledatacolumn.push(ch_width);
                    continue;
                }

                ch_width += Math.round((firstcolumnlen + 1)*zoomRatio);

                visibledatacolumn.push(ch_width);//列的临时长度分布
            }
        }

        if(rowIndex == null){
            rowIndex = 0;
        }

        if(rowIndex < 0){
            rowIndex = 0;
        }

        if(rowIndex > visibledatarow.length){
            rowIndex = visibledatarow.length;
        }

        if(colIndex == null){
            colIndex = 0;
        }

        if(colIndex < 0){
            colIndex = 0;
        }

        if(colIndex > visibledatacolumn.length){
            colIndex = visibledatacolumn.length;
        }

        let left = colIndex == 0 ? 0 : visibledatacolumn[colIndex - 1];
        let top = rowIndex == 0 ? 0 : visibledatarow[rowIndex - 1];

        let image = new Image();
        image.onload = function(){
            let img = {
                src: src,
                left: left,
                top: top,
                originWidth: image.width,
                originHeight: image.height
            }

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

            let imgItem = structuredClone(imageCtrl.imgItem);
            imgItem.src = img.src;
            imgItem.originWidth = img.originWidth;
            imgItem.originHeight = img.originHeight;
            imgItem.default.width = width;
            imgItem.default.height = height;
            imgItem.default.left = img.left;
            imgItem.default.top = img.top;
            imgItem.crop.width = width;
            imgItem.crop.height = height;

            let id = imageCtrl.generateRandomId();
            images[id] = imgItem;

            file.images = images;

            if (success && typeof success === 'function') {
                success();
            }
        }
        image.src = src;
    }
}

export function deleteImage(options = {}){
    let {
        order = getCurrentSheetOrder(),
        idList = 'all',
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let images = file.images;

    if(images == null){
        return tooltip.info("The worksheet has no pictures to delete.", "");
    }

    if(idList != 'all' && getObjType(idList) != 'array'){
        return tooltip.info("The idList parameter is invalid.", "");
    }

    if(getObjType(idList) == 'array'){
        idList.forEach(item => {
            delete images[item];
        })
    }
    else {
        images = null;
    }

    file.images = images;

    if(file.index == Store.currentSheetIndex){
        if(imageCtrl.currentImgId != null && (idList == 'all' || idList.includes(imageCtrl.currentImgId))){
            imageDialog.active.hide();
            imageDialog.cropping.hide();
            imageDialog.slider.hide();
        }

        imageCtrl.images = images;
        imageCtrl.allImagesShow();
        imageCtrl.init();
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function getImageOption(options = {}){
    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    setTimeout(function(){
        if (success && typeof success === 'function') {
            success();
        }
    }, 1)

    return file.images;
}
