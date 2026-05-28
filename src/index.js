import './utils/math'
import jQuery from 'jquery'
import { luckysheet } from './core'
import __firefox from './utils/polyfill'

window.jQuery = jQuery
window.$ = jQuery

import '@fortawesome/fontawesome-free/css/all.min.css'
import './plugins/jquery.sPage.css'
import './css/core/index.css'
import './css/luckysheet-zoom.css'
import './assets/iconfont/iconfont.css'
import './css/iconCustom.css'
import 'flatpickr/dist/themes/light.css'

if (window.addEventListener && (navigator.userAgent.indexOf("Firefox") > 0)) {
    __firefox();
}

export { luckysheet }
export default luckysheet
