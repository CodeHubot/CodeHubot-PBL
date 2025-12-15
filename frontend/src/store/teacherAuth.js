/**
 * 教师端认证状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { teacherLogin as teacherLoginApi, getTeacherInfo, refreshTeacherToken as refreshTokenApi } from '@/api/teacher'

export const useTeacherAuthStore = defineStore('teacherAuth', () => {
  // ==================== 状态定义 ====================
  
  /** @type {Ref<string>} 访问令牌 */
  const accessToken = ref(localStorage.getItem('teacher_access_token') || '')
  
  /** @type {Ref<string>} 刷新令牌 */
  const refreshToken = ref(localStorage.getItem('teacher_refresh_token') || '')
  
  /** @type {Ref<Object|null>} 教师信息对象 */
  const teacherInfo = ref(JSON.parse(localStorage.getItem('teacher_info') || 'null'))
  
  /** @type {Ref<Object|null>} 学校信息对象 */
  const schoolInfo = ref(JSON.parse(localStorage.getItem('teacher_school_info') || 'null'))

  // ==================== 计算属性 ====================
  
  /** 教师是否已登录 */
  const isLoggedIn = computed(() => !!accessToken.value && !!teacherInfo.value)
  
  /** 教师显示名称 */
  const teacherName = computed(() => teacherInfo.value?.name || teacherInfo.value?.real_name || teacherInfo.value?.username || '')
  
  /** 教师工号 */
  const teacherNumber = computed(() => teacherInfo.value?.teacher_number || '')
  
  /** 学校名称 */
  const schoolName = computed(() => schoolInfo.value?.school_name || '')
  
  /** 学校代码 */
  const schoolCode = computed(() => schoolInfo.value?.school_code || '')

  // ==================== 核心方法 ====================
  
  /**
   * 教师登录
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.school_code - 学校代码
   * @param {string} loginData.number - 教师工号
   * @param {string} loginData.password - 密码
   */
  const login = async (loginData) => {
    try {
      const response = await teacherLoginApi(loginData)
      const { data } = response.data
      
      // 保存认证令牌
      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token
      
      // 保存教师信息
      teacherInfo.value = data.user
      
      // 保存学校信息
      schoolInfo.value = data.school || null

      // 持久化存储
      localStorage.setItem('teacher_access_token', accessToken.value)
      localStorage.setItem('teacher_refresh_token', refreshToken.value)
      localStorage.setItem('teacher_info', JSON.stringify(teacherInfo.value))
      localStorage.setItem('teacher_school_info', JSON.stringify(schoolInfo.value))
      
      return data
    } catch (error) {
      console.error('教师登录失败:', error)
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
      teacherInfo.value = null
      schoolInfo.value = null
      
      // 清除本地存储
      localStorage.removeItem('teacher_access_token')
      localStorage.removeItem('teacher_refresh_token')
      localStorage.removeItem('teacher_info')
      localStorage.removeItem('teacher_school_info')
      
      // 跳转到登录页
      window.location.href = '/teacher/login'
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
      localStorage.setItem('teacher_access_token', accessToken.value)
      localStorage.setItem('teacher_refresh_token', refreshToken.value)
      
      return data
    } catch (error) {
      console.error('刷新令牌失败:', error)
      // 刷新失败，清除登录状态
      await logout()
      throw error
    }
  }

  /**
   * 获取当前教师信息
   */
  const fetchTeacherInfo = async () => {
    try {
      const response = await getTeacherInfo()
      const { data } = response.data
      
      teacherInfo.value = data
      
      // 更新学校信息
      if (data.school) {
        schoolInfo.value = data.school
        localStorage.setItem('teacher_school_info', JSON.stringify(schoolInfo.value))
      }
      
      localStorage.setItem('teacher_info', JSON.stringify(teacherInfo.value))
      
      return data
    } catch (error) {
      console.error('获取教师信息失败:', error)
      throw error
    }
  }

  /**
   * 设置令牌（用于刷新令牌后更新）
   */
  const setToken = (token) => {
    accessToken.value = token
    localStorage.setItem('teacher_access_token', token)
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
    const token = localStorage.getItem('teacher_access_token')
    const refresh = localStorage.getItem('teacher_refresh_token')
    const info = localStorage.getItem('teacher_info')
    const school = localStorage.getItem('teacher_school_info')
    
    if (token) accessToken.value = token
    if (refresh) refreshToken.value = refresh
    if (info) {
      try {
        teacherInfo.value = JSON.parse(info)
      } catch (e) {
        console.error('解析教师信息失败:', e)
      }
    }
    if (school) {
      try {
        schoolInfo.value = JSON.parse(school)
      } catch (e) {
        console.error('解析学校信息失败:', e)
      }
    }
  }

  // ==================== 导出 ====================
  
  return {
    // 状态
    accessToken,
    refreshToken,
    teacherInfo,
    schoolInfo,
    
    // 计算属性
    isLoggedIn,
    teacherName,
    teacherNumber,
    schoolName,
    schoolCode,
    
    // 方法
    login,
    logout,
    refreshAccessToken,
    fetchTeacherInfo,
    setToken,
    checkAuth,
    initAuth
  }
})
