import numeral from 'numeral';

function luckysheet_getarraydata() {
    let fp = arguments[0];

    fp = fp.replace("{", "").replace("}", "").replace(/"/g, '');

    let arr = [];

    if(fp.indexOf(";") > -1){
        arr = fp.split(";");

        for(let i = 0; i < arr.length; i++){
            arr[i] = arr[i].split(",");
        }
    }
    else{
        arr = fp.split(",");
    }

    return arr;
}

function luckysheet_calcADPMM(fp, sp, tp){
    let value;
    if(sp=="+"){
        value = numeral(fp).add(tp).value();
    }
    else if(sp=="-"){
        value = numeral(fp).subtract(tp).value();
    }
    else if(sp=="%"){
        value = new Function("return " + parseFloat(fp) + sp + "(" + parseFloat(tp) + ")" )();
    }
    else if(sp=="/"){
        value = numeral(fp).divide(tp).value();
    }
    else if(sp=="*"){
        value = numeral(fp).multiply(tp).value();
    }
    return value;
}

export { luckysheet_getarraydata, luckysheet_calcADPMM };
