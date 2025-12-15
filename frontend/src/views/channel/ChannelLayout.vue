<template>
  <el-container class="channel-layout">
    <el-header class="channel-header">
      <div class="header-left">
        <h1 class="logo">PBL渠道商端</h1>
      </div>
      <div class="header-right">
        <span class="channel-name">{{ channelName }}</span>
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <el-icon><UserFilled /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <el-aside width="200px" class="channel-aside">
        <el-menu :default-active="activeMenu" router class="channel-menu">
          <el-menu-item index="/channel">
            <el-icon><HomeFilled /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/channel/schools">
            <el-icon><School /></el-icon>
            <span>学校管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="channel-main">
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
import { useChannelAuthStore } from '@/store/channelAuth'

const router = useRouter()
const route = useRoute()
const channelAuthStore = useChannelAuthStore()

const activeMenu = computed(() => route.path)
const channelName = computed(() => channelAuthStore.channelName)

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await channelAuthStore.logout()
      ElMessage.success('已退出登录')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('退出登录失败:', error)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.channel-layout {
  height: 100vh;
}

.channel-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  .logo {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .channel-name {
    font-size: 14px;
  }
  
  .el-dropdown-link {
    cursor: pointer;
    font-size: 20px;
  }
}

.channel-aside {
  background: #fff;
  border-right: 1px solid #e6e6e6;
}

.channel-menu {
  border-right: none;
  height: 100%;
}

.channel-main {
  background: #f5f7fa;
  padding: 24px;
}
</style>
