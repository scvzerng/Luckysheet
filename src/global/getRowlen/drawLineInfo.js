function drawLineInfo(wordGroup, cancelLine,underLine,option){
    let left = option.left, top = option.top, width=option.width, height = option.height, asc = option.asc,desc = option.desc,fs = option.fs;

    if(wordGroup.wrap===true){
        return;
    }

    if(wordGroup.inline==true && wordGroup.style!=null){
        cancelLine = wordGroup.style.cl;
        underLine = wordGroup.style.un;
    }

    if(cancelLine!="0"){
        wordGroup.cancelLine = {};
        wordGroup.cancelLine.startX = left;
        wordGroup.cancelLine.startY = top-asc/2+1;

        wordGroup.cancelLine.endX = left + width;
        wordGroup.cancelLine.endY = top-asc/2+1;

        wordGroup.cancelLine.fs = fs;

    }

    if(underLine!="0"){
         wordGroup.underLine = [];
         if(underLine=="1" || underLine=="2"){
            let item = {};
            item.startX = left;
            item.startY = top + 3;

            item.endX = left + width;
            item.endY = top + 3;

            item.fs = fs;

            wordGroup.underLine.push(item);
         }

         if(underLine=="2"){
            let item = {};
            item.startX = left;
            item.startY = top+desc;

            item.endX = left + width;
            item.endY = top+desc;

            item.fs = fs;

            wordGroup.underLine.push(item);
         }

         if(underLine=="3" || underLine=="4"){
            let item = {};
            item.startX = left;
            item.startY = top+desc;

            item.endX = left + width;
            item.endY = top+desc;

            item.fs = fs;

            wordGroup.underLine.push(item);
         }

         if(underLine=="4"){
            let item = {};
            item.startX = left;
            item.startY = top+desc+2;

            item.endX = left + width;
            item.endY = top+desc+2;

            item.fs = fs;

            wordGroup.underLine.push(item);
         }
    }
}

export { drawLineInfo };
