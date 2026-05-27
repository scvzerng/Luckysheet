

function getNowDateTime(format) {
    let now = new Date();
    let year = now.getFullYear(); //得到年份
    let month = now.getMonth(); //得到月份
    let date = now.getDate(); //得到日期
    let day = now.getDay(); //得到周几
    let hour = now.getHours(); //得到小时
    let minu = now.getMinutes(); //得到分钟
    let sec = now.getSeconds(); //得到秒

    month = month + 1;
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    if (hour < 10) hour = "0" + hour;
    if (minu < 10) minu = "0" + minu;
    if (sec < 10) sec = "0" + sec;

    let time = "";

    //日期
    if (format == 1) {
        time = year + "-" + month + "-" + date;
    }
    //日期时间
    else if (format == 2) {
        time = year + "-" + month + "-" + date + " " + hour + ":" + minu + ":" + sec;
    }

    return time;
}

export { getNowDateTime };
