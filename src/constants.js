import { baseUrl } from './utils/request';

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
  "organization_management": URI_3,
  "organization_bd": "/app", // todo?
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
  "dashboard": "/app",
  "organization_bd": "/app/org/bd",
}

export const URI_TO_KEY = {
  "/app": "dashboard",
  "/app/projects/library": "project_library",
  "/app/projects/list": "platform_projects",
  "/app/projects/list/interest": "interest_projects",
  "/app/projects/list/recommend": "recommon_projects",
  "/app/projects/published": "publish_projects",
  "/app/projects/list/favor": "collect_projects",
  "/app/organization/list": "organization_management",
  "/app/organization/bd": "dashboard", // todo?
  "/app/projects/bd": "project_bd",
  "/app/email/list": "email_management",
  "/app/schedule/list": "schedule_list",
  "/app/schedule": "my_schedule",
  "/app/user/list": "user_management",
  "/app/investor/my": "myinvestor",
  "/app/trader/my": "mytrader",
  "/app/timeline/list": "timeline_management",
  "/app/dataroom/list": "dataroom_management",
  "/app/inbox/list": "reminder",
  "/app/modify_password": "change_password",
  "/app/personal_info": "profile",
  "/app/perm/list": "permission_management",
  "/app/log/list": "log",
}

export const CONTENT_TYPE_ID_TO_PERM_GROUP = baseUrl === 'http://39.107.14.53:8080' ? 
{
  52: 'dataroom管理',
  13: '机构管理',
  14: '机构备注管理',
  18: '用户项目管理',
  25: '项目管理',
  21: '分享项目管理',
  57: '时间轴管理',
  56: '时间轴备注管理',
  10: '用户管理',
  9: '好友管理管理',
  8: '绑定管理管理',
  61: '日程管理',
  71: '项目BD管理',
  74: '会议BD',
  70: '机构BD', 
  67: '用户信息修改日志管理', 
} 
: 
{
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
  7: '绑定管理管理',
  74: '日程管理',
  79: '项目BD管理',
  82: '会议BD', 
  78: '机构BD', 
  67: '用户信息修改日志管理',  
}

export const KEY_TO_ICON = {
  'dashboard': 'fa fa-home',
  'project_library': 'glyphicon glyphicon-book',
  'project_management': 'glyphicon glyphicon-list',
  'organization_management': 'fa fa-sitemap',
  'bd_management': 'glyphicon glyphicon-lock',
  'email_management': 'fa fa-envelope-o',
  'schedule_management': 'fa fa-calendar',
  'user_management': 'fa fa-group',
  'myinvestor': 'fa fa-user',
  'mytrader': 'fa fa-user-plus',
  'timeline_management': 'fa fa-tasks',
  'dataroom_management': 'fa fa-folder',
  'inbox_management': 'glyphicon glyphicon-envelope',
  'user_center': 'fa fa-cogs',
  'permission_management': 'fa fa-sitemap',
  'log': 'fa fa-search',
}
