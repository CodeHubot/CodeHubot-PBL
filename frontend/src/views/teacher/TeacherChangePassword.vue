<template>
  <div class="teacher-change-password">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回个人信息
      </el-button>
      <h2>修改密码</h2>
    </div>

    <el-row justify="center">
      <el-col :span="12">
        <el-card shadow="never">
          <el-alert
            title="密码安全提示"
            type="info"
            :closable="false"
            show-icon
          >
            <p>为了您的账号安全，请定期修改密码</p>
            <ul>
              <li>密码长度至少6位</li>
              <li>建议包含字母、数字和特殊字符</li>
              <li>不要使用过于简单的密码</li>
            </ul>
          </el-alert>

          <el-form
            :model="passwordForm"
            :rules="passwordRules"
            ref="passwordFormRef"
            label-width="100px"
            style="margin-top: 24px"
          >
            <el-form-item label="旧密码" prop="old_password">
              <el-input
                v-model="passwordForm.old_password"
                type="password"
                placeholder="请输入旧密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="new_password">
              <el-input
                v-model="passwordForm.new_password"
                type="password"
                placeholder="请输入新密码（至少6位）"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirm_password">
              <el-input
                v-model="passwordForm.confirm_password"
                type="password"
                placeholder="请再次输入新密码"
                show-password
                @keyup.enter="handleChangePassword"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="handleChangePassword"
                :loading="changing"
                style="width: 100%"
              >
                {{ changing ? '提交中...' : '确认修改' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { changePassword } from '@/api/teacher'
import { useTeacherAuthStore } from '@/store/teacherAuth'

const router = useRouter()
const teacherAuthStore = useTeacherAuthStore()
const passwordFormRef = ref(null)
const changing = ref(false)

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

// 自定义验证规则：确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.value.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  old_password: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return
    
    changing.value = true
    
    await changePassword({
      old_password: passwordForm.value.old_password,
      new_password: passwordForm.value.new_password
    })
    
    ElMessage.success('密码修改成功，请重新登录')
    
    // 延迟退出登录
    setTimeout(async () => {
      await teacherAuthStore.logout()
    }, 1500)
    
  } catch (error) {
    console.error('修改密码失败:', error)
    
    let errorMessage = '修改密码失败'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    ElMessage.error(errorMessage)
  } finally {
    changing.value = false
  }
}

const goBack = () => {
  router.push('/teacher/profile')
}
</script>

<style scoped lang="scss">
.teacher-change-password {
  max-width: 1200px;
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

.el-alert {
  margin-bottom: 24px;
  
  p {
    margin: 0 0 12px 0;
    font-size: 14px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      font-size: 13px;
      line-height: 1.8;
      color: #606266;
    }
  }
}
</style>
