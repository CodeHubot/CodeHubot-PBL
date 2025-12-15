<template>
  <div class="channel-school-detail">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回学校列表
      </el-button>
      <h2>学校详情</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="school" class="detail-content">
      <el-card class="header-card" shadow="never">
        <h1>{{ school.school_name }}</h1>
        <p><strong>学校代码：</strong>{{ school.school_code }}</p>
        <p><strong>地址：</strong>{{ school.province }} {{ school.city }} {{ school.district }} {{ school.address }}</p>
      </el-card>

      <el-row :gutter="24" class="stats-row">
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="班级数" :value="school.statistics.class_count" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="教师数" :value="school.statistics.teacher_count" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="学生数" :value="school.statistics.student_count" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-button type="primary" @click="viewCourses" style="width: 100%">
              查看课程
            </el-button>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="classes-card" shadow="never">
        <template #header><span>班级列表</span></template>
        <el-table :data="school.classes" style="width: 100%">
          <el-table-column prop="name" label="班级名称" min-width="150" />
          <el-table-column prop="class_type" label="班级类型" min-width="100">
            <template #default="{ row }">
              <el-tag :type="getClassTypeTag(row.class_type)" size="small">
                {{ getClassTypeName(row.class_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="current_members" label="学生人数" min-width="100" align="center" />
          <el-table-column prop="course_count" label="课程数" min-width="100" align="center" />
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
import { getSchoolDetail } from '@/api/channel'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const school = ref(null)

const loadSchoolDetail = async () => {
  loading.value = true
  try {
    const response = await getSchoolDetail(route.params.id)
    school.value = response.data.data
  } catch (error) {
    console.error('加载学校详情失败:', error)
    ElMessage.error('加载学校详情失败')
  } finally {
    loading.value = false
  }
}

const getClassTypeTag = (type) => {
  const map = { club: 'primary', project: 'success', interest: 'warning', competition: 'danger', regular: 'info' }
  return map[type] || 'info'
}

const getClassTypeName = (type) => {
  const map = { club: '社团班', project: '项目班', interest: '兴趣班', competition: '竞赛班', regular: '普通班' }
  return map[type] || type
}

const viewCourses = () => router.push(`/channel/schools/${route.params.id}/courses`)
const goBack = () => router.push('/channel/schools')

onMounted(() => loadSchoolDetail())
</script>

<style scoped lang="scss">
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

.header-card {
  margin-bottom: 24px;
  
  h1 {
    margin: 0 0 16px 0;
    font-size: 28px;
  }
  
  p {
    margin: 8px 0;
    font-size: 14px;
    color: #606266;
  }
}

.stats-row {
  margin-bottom: 24px;
}
</style>
