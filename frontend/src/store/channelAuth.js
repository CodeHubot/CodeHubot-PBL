/**
 * 渠道商端认证状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { channelLogin as channelLoginApi, getChannelInfo, refreshChannelToken as refreshTokenApi } from '@/api/channel'

export const useChannelAuthStore = defineStore('channelAuth', () => {
  // ==================== 状态定义 ====================
  
  /** @type {Ref<string>} 访问令牌 */
  const accessToken = ref(localStorage.getItem('channel_access_token') || '')
  
  /** @type {Ref<string>} 刷新令牌 */
  const refreshToken = ref(localStorage.getItem('channel_refresh_token') || '')
  
  /** @type {Ref<Object|null>} 渠道商信息对象 */
  const channelInfo = ref(JSON.parse(localStorage.getItem('channel_info') || 'null'))

  // ==================== 计算属性 ====================
  
  /** 渠道商是否已登录 */
  const isLoggedIn = computed(() => !!accessToken.value && !!channelInfo.value)
  
  /** 渠道商显示名称 */
  const channelName = computed(() => channelInfo.value?.name || channelInfo.value?.username || '')
  
  /** 渠道商用户名 */
  const username = computed(() => channelInfo.value?.username || '')

  // ==================== 核心方法 ====================
  
  /**
   * 渠道商登录
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.username - 用户名
   * @param {string} loginData.password - 密码
   */
  const login = async (loginData) => {
    try {
      const response = await channelLoginApi(loginData)
      const { data } = response.data
      
      // 保存认证令牌
      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token
      
      // 保存渠道商信息
      channelInfo.value = data.user

      // 持久化存储
      localStorage.setItem('channel_access_token', accessToken.value)
      localStorage.setItem('channel_refresh_token', refreshToken.value)
      localStorage.setItem('channel_info', JSON.stringify(channelInfo.value))
      
      return data
    } catch (error) {
      console.error('渠道商登录失败:', error)
      throw error
    }
  }

  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      // 清除状态
      accessToken.value = ''
      refreshToken.value = ''
      channelInfo.value = null
      
      // 清除本地存储
      localStorage.removeItem('channel_access_token')
      localStorage.removeItem('channel_refresh_token')
      localStorage.removeItem('channel_info')
      
      // 跳转到登录页
      window.location.href = '/channel/login'
    } catch (error) {
      console.error('退出登录失败:', error)
      throw error
    }
  }

  /**
   * 刷新令牌
   */
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('没有刷新令牌')
      }
      
      const response = await refreshTokenApi(refreshToken.value)
      const { data } = response.data
      
      // 更新令牌
      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token
      
      // 持久化存储
      localStorage.setItem('channel_access_token', accessToken.value)
      localStorage.setItem('channel_refresh_token', refreshToken.value)
      
      return data
    } catch (error) {
      console.error('刷新令牌失败:', error)
      // 刷新失败，清除登录状态
      await logout()
      throw error
    }
  }

  /**
   * 获取当前渠道商信息
   */
  const fetchChannelInfo = async () => {
    try {
      const response = await getChannelInfo()
      const { data } = response.data
      
      channelInfo.value = data
      localStorage.setItem('channel_info', JSON.stringify(channelInfo.value))
      
      return data
    } catch (error) {
      console.error('获取渠道商信息失败:', error)
      throw error
    }
  }

  /**
   * 设置令牌（用于刷新令牌后更新）
   */
  const setToken = (token) => {
    accessToken.value = token
    localStorage.setItem('channel_access_token', token)
  }

  /**
   * 检查登录状态
   */
  const checkAuth = () => {
    return isLoggedIn.value
  }

  /**
   * 初始化认证状态（从localStorage恢复）
   */
  const initAuth = () => {
    const token = localStorage.getItem('channel_access_token')
    const refresh = localStorage.getItem('channel_refresh_token')
    const info = localStorage.getItem('channel_info')
    
    if (token) accessToken.value = token
    if (refresh) refreshToken.value = refresh
    if (info) {
      try {
        channelInfo.value = JSON.parse(info)
      } catch (e) {
        console.error('解析渠道商信息失败:', e)
      }
    }
  }

  // ==================== 导出 ====================
  
  return {
    // 状态
    accessToken,
    refreshToken,
    channelInfo,
    
    // 计算属性
    isLoggedIn,
    channelName,
    username,
    
    // 方法
    login,
    logout,
    refreshAccessToken,
    fetchChannelInfo,
    setToken,
    checkAuth,
    initAuth
  }
})
