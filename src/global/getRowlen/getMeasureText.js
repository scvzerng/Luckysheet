import {luckysheetfontformat} from '../../utils/util';
import menuButton from '../../controllers/menuButton';
import {checkstatusByCell} from '../../global/getdata';
import {colLocationByIndex,colSpanLocationByIndex} from '../../global/location';
import {checkWordByteLength, hasChinaword, isRealNull} from '../../global/validate';
import {isInlineStringCell} from '../../controllers/inlineString';
import Store from '../../store';

function getMeasureText(value, ctx, fontset){

    let mtc = Store.measureTextCache[value + "_" + ctx.font];
    if(fontset!=null){
        mtc = Store.measureTextCache[value + "_" + fontset];
    }

    if(mtc != null){
        return mtc;
    }
    else{
        if(fontset!=null){
            let preFont = ctx.font;
            ctx.font = fontset;
        }

        let measureText = ctx.measureText(value), cache = {};
        // var regu = "^[ ]+$";
        // var re = new RegExp(regu);
        // if(measureText.actualBoundingBoxRight==null || re.test(value)){
        //     cache.width = measureText.width;
        // }
        // else{
        //     //measureText.actualBoundingBoxLeft +
        //     cache.width = measureText.actualBoundingBoxRight;
        // }

        cache.width = measureText.width;

        if(fontset!=null){
            ctx.font = fontset;
        }

        cache.actualBoundingBoxDescent = measureText.actualBoundingBoxDescent;
        cache.actualBoundingBoxAscent = measureText.actualBoundingBoxAscent;
        if(cache.actualBoundingBoxDescent==null || cache.actualBoundingBoxAscent==null || isNaN(cache.actualBoundingBoxDescent) || isNaN(cache.actualBoundingBoxAscent)){
            let commonWord = "M"
            if(hasChinaword(value)){
                commonWord = "田";
            }
            let oneLineTextHeight = menuButton.getTextSize(commonWord, ctx.font)[1]*0.8;
            if(ctx.textBaseline=="top"){
                cache.actualBoundingBoxDescent = oneLineTextHeight;
                cache.actualBoundingBoxAscent = 0;
            }
            else if(ctx.textBaseline=="middle"){
                cache.actualBoundingBoxDescent = oneLineTextHeight/2;
                cache.actualBoundingBoxAscent = oneLineTextHeight/2;
            }
            else{
                cache.actualBoundingBoxDescent = 0;
                cache.actualBoundingBoxAscent = oneLineTextHeight;
            }

            //console.log(value, oneLineTextHeight, measureText.actualBoundingBoxDescent+measureText.actualBoundingBoxAscent,ctx.font);
        }

        if(ctx.textBaseline == 'alphabetic'){
            let descText = "gjpqy", matchText="abcdABCD";
            let descTextMeasure = Store.measureTextCache[descText + "_" + ctx.font];
            if(fontset!=null){
                descTextMeasure = Store.measureTextCache[descText + "_" + fontset];
            }

            let matchTextMeasure = Store.measureTextCache[matchText + "_" + ctx.font];
            if(fontset!=null){
                matchTextMeasure = Store.measureTextCache[matchText + "_" + fontset];
            }

            if(descTextMeasure == null){
                descTextMeasure = ctx.measureText(descText);
            }

            if(matchTextMeasure == null){
                matchTextMeasure = ctx.measureText(matchText);
            }

            if(cache.actualBoundingBoxDescent<=matchTextMeasure.actualBoundingBoxDescent){
                cache.actualBoundingBoxDescent = descTextMeasure.actualBoundingBoxDescent;
                if(cache.actualBoundingBoxDescent==null){
                    cache.actualBoundingBoxDescent = 0;
                }
            }


        }

        cache.width *= Store.zoomRatio;
        cache.actualBoundingBoxDescent *= Store.zoomRatio;
        cache.actualBoundingBoxAscent *= Store.zoomRatio;
        Store.measureTextCache[value + "_" + Store.zoomRatio +  "_" + ctx.font] = cache;
        // console.log(measureText, value);
        return cache;
    }
}

export { getMeasureText };
