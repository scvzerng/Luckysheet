import { onNS, offNS } from '../../utils/migrationHelpers.js';

export function filterCheckboxEvents() {
    offNS("filterCheckbox1");
    onNS(document, "click.filterCheckbox1", "#luckysheet-filter-byvalue-select .textBox",function(){
        if(this.getAttribute("data-check") == "true"){
            this.setAttribute("data-check", "false");
            const cb = this.querySelector("input[type='checkbox']");
            if (cb) { cb.checked = false; cb.removeAttribute("checked"); }
        }
        else{
            this.setAttribute("data-check", "true");
            const cb = this.querySelector("input[type='checkbox']");
            if (cb) cb.checked = true;
        }
    })
    offNS("filterCheckbox2");
    onNS(document, "click.filterCheckbox2", "#luckysheet-filter-byvalue-select .year",function(){
        const yearBox = this.closest(".yearBox");
        if(this.getAttribute("data-check") == "true"){
            this.setAttribute("data-check", "false");
            yearBox?.querySelectorAll(".month").forEach(el => el.setAttribute("data-check", "false"));
            yearBox?.querySelectorAll(".day").forEach(el => el.setAttribute("data-check", "false"));
            yearBox?.querySelectorAll("input[type='checkbox']").forEach(el => { el.checked = false; el.removeAttribute("checked"); });
        }
        else{
            this.setAttribute("data-check", "true");
            yearBox?.querySelectorAll(".month").forEach(el => el.setAttribute("data-check", "true"));
            yearBox?.querySelectorAll(".day").forEach(el => el.setAttribute("data-check", "true"));
            yearBox?.querySelectorAll("input[type='checkbox']").forEach(el => { el.checked = true; });
        }
    })
    offNS("filterCheckbox3");
    onNS(document, "click.filterCheckbox3", "#luckysheet-filter-byvalue-select .month",function(){
        const monthBox = this.closest(".monthBox");
        const yearBox = this.closest(".yearBox");
        if(this.getAttribute("data-check") == "true"){
            this.setAttribute("data-check", "false");
            monthBox?.querySelectorAll(".day").forEach(el => el.setAttribute("data-check", "false"));
            monthBox?.querySelectorAll("input[type='checkbox']").forEach(el => { el.checked = false; el.removeAttribute("checked"); });
        }
        else{
            this.setAttribute("data-check", "true");
            monthBox?.querySelectorAll(".day").forEach(el => el.setAttribute("data-check", "true"));
            monthBox?.querySelectorAll("input[type='checkbox']").forEach(el => { el.checked = true; });
        }
        let yearDayAllCheck = true;
        yearBox?.querySelectorAll(".day").forEach(function(e){
            if(e.getAttribute("data-check") == "true"){

            }
            else{
                yearDayAllCheck = false;
            }
        });
        if(yearDayAllCheck){
            yearBox?.querySelectorAll(".year").forEach(el => el.setAttribute("data-check", "true"));
            yearBox?.querySelectorAll(".year input[type='checkbox']").forEach(el => { el.checked = true; });
        }
        else{
            yearBox?.querySelectorAll(".year").forEach(el => el.setAttribute("data-check", "false"));
            yearBox?.querySelectorAll(".year input[type='checkbox']").forEach(el => { el.checked = false; el.removeAttribute("checked"); });
        }
    })
    offNS("filterCheckbox4");
    onNS(document, "click.filterCheckbox4", "#luckysheet-filter-byvalue-select .day",function(){
        const monthBox = this.closest(".monthBox");
        const yearBox = this.closest(".yearBox");
        if(this.getAttribute("data-check") == "true"){
            this.setAttribute("data-check", "false");
            const cb = this.querySelector("input[type='checkbox']");
            if (cb) { cb.checked = false; cb.removeAttribute("checked"); }
        }
        else{
            this.setAttribute("data-check", "true");
            const cb = this.querySelector("input[type='checkbox']");
            if (cb) cb.checked = true;
        }
        let monthDayAllCheck = true;
        monthBox?.querySelectorAll(".day").forEach(function(e){
            if(e.getAttribute("data-check") == "true"){

            }
            else{
                monthDayAllCheck = false;
            }
        });
        if(monthDayAllCheck){
            monthBox?.querySelectorAll(".month").forEach(el => el.setAttribute("data-check", "true"));
            monthBox?.querySelectorAll(".month input[type='checkbox']").forEach(el => { el.checked = true; });
        }
        else{
            monthBox?.querySelectorAll(".month").forEach(el => el.setAttribute("data-check", "false"));
            monthBox?.querySelectorAll(".month input[type='checkbox']").forEach(el => { el.checked = false; el.removeAttribute("checked"); });
        }
        let yearDayAllCheck = true;
        yearBox?.querySelectorAll(".day").forEach(function(e){
            if(e.getAttribute("data-check") == "true"){

            }
            else{
                yearDayAllCheck = false;
            }
        });
        if(yearDayAllCheck){
            yearBox?.querySelectorAll(".year").forEach(el => el.setAttribute("data-check", "true"));
            yearBox?.querySelectorAll(".year input[type='checkbox']").forEach(el => { el.checked = true; });
        }
        else{
            yearBox?.querySelectorAll(".year").forEach(el => el.setAttribute("data-check", "false"));
            yearBox?.querySelectorAll(".year input[type='checkbox']").forEach(el => { el.checked = false; el.removeAttribute("checked"); });
        }
    })

    offNS("filterYearDropdown");
    onNS(document, "click.filterYearDropdown", "#luckysheet-filter-byvalue-select .yearBox .fa-caret-right",function(event){
        const p = this.closest(".luckysheet-mousedown-cancel");
        if(p && p.classList.contains("year")){
            const monthList = this.closest(".yearBox")?.querySelector(".monthList");
            if (monthList) monthList.style.display = monthList.style.display === 'none' ? '' : 'none';
        }
        if(p && p.classList.contains("month")){
            const dayList = this.closest(".monthBox")?.querySelector(".dayList");
            if (dayList) dayList.style.display = dayList.style.display === 'none' ? '' : 'none';
        }

        event.stopPropagation();
    });

    const btnAll = document.getElementById("luckysheet-filter-byvalue-btn-all");
    if (btnAll) {
        btnAll.addEventListener("click", function () {
            document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").forEach(el => { el.checked = true; });
            document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").forEach(el => {
                const parent = el.closest(".luckysheet-mousedown-cancel");
                if (parent) parent.setAttribute("data-check", "true");
            });
        });
    }

    const btnClear = document.getElementById("luckysheet-filter-byvalue-btn-clear");
    if (btnClear) {
        btnClear.addEventListener("click", function () {
            document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").forEach(el => { el.checked = false; el.removeAttribute("checked"); });
            document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").forEach(el => {
                const parent = el.closest(".luckysheet-mousedown-cancel");
                if (parent) parent.setAttribute("data-check", "false");
            });
        });
    }

    const btnContra = document.getElementById("luckysheet-filter-byvalue-btn-contra");
    if (btnContra) {
        btnContra.addEventListener("click", function () {
            const inputs = document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']");
            inputs.forEach(function(e){
                if(e.checked){
                    e.checked = false;
                    e.removeAttribute("checked");
                    const parent = e.closest(".luckysheet-mousedown-cancel");
                    if (parent) parent.setAttribute("data-check", "false");
                }
                else{
                    e.checked = true;
                    const parent = e.closest(".luckysheet-mousedown-cancel");
                    if (parent) parent.setAttribute("data-check", "true");
                }
            });
            document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox .monthBox").forEach(function(monthBox){
                let monthDayAllCheck = true;
                monthBox.querySelectorAll(".day input[type='checkbox']").forEach(function(e){
                    if(e.checked){

                    }
                    else{
                        monthDayAllCheck = false;
                    }
                });
                if(monthDayAllCheck){
                    monthBox.querySelectorAll(".month input[type='checkbox']").forEach(el => { el.checked = true; });
                    monthBox.setAttribute("data-check", "true");
                }
                else{
                    monthBox.querySelectorAll(".month input[type='checkbox']").forEach(el => { el.checked = false; el.removeAttribute("checked"); });
                    monthBox.setAttribute("data-check", "false");
                }
            });
            document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox .yearBox").forEach(function(yearBox){
                let yearDayAllCheck = true;
                yearBox.querySelectorAll(".day input[type='checkbox']").forEach(function(e){
                    if(e.checked){

                    }
                    else{
                        yearDayAllCheck = false;
                    }
                });
                if(yearDayAllCheck){
                    yearBox.querySelectorAll(".year input[type='checkbox']").forEach(el => { el.checked = true; });
                    yearBox.setAttribute("data-check", "true");
                }
                else{
                    yearBox.querySelectorAll(".year input[type='checkbox']").forEach(el => { el.checked = false; el.removeAttribute("checked"); });
                    yearBox.setAttribute("data-check", "false");
                }
            });
        });
    }
}
