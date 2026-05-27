import { initRowHeaderEvents } from './initRowHeaderEvents.js';
import { initColHeaderEvents } from './initColHeaderEvents.js';
import { initResizeEvents } from './initResizeEvents.js';
import { initAddRowColEvents } from './initAddRowColEvents.js';
import { initDeleteRowColEvents } from './initDeleteRowColEvents.js';
import { initHideShowEvents } from './initHideShowEvents.js';
import { initDeleteCellEvents } from './initDeleteCellEvents.js';
import { initRowColWidthEvents } from './initRowColWidthEvents.js';

function rowColumnOperationInitial() {
  initRowHeaderEvents();
  initColHeaderEvents();
  initResizeEvents();
  initAddRowColEvents();
  initDeleteRowColEvents();
  initHideShowEvents();
  initDeleteCellEvents();
  initRowColWidthEvents();
}

export { rowColumnOperationInitial };
