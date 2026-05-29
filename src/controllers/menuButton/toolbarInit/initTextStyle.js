import { checkTheStatusOfTheSelectedCells } from '../../../global/api';
import { hideMenuByCancel } from '../../../global/cursorPos';
import editor from '../../../global/editor';
import Store from '../../../store';

export function initTextStyle(_this) {
      //加粗
      document.getElementById("luckysheet-icon-bold").addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      }).addEventListener("click", function (e) {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let flag = checkTheStatusOfTheSelectedCells("bl", 1);
        let foucsStatus = flag ? 0 : 1;
        _this.updateFormat(d, "bl", foucsStatus);
      });
  
      //斜体
      document.getElementById("luckysheet-icon-italic").addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      }).addEventListener("click", function () {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let flag = checkTheStatusOfTheSelectedCells("it", 1);
        let foucsStatus = flag ? 0 : 1;
        _this.updateFormat(d, "it", foucsStatus);
      });
  
      //删除�?
      document.getElementById("luckysheet-icon-strikethrough").addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      }).addEventListener("click", function () {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let flag = checkTheStatusOfTheSelectedCells("cl", 1);
        let foucsStatus = flag ? 0 : 1;
        _this.updateFormat(d, "cl", foucsStatus);
      });
  
      //下划�?
      document.getElementById("luckysheet-icon-underline").addEventListener("mousedown", function (e) {
        hideMenuByCancel(e);
        e.stopPropagation();
      }).addEventListener("click", function () {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let flag = checkTheStatusOfTheSelectedCells("un", 1);
        let foucsStatus = flag ? 0 : 1;
        _this.updateFormat(d, "un", foucsStatus);
      });
}
