// 路由守卫 - 页面拦截器

// 不需要登录的页面白名单
const whiteList = [
  '/pages/login/login',
  '/pages/user/privacyAgreement/userPrivacy',
  '/pages/user/privacyAgreement/userAgreement'
]

// 检查页面是否在白名单中
const isWhiteList = (url) => {
  return whiteList.some(path => url.includes(path))
}

// 检查是否已登录
const isLoggedIn = () => {
  const token = uni.getStorageSync('token')
  return !!token
}

// 路由守卫拦截
const routerGuard = () => {
  // 拦截 uni.navigateTo
  const originalNavigateTo = uni.navigateTo
  uni.navigateTo = (options) => {
    const url = options.url || ''

    if (!isWhiteList(url) && !isLoggedIn()) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/login' })
      }, 1000)
      return
    }

    return originalNavigateTo(options)
  }

  // 拦截 uni.redirectTo
  const originalRedirectTo = uni.redirectTo
  uni.redirectTo = (options) => {
    const url = options.url || ''

    if (!isWhiteList(url) && !isLoggedIn()) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/login' })
      }, 1000)
      return
    }

    return originalRedirectTo(options)
  }

  // 拦截 uni.reLaunch
  const originalReLaunch = uni.reLaunch
  uni.reLaunch = (options) => {
    const url = options.url || ''

    if (!isWhiteList(url) && !isLoggedIn()) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        originalReLaunch({ url: '/pages/login/login' })
      }, 1000)
      return
    }

    return originalReLaunch(options)
  }

  // 拦截 uni.switchTab
  const originalSwitchTab = uni.switchTab
  uni.switchTab = (options) => {
    const url = options.url || ''

    if (!isWhiteList(url) && !isLoggedIn()) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/login' })
      }, 1000)
      return
    }

    return originalSwitchTab(options)
  }
}

// 页面生命周期守卫 - 在每个需要登录的页面 onShow 中调用
const pageGuard = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]

  if (!currentPage) return true

  const route = currentPage.route
  const fullPath = '/' + route

  // 白名单页面直接放行
  if (isWhiteList(fullPath)) {
    return true
  }

  // 未登录则跳转到登录页
  if (!isLoggedIn()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/login' })
    }, 1000)
    return false
  }

  return true
}

export {
  routerGuard,
  pageGuard,
  isWhiteList,
  isLoggedIn
}

export default routerGuard
