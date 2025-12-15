<template>
  <div class="teacher-groups">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回课程详情
      </el-button>
      <h2>分组管理</h2>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        创建小组
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="groups.length === 0" class="empty-container">
      <el-empty description="暂无小组">
        <el-button type="primary" @click="showCreateDialog">创建第一个小组</el-button>
      </el-empty>
    </div>

    <el-row v-else :gutter="24">
      <el-col v-for="group in groups" :key="group.id" :span="8">
        <el-card class="group-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="group-name">{{ group.name }}</span>
              <el-dropdown @command="(cmd) => handleGroupCommand(cmd, group)">
                <el-icon class="more-icon"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑小组</el-dropdown-item>
                    <el-dropdown-item command="addMember">添加成员</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除小组</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>

          <div class="group-info">
            <p class="group-description">{{ group.description || '暂无描述' }}</p>
            
            <div class="group-stats">
              <el-tag type="info">
                {{ group.current_members }}/{{ group.max_members }} 人
              </el-tag>
            </div>

            <div class="member-list">
              <div v-for="member in group.members" :key="member.id" class="member-item">
                <div class="member-info">
                  <el-avatar :size="32" :style="{ backgroundColor: getMemberColor(member.id) }">
                    {{ member.name?.substring(0, 1) }}
                  </el-avatar>
                  <div class="member-details">
                    <span class="member-name">{{ member.name }}</span>
                    <span class="member-number">{{ member.student_number }}</span>
                  </div>
                  <el-tag v-if="member.role === 'leader'" type="success" size="small">组长</el-tag>
                </div>
                <el-icon 
                  class="remove-icon" 
                  @click="removeMember(group, member)"
                  v-if="member.role !== 'leader'"
                >
                  <Close />
                </el-icon>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建/编辑小组对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '创建小组' : '编辑小组'"
      width="500px"
    >
      <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef" label-width="100px">
        <el-form-item label="小组名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入小组名称" />
        </el-form-item>
        <el-form-item label="小组描述" prop="description">
          <el-input
            v-model="groupForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入小组描述"
          />
        </el-form-item>
        <el-form-item label="最大成员数" prop="max_members">
          <el-input-number v-model="groupForm.max_members" :min="1" :max="20" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ submitting ? '提交中...' : '确定' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加成员对话框 -->
    <el-dialog v-model="addMemberDialogVisible" title="添加小组成员" width="600px">
      <div class="member-selector">
        <el-input
          v-model="memberSearch"
          placeholder="搜索学生姓名或学号"
          :prefix-icon="Search"
          clearable
          @input="handleMemberSearch"
        />
        
        <div class="available-members">
          <el-checkbox-group v-model="selectedMembers">
            <div
              v-for="student in filteredAvailableStudents"
              :key="student.id"
              class="student-item"
            >
              <el-checkbox :label="student.id">
                <div class="student-info">
                  <el-avatar :size="32" :style="{ backgroundColor: getMemberColor(student.id) }">
                    {{ student.name?.substring(0, 1) }}
                  </el-avatar>
                  <div class="student-details">
                    <span class="student-name">{{ student.name }}</span>
                    <span class="student-number">{{ student.student_number }}</span>
                  </div>
                </div>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="addMemberDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddMembers" :loading="submitting">
          添加 {{ selectedMembers.length }} 名成员
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Plus, MoreFilled, Close, Search
} from '@element-plus/icons-vue'
import {
  getCourseGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addGroupMembers,
  removeGroupMember
} from '@/api/teacher'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const groups = ref([])
const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const groupFormRef = ref(null)
const currentGroup = ref(null)

const groupForm = ref({
  name: '',
  description: '',
  max_members: 6
})

const groupRules = {
  name: [
    { required: true, message: '请输入小组名称', trigger: 'blur' }
  ]
}

// 添加成员相关
const addMemberDialogVisible = ref(false)
const memberSearch = ref('')
const selectedMembers = ref([])
const availableStudents = ref([]) // TODO: 从API获取可用学生列表
const currentGroupForAddMember = ref(null)

const filteredAvailableStudents = computed(() => {
  if (!memberSearch.value) return availableStudents.value
  
  const search = memberSearch.value.toLowerCase()
  return availableStudents.value.filter(student => 
    student.name?.toLowerCase().includes(search) ||
    student.student_number?.toLowerCase().includes(search)
  )
})

const loadGroups = async () => {
  loading.value = true
  try {
    const courseUuid = route.params.uuid
    const response = await getCourseGroups(courseUuid)
    groups.value = response.data.data || []
  } catch (error) {
    console.error('加载小组列表失败:', error)
    ElMessage.error('加载小组列表失败')
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  dialogMode.value = 'create'
  groupForm.value = {
    name: '',
    description: '',
    max_members: 6
  }
  currentGroup.value = null
  dialogVisible.value = true
}

const showEditDialog = (group) => {
  dialogMode.value = 'edit'
  groupForm.value = {
    name: group.name,
    description: group.description,
    max_members: group.max_members
  }
  currentGroup.value = group
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!groupFormRef.value) return
  
  try {
    const valid = await groupFormRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    const courseUuid = route.params.uuid
    
    if (dialogMode.value === 'create') {
      await createGroup(courseUuid, groupForm.value)
      ElMessage.success('小组创建成功')
    } else {
      await updateGroup(courseUuid, currentGroup.value.id, groupForm.value)
      ElMessage.success('小组更新成功')
    }
    
    dialogVisible.value = false
    await loadGroups()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleGroupCommand = (command, group) => {
  if (command === 'edit') {
    showEditDialog(group)
  } else if (command === 'addMember') {
    showAddMemberDialog(group)
  } else if (command === 'delete') {
    handleDeleteGroup(group)
  }
}

const handleDeleteGroup = async (group) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除小组"${group.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const courseUuid = route.params.uuid
    await deleteGroup(courseUuid, group.id)
    ElMessage.success('小组已删除')
    await loadGroups()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const showAddMemberDialog = (group) => {
  currentGroupForAddMember.value = group
  selectedMembers.value = []
  memberSearch.value = ''
  // TODO: 加载可用学生列表（排除已在小组中的学生）
  availableStudents.value = []
  addMemberDialogVisible.value = true
}

const handleMemberSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const handleAddMembers = async () => {
  if (selectedMembers.value.length === 0) {
    ElMessage.warning('请选择要添加的成员')
    return
  }
  
  try {
    submitting.value = true
    const courseUuid = route.params.uuid
    await addGroupMembers(
      courseUuid,
      currentGroupForAddMember.value.id,
      selectedMembers.value
    )
    ElMessage.success(`成功添加 ${selectedMembers.value.length} 名成员`)
    addMemberDialogVisible.value = false
    await loadGroups()
  } catch (error) {
    console.error('添加成员失败:', error)
    ElMessage.error('添加成员失败')
  } finally {
    submitting.value = false
  }
}

const removeMember = async (group, member) => {
  try {
    await ElMessageBox.confirm(
      `确定要将"${member.name}"从小组中移除吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const courseUuid = route.params.uuid
    await removeGroupMember(courseUuid, group.id, member.id)
    ElMessage.success('成员已移除')
    await loadGroups()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除失败:', error)
      ElMessage.error('移除失败')
    }
  }
}

const getMemberColor = (id) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  return colors[id % colors.length]
}

const goBack = () => {
  router.push(`/teacher/courses/${route.params.uuid}`)
}

onMounted(() => {
  loadGroups()
})
</script>

<style scoped lang="scss">
.teacher-groups {
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

.loading-container,
.empty-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
}

.group-card {
  margin-bottom: 24px;
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .group-name {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    .more-icon {
      cursor: pointer;
      font-size: 20px;
      color: #909399;
      
      &:hover {
        color: #606266;
      }
    }
  }
}

.group-info {
  .group-description {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #606266;
    min-height: 40px;
  }
  
  .group-stats {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .member-list {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .member-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    border-radius: 4px;
    
    &:hover {
      background: #f5f7fa;
      
      .remove-icon {
        opacity: 1;
      }
    }
    
    .member-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .member-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .member-name {
        font-size: 14px;
        color: #303133;
      }
      
      .member-number {
        font-size: 12px;
        color: #909399;
      }
    }
    
    .remove-icon {
      opacity: 0;
      cursor: pointer;
      color: #f56c6c;
      transition: opacity 0.2s;
      
      &:hover {
        color: #f56c6c;
      }
    }
  }
}

.member-selector {
  .available-members {
    margin-top: 16px;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 12px;
  }
  
  .student-item {
    padding: 8px;
    border-radius: 4px;
    
    &:hover {
      background: #f5f7fa;
    }
    
    .student-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .student-details {
      display: flex;
      flex-direction: column;
      
      .student-name {
        font-size: 14px;
        color: #303133;
      }
      
      .student-number {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
