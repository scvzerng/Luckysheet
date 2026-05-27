function isSupportBoundingBox(ctx){
    let measureText = ctx.measureText("田");
    if(measureText.actualBoundingBoxAscent==null){
        return false;
    }
    return true;
}

export { isSupportBoundingBox };
