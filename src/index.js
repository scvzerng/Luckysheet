import './utils/math'
import { luckysheet } from './core'
import __firefox from './utils/polyfill'

import './css/fontawesome.min.css'
import './plugins/pagination.css'
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
