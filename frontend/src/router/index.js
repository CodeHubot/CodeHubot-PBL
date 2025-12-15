import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'
import Login from '../views/Login.vue'
import ChangePassword from '../views/ChangePassword.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '学生登录 - 跨学科项目式学习平台',
      requiresAuth: false
    }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: {
      title: '修改密码 - 跨学科项目式学习平台',
      requiresAuth: true,
      skipPasswordCheck: true  // 跳过密码检查，允许访问修改密码页面
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/courses',
    children: [
      {
        path: 'courses',
        name: 'MyCourses',
        component: () => import('../views/MyCourses.vue'),
        meta: {
          title: '我的课程 - 跨学科项目式学习平台',
          requiresAuth: true
        }
      },
      {
        path: 'course/:courseId',
        name: 'CourseDetail',
        component: () => import('../views/CourseDetail.vue'),
        meta: {
          title: '课程详情 - 跨学科项目式学习平台',
          requiresAuth: true
        }
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('../views/Projects.vue'),
        meta: { 
          requiresAuth: true,
          title: '项目实践 - 跨学科项目式学习平台'
        }
      },
      {
        path: 'project/:id',
        name: 'ProjectDetail',
        component: () => import('../views/ProjectDetail.vue'),
        meta: { 
          requiresAuth: true, 
          title: '项目详情 - 跨学科项目式学习平台'
        }
      },
      {
        path: 'outputs',
        name: 'Outputs',
        component: () => import('../views/StudentOutputs.vue'),
        meta: { 
          requiresAuth: true, 
          title: '项目成果 - 跨学科项目式学习平台'
        }
      },
      {
        path: 'portfolio',
        name: 'Portfolio',
        component: () => import('../views/StudentPortfolio.vue'),
        meta: { 
          requiresAuth: true, 
          title: '学习档案 - 跨学科项目式学习平台'
        }
      },
      {
        path: 'tasks/:id?',
        name: 'Tasks',
        component: () => import('../views/Tasks.vue'),
        meta: { 
          requiresAuth: true, 
          title: '任务列表 - 跨学科项目式学习平台'
        }
      },
      {
        path: 'progress',
        name: 'Progress',
        component: () => import('../views/Progress.vue'),
        meta: { 
          requiresAuth: true, 
          title: '学习进度 - 跨学科项目式学习平台'
        }
      },
      {
        path: 'unit/:unitId',
        name: 'UnitLearning',
        component: () => import('../views/UnitLearning.vue'),
        meta: {
          title: '单元学习',
          requiresAuth: true,
          hideSidebar: true
        },
        props: true
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: {
          title: '个人中心 - 跨学科项目式学习平台',
          requiresAuth: true
        }
      },
      {
        path: 'my-tasks',
        name: 'MyTasks',
        component: () => import('../views/MyTasks.vue'),
        meta: {
          title: '我提交的任务 - 跨学科项目式学习平台',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLogin.vue'),
    meta: {
      title: '机构管理员登录 - PBL系统管理后台',
      requiresAuth: false
    }
  },
  {
    path: '/platform-admin/login',
    name: 'PlatformAdminLogin',
    component: () => import('../views/PlatformAdminLogin.vue'),
    meta: {
      title: '平台管理员登录 - PBL系统管理后台',
      requiresAuth: false
    }
  },
  {
    path: '/admin',
    component: () => import('../views/AdminDashboard.vue'),
    redirect: '/admin',
    meta: {
      requiresAdminAuth: true
    },
    children: [
      {
        path: '',
        name: 'AdminHome',
        component: () => import('../views/AdminCourses.vue'),
        meta: {
          title: '概览 - PBL系统管理后台'
        }
      },
      {
        path: 'courses',
        name: 'AdminCourses',
        component: () => import('../views/AdminCourses.vue'),
        meta: {
          title: '课程管理 - PBL系统管理后台'
        }
      },
      {
        path: 'courses/:courseId',
        name: 'AdminCourseDetail',
        component: () => import('../views/AdminCourseDetail.vue'),
        meta: {
          title: '课程详情 - PBL系统管理后台'
        }
      },
      {
        path: 'schools',
        name: 'AdminSchools',
        component: () => import('../views/AdminSchools.vue'),
        meta: {
          title: '学校管理 - PBL系统管理后台'
        }
      },
      {
        path: 'school-courses',
        name: 'AdminSchoolCourses',
        component: () => import('../views/AdminSchoolCourses.vue'),
        meta: {
          title: '学校课程配置 - PBL系统管理后台'
        }
      },
      {
        path: 'school-course-library',
        name: 'SchoolCourseLibrary',
        component: () => import('../views/SchoolCourseLibrary.vue'),
        meta: {
          title: '学校课程库 - PBL系统管理后台'
        }
      },
      {
        path: 'course-templates',
        name: 'CourseTemplates',
        component: () => import('../views/CourseTemplates.vue'),
        meta: {
          title: '课程模板管理 - PBL系统管理后台'
        }
      },
      {
        path: 'course-templates/:uuid',
        name: 'CourseTemplateDetail',
        component: () => import('../views/CourseTemplateDetail.vue'),
        meta: {
          title: '课程模板详情 - PBL系统管理后台'
        }
      },
      {
        path: 'template-permissions',
        name: 'TemplatePermissions',
        component: () => import('../views/TemplatePermissions.vue'),
        meta: {
          title: '课程模板授权 - PBL系统管理后台'
        }
      },
      {
        path: 'template-library',
        redirect: '/admin/template-permissions',
        meta: {
          title: '模板库管理 - PBL系统管理后台'
        }
      },
      {
        path: 'available-templates',
        name: 'AvailableTemplates',
        component: () => import('../views/AvailableTemplates.vue'),
        meta: {
          title: '课程模板库 - PBL系统管理后台'
        }
      },
      {
        path: 'template-detail/:uuid',
        name: 'TemplateDetail',
        component: () => import('../views/TemplateDetail.vue'),
        meta: {
          title: '课程模板详情 - PBL系统管理后台'
        }
      },
      {
        path: 'units',
        name: 'AdminUnits',
        component: () => import('../views/AdminUnits.vue'),
        meta: {
          title: '学习单元 - PBL系统管理后台'
        }
      },
      {
        path: 'resources',
        name: 'AdminResources',
        component: () => import('../views/AdminResources.vue'),
        meta: {
          title: '资料管理 - PBL系统管理后台'
        }
      },
      {
        path: 'video-permissions',
        name: 'AdminVideoPermissions',
        component: () => import('../views/AdminVideoPermissions.vue'),
        meta: {
          title: '视频权限管理 - PBL系统管理后台'
        }
      },
      {
        path: 'tasks',
        name: 'AdminTasks',
        component: () => import('../views/AdminTasks.vue'),
        meta: {
          title: '任务管理 - PBL系统管理后台'
        }
      },
      {
        path: 'projects',
        name: 'AdminProjects',
        component: () => import('../views/AdminProjects.vue'),
        meta: {
          title: '项目管理 - PBL系统管理后台'
        }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/AdminUsers.vue'),
        meta: {
          title: '用户管理 - PBL系统管理后台'
        }
      },
      {
        path: 'school-user-management',
        name: 'SchoolUserManagement',
        component: () => import('../views/SchoolUserManagement.vue'),
        meta: {
          title: '用户管理 - PBL系统管理后台'
        }
      },
      {
        path: 'classes',
        name: 'AdminClasses',
        component: () => import('../views/ClubClasses.vue'),
        meta: {
          title: '项目式课程管理 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:uuid',
        name: 'ClassDetail',
        component: () => import('../views/ClassDetail.vue'),
        meta: {
          title: '班级详情 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:uuid/edit',
        name: 'ClassEdit',
        component: () => import('../views/ClassEdit.vue'),
        meta: {
          title: '编辑班级 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:uuid/members',
        name: 'ClassMembers',
        component: () => import('../views/ClassMembers.vue'),
        meta: {
          title: '成员管理 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:uuid/courses',
        name: 'ClassCourses',
        component: () => import('../views/ClassCourses.vue'),
        meta: {
          title: '课程管理 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:uuid/groups',
        name: 'ClassGroups',
        component: () => import('../views/ClassGroups.vue'),
        meta: {
          title: '小组管理 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:uuid/teachers',
        name: 'ClassTeachers',
        component: () => import('../views/ClassTeachers.vue'),
        meta: {
          title: '教师管理 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:uuid/progress',
        name: 'ClassProgress',
        component: () => import('../views/ClassProgress.vue'),
        meta: {
          title: '学习进度 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:classUuid/progress/units/:unitId',
        name: 'ClassUnitDetail',
        component: () => import('../views/ClassUnitDetail.vue'),
        meta: {
          title: '单元详情 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:uuid/homework',
        name: 'ClassHomework',
        component: () => import('../views/ClassHomework.vue'),
        meta: {
          title: '作业管理 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:uuid/homework/units/:unitId',
        name: 'ClassUnitHomework',
        component: () => import('../views/ClassUnitHomework.vue'),
        meta: {
          title: '单元作业 - PBL系统管理后台'
        }
      },
      {
        path: 'classes/:uuid/create-course',
        name: 'ClassCreateCourse',
        component: () => import('../views/ClassCreateCourse.vue'),
        meta: {
          title: '创建课程 - PBL系统管理后台'
        }
      },
      {
        path: 'progress',
        name: 'AdminProgress',
        component: () => import('../views/AdminProgress.vue'),
        meta: {
          title: '学习进度 - PBL系统管理后台'
        }
      },
      {
        path: 'assessments',
        name: 'AdminAssessments',
        component: () => import('../views/AdminAssessments.vue'),
        meta: {
          title: '评价管理 - PBL系统管理后台'
        }
      },
      {
        path: 'assessment-templates',
        name: 'AdminAssessmentTemplates',
        component: () => import('../views/AdminAssessmentTemplates.vue'),
        meta: {
          title: '评价模板 - PBL系统管理后台'
        }
      },
      {
        path: 'outputs',
        name: 'AdminOutputs',
        component: () => import('../views/AdminOutputs.vue'),
        meta: {
          title: '成果管理 - PBL系统管理后台'
        }
      },
      {
        path: 'portfolios',
        name: 'AdminPortfolios',
        component: () => import('../views/AdminPortfolios.vue'),
        meta: {
          title: '学习档案 - PBL系统管理后台'
        }
      },
      {
        path: 'datasets',
        name: 'AdminDatasets',
        component: () => import('../views/AdminDatasets.vue'),
        meta: {
          title: '数据集管理 - PBL系统管理后台'
        }
      },
      {
        path: 'ethics-cases',
        name: 'AdminEthicsCases',
        component: () => import('../views/AdminEthicsCases.vue'),
        meta: {
          title: '伦理案例 - PBL系统管理后台'
        }
      },
      {
        path: 'ethics-activities',
        name: 'AdminEthicsActivities',
        component: () => import('../views/AdminEthicsActivities.vue'),
        meta: {
          title: '伦理活动 - PBL系统管理后台'
        }
      },
      {
        path: 'experts',
        name: 'AdminExperts',
        component: () => import('../views/AdminExperts.vue'),
        meta: {
          title: '专家管理 - PBL系统管理后台'
        }
      },
      {
        path: 'social-activities',
        name: 'AdminSocialActivities',
        component: () => import('../views/AdminSocialActivities.vue'),
        meta: {
          title: '社会活动 - PBL系统管理后台'
        }
      }
    ]
  },
  {
    path: '/teacher/login',
    name: 'TeacherLogin',
    component: () => import('../views/teacher/TeacherLogin.vue'),
    meta: {
      title: '教师登录 - PBL系统教师端',
      requiresAuth: false
    }
  },
  {
    path: '/teacher',
    component: () => import('../views/teacher/TeacherLayout.vue'),
    redirect: '/teacher/dashboard',
    meta: {
      requiresTeacherAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('../views/teacher/TeacherDashboard.vue'),
        meta: {
          title: '工作台 - PBL系统教师端'
        }
      },
      {
        path: 'courses',
        name: 'TeacherCourses',
        component: () => import('../views/teacher/TeacherCourses.vue'),
        meta: {
          title: '我的班级 - PBL系统教师端'
        }
      },
      {
        path: 'courses/:uuid',
        name: 'TeacherCourseDetail',
        component: () => import('../views/teacher/TeacherCourseDetail.vue'),
        meta: {
          title: '课程详情 - PBL系统教师端'
        }
      },
      {
        path: 'courses/:uuid/members',
        name: 'TeacherMembers',
        component: () => import('../views/teacher/TeacherMembers.vue'),
        meta: {
          title: '班级成员 - PBL系统教师端'
        }
      },
      {
        path: 'courses/:uuid/groups',
        name: 'TeacherGroups',
        component: () => import('../views/teacher/TeacherGroups.vue'),
        meta: {
          title: '分组管理 - PBL系统教师端'
        }
      },
      {
        path: 'courses/:uuid/progress',
        name: 'TeacherProgressUnits',
        component: () => import('../views/teacher/TeacherProgressUnits.vue'),
        meta: {
          title: '学习进度 - PBL系统教师端'
        }
      },
      {
        path: 'courses/:uuid/progress/units/:unitId',
        name: 'TeacherProgressUnitDetail',
        component: () => import('../views/teacher/TeacherProgressUnitDetail.vue'),
        meta: {
          title: '单元学习进度 - PBL系统教师端'
        }
      },
      {
        path: 'courses/:uuid/homework',
        name: 'TeacherHomeworkUnits',
        component: () => import('../views/teacher/TeacherHomeworkUnits.vue'),
        meta: {
          title: '作业管理 - PBL系统教师端'
        }
      },
      {
        path: 'courses/:uuid/homework/units/:unitId',
        name: 'TeacherHomeworkUnitDetail',
        component: () => import('../views/teacher/TeacherHomeworkUnitDetail.vue'),
        meta: {
          title: '单元作业管理 - PBL系统教师端'
        }
      },
      {
        path: 'profile',
        name: 'TeacherProfile',
        component: () => import('../views/teacher/TeacherProfile.vue'),
        meta: {
          title: '个人信息 - PBL系统教师端'
        }
      },
      {
        path: 'change-password',
        name: 'TeacherChangePassword',
        component: () => import('../views/teacher/TeacherChangePassword.vue'),
        meta: {
          title: '修改密码 - PBL系统教师端'
        }
      }
    ]
  },
  {
    path: '/channel/login',
    name: 'ChannelLogin',
    component: () => import('../views/channel/ChannelLogin.vue'),
    meta: {
      title: '渠道商登录 - PBL系统渠道商端',
      requiresAuth: false
    }
  },
  {
    path: '/channel',
    component: () => import('../views/channel/ChannelLayout.vue'),
    redirect: '/channel/dashboard',
    meta: {
      requiresChannelAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'ChannelDashboard',
        component: () => import('../views/channel/ChannelDashboard.vue'),
        meta: {
          title: '工作台 - PBL系统渠道商端'
        }
      },
      {
        path: 'schools',
        name: 'ChannelSchools',
        component: () => import('../views/channel/ChannelSchools.vue'),
        meta: {
          title: '学校管理 - PBL系统渠道商端'
        }
      },
      {
        path: 'schools/:id',
        name: 'ChannelSchoolDetail',
        component: () => import('../views/channel/ChannelSchoolDetail.vue'),
        meta: {
          title: '学校详情 - PBL系统渠道商端'
        }
      },
      {
        path: 'schools/:id/courses',
        name: 'ChannelSchoolCourses',
        component: () => import('../views/channel/ChannelSchoolCourses.vue'),
        meta: {
          title: '课程列表 - PBL系统渠道商端'
        }
      },
      {
        path: 'courses/:uuid',
        name: 'ChannelCourseView',
        component: () => import('../views/channel/ChannelCourseView.vue'),
        meta: {
          title: '课程详情 - PBL系统渠道商端'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  try {
    // 设置页面标题
    if (to.meta.title) {
      document.title = to.meta.title
    } else {
      document.title = '跨学科项目式学习平台'
    }
    
    // 渠道商端路由检查
    if (to.meta.requiresChannelAuth) {
      const channelToken = localStorage.getItem('channel_access_token')
      const isChannelTokenValid = channelToken && !isTokenExpired(channelToken)
      
      if (!isChannelTokenValid) {
        localStorage.removeItem('channel_access_token')
        localStorage.removeItem('channel_refresh_token')
        localStorage.removeItem('channel_info')
        next('/channel/login')
        return
      }
      
      next()
      return
    }
    
    // 如果已登录渠道商端且访问渠道商登录页，跳转到渠道商工作台
    if (to.name === 'ChannelLogin') {
      const channelToken = localStorage.getItem('channel_access_token')
      const isChannelTokenValid = channelToken && !isTokenExpired(channelToken)
      if (isChannelTokenValid) {
        next('/channel')
        return
      }
    }
    
    // 教师端路由检查
    if (to.meta.requiresTeacherAuth) {
      const teacherToken = localStorage.getItem('teacher_access_token')
      const isTeacherTokenValid = teacherToken && !isTokenExpired(teacherToken)
      
      if (!isTeacherTokenValid) {
        localStorage.removeItem('teacher_access_token')
        localStorage.removeItem('teacher_refresh_token')
        localStorage.removeItem('teacher_info')
        next('/teacher/login')
        return
      }
      
      next()
      return
    }
    
    // 如果已登录教师端且访问教师登录页，跳转到教师工作台
    if (to.name === 'TeacherLogin') {
      const teacherToken = localStorage.getItem('teacher_access_token')
      const isTeacherTokenValid = teacherToken && !isTokenExpired(teacherToken)
      if (isTeacherTokenValid) {
        next('/teacher')
        return
      }
    }
    
    // 管理员路由检查
    if (to.meta.requiresAdminAuth) {
      const adminToken = localStorage.getItem('admin_access_token')
      const isAdminTokenValid = adminToken && !isTokenExpired(adminToken)
      
      if (!isAdminTokenValid) {
        localStorage.removeItem('admin_access_token')
        localStorage.removeItem('admin_info')
        next('/admin/login')
        return
      }
      
      // 如果已登录且访问管理员登录页，跳转到管理后台
      if ((to.name === 'AdminLogin' || to.name === 'PlatformAdminLogin') && isAdminTokenValid) {
        // 获取管理员信息，根据角色重定向
        const adminInfo = localStorage.getItem('admin_info')
        if (adminInfo) {
          try {
            const admin = JSON.parse(adminInfo)
            if (admin.role === 'teacher') {
              next('/admin/classes')
              return
            }
          } catch (e) {
            console.error('解析管理员信息失败:', e)
          }
        }
        next('/admin')
        return
      }
      
      // 如果是教师访问 /admin 首页，重定向到 /admin/classes
      if (to.path === '/admin' || to.name === 'AdminHome') {
        const adminInfo = localStorage.getItem('admin_info')
        if (adminInfo) {
          try {
            const admin = JSON.parse(adminInfo)
            if (admin.role === 'teacher') {
              next('/admin/classes')
              return
            }
          } catch (e) {
            console.error('解析管理员信息失败:', e)
          }
        }
      }
      
      next()
      return
    }
    
    // 动态导入认证store以避免循环依赖
    const { useAuthStore } = await import('@/store/auth')
    const authStore = useAuthStore()
    
    // 学生路由检查
    if (to.meta.requiresAuth !== false) {
      // 检查token是否存在且有效
      const token = localStorage.getItem('access_token') || localStorage.getItem('student_access_token')
      const isTokenValid = token && !isTokenExpired(token)
      
      if (!isTokenValid) {
        // 清除无效token
        localStorage.removeItem('access_token')
        localStorage.removeItem('student_access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('student_refresh_token')
        
        // 重置认证状态
        authStore.logout()
        
        next('/login')
        return
      }
      
      // Token有效，更新认证状态
      if (!authStore.isLoggedIn) {
        authStore.setToken(token)
      }
    }
    
    // 如果已登录且访问登录页，跳转到首页
    if (to.name === 'Login') {
      const token = localStorage.getItem('access_token') || localStorage.getItem('student_access_token')
      const isTokenValid = token && !isTokenExpired(token)
      if (isTokenValid) {
        next('/')
        return
      }
    }
    
    // 如果已登录且访问管理员登录页，跳转到管理后台
    if (to.name === 'AdminLogin' || to.name === 'PlatformAdminLogin') {
      const adminToken = localStorage.getItem('admin_access_token')
      const isAdminTokenValid = adminToken && !isTokenExpired(adminToken)
      if (isAdminTokenValid) {
        next('/admin')
        return
      }
    }
    
    // 检查是否需要强制修改密码（学生用户）
    if (to.meta.requiresAuth && !to.meta.skipPasswordCheck && to.name !== 'ChangePassword') {
      
      // 确保用户信息已加载
      if (!authStore.userInfo) {
        await authStore.fetchUserInfo()
      }
      
      // 如果用户需要修改密码，强制跳转到修改密码页面
      if (authStore.userInfo && authStore.userInfo.need_change_password) {
        next('/change-password')
        return
      }
    }
    
    next()
  } catch (error) {
    console.error('路由守卫错误:', error)
    // 发生错误时，如果是需要认证的页面，跳转到登录页
    if (to.meta.requiresAuth !== false || to.meta.requiresAdminAuth) {
      if (to.meta.requiresAdminAuth) {
        next('/admin/login')
      } else {
        next('/login')
      }
    } else {
      next()
    }
  }
})

// Token过期检查函数
function isTokenExpired(token) {
  try {
    if (!token) return true
    
    // 如果是 Mock Token，直接认为未过期
    if (token.startsWith('mock_')) {
      return false
    }
    
    // 简单的JWT token过期检查
    const parts = token.split('.')
    if (parts.length !== 3) {
      return true
    }
    
    const payload = JSON.parse(atob(parts[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    return payload.exp < currentTime
  } catch (error) {
    console.error('Token解析错误:', error)
    return true
  }
}

export default router

