<template>
  <el-container class="teacher-layout">
    <!-- 顶部导航栏 -->
    <el-header class="teacher-header">
      <div class="header-left">
        <h1 class="logo">PBL教师端</h1>
        <span class="school-info" v-if="schoolName">{{ schoolName }}</span>
      </div>
      <div class="header-right">
        <span class="teacher-name">{{ teacherName }}</span>
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <el-icon><UserFilled /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px" class="teacher-aside">
        <el-menu
          :default-active="activeMenu"
          router
          class="teacher-menu"
        >
          <el-menu-item index="/teacher">
            <el-icon><HomeFilled /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/teacher/courses">
            <el-icon><School /></el-icon>
            <span>我的班级</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="teacher-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled, HomeFilled, School } from '@element-plus/icons-vue'
import { useTeacherAuthStore } from '@/store/teacherAuth'

const router = useRouter()
const route = useRoute()
const teacherAuthStore = useTeacherAuthStore()

const activeMenu = computed(() => route.path)
const teacherName = computed(() => teacherAuthStore.teacherName)
const schoolName = computed(() => teacherAuthStore.schoolName)

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await teacherAuthStore.logout()
      ElMessage.success('已退出登录')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('退出登录失败:', error)
      }
    }
  } else if (command === 'profile') {
    router.push('/teacher/profile')
  }
}
</script>

<style scoped lang="scss">
.teacher-layout {
  height: 100vh;
}

.teacher-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .logo {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
  
  .school-info {
    font-size: 14px;
    opacity: 0.9;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .teacher-name {
    font-size: 14px;
  }
  
  .el-dropdown-link {
    cursor: pointer;
    font-size: 20px;
    color: white;
    display: flex;
    align-items: center;
    
    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .el-icon {
      font-size: 24px;
    }
  }
}

.teacher-aside {
  background: #fff;
  border-right: 1px solid #e6e6e6;
}

.teacher-menu {
  border-right: none;
  height: 100%;
}

.teacher-main {
  background: #f5f7fa;
  padding: 24px;
}
</style>
