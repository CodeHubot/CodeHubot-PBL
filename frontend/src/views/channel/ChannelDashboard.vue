<template>
  <div class="channel-dashboard">
    <div class="welcome-card">
      <h2>欢迎，{{ channelName }}！</h2>
      <p>渠道商数据管理平台</p>
    </div>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="负责学校" :value="schoolCount" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="总课程数" :value="courseCount" />
        </el-card>
      </el-col>
    </el-row>

    <el-card class="quick-actions" shadow="never">
      <template #header><span>快捷操作</span></template>
      <el-button size="large" @click="goToSchools">
        <el-icon><School /></el-icon>
        查看学校列表
      </el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { School } from '@element-plus/icons-vue'
import { useChannelAuthStore } from '@/store/channelAuth'
import { getChannelSchools } from '@/api/channel'

const router = useRouter()
const channelAuthStore = useChannelAuthStore()
const schoolCount = ref(0)
const courseCount = ref(0)
const channelName = computed(() => channelAuthStore.channelName)

const loadStatistics = async () => {
  try {
    const response = await getChannelSchools()
    const schools = response.data.data || []
    schoolCount.value = schools.length
    courseCount.value = schools.reduce((sum, s) => sum + (s.statistics?.course_count || 0), 0)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const goToSchools = () => router.push('/channel/schools')

onMounted(() => loadStatistics())
</script>

<style scoped lang="scss">
.channel-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  
  h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
  }
  
  p {
    margin: 0;
    font-size: 16px;
    opacity: 0.9;
  }
}

.stat-card {
  margin-bottom: 24px;
  
  :deep(.el-statistic__content) {
    font-size: 32px;
    font-weight: 600;
    color: #f5576c;
  }
}
</style>
