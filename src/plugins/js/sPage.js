function sPage(element, options) {
    this.element = element;
    this.settings = Object.assign({}, sPage.defaults, options);
    this.pageNum = 1;
    this.pageList = [];
    this.pageTatol = 0;
    this.init();
}

sPage.defaults = {
    page: 1,
    pageSize: 200,
    total: 0,
    showTotal: false,
    totalTxt: '',
    noData: false,
    showSkip: false,
    showPN: true,
    prevPage: "上一页",
    nextPage: "下一页",
    fastForward: 0,
    selectOption: [],
    backFun: function () {}
};

sPage.prototype.init = function () {
    this.element.innerHTML = '';
    this.viewHtml();
    this.clickBtn();
};

sPage.prototype.creatHtml = function (t) {
    if (t == this.settings.page) {
        this.pageList.push('<button class="active" data-page=' + t + ">" + t + "</button>");
    } else {
        this.pageList.push("<button data-page=" + t + ">" + t + "</button>");
    }
};

sPage.prototype.viewHtml = function () {
    var t = this.settings;
    var e = 0;
    var a = [];

    if (t.total > 0) {
        e = Math.ceil(t.total / t.pageSize);
    } else {
        if (t.noData) {
            e = 1;
            t.page = 1;
            t.total = 0;
        } else {
            return;
        }
    }

    this.pageTatol = e;
    this.pageNum = t.page;

    if (t.showTotal) {
        a.push('<div class="spage-total">' + t.totalTxt + "</div>");
    }
    a.push('<div class="spage-number">');
    this.pageList = [];

    if (t.showPN) {
        if (t.page == 1) {
            this.pageList.push('<button class="button-disabled" data-page="prev"><i class="prevBtn"></i></button>');
        } else {
            this.pageList.push('<button data-page="prev"><i class="prevBtn"></i></button>');
        }
    }

    if (e <= 6) {
        for (var s = 1; s < e + 1; s++) {
            this.creatHtml(s);
        }
    } else {
        if (t.page < 3) {
            for (var s = 1; s <= 3; s++) {
                this.creatHtml(s);
            }
            this.pageList.push('<button data-page="after" class="spage-after">...</button><button data-page=' + e + ">" + e + "</button>");
        } else if (t.page > e - 3) {
            this.pageList.push('<button data-page="1">1</button><button data-page="before" class="spage-before">...</button>');
            for (var s = e - 3; s <= e; s++) {
                this.creatHtml(s);
            }
        } else {
            this.pageList.push('<button data-page="1">1</button>');
            if (t.page > 3) {
                this.pageList.push('<button data-page="before" class="spage-before">...</button>');
            }
            for (var s = t.page - 1; s <= Number(t.page) + 1; s++) {
                this.creatHtml(s);
            }
            if (t.page <= e - 3) {
                this.pageList.push('<button data-page="after" class="spage-after">...</button>');
            }
            this.pageList.push('<button data-page=' + e + ">" + e + "</button>");
        }
    }

    if (t.showPN) {
        if (t.page == e) {
            this.pageList.push('<button class="button-disabled" data-page="next"><i class="nextBtn"></i></button>');
        } else {
            this.pageList.push('<button data-page="next"><i class="nextBtn"></i></button>');
        }
    }

    a.push(this.pageList.join(""));
    a.push("</div>");

    if (t.selectOption.length > 0) {
        var str = '<select class="selectNum" id="selectNum">';
        for (var i = 0; i <= t.selectOption.length - 1; i++) {
            str += '<option value=' + t.selectOption[i] + ' ';
            if (t.pageSize === t.selectOption[i]) {
                str += 'selected' + '>' + t.selectOption[i] + '行/页</option>';
            } else {
                str += '>' + t.selectOption[i] + '行/页</option>';
            }
        }
        str += '</select>';
        a.push(str);
    }

    if (t.showSkip) {
        a.push('<div class="spage-skip">跳至&nbsp;<input type="text" class="luckysheet-mousedown-cancel" value="' + t.page + '"/>&nbsp;页&nbsp;&nbsp;</div>');
    }

    this.element.innerHTML = a.join("");
};

sPage.prototype.clickBtn = function () {
    var a = this;
    var s = this.settings;
    var n = this.pageTatol;

    this.element.addEventListener('change', function (e) {
        if (e.target.tagName === 'SELECT') {
            var value = parseInt(document.getElementById('selectNum').value);
            s.pageSize = value;
            s.page = 1;
            a.element.innerHTML = '';
            a.viewHtml();
            a.clickBtn();
            s.backFun(s);
        }
    });

    this.element.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        var t = btn.dataset.page;
        if (t === undefined) return;

        switch (t) {
            case "prev":
                s.page = s.page - 1 >= 1 ? s.page - 1 : 1;
                t = s.page;
                break;
            case "next":
                s.page = Number(s.page) + 1 <= n ? Number(s.page) + 1 : n;
                t = s.page;
                break;
            case "before":
                s.page = s.page - s.fastForward >= 1 ? s.page - s.fastForward : 1;
                t = s.page;
                break;
            case "after":
                s.page = Number(s.page) + Number(s.fastForward) <= n ? Number(s.page) + Number(s.fastForward) : n;
                t = s.page;
                break;
            case "go":
                var input = a.element.querySelector("input");
                var ev = parseInt(input.value);
                if (/^[0-9]*$/.test(ev) && ev >= 1 && ev <= n) {
                    s.page = ev;
                    t = ev;
                } else {
                    return;
                }
                break;
            default:
                s.page = t;
        }

        if (t == a.pageNum) {
            return;
        }

        a.pageNum = s.page;
        a.element.innerHTML = '';
        a.viewHtml();
        a.clickBtn();
        s.backFun(s);
    });

    this.element.addEventListener('keyup', function (e) {
        if (e.target.tagName === 'INPUT' && e.keyCode == 13) {
            var ev = parseInt(e.target.value);
            if (/^[0-9]*$/.test(ev) && ev >= 1 && ev <= n && ev != a.pageNum) {
                s.page = ev;
                a.pageNum = ev;
                a.element.innerHTML = '';
                a.viewHtml();
                a.clickBtn();
                s.backFun(s);
            }
        }
    });

    if (s.fastForward > 0) {
        this.element.addEventListener('mouseenter', function (e) {
            var btn = e.target.closest('.spage-after');
            if (btn) btn.innerHTML = "&raquo;";
            var btn2 = e.target.closest('.spage-before');
            if (btn2) btn2.innerHTML = "&laquo;";
        }, true);
        this.element.addEventListener('mouseleave', function (e) {
            var btn = e.target.closest('.spage-after');
            if (btn) btn.innerHTML = "...";
            var btn2 = e.target.closest('.spage-before');
            if (btn2) btn2.innerHTML = "...";
        }, true);
    }
};

export default sPage;
