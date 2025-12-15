<template>
  <div class="teacher-members">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回课程详情
      </el-button>
      <h2>班级成员</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else class="content">
      <!-- 班级信息卡片 -->
      <el-card v-if="classInfo" shadow="never" class="class-info-card">
        <h3>{{ classInfo.name }}</h3>
        <div class="info-items">
          <span><strong>班级类型：</strong>{{ getClassTypeName(classInfo.class_type) }}</span>
          <span><strong>当前人数：</strong>{{ classInfo.current_members }}人</span>
        </div>
      </el-card>

      <!-- 成员列表 -->
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>成员列表（共 {{ total }} 人）</span>
          </div>
        </template>

        <el-table :data="members" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="name" label="姓名" min-width="120" />
          <el-table-column prop="student_number" label="学号" min-width="120" />
          <el-table-column prop="phone" label="联系电话" min-width="130" />
          <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
          <el-table-column label="所在小组" min-width="120">
            <template #default="{ row }">
              <el-tag v-if="row.group_name" type="primary" size="small">
                {{ row.group_name }}
              </el-tag>
              <span v-else class="text-muted">未分组</span>
            </template>
          </el-table-column>
          <el-table-column label="加入时间" min-width="180">
            <template #default="{ row }">
              {{ formatDate(row.joined_at) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getClassMembers } from '@/api/teacher'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const classInfo = ref(null)
const members = ref([])
const total = ref(0)

const loadMembers = async () => {
  loading.value = true
  try {
    const response = await getClassMembers(route.params.uuid)
    const data = response.data.data
    classInfo.value = data.class_info
    members.value = data.members
    total.value = data.total
  } catch (error) {
    console.error('加载班级成员失败:', error)
    ElMessage.error('加载班级成员失败')
  } finally {
    loading.value = false
  }
}

const getClassTypeName = (type) => {
  const map = {
    'club': '社团班',
    'project': '项目班',
    'interest': '兴趣班',
    'competition': '竞赛班',
    'regular': '普通班'
  }
  return map[type] || type
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.push(`/teacher/courses/${route.params.uuid}`)
}

onMounted(() => {
  loadMembers()
})
</script>

<style scoped lang="scss">
.teacher-members {
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

.class-info-card {
  margin-bottom: 24px;
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 20px;
  }
  
  .info-items {
    display: flex;
    gap: 24px;
    
    span {
      color: #606266;
      font-size: 14px;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}
</style>
