import { checkTheStatusOfTheSelectedCells } from '../../../global/api';
import { hideMenuByCancel } from '../../../global/cursorPos';
import editor from '../../../global/editor';
import Store from '../../../store';

export function initTextStyle(_this) {
      //加粗
      $("#luckysheet-icon-bold").mousedown(function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      }).click(function (e) {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let flag = checkTheStatusOfTheSelectedCells("bl", 1);
        let foucsStatus = flag ? 0 : 1;
        _this.updateFormat(d, "bl", foucsStatus);
      });
  
      //斜体
      $("#luckysheet-icon-italic").mousedown(function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      }).click(function () {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let flag = checkTheStatusOfTheSelectedCells("it", 1);
        let foucsStatus = flag ? 0 : 1;
        _this.updateFormat(d, "it", foucsStatus);
      });
  
      //删除�?
      $("#luckysheet-icon-strikethrough").mousedown(function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      }).click(function () {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let flag = checkTheStatusOfTheSelectedCells("cl", 1);
        let foucsStatus = flag ? 0 : 1;
        _this.updateFormat(d, "cl", foucsStatus);
      });
  
      //下划�?
      $("#luckysheet-icon-underline").mousedown(function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      }).click(function () {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let flag = checkTheStatusOfTheSelectedCells("un", 1);
        let foucsStatus = flag ? 0 : 1;
        _this.updateFormat(d, "un", foucsStatus);
      });
}
