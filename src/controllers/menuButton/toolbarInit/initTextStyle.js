import { checkTheStatusOfTheSelectedCells } from '../../../global/api';
import { hideMenuByCancel } from '../../../global/cursorPos';
import editor from '../../../global/editor';
import Store from '../../../store';

export function initTextStyle(_this) {
      const _bold = document.getElementById("luckysheet-icon-bold");
      if (_bold) {
        _bold.addEventListener("mousedown", function (e) {
          hideMenuByCancel(e);
          e.stopPropagation();
        });
        _bold.addEventListener("click", function (e) {
          let d = editor.deepCopyFlowData(Store.flowdata);
          let flag = checkTheStatusOfTheSelectedCells("bl", 1);
          let foucsStatus = flag ? 0 : 1;
          _this.updateFormat(d, "bl", foucsStatus);
        });
      }

      const _italic = document.getElementById("luckysheet-icon-italic");
      if (_italic) {
        _italic.addEventListener("mousedown", function (e) {
          hideMenuByCancel(e);
          e.stopPropagation();
        });
        _italic.addEventListener("click", function () {
          let d = editor.deepCopyFlowData(Store.flowdata);
          let flag = checkTheStatusOfTheSelectedCells("it", 1);
          let foucsStatus = flag ? 0 : 1;
          _this.updateFormat(d, "it", foucsStatus);
        });
      }

      const _strike = document.getElementById("luckysheet-icon-strikethrough");
      if (_strike) {
        _strike.addEventListener("mousedown", function (e) {
          hideMenuByCancel(e);
          e.stopPropagation();
        });
        _strike.addEventListener("click", function () {
          let d = editor.deepCopyFlowData(Store.flowdata);
          let flag = checkTheStatusOfTheSelectedCells("cl", 1);
          let foucsStatus = flag ? 0 : 1;
          _this.updateFormat(d, "cl", foucsStatus);
        });
      }

      const _underline = document.getElementById("luckysheet-icon-underline");
      if (_underline) {
        _underline.addEventListener("mousedown", function (e) {
          hideMenuByCancel(e);
          e.stopPropagation();
        });
        _underline.addEventListener("click", function () {
          let d = editor.deepCopyFlowData(Store.flowdata);
          let flag = checkTheStatusOfTheSelectedCells("un", 1);
          let foucsStatus = flag ? 0 : 1;
          _this.updateFormat(d, "un", foucsStatus);
        });
      }
}
