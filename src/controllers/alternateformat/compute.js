import Store from '../../store';
import { getSheetIndex } from '../../methods/get';

function checksAF(r, c, computeMap) {
        if((r + "_" + c) in computeMap){
            //返回值（fc  bc）
            return computeMap[r + "_" + c];
        }
        else{
            return null;
        }
}

function compute(obj) {
        //计算存储
        let computeMap = {};

        if(obj != null && obj.length > 0){
            for(let i = 0; i < obj.length; i++){
                let cellrange = obj[i]["cellrange"];
                let format = obj[i]["format"];
                let hasRowHeader = obj[i]["hasRowHeader"];
                let hasRowFooter = obj[i]["hasRowFooter"];
                let st_r = cellrange["row"][0], 
                    ed_r = cellrange["row"][1], 
                    st_c = cellrange["column"][0], 
                    ed_c = cellrange["column"][1];
                
                if(hasRowHeader && hasRowFooter){
                    //页眉所在行
                    for(let c = st_c; c <= ed_c; c++){
                        computeMap[st_r + "_" + c] = [format["head"].fc, format["head"].bc];
                    }

                    //中间行
                    if(ed_r - st_r > 1){
                        for(let r = st_r + 1; r < ed_r; r++){
                            let fc, bc;
                            if((r - st_r) % 2 != 0){
                                fc = format["one"].fc;
                                bc = format["one"].bc;
                            }
                            else{
                                fc = format["two"].fc;
                                bc = format["two"].bc;
                            }

                            for(let c = st_c; c <= ed_c; c++){
                                computeMap[r + "_" + c] = [fc, bc];
                            } 
                        }
                    }

                    //页脚所在行
                    if(ed_r > st_r){
                        for(let c = st_c; c <= ed_c; c++){
                            computeMap[ed_r + "_" + c] = [format["foot"].fc, format["foot"].bc];
                        }
                    }
                }
                else if(hasRowHeader){
                    //页眉所在行
                    for(let c = st_c; c <= ed_c; c++){
                        computeMap[st_r + "_" + c] = [format["head"].fc, format["head"].bc];
                    }

                    //中间行
                    if(ed_r > st_r){
                        for(let r = st_r + 1; r <= ed_r; r++){
                            let fc, bc;
                            if((r - st_r) % 2 != 0){
                                fc = format["one"].fc;
                                bc = format["one"].bc;
                            }
                            else{
                                fc = format["two"].fc;
                                bc = format["two"].bc;
                            }

                            for(let c = st_c; c <= ed_c; c++){
                                computeMap[r + "_" + c] = [fc, bc];
                            } 
                        }
                    }
                }
                else if(hasRowFooter){
                    //中间行
                    if(ed_r > st_r){
                        for(let r = st_r; r < ed_r; r++){
                            let fc, bc;
                            if((r - st_r) % 2 == 0){
                                fc = format["one"].fc;
                                bc = format["one"].bc;
                            }
                            else{
                                fc = format["two"].fc;
                                bc = format["two"].bc;
                            }

                            for(let c = st_c; c <= ed_c; c++){
                                computeMap[r + "_" + c] = [fc, bc];
                            }
                        }
                    }

                    //页脚所在行
                    for(let c = st_c; c <= ed_c; c++){
                        computeMap[ed_r + "_" + c] = [format["foot"].fc, format["foot"].bc];
                    }
                }
                else{
                    //中间行
                    for(let r = st_r; r <= ed_r; r++){
                        let fc, bc;
                        if((r - st_r) % 2 == 0){
                            fc = format["one"].fc;
                            bc = format["one"].bc;
                        }
                        else{
                            fc = format["two"].fc;
                            bc = format["two"].bc;
                        }

                        for(let c = st_c; c <= ed_c; c++){
                            computeMap[r + "_" + c] = [fc, bc];
                        } 
                    }
                }
            }
        }

        return computeMap;
}

function getComputeMap() {
    let file = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
    let ruleArr = file["luckysheet_alternateformat_save"];
    let computeMap = compute(ruleArr);
    return computeMap;
}

export { checksAF, compute, getComputeMap };
