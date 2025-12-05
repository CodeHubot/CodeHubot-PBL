# PBL (Project-Based Learning) 系统设计文档

## 1. 系统概述

PBL（Project-Based Learning）项目式学习系统旨在为 CodeHubot 平台提供一个以项目为核心的学习环境。学生通过组队完成具有挑战性的项目，经历"驱动问题-探究-协作-产出-评价"的完整流程，培养解决实际问题的能力。

本系统将作为 CodeHubot 平台的独立子系统存在，与主系统共享用户账户、设备管理和基础教学数据（班级/课程），但在业务逻辑和代码部署上保持独立。

## 2. 架构设计

### 2.1 总体架构

系统采用前后端分离架构：
- **前端 (pbl-frontend)**: 基于 Vue.js + Vite 构建，专注于 PBL 教学流程的交互体验。
- **后端 (pbl-backend)**: 基于 FastAPI (Python) 构建，提供 RESTful API，处理 PBL 业务逻辑。
- **数据库**: 共享主系统的 MySQL 数据库，复用核心表（用户、设备），新增 PBL 专用表。

### 2.2 目录结构

```text
CodeHubot/
├── pbl-backend/           # PBL 后端服务
│   ├── app/
│   │   ├── api/           # API 路由定义
│   │   ├── core/          # 核心配置与工具
│   │   ├── models/        # SQLAlchemy 模型
│   │   ├── schemas/       # Pydantic 数据验证模型
│   │   ├── services/      # 业务逻辑层
│   │   └── utils/         # 通用工具
│   ├── main.py            # 应用入口
│   └── requirements.txt   # 依赖列表
│
└── pbl-frontend/          # PBL 前端应用
    ├── src/
    │   ├── api/           # API 请求封装
    │   ├── components/    # 通用组件
    │   ├── router/        # 路由配置
    │   ├── store/         # 状态管理
    │   ├── utils/         # 工具函数
    │   └── views/         # 页面视图
    └── package.json
```

## 3. 数据库设计

系统将尽量复用现有表结构，仅针对 PBL 业务增加必要的新表。

### 3.1 复用现有表

- `aiot_core_users`: 用户认证与基础信息。
- `aiot_schools`: 学校信息。
- `aiot_classes` / `aiot_courses`: 教学班级与课程结构。PBL 项目通常依托于某个课程或班级开展。
- `aiot_course_groups` / `aiot_groups`: 团队协作的基础。
- `aiot_core_devices`: 项目中可能使用的硬件设备。

### 3.2 新增 PBL 核心表

建议添加以下表（前缀 `aiot_pbl_`）：

#### 1. 项目定义表 (`aiot_pbl_projects`)
定义项目的元数据，如标题、目标、背景故事、难度等。

```sql
CREATE TABLE `aiot_pbl_projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `uuid` varchar(36) NOT NULL COMMENT 'UUID',
  `course_id` int(11) DEFAULT NULL COMMENT '关联课程ID（可选）',
  `name` varchar(200) NOT NULL COMMENT '项目名称',
  `description` text COMMENT '项目简介',
  `background_story` text COMMENT '项目背景故事（驱动问题）',
  `cover_image` varchar(500) DEFAULT NULL COMMENT '封面图',
  `difficulty` enum('easy','medium','hard') DEFAULT 'medium' COMMENT '难度',
  `estimated_hours` int(11) DEFAULT NULL COMMENT '预计耗时(课时)',
  `creator_id` int(11) NOT NULL COMMENT '创建者ID',
  `is_public` tinyint(1) DEFAULT '0' COMMENT '是否公开模板',
  `status` enum('draft','published','archived') DEFAULT 'draft' COMMENT '状态',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. 项目阶段表 (`aiot_pbl_stages`)
定义项目的标准流程，如：立项组队 -> 方案设计 -> 原型开发 -> 测试优化 -> 展示评价。

```sql
CREATE TABLE `aiot_pbl_stages` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `project_id` int(11) NOT NULL COMMENT '所属项目ID',
  `name` varchar(100) NOT NULL COMMENT '阶段名称',
  `description` text COMMENT '阶段描述',
  `order_index` int(11) NOT NULL DEFAULT '0' COMMENT '顺序',
  `requires_deliverable` tinyint(1) DEFAULT '1' COMMENT '是否需要提交产出物',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. 项目任务/活动表 (`aiot_pbl_tasks`)
每个阶段下的具体任务或探究活动。

```sql
CREATE TABLE `aiot_pbl_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `stage_id` int(11) NOT NULL COMMENT '所属阶段ID',
  `name` varchar(200) NOT NULL COMMENT '任务名称',
  `description` text COMMENT '任务详情',
  `task_type` enum('reading','discussion','coding','submission','quiz') NOT NULL COMMENT '任务类型',
  `resource_link` varchar(500) DEFAULT NULL COMMENT '学习资源链接',
  `order_index` int(11) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. 团队项目实例表 (`aiot_pbl_team_projects`)
记录某个小组正在进行的具体项目实例（实例化）。

```sql
CREATE TABLE `aiot_pbl_team_projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `project_id` int(11) NOT NULL COMMENT '项目模板ID',
  `group_id` int(11) NOT NULL COMMENT '小组ID (关联 aiot_course_groups)',
  `current_stage_id` int(11) DEFAULT NULL COMMENT '当前进行到的阶段',
  `status` enum('not_started','in_progress','completed','paused') DEFAULT 'not_started',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL COMMENT '最终得分',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. 产出物提交表 (`aiot_pbl_submissions`)
记录小组在各个阶段或任务中的产出。

```sql
CREATE TABLE `aiot_pbl_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `team_project_id` int(11) NOT NULL COMMENT '团队项目实例ID',
  `stage_id` int(11) DEFAULT NULL COMMENT '关联阶段',
  `task_id` int(11) DEFAULT NULL COMMENT '关联任务',
  `content` text COMMENT '提交内容（文本或描述）',
  `file_url` varchar(500) DEFAULT NULL COMMENT '文件附件地址',
  `submitted_by` int(11) NOT NULL COMMENT '提交人ID',
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('submitted','graded','returned') DEFAULT 'submitted'
);
```

#### 6. 评价表 (`aiot_pbl_evaluations`)
包含教师评价、组内互评等。

```sql
CREATE TABLE `aiot_pbl_evaluations` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `target_type` enum('team_project','submission','student') NOT NULL COMMENT '评价对象类型',
  `target_id` int(11) NOT NULL COMMENT '评价对象ID',
  `evaluator_id` int(11) NOT NULL COMMENT '评价人ID',
  `score` decimal(5,2) DEFAULT NULL COMMENT '评分',
  `comment` text COMMENT '评语',
  `rubric_data` json DEFAULT NULL COMMENT '量规评分详情',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
);
```

## 4. 功能模块设计

### 4.1 教师端 (Teacher Portal)
1.  **项目库管理**: 创建、编辑、发布 PBL 项目模版，定义阶段和任务。
2.  **进度看板**: 查看各小组当前所处阶段、滞后情况。
3.  **作业批改**: 查看小组提交的产出物（文档、代码、视频），进行打分和反馈。
4.  **设备授权**: 为特定项目分配设备使用权限（复用现有功能）。

### 4.2 学生端 (Student Portal)
1.  **项目中心**: 查看已分配的项目，了解项目背景和目标。
2.  **任务协作**: 按照阶段指引完成任务，支持组内讨论（可选集成 Chat 功能）。
3.  **成果提交**: 上传阶段性成果。
4.  **我的团队**: 查看队友，进行组内互评。

### 4.3 交互流程示例
1.  **项目启动**: 教师选择一个"智能植物养护"项目，分配给"三年级二班"。
2.  **自动组队**: 系统根据 `aiot_course_groups` 自动生成 `aiot_pbl_team_projects` 记录。
3.  **阶段推进**: 小组 A 进入"调研阶段"，查看任务要求，提交一份"植物生长习性调研报告"。
4.  **教师反馈**: 教师在后台看到提交提醒，预览报告并打分，系统自动解锁下一阶段"方案设计"。
5.  **设备开发**: 在"实施阶段"，小组 A 申请使用温湿度传感器，编写代码并上传到平台记录。
6.  **结项展示**: 完成所有阶段，系统生成项目档案。

## 5. 开发计划建议

1.  **Phase 1 (基础框架)**:
    -   搭建独立的前后端工程结构。
    -   实现基础的用户登录（复用现有 Token 验证逻辑）。
    -   实现数据库模型定义（SQLAlchemy）。

2.  **Phase 2 (核心业务 - 教师侧)**:
    -   项目 CRUD API。
    -   阶段与任务配置 API。

3.  **Phase 3 (核心业务 - 学生侧)**:
    -   项目概览与任务流。
    -   文件上传与提交接口。

4.  **Phase 4 (评价与整合)**:
    -   教师打分功能。
    -   与 CodeHubot 现有设备系统的联动测试。

# CodeHubot PBL System
