import filterState from './filterState';

let submenuhide = null;
let rightclickmenu = null;

function slideToggle(el, duration) {
    if (!el) return;
    if (el.offsetHeight > 0) {
        slideUp(el, duration);
    } else {
        slideDown(el, duration);
    }
}

function slideUp(el, duration) {
    if (!el || el.offsetHeight === 0) return;
    el.style.overflow = 'hidden';
    el.style.height = el.offsetHeight + 'px';
    el.offsetHeight;
    el.style.transition = 'height ' + duration + 'ms ease';
    el.style.height = '0px';
    setTimeout(() => {
        el.style.display = 'none';
        el.style.transition = '';
        el.style.height = '';
        el.style.overflow = '';
    }, duration);
}

function slideDown(el, duration) {
    if (!el) return;
    el.style.display = '';
    el.style.overflow = 'hidden';
    el.style.height = '0px';
    el.offsetHeight;
    el.style.transition = 'height ' + duration + 'ms ease';
    el.style.height = el.scrollHeight + 'px';
    setTimeout(() => {
        el.style.transition = '';
        el.style.height = '';
        el.style.overflow = '';
    }, duration);
}

export function filterMenuEvents() {
    document.querySelectorAll(".luckysheet-cols-menu .luckysheet-cols-submenu").forEach(el => {
        el.addEventListener("mouseenter", function () {
            let t = this, attrid = t.getAttribute("id"), attr = document.getElementById(attrid + "_sub"), con = t.parentElement;
            let winW = document.documentElement.clientWidth, winH = document.documentElement.clientHeight;
            let menuW = con.offsetWidth, attrH = attr ? attr.offsetHeight + 25 : 0, attrW = attr ? attr.offsetWidth + 5 : 0;
            let tRect = t.getBoundingClientRect();
            let offsetTop = tRect.top + window.pageYOffset,
                offsetLeft = tRect.left + window.pageXOffset;
            let top = offsetTop, left = offsetLeft + menuW;

            if (left + attrW > winW) {
                left = offsetLeft - attrW;
            }

            if (top + attrH > winH) {
                top = winH - attrH;
            }

            if (attr) {
                attr.style.top = top + 'px';
                attr.style.left = left + 'px';
                attr.style.display = '';
            }
            rightclickmenu = t;
        });
        el.addEventListener("mouseleave", function () {
            let t = this, attrid = t.getAttribute("id"), attr = document.getElementById(attrid + "_sub");
            submenuhide = setTimeout(function () { if (attr) attr.style.display = 'none'; }, 200);
        });
    });

    document.querySelectorAll(".luckysheet-rightglick-menu-sub").forEach(el => {
        el.addEventListener("mouseenter", function () {
            if (rightclickmenu) rightclickmenu.classList.add("luckysheet-cols-menuitem-hover");
            clearTimeout(submenuhide);
        });
        el.addEventListener("mouseleave", function () {
            if (rightclickmenu) rightclickmenu.classList.remove("luckysheet-cols-menuitem-hover");
            this.style.display = 'none';
        });
    });

    const filterMenu = document.getElementById("luckysheet-filter-menu");
    if (filterMenu) {
        filterMenu.addEventListener("mouseover", function () {
            clearTimeout(filterState.hidefilersubmenu);

            filterState.hidefilersubmenu = setTimeout(function () {
                const submenu = document.getElementById("luckysheet-filter-submenu");
                if (submenu) submenu.style.display = 'none';
            }, 500);
        });
    }

    const filterSubmenu = document.getElementById("luckysheet-filter-submenu");
    if (filterSubmenu) {
        filterSubmenu.addEventListener("mouseover", function () {
            clearTimeout(filterState.hidefilersubmenu);
        });
        filterSubmenu.querySelectorAll(".luckysheet-cols-menuitem").forEach(item => {
            item.addEventListener("click", function (e) {
                const selectedSpan = document.querySelector("#luckysheet-filter-selected span");
                const contentEl = this.querySelector(".luckysheet-cols-menuitem-content");
                if (selectedSpan) {
                    selectedSpan.innerHTML = contentEl ? contentEl.textContent : '';
                    selectedSpan.dataset.value = this.dataset.value;
                }
                document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input").forEach(el => { el.style.display = 'none'; });

                let type = this.dataset.type;
                let value = this.getAttribute("data-value");

                if (type == "2") {
                    if (selectedSpan) selectedSpan.dataset.type = "2";
                    const input2 = document.querySelector("#luckysheet-filter-menu .luckysheet-filter-selected-input2");
                    if (input2) input2.style.display = '';
                    document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input input").forEach(input => { input.type = "number"; });
                }
                else if (type == "0") {
                    if (selectedSpan) selectedSpan.dataset.type = "0";
                }
                else {
                    if (selectedSpan) selectedSpan.dataset.type = "1";
                    const firstInput = document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input")[0];
                    if (firstInput) firstInput.style.display = '';

                    if(value == "dateequal" || value == "datelessthan" || value == "datemorethan"){
                        document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input input").forEach(input => { input.type = "date"; });
                    }
                    else if(value == "morethan" || value == "moreequalthan" || value == "lessthan" || value == "lessequalthan" || value == "equal" || value == "noequal"){
                        document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input input").forEach(input => { input.type = "number"; });
                    }
                    else{
                        document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input input").forEach(input => { input.type = "text"; });
                    }
                }

                const byvalue = document.getElementById("luckysheet-filter-byvalue");
                if (byvalue && byvalue.nextElementSibling) slideUp(byvalue.nextElementSibling, 200);
                const submenuEl = document.getElementById("luckysheet-filter-submenu");
                if (submenuEl) submenuEl.style.display = 'none';
            });
        });
    }

    const bycondition = document.getElementById("luckysheet-filter-bycondition");
    const byvalue = document.getElementById("luckysheet-filter-byvalue");
    [bycondition, byvalue].forEach(el => {
        if (!el) return;
        el.addEventListener("click", function () {
            let t = this;
            if (t.nextElementSibling) slideToggle(t.nextElementSibling, 200);

            setTimeout(function () {
                if (t.getAttribute("id") == "luckysheet-filter-bycondition" && bycondition && bycondition.nextElementSibling && bycondition.nextElementSibling.offsetWidth > 0) {
                    const selectedSpan = document.querySelector("#luckysheet-filter-selected span");
                    if (selectedSpan && selectedSpan.textContent != filterState.locale_filter.filiterInputNone) {
                        if (byvalue && byvalue.nextElementSibling) slideUp(byvalue.nextElementSibling, 200);
                    }
                }

                if (t === bycondition) {
                    if (bycondition && bycondition.nextElementSibling && bycondition.nextElementSibling.offsetWidth === 0 && byvalue && byvalue.nextElementSibling && byvalue.nextElementSibling.offsetWidth === 0) {
                        slideDown(byvalue.nextElementSibling, 200);
                    }
                }
            }, 300);
        });
    });

    const filterSelected = document.getElementById("luckysheet-filter-selected");
    if (filterSelected) {
        filterSelected.addEventListener("click", function () {
            let t = this,
                tRect = t.getBoundingClientRect(),
                toffset = { top: tRect.top + window.pageYOffset, left: tRect.left + window.pageXOffset },
                menu = document.getElementById("luckysheet-filter-submenu");
            if (menu) menu.style.display = 'none';

            let winH = document.documentElement.clientHeight, winW = document.documentElement.clientWidth;
            let menuW = menu ? menu.offsetWidth : 0, menuH = menu ? menu.offsetHeight : 0;
            let top = toffset.top, left = toffset.left, mheight = winH - toffset.top - 20;

            if (toffset.left + menuW > winW) {
                left = toffset.left - menuW;
            }

            if (toffset.top > winH / 2) {
                top = winH - toffset.top;

                if (top < 0) {
                    top = 0;
                }

                mheight = toffset.top - 20;
            }

            if (menu) {
                menu.style.top = top + 'px';
                menu.style.left = left + 'px';
                menu.style.height = mheight + 'px';
                menu.style.display = '';
            }
            clearTimeout(filterState.hidefilersubmenu);
        });
    }
}
