<template>
  <div class="teacher-profile">
    <div class="page-header">
      <h2>个人信息</h2>
    </div>

    <el-row :gutter="24">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <span>基本信息</span>
          </template>
          
          <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="teacherInfo.username" disabled />
            </el-form-item>
            
            <el-form-item label="工号">
              <el-input v-model="teacherInfo.teacher_number" disabled />
            </el-form-item>
            
            <el-form-item label="所属学校">
              <el-input v-model="schoolName" disabled />
            </el-form-item>
            
            <el-form-item label="姓名" prop="name">
              <el-input v-model="profileForm.name" placeholder="请输入姓名" />
            </el-form-item>
            
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
            
            <el-form-item label="任教科目" prop="subject">
              <el-input v-model="profileForm.subject" placeholder="请输入任教科目" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile" :loading="updating">
                {{ updating ? '保存中...' : '保存信息' }}
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never" class="info-card">
          <template #header>
            <span>账号信息</span>
          </template>
          
          <div class="info-item">
            <div class="info-label">注册时间</div>
            <div class="info-value">{{ formatDateTime(teacherInfo.created_at) }}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">最后登录</div>
            <div class="info-value">{{ formatDateTime(teacherInfo.last_login) }}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">账号状态</div>
            <div class="info-value">
              <el-tag v-if="teacherInfo.is_active" type="success">正常</el-tag>
              <el-tag v-else type="danger">已禁用</el-tag>
            </div>
          </div>
          
          <el-divider />
          
          <el-button type="warning" plain style="width: 100%" @click="goToChangePassword">
            <el-icon><Lock /></el-icon>
            修改密码
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useTeacherAuthStore } from '@/store/teacherAuth'
import { updateProfile } from '@/api/teacher'
import dayjs from 'dayjs'

const router = useRouter()
const teacherAuthStore = useTeacherAuthStore()
const profileFormRef = ref(null)
const updating = ref(false)

const teacherInfo = computed(() => teacherAuthStore.teacherInfo || {})
const schoolName = computed(() => teacherAuthStore.schoolName || '-')

const profileForm = ref({
  name: '',
  phone: '',
  subject: ''
})

const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const initForm = () => {
  profileForm.value = {
    name: teacherInfo.value.name || '',
    phone: teacherInfo.value.phone || '',
    subject: teacherInfo.value.subject || ''
  }
}

const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return
    
    updating.value = true
    const response = await updateProfile(profileForm.value)
    
    // 更新本地状态
    await teacherAuthStore.fetchTeacherInfo()
    
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error(error.response?.data?.message || '更新失败')
  } finally {
    updating.value = false
  }
}

const resetForm = () => {
  initForm()
}

const goToChangePassword = () => {
  router.push('/teacher/change-password')
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  initForm()
})
</script>

<style scoped lang="scss">
.teacher-profile {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
}

.info-card {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    
    &:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
    }
    
    .info-label {
      font-size: 14px;
      color: #909399;
    }
    
    .info-value {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }
}
</style>
