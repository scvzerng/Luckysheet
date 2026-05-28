import { selectionCopyShow } from '../../select';
import { showModalMask } from '../../../utils/domUtils.js';

export function initRangeAndCloseEvents(_this) {
      // 选择单元�?
      $(document).on("click", ".range .fa-table", function () {
        let id = $(this).parents(".luckysheet-modal-dialog").attr("id");
        $("#" + id).hide();
        //入口
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
        //input�?
        let v = $(this).siblings("input").val();
        _this.singleRangeDialog(source, v);
        selectionCopyShow(_this.getRangeByTxt(v));
      });
      $(document).on("click", "#luckysheet-singleRange-dialog-confirm", function () {
        showModalMask();
        $(this).parents("#luckysheet-singleRange-dialog").hide();
        let source = $(this).attr("data-source");
        let v = $(this).parents("#luckysheet-singleRange-dialog").find("input").val();
        if (source == "0_1") {
          $("#luckysheet-conditionformat-dialog").show();
          $("#luckysheet-conditionformat-dialog #conditionVal").val(v);
        } else if (source == "0_2") {
          $("#luckysheet-conditionformat-dialog").show();
          $("#luckysheet-conditionformat-dialog #conditionVal2").val(v);
        } else if (source == "1_0") {
          $("#luckysheet-newConditionRule-dialog").show();
          $("#luckysheet-newConditionRule-dialog #formulaConditionVal input").val(v);
        } else if (source == "1_1") {
          $("#luckysheet-newConditionRule-dialog").show();
          $("#luckysheet-newConditionRule-dialog #conditionVal input").val(v);
        } else if (source == "1_2") {
          $("#luckysheet-newConditionRule-dialog").show();
          $("#luckysheet-newConditionRule-dialog #conditionVal2 input").val(v);
        } else if (source == "2_0") {
          $("#luckysheet-editorConditionRule-dialog").show();
          $("#luckysheet-editorConditionRule-dialog #formulaConditionVal input").val(v);
        } else if (source == "2_1") {
          $("#luckysheet-editorConditionRule-dialog").show();
          $("#luckysheet-editorConditionRule-dialog #conditionVal input").val(v);
        } else if (source == "2_2") {
          $("#luckysheet-editorConditionRule-dialog").show();
          $("#luckysheet-editorConditionRule-dialog #conditionVal2 input").val(v);
        }
        let range = [];
        selectionCopyShow(range);
      });
      $(document).on("click", "#luckysheet-singleRange-dialog-close", function () {
        showModalMask();
        $(this).parents("#luckysheet-singleRange-dialog").hide();
        let source = $(this).attr("data-source");
        if (source == "0_1" || source == "0_2") {
          $("#luckysheet-conditionformat-dialog").show();
        } else if (source == "1_0" || source == "1_1" || source == "1_2") {
          $("#luckysheet-newConditionRule-dialog").show();
        } else if (source == "2_0" || source == "2_1" || source == "2_2") {
          $("#luckysheet-editorConditionRule-dialog").show();
        }
        let range = [];
        selectionCopyShow(range);
      });
  
      // 弹出层右上角关闭按钮
      $(document).on("click", ".luckysheet-modal-dialog-title-close", function () {
        let id = $(this).parents(".luckysheet-modal-dialog").attr("id");
  
        //新建规则弹出�?
        if (id == "luckysheet-newConditionRule-dialog") {
          let source = $("#" + id).find("#luckysheet-newConditionRule-dialog-close").attr("data-source");
          //新建规则入口
          if (source == 1) {
            $("#luckysheet-administerRule-dialog").show();
          }
        }
  
        //编辑规则弹出�?
        if (id == "luckysheet-editorConditionRule-dialog") {
          $("#luckysheet-administerRule-dialog").show();
        }
  
        //选择单元格弹出层
        if (id == "luckysheet-singleRange-dialog") {
          showModalMask();
          let source = $(this).parents("#luckysheet-singleRange-dialog").find("#luckysheet-singleRange-dialog-confirm").attr("data-source");
          if (source == "0_1" || source == "0_2") {
            $("#luckysheet-conditionformat-dialog").show();
          } else if (source == "1_1" || source == "1_2") {
            $("#luckysheet-newConditionRule-dialog").show();
          } else if (source == "2_1" || source == "2_2") {
            $("#luckysheet-editorConditionRule-dialog").show();
          }
          let range = [];
          selectionCopyShow(range);
        }
  
        //选择应用范围弹出�?
        if (id == "luckysheet-multiRange-dialog") {
          showModalMask();
          $("#luckysheet-administerRule-dialog").show();
          let range = [];
          selectionCopyShow(range);
        }
  
        //提示�?
        if (id == "luckysheet-conditionformat-info-dialog") {
          showModalMask();
        }
      });
  
      //提示�?
      $(document).on("click", "#luckysheet-conditionformat-info-dialog-close", function () {
        $(this).parents("#luckysheet-conditionformat-info-dialog").hide();
      });
}
