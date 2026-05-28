import {  columeHeader_word } from '../../controllers/constant';

function ABCatNum(a) {
    // abc = abc.toUpperCase();

    // let abc_len = abc.length;
    // if (abc_len == 0) {
    //     return NaN;
    // }

    // let abc_array = abc.split("");
    // let wordlen = columeHeader_word.length;
    // let ret = 0;

    // for (let i = abc_len - 1; i >= 0; i--) {
    //     if (i == abc_len - 1) {
    //         ret += columeHeader_word_index[abc_array[i]];
    //     }
    //     else {
    //         ret += Math.pow(wordlen, abc_len - i - 1) * (columeHeader_word_index[abc_array[i]] + 1);
    //     }
    // }

    // return ret;
    if (a == null || a.length == 0) {
        return NaN;
    }
    var str = a.toLowerCase().split("");
    var num = 0;
    var al = str.length;
    var getCharNumber = function(charx) {
        return charx.charCodeAt() - 96;
    };
    var numout = 0;
    var charnum = 0;
    for (var i = 0; i < al; i++) {
        charnum = getCharNumber(str[i]);
        numout += charnum * Math.pow(26, al - i - 1);
    }
    // console.log(a, numout-1);
    if (numout == 0) {
        return NaN;
    }
    return numout - 1;
}

function chatatABC(n) {
    // let wordlen = columeHeader_word.length;

    // if (index < wordlen) {
    //     return columeHeader_word[index];
    // }
    // else {
    //     let last = 0, pre = 0, ret = "";
    //     let i = 1, n = 0;

    //     while (index >= (wordlen / (wordlen - 1)) * (Math.pow(wordlen, i++) - 1)) {
    //         n = i;
    //     }

    //     let index_ab = index - (wordlen / (wordlen - 1)) * (Math.pow(wordlen, n - 1) - 1);//970
    //     last = index_ab + 1;

    //     for (let x = n; x > 0; x--) {
    //         let last1 = last, x1 = x;//-702=268, 3

    //         if (x == 1) {
    //             last1 = last1 % wordlen;

    //             if (last1 == 0) {
    //                 last1 = 26;
    //             }

    //             return ret + columeHeader_word[last1 - 1];
    //         }

    //         last1 = Math.ceil(last1 / Math.pow(wordlen, x - 1));
    //         //last1 = last1 % wordlen;
    //         ret += columeHeader_word[last1 - 1];

    //         if (x > 1) {
    //             last = last - (last1 - 1) * wordlen;
    //         }
    //     }
    // }

    var orda = "a".charCodeAt(0);

    var ordz = "z".charCodeAt(0);

    var len = ordz - orda + 1;

    var s = "";

    while (n >= 0) {
        s = String.fromCharCode((n % len) + orda) + s;

        n = Math.floor(n / len) - 1;
    }

    return s.toUpperCase();
}

function ceateABC(index) {
    let wordlen = columeHeader_word.length;

    if (index < wordlen) {
        return columeHeader_word;
    } else {
        let relist = [];
        let i = 2,
            n = 0;

        while (index < (wordlen / (wordlen - 1)) * (Math.pow(wordlen, i) - 1)) {
            n = i;
            i++;
        }

        for (let x = 0; x < n; x++) {
            if (x == 0) {
                relist = relist.concat(columeHeader_word);
            } else {
                relist = relist.concat(createABCdim(x), index);
            }
        }
    }
}

function createABCdim(x, count) {
    let chwl = columeHeader_word.length;

    if (x == 1) {
        let ret = [];
        let c = 0,
            con = true;

        for (let i = 0; i < chwl; i++) {
            let b = columeHeader_word[i];

            for (let n = 0; n < chwl; n++) {
                let bq = b + columeHeader_word[n];
                ret.push(bq);
                c++;

                if (c > index) {
                    return ret;
                }
            }
        }
    } else if (x == 2) {
        let ret = [];
        let c = 0,
            con = true;

        for (let i = 0; i < chwl; i++) {
            let bb = columeHeader_word[i];

            for (let w = 0; w < chwl; w++) {
                let aa = columeHeader_word[w];

                for (let n = 0; n < chwl; n++) {
                    let bqa = bb + aa + columeHeader_word[n];
                    ret.push(bqa);
                    c++;

                    if (c > index) {
                        return ret;
                    }
                }
            }
        }
    }
}

export { ABCatNum, chatatABC, ceateABC, createABCdim };
