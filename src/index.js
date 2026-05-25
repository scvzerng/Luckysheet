import './utils/math'
import jQuery from 'jquery'
import { luckysheet } from './core'
import __firefox from './utils/polyfill'

window.jQuery = jQuery
window.$ = jQuery

import 'spectrum-colorpicker/spectrum.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'jquery-ui/dist/themes/base/jquery-ui.css'
import './plugins/jquery.sPage.css'
import './css/luckysheet-core.css'
import './css/luckysheet-cellFormat.css'
import './css/luckysheet-protection.css'
import './css/luckysheet-zoom.css'
import './css/iconCustom.css'
import 'flatpickr/dist/themes/light.css'

if (window.addEventListener && (navigator.userAgent.indexOf("Firefox") > 0)) {
    __firefox();
}

export { luckysheet }
export default luckysheet
