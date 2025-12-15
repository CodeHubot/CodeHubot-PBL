<template>
  <div class="teacher-homework-units">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回课程详情
      </el-button>
      <h2>作业管理 - 选择单元</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <el-row v-else :gutter="24">
      <el-col v-for="unit in units" :key="unit.id" :span="8">
        <el-card class="unit-card" shadow="hover" @click="goToUnitDetail(unit.id)">
          <div class="unit-header">
            <h3>{{ unit.title }}</h3>
            <el-tag type="success" size="small">单元 {{ unit.order }}</el-tag>
          </div>
          
          <p class="unit-description">{{ unit.description || '暂无描述' }}</p>
          
          <div class="unit-stats">
            <div class="stat-item">
              <el-icon><Document /></el-icon>
              <span>{{ unit.task_count }} 个作业任务</span>
            </div>
            <div v-if="unit.estimated_duration" class="stat-item">
              <el-icon><Clock /></el-icon>
              <span>{{ unit.estimated_duration }}</span>
            </div>
          </div>
          
          <div class="unit-footer">
            <el-button type="success" size="small" @click.stop="goToUnitDetail(unit.id)">
              查看作业
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Document, Clock } from '@element-plus/icons-vue'
import { getCourseUnits } from '@/api/teacher'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const units = ref([])

const loadUnits = async () => {
  loading.value = true
  try {
    const response = await getCourseUnits(route.params.uuid)
    units.value = response.data.data
  } catch (error) {
    console.error('加载单元列表失败:', error)
    ElMessage.error('加载单元列表失败')
  } finally {
    loading.value = false
  }
}

const goToUnitDetail = (unitId) => {
  router.push(`/teacher/courses/${route.params.uuid}/homework/units/${unitId}`)
}

const goBack = () => {
  router.push(`/teacher/courses/${route.params.uuid}`)
}

onMounted(() => {
  loadUnits()
})
</script>

<style scoped lang="scss">
.teacher-homework-units {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  
  h2 {
    flex: 1;
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
}

.unit-card {
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  .unit-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
    
    h3 {
      flex: 1;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .unit-description {
    margin: 0 0 16px 0;
    color: #606266;
    font-size: 14px;
    line-height: 1.6;
    min-height: 44px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .unit-stats {
    display: flex;
    gap: 16px;
    padding: 12px 0;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 16px;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #909399;
      font-size: 14px;
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
  
  .unit-footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
