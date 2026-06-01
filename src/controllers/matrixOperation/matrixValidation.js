import Store from '../../store';
import tooltip from '../../global/tooltip';
import locale from '../../locale/locale';
import { isEditMode } from '../../global/validate';

function checkMultiSelection() {
    const _locale = locale();
    const locale_drag = _locale.drag;
    if(Store.selections.length > 1){
        if(isEditMode()){
            alert(locale_drag.noMulti);
        }
        else{
            tooltip.info(locale_drag.noMulti, "");
        }
        return true;
    }
    return false;
}

function checkPartMerge(st_r, ed_r, st_c, ed_c) {
    const _locale = locale();
    const locale_drag = _locale.drag;
    let merges = Store.config["merge"] || {};
    if(merges != null){
        for(let m in merges){
            if(merges[m].rs != null){
                let r1 = merges[m].r, r2 = merges[m].r + merges[m].rs - 1;
                let c1 = merges[m].c, c2 = merges[m].c + merges[m].cs - 1;
                if(!((ed_r < r1 || st_r > r2) || (ed_c < c1 || st_c > c2))){
                    if(!(r1 >= st_r && r2 <= ed_r && c1 >= st_c && c2 <= ed_c)){
                        if(isEditMode()){
                            alert(locale_drag.noPartMerge);
                        }
                        else{
                            tooltip.info(locale_drag.noPartMerge, "");
                        }
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

export { checkMultiSelection, checkPartMerge };
