<template>
  <div class="teacher-login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>跨学科项目式学习平台</h1>
        <p>教师端 - 工号登录</p>
      </div>
      
      <el-form 
        ref="loginFormRef" 
        :model="loginData" 
        :rules="loginRules" 
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="teacherNumber">
          <el-input
            v-model="loginData.teacherNumber"
            placeholder="请输入工号"
            :prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="schoolCode">
          <el-input
            v-model="loginData.schoolCode"
            placeholder="请输入学校代码"
            :prefix-icon="School"
            size="large"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginData.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <el-link @click="goToStudentLogin">学生登录</el-link>
        <el-divider direction="vertical" />
        <el-link @click="goToAdminLogin">管理员登录</el-link>
      </div>

      <div class="copyright">
        <p>© 2025 跨学科项目式学习平台. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, School } from '@element-plus/icons-vue'
import { useTeacherAuthStore } from '@/store/teacherAuth'

const router = useRouter()
const teacherAuthStore = useTeacherAuthStore()

const loading = ref(false)
const loginFormRef = ref(null)

const loginData = reactive({
  teacherNumber: '',
  schoolCode: '',
  password: ''
})

const loginRules = {
  teacherNumber: [
    { required: true, message: '请输入教师工号', trigger: 'blur' }
  ],
  schoolCode: [
    { required: true, message: '请输入学校代码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // 调用登录API
    await teacherAuthStore.login({
      school_code: loginData.schoolCode.toUpperCase(),
      number: loginData.teacherNumber,
      password: loginData.password
    })
    
    ElMessage.success('登录成功！')
    await router.push('/teacher')
    
  } catch (error) {
    console.error('登录失败:', error)
    
    let errorMessage = '登录失败，请重试！'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const goToStudentLogin = () => {
  router.push('/login')
}

const goToAdminLogin = () => {
  router.push('/admin/login')
}

onMounted(() => {
  if (teacherAuthStore.isLoggedIn) {
    router.push('/teacher')
  }
})
</script>

<style scoped lang="scss">
.teacher-login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.login-header h1 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.login-header p {
  color: #667eea;
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 32px 0;
}

.login-form {
  text-align: left;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.login-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.copyright {
  margin-top: 16px;
  
  p {
    margin: 0;
    color: #999;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
    margin: 0 16px;
  }
  
  .login-header h1 {
    font-size: 20px;
  }
}
</style>
