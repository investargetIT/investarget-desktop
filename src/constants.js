export const PAGE_SIZE = 5

export const URI_1 = "/app/projects/list"
export const URI_2 = "/app/projects/list/interest"
export const URI_3 = "/app/organization/list"
export const URI_4 = "/app/email/list"
export const URI_5 = "/app/timeline/list"
export const URI_6 = "/app/user/list"
export const URI_7 = "/app/dataroom/list"
export const URI_8 = "/app/inbox/list"
export const URI_9 = "/app/modify_password"
export const URI_10 = "/app/personal_info"
export const URI_11 = "/app/log/list"
export const URI_12 = "/app/investor/my"
export const URI_13 = "/app/trader/my"
export const URI_14 = "/app/perm/list"
export const URI_15 = "/app/projects/list/recommend"
export const URI_16 = "/app/projects/published"
export const URI_17 = "/app/projects/list/favor"

export const KEY_TO_URI = {
  "project_library": "/app/projects/library",
  "project_bd": "/app/projects/bd",
  "platform_projects": URI_1,
  "organization_bd": URI_3,
  "email_management": URI_4,
  "timeline_management": URI_5,
  "user_management": URI_6,
  "dataroom_management": URI_7,
  "reminder": URI_8,
  "interest_projects": URI_2,
  "myinvestor": URI_12,
  "mytrader": URI_13,
  "change_password": URI_9,
  "profile": URI_10,
  "log": URI_11,
  "permission_management": URI_14,
  "recommon_projects": URI_15,
  "publish_projects": URI_16,
  "collect_projects": URI_17,
  "schedule_list": "/app/schedule/list",
  "my_schedule": "/app/schedule",
}

export const CONTENT_TYPE_ID_TO_PERM_GROUP = {
  50: 'dataroom管理',
  12: '机构管理',
  11: '机构备注管理',
  47: '用户项目管理',
  19: '项目管理',
  49: '分享项目管理',
  40: '时间轴管理',
  39: '时间轴备注管理',
  9: '用户管理',
  54: '好友管理管理',
  7: '绑定管理管理'
}

export const BASE_URL = 'http://192.168.1.251:8080'
