import { selectionCopyShow } from '../../select';
import { showModalMask } from '../../../utils/domUtils.js';
import formulaDialogs from '../../../ui/formulaDialogs.js';
import conditionformatDialog from '../../../ui/conditionformatDialog.js';

export function initRangeAndCloseEvents(_this) {
      $(document).off("click.CFrangeFaTable").on("click.CFrangeFaTable", ".range .fa-table", function () {
        let id = $(this).parents(".luckysheet-modal-dialog").attr("id");
        $("#" + id).hide();
        let source;
        if (id == "luckysheet-conditionformat-dialog") {
          let $id = $(this).siblings("input").attr("id");
          if ($id == "conditionVal") {
            source = "0_1";
          } else {
            source = "0_2";
          }
        } else if (id == "luckysheet-newConditionRule-dialog") {
          let $id = $(this).parents(".range").attr("id");
          if ($id == "formulaConditionVal") {
            source = "1_0";
          } else if ($id == "conditionVal") {
            source = "1_1";
          } else {
            source = "1_2";
          }
        } else if (id == "luckysheet-editorConditionRule-dialog") {
          let $id = $(this).parents(".range").attr("id");
          if ($id == "formulaConditionVal") {
            source = "2_0";
          } else if ($id == "conditionVal") {
            source = "2_1";
          } else {
            source = "2_2";
          }
        }
        let v = $(this).siblings("input").val();
        _this.singleRangeDialog(source, v);
        selectionCopyShow(_this.getRangeByTxt(v));
      });
      $(document).off("click.CFsingleRangeConfirm").on("click.CFsingleRangeConfirm", "#luckysheet-singleRange-dialog-confirm", function () {
        showModalMask();
        formulaDialogs.singleRange.hide();
        let source = $(this).attr("data-source");
        let v = formulaDialogs.singleRange.find("input").val();
        if (source == "0_1") {
          conditionformatDialog.main.show();
          conditionformatDialog.main.find("#conditionVal").val(v);
        } else if (source == "0_2") {
          conditionformatDialog.main.show();
          conditionformatDialog.main.find("#conditionVal2").val(v);
        } else if (source == "1_0") {
          conditionformatDialog.newRule.show();
          conditionformatDialog.newRule.find("#formulaConditionVal input").val(v);
        } else if (source == "1_1") {
          conditionformatDialog.newRule.show();
          conditionformatDialog.newRule.find("#conditionVal input").val(v);
        } else if (source == "1_2") {
          conditionformatDialog.newRule.show();
          conditionformatDialog.newRule.find("#conditionVal2 input").val(v);
        } else if (source == "2_0") {
          conditionformatDialog.editRule.show();
          conditionformatDialog.editRule.find("#formulaConditionVal input").val(v);
        } else if (source == "2_1") {
          conditionformatDialog.editRule.show();
          conditionformatDialog.editRule.find("#conditionVal input").val(v);
        } else if (source == "2_2") {
          conditionformatDialog.editRule.show();
          conditionformatDialog.editRule.find("#conditionVal2 input").val(v);
        }
        let range = [];
        selectionCopyShow(range);
      });
      $(document).off("click.CFsingleRangeClose").on("click.CFsingleRangeClose", "#luckysheet-singleRange-dialog-close", function () {
        showModalMask();
        formulaDialogs.singleRange.hide();
        let source = formulaDialogs.singleRange.find("#luckysheet-singleRange-dialog-confirm").attr("data-source");
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

      $(document).off("click.CFmodalDialogTitleClose").on("click.CFmodalDialogTitleClose", ".luckysheet-modal-dialog-title-close", function () {
        let id = $(this).parents(".luckysheet-modal-dialog").attr("id");

        if (id == "luckysheet-newConditionRule-dialog") {
          let source = $("#" + id).find("#luckysheet-newConditionRule-dialog-close").attr("data-source");
          if (source == 1) {
            conditionformatDialog.adminRule.show();
          }
        }

        if (id == "luckysheet-editorConditionRule-dialog") {
          conditionformatDialog.adminRule.show();
        }

        if (id == "luckysheet-singleRange-dialog") {
          showModalMask();
          let source = formulaDialogs.singleRange.find("#luckysheet-singleRange-dialog-confirm").attr("data-source");
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

      $(document).off("click.CFinfoDialogClose").on("click.CFinfoDialogClose", "#luckysheet-conditionformat-info-dialog-close", function () {
        $(this).parents("#luckysheet-conditionformat-info-dialog").hide();
      });
}
