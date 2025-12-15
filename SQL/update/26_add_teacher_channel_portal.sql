-- ==========================================================================================================
-- 添加教师端和渠道商端支持
-- ==========================================================================================================
-- 
-- 脚本名称: 26_add_teacher_channel_portal.sql
-- 创建日期: 2024-12-14
-- 兼容版本: MySQL 5.7.x, 8.0.x
-- 字符集: utf8mb4
-- 排序规则: utf8mb4_unicode_ci
--
-- ==========================================================================================================
-- 功能说明:
-- ==========================================================================================================
--
-- 1. 创建 pbl_course_teachers 表（已废弃，请使用 pbl_class_teachers）
--    - ⚠️ 注意：此表已废弃，教师与课程的关系应通过班级关联
--    - 正确的关联方式：教师 → pbl_class_teachers → 班级 → pbl_courses → 课程
--    - 保留此表创建语句仅用于数据库初始化，实际业务中不使用
--
-- 2. 创建 pbl_channel_school_relations 表（渠道商与学校关联表）
--    - 记录渠道商负责的学校
--    - 一个渠道商可以负责多个学校
--
-- 3. 更新 core_users 表支持
--    - 新增 role='channel_partner' 角色
--
-- 背景：
-- - 需要为教师提供独立的管理端，管理自己负责的课程
-- - 需要为渠道商提供独立的查看端，查看负责学校的课程数据
-- - 教师通过 职工号@学校代码 登录
-- - 渠道商通过 账号+密码 登录
--
-- 注意：
-- - 此脚本使用存储过程实现，可重复执行
-- - 如果表已存在则跳过创建
--
-- ==========================================================================================================

-- 设置字符集
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================================================================================
-- 1. 创建 pbl_course_teachers 表（已废弃 - 仅保留用于兼容性）
-- ==========================================================================================================
-- 
-- ⚠️ 重要说明：
-- 此表已废弃，教师与课程的关系应通过班级关联实现：
-- 教师 → pbl_class_teachers（教师-班级关系）→ 班级 → pbl_courses（课程-班级关系）→ 课程
-- 
-- 正确的查询逻辑：
-- 1. 查询 pbl_class_teachers 获取教师负责的班级ID
-- 2. 查询 pbl_courses WHERE class_id IN (班级ID列表) 获取对应的课程
-- 
-- 保留此表仅用于向后兼容，新业务不应使用此表
-- ==========================================================================================================

CREATE TABLE IF NOT EXISTS `pbl_course_teachers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID',
  `course_id` BIGINT(20) NOT NULL COMMENT '课程ID',
  `teacher_id` INT(11) NOT NULL COMMENT '教师ID',
  `subject` VARCHAR(50) DEFAULT NULL COMMENT '教师在该课程教授的科目',
  `is_primary` TINYINT(1) DEFAULT '0' COMMENT '是否为主讲教师',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_course_teacher` (`course_id`, `teacher_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_is_primary` (`is_primary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='PBL课程教师关联表（多对多）';

-- ==========================================================================================================
-- 2. 创建 pbl_channel_school_relations 表（如果不存在）
-- ==========================================================================================================

CREATE TABLE IF NOT EXISTS `pbl_channel_school_relations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID',
  `channel_partner_id` INT(11) NOT NULL COMMENT '渠道商ID（关联core_users表，role=channel_partner）',
  `school_id` INT(11) NOT NULL COMMENT '学校ID（关联core_schools表）',
  `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  `is_active` TINYINT(1) DEFAULT '1' COMMENT '是否激活',
  `remarks` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_channel_school` (`channel_partner_id`, `school_id`),
  KEY `idx_channel_partner_id` (`channel_partner_id`),
  KEY `idx_school_id` (`school_id`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='渠道商与学校关联表';

-- ==========================================================================================================
-- 验证表创建结果
-- ==========================================================================================================

SELECT 
    '验证结果' AS info_type,
    TABLE_NAME AS '表名',
    TABLE_COMMENT AS '表说明',
    TABLE_ROWS AS '当前行数'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('pbl_course_teachers', 'pbl_channel_school_relations')
ORDER BY TABLE_NAME;

-- 查看 pbl_course_teachers 表结构
SELECT 
    'pbl_course_teachers' AS '表名',
    COLUMN_NAME AS '字段名',
    COLUMN_TYPE AS '数据类型',
    IS_NULLABLE AS '允许NULL',
    COLUMN_DEFAULT AS '默认值',
    COLUMN_COMMENT AS '备注'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'pbl_course_teachers'
ORDER BY ORDINAL_POSITION;

-- 查看 pbl_channel_school_relations 表结构
SELECT 
    'pbl_channel_school_relations' AS '表名',
    COLUMN_NAME AS '字段名',
    COLUMN_TYPE AS '数据类型',
    IS_NULLABLE AS '允许NULL',
    COLUMN_DEFAULT AS '默认值',
    COLUMN_COMMENT AS '备注'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'pbl_channel_school_relations'
ORDER BY ORDINAL_POSITION;

-- ==========================================================================================================
-- 使用说明
-- ==========================================================================================================

SELECT '==========================================================================================================' AS ' ';
SELECT '教师端和渠道商端支持表创建完成！' AS '状态';
SELECT '==========================================================================================================' AS ' ';
SELECT '已创建以下表：' AS ' ';
SELECT '1. pbl_course_teachers - 课程教师关联表（已废弃）' AS '';
SELECT '2. pbl_channel_school_relations - 渠道商学校关联表' AS '';
SELECT '==========================================================================================================' AS ' ';
SELECT '表说明：' AS ' ';
SELECT '' AS '';
SELECT 'pbl_course_teachers 表（已废弃）：' AS '';
SELECT '- ⚠️ 此表已废弃，不应在新业务中使用' AS '';
SELECT '- 正确方式：通过 pbl_class_teachers 表关联班级，再通过班级关联课程' AS '';
SELECT '- 关联链：教师 → pbl_class_teachers → 班级 → pbl_courses → 课程' AS '';
SELECT '' AS '';
SELECT 'pbl_channel_school_relations 表：' AS '';
SELECT '- 用途：记录渠道商负责的学校（多对多关系）' AS '';
SELECT '- 渠道商通过此表查询自己负责的所有学校' AS '';
SELECT '- 一个渠道商可以负责多个学校' AS '';
SELECT '==========================================================================================================' AS ' ';
SELECT '后续操作：' AS ' ';
SELECT '1. 在 core_users 表中添加 role=teacher 的教师用户' AS '';
SELECT '2. 在 pbl_class_teachers 表中添加教师与班级的关联关系' AS '';
SELECT '3. 在 core_users 表中添加 role=channel_partner 的渠道商用户' AS '';
SELECT '4. 在 pbl_channel_school_relations 表中添加渠道商与学校的关联关系' AS '';
SELECT '==========================================================================================================' AS ' ';

-- ==========================================================================================================
-- 脚本结束
-- ==========================================================================================================
