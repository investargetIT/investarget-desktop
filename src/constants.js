import { baseUrl, prodUrl } from './utils/request';
import {
  HomeOutlined,
  BookOutlined,
  WalletOutlined,
  EditOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  FileSearchOutlined,
  ApartmentOutlined,
  UnorderedListOutlined,
  ClusterOutlined,
  LockOutlined,
  CalendarOutlined,
  UserOutlined,
  UserAddOutlined,
  FolderOutlined,
  MessageOutlined,
  SettingOutlined,
  SolutionOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

export const PAGE_SIZE = 5

export const URI_1 = "/app/projects/list"
export const URI_2 = "/app/projects/list/interest"
export const URI_3 = "/app/organization/list"
export const URI_4 = "/app/email/list"
export const URI_5 = "/app/timeline/list"
export const URI_6 = "/app/user/list"
export const URI_7 = "/app/dataroom/project/list"
export const URI_8 = "/app/inbox/list"
export const URI_9 = "/app/modify_password"
export const URI_10 = "/app/personal-info"
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
  // "meeting_bd": "/app/meeting/bd",
  "platform_projects": URI_1,
  "list_organization": URI_3,
  "organization_bd": "/app", // todo?
  // "email_management": URI_4,
  // "timeline_management": URI_5,
  // "Full_usermanager": URI_6,
  "project_dataroom": URI_7,
  "company_dataroom": "/app/dataroom/company/list",
  "reminder": URI_8,
  // "interest_projects": URI_2,
  "myinvestor": URI_12,
  // "mytrader": URI_13,
  "change_password": URI_9,
  "profile": URI_10,
  "log": URI_11,
  "permission_management": URI_14,
  // "recommon_projects": URI_15,
  // "publish_projects": URI_16,
  // "collect_projects": URI_17,
  // "schedule_list": "/app/schedule/list",
  "my_schedule": "/app/schedule",
  "dashboard": "/app",
  "organization_bd": "/app/orgbd/project/list",
  // "exportexcel_organization": "/app/org/export",
  "weekly_report": "/app/report/list",
  // "OKR": "/app/okr/list",
  // "onlineTest": "/app/online-test",
  // "orgBD_report": "/app/project-report",
  // "HR": "/app/hr",
  // "Resigned_usermanager": "/app/user/list/resigned-trader",
  "user_profile": "/app/personal-center",
  "feishu_work": "/app/feishu/approval",
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
  "/app/dataroom/project/list": "project_dataroom",
  "/app/dataroom/company/list": "company_dataroom",
  "/app/inbox/list": "reminder",
  "/app/modify_password": "change_password",
  "/app/personal-info": "profile",
  "/app/perm/list": "permission_management",
  "/app/log/list": "log",
  "/app/hr": "HR",
  "/app/personal-center": "user_profile",
}

export const CONTENT_TYPE_ID_TO_PERM_GROUP = baseUrl === prodUrl ? 
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
  71: '线索项目管理',
  74: '会议BD',
  70: '机构看板', 
  67: '用户信息修改日志管理', 
  69: '邮件管理', 
  6: '用户备注管理',
  91: '机构附件管理',
  92: '视频会议管理',
  96: '机构看板黑名单',
  100: '工作报表管理',
  104: '在线测试管理',
} 
: 
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
  71: '线索项目管理',
  74: '会议BD',
  70: '机构看板', 
  67: '用户信息修改日志管理', 
  69: '邮件管理', 
  6: '用户备注管理',
  91: '机构附件管理',
  92: '视频会议管理',
  96: '机构看板黑名单',
  100: '工作报表管理',
  104: '在线测试管理',
}

export const KEY_TO_ICON = {
  // 'dashboard': 'fa fa-home',
  // 'project_library': 'glyphicon glyphicon-book',
  // 'project_management': 'glyphicon glyphicon-list',
  // 'organization_management': 'fa fa-sitemap',
  // 'bd_management': 'glyphicon glyphicon-lock',
  // 'email_management': 'fa fa-envelope-o',
  // 'schedule_management': 'fa fa-calendar',
  // 'user_management': 'fa fa-group',
  // 'myinvestor': 'fa fa-user',
  // 'mytrader': 'fa fa-user-plus',
  // 'timeline_management': 'fa fa-tasks',
  // 'dataroom_management': 'fa fa-folder',
  // 'inbox_management': 'glyphicon glyphicon-envelope',
  // 'user_center': 'fa fa-cogs',
  // 'permission_management': 'fa fa-sitemap',
  // 'log': 'fa fa-search',
  // 'onlineTest': 'fa fa-pencil',

  'dashboard': <HomeOutlined />,
  'project_library': <BookOutlined />,
  'project_management': <UnorderedListOutlined />,
  'organization_management': <ClusterOutlined />,
  'bd_management': <LockOutlined />,
  'email_management': <WalletOutlined />,
  'schedule_management': <CalendarOutlined />,
  'user_management': <TeamOutlined />,
  'myinvestor': <UserOutlined />,
  'mytrader': <UserAddOutlined />,
  'timeline_management': <FieldTimeOutlined />,
  'dataroom_management': <FolderOutlined />,
  'inbox_management': <MessageOutlined />,
  'user_center': <SettingOutlined />,
  'permission_management': <ApartmentOutlined />,
  'log': <FileSearchOutlined />,
  'onlineTest': <EditOutlined />,
  "HR": <SolutionOutlined />,
  'feishu_work': <CheckCircleOutlined />,
}

export const PAGE_SIZE_OPTIONS = ['10', '50', '100'];

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}
export const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14, offset: 6 },
  }
}

export const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
}

export const SIZE_4M = 4194304;
