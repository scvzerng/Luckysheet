import filterState from './filterState';

export function filterMenuEvents() {
    let submenuhide = null, rightclickmenu = null;
    $(".luckysheet-cols-menu .luckysheet-cols-submenu").hover(
        function () {
            let $t = $(this), attrid = $t.attr("id"), $attr = $("#" + attrid + "_sub"), $con = $t.parent();
            let winW = $(window).width(), winH = $(window).height();
            let menuW = $con.width(), attrH = $attr.height() + 25, attrW = $attr.width() + 5;
            let offset = $t.offset();
            let top = offset.top, left = offset.left + menuW;

            if (left + attrW > winW) {
                left = offset.left - attrW;
            }

            if (top + attrH > winH) {
                top = winH - attrH;
            }

            $attr.css({ "top": top, "left": left }).show();
            rightclickmenu = $t;
        },
        function () {
            let $t = $(this), attrid = $t.attr("id"), $attr = $("#" + attrid + "_sub");
            submenuhide = setTimeout(function () { $attr.hide(); }, 200);
        }
    );

    $(".luckysheet-rightgclick-menu-sub").hover(
        function () {
            rightclickmenu.addClass("luckysheet-cols-menuitem-hover");
            clearTimeout(submenuhide);
        },
        function () {
            rightclickmenu.removeClass("luckysheet-cols-menuitem-hover");
            $(this).hide();
        }
    );

    $("#luckysheet-filter-menu").mouseover(function () {
        clearTimeout(filterState.hidefilersubmenu);

        filterState.hidefilersubmenu = setTimeout(function () {
            $("#luckysheet-filter-submenu").hide();
        }, 500);
    });


    $("#luckysheet-filter-submenu").mouseover(function () {
        clearTimeout(filterState.hidefilersubmenu);
    }).find(".luckysheet-cols-menuitem").click(function (e) {
        $("#luckysheet-filter-selected span").html($(this).find(".luckysheet-cols-menuitem-content").text()).data("value", $(this).data("value"));
        $("#luckysheet-filter-menu .luckysheet-filter-selected-input").hide();

        let $type = $(this).data("type");
        let $value = $(this).attr("data-value");

        if ($type == "2") {
            $("#luckysheet-filter-selected span").data("type", "2");
            $("#luckysheet-filter-menu .luckysheet-filter-selected-input2").show();
            $("#luckysheet-filter-menu .luckysheet-filter-selected-input input").prop("type", "number");
        }
        else if ($type == "0") {
            $("#luckysheet-filter-selected span").data("type", "0");
        }
        else {
            $("#luckysheet-filter-selected span").data("type", "1");
            $("#luckysheet-filter-menu .luckysheet-filter-selected-input").eq(0).show();

            //若是日期 改变input type类型为date
            if($value == "dateequal" || $value == "datelessthan" || $value == "datemorethan"){
                $("#luckysheet-filter-menu .luckysheet-filter-selected-input input").prop("type", "date");
            }
            else if($value == "morethan" || $value == "moreequalthan" || $value == "lessthan" || $value == "lessequalthan" || $value == "equal" || $value == "noequal"){
                $("#luckysheet-filter-menu .luckysheet-filter-selected-input input").prop("type", "number");
            }
            else{
                $("#luckysheet-filter-menu .luckysheet-filter-selected-input input").prop("type", "text");
            }
        }

        $("#luckysheet-filter-byvalue").next().slideUp();
        $("#luckysheet-filter-submenu").hide();
    });

    $("#luckysheet-filter-bycondition, #luckysheet-filter-byvalue").click(function () {
        let $t = $(this);
        $t.next().slideToggle(200);

        setTimeout(function () {
            if ($t.attr("id") == "luckysheet-filter-bycondition" && $("#luckysheet-filter-bycondition").next().is(":visible")) {
                if ($("#luckysheet-filter-selected span").text() != filterState.locale_filter.filiterInputNone) {
                    $("#luckysheet-filter-byvalue").next().slideUp(200);
                }
            }

            if ($t.is($("#luckysheet-filter-bycondition"))) {
                if ($("#luckysheet-filter-bycondition").next().is(":hidden") && $("#luckysheet-filter-byvalue").next().is(":hidden")) {
                    $("#luckysheet-filter-byvalue").next().slideDown(200);
                }
            }
        }, 300);
    });

    $("#luckysheet-filter-selected").click(function () {
        let $t = $(this), toffset = $t.offset(), $menu = $("#luckysheet-filter-submenu");
        $menu.hide();

        let winH = $(window).height(), winW = $(window).width();
        let menuW = $menu.width(), menuH = $menu.height();
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

        $menu.css({ "top": top, "left": left, "height": mheight }).show();
        clearTimeout(filterState.hidefilersubmenu);
    });
}
