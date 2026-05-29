import { onNS, offNS } from '../../../utils/migrationHelpers.js';
import { selectionCopyShow } from '../../select';
import { showModalMask } from '../../../utils/domUtils.js';
import formulaDialogs from '../../../ui/formulaDialogs.js';
import conditionformatDialog from '../../../ui/conditionformatDialog.js';

export function initRangeAndCloseEvents(_this) {
      offNS("CFrangeFaTable");
      onNS(document, "click.CFrangeFaTable", ".range .fa-table", function () {
        let id = this.closest(".luckysheet-modal-dialog")?.getAttribute("id");
        const _elRangeHide = document.getElementById(id); if (_elRangeHide) _elRangeHide.style.display = 'none';
        let source;
        if (id == "luckysheet-conditionformat-dialog") {
          let $id = this.parentElement.querySelector("input")?.getAttribute("id");
          if ($id == "conditionVal") {
            source = "0_1";
          } else {
            source = "0_2";
          }
        } else if (id == "luckysheet-newConditionRule-dialog") {
          let $id = this.closest(".range")?.getAttribute("id");
          if ($id == "formulaConditionVal") {
            source = "1_0";
          } else if ($id == "conditionVal") {
            source = "1_1";
          } else {
            source = "1_2";
          }
        } else if (id == "luckysheet-editorConditionRule-dialog") {
          let $id = this.closest(".range")?.getAttribute("id");
          if ($id == "formulaConditionVal") {
            source = "2_0";
          } else if ($id == "conditionVal") {
            source = "2_1";
          } else {
            source = "2_2";
          }
        }
        let v = this.parentElement.querySelector("input")?.value;
        _this.singleRangeDialog(source, v);
        selectionCopyShow(_this.getRangeByTxt(v));
      });
      offNS("CFsingleRangeConfirm");
      onNS(document, "click.CFsingleRangeConfirm", "#luckysheet-singleRange-dialog-confirm", function () {
        showModalMask();
        formulaDialogs.singleRange.hide();
        let source = this.getAttribute("data-source");
        let v = formulaDialogs.singleRange.find("input")?.value;
        if (source == "0_1") {
          conditionformatDialog.main.show();
          let _cv = conditionformatDialog.main.find("#conditionVal"); if (_cv) _cv.value = v;
        } else if (source == "0_2") {
          conditionformatDialog.main.show();
          let _cv2 = conditionformatDialog.main.find("#conditionVal2"); if (_cv2) _cv2.value = v;
        } else if (source == "1_0") {
          conditionformatDialog.newRule.show();
          let _fcv = conditionformatDialog.newRule.find("#formulaConditionVal input"); if (_fcv) _fcv.value = v;
        } else if (source == "1_1") {
          conditionformatDialog.newRule.show();
          let _cv3 = conditionformatDialog.newRule.find("#conditionVal input"); if (_cv3) _cv3.value = v;
        } else if (source == "1_2") {
          conditionformatDialog.newRule.show();
          let _cv4 = conditionformatDialog.newRule.find("#conditionVal2 input"); if (_cv4) _cv4.value = v;
        } else if (source == "2_0") {
          conditionformatDialog.editRule.show();
          let _fcv2 = conditionformatDialog.editRule.find("#formulaConditionVal input"); if (_fcv2) _fcv2.value = v;
        } else if (source == "2_1") {
          conditionformatDialog.editRule.show();
          let _cv5 = conditionformatDialog.editRule.find("#conditionVal input"); if (_cv5) _cv5.value = v;
        } else if (source == "2_2") {
          conditionformatDialog.editRule.show();
          let _cv6 = conditionformatDialog.editRule.find("#conditionVal2 input"); if (_cv6) _cv6.value = v;
        }
        let range = [];
        selectionCopyShow(range);
      });
      offNS("CFsingleRangeClose");
      onNS(document, "click.CFsingleRangeClose", "#luckysheet-singleRange-dialog-close", function () {
        showModalMask();
        formulaDialogs.singleRange.hide();
        let source = formulaDialogs.singleRange.find("#luckysheet-singleRange-dialog-confirm")?.getAttribute("data-source");
        if (source == "0_1" || source == "0_2") {
          conditionformatDialog.main.show();
        } else if (source == "1_0" || source == "1_1" || source == "1_2") {
          conditionformatDialog.newRule.show();
        } else if (source == "2_0" || source == "2_1" || source == "2_2") {
          conditionformatDialog.editRule.show();
        }
        let range = [];
        selectionCopyShow(range);
      });

      offNS("CFmodalDialogTitleClose");
      onNS(document, "click.CFmodalDialogTitleClose", ".luckysheet-modal-dialog-title-close", function () {
        let id = this.closest(".luckysheet-modal-dialog")?.getAttribute("id");

        if (id == "luckysheet-newConditionRule-dialog") {
          let source = document.getElementById(id)?.querySelector("#luckysheet-newConditionRule-dialog-close")?.getAttribute("data-source");
          if (source == 1) {
            conditionformatDialog.adminRule.show();
          }
        }

        if (id == "luckysheet-editorConditionRule-dialog") {
          conditionformatDialog.adminRule.show();
        }

        if (id == "luckysheet-singleRange-dialog") {
          showModalMask();
          let source = formulaDialogs.singleRange.find("#luckysheet-singleRange-dialog-confirm")?.getAttribute("data-source");
          if (source == "0_1" || source == "0_2") {
            conditionformatDialog.main.show();
          } else if (source == "1_1" || source == "1_2") {
            conditionformatDialog.newRule.show();
          } else if (source == "2_1" || source == "2_2") {
            conditionformatDialog.editRule.show();
          }
          let range = [];
          selectionCopyShow(range);
        }

        if (id == "luckysheet-multiRange-dialog") {
          showModalMask();
          conditionformatDialog.adminRule.show();
          let range = [];
          selectionCopyShow(range);
        }

        if (id == "luckysheet-conditionformat-info-dialog") {
          showModalMask();
        }
      });

      offNS("CFinfoDialogClose");
      onNS(document, "click.CFinfoDialogClose", "#luckysheet-conditionformat-info-dialog-close", function () {
        this.closest("#luckysheet-conditionformat-info-dialog").style.display = 'none';
      });
}
