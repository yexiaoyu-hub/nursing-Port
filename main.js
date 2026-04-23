import App from './App'
import routerGuard from './utils/routerGuard.js'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()

// 初始化路由守卫
routerGuard()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)

  // 初始化路由守卫
  routerGuard()

  return {
    app
  }
}
// #endif