import sheetmanage from "../../controllers/sheetmanage";

export function transToCellData(data, options = {}){
    let {
        success
    } = {...options}

    setTimeout(()=>{
        if (success && typeof success === 'function') {
            success();
        }
    },0)

    return sheetmanage.getGridData(data)
}

export function transToData(celldata, options = {}){
    let {
        success
    } = {...options}

    setTimeout(()=>{
        if (success && typeof success === 'function') {
            success();
        }
    },0)

    return sheetmanage.buildGridData({
        celldata: celldata
    })
}
