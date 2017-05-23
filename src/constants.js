export const PAGE_SIZE = 5

export const URI_1 = "/app/projects/list"
export const URI_2 = "/app/projects/my"
export const URI_3 = "/app/organization/list"
export const URI_4 = "/app/email/list"
export const URI_5 = "/app/timeline/list"
export const URI_6 = "/app/user/list"
export const URI_7 = "/app/dataroom/list"
export const URI_8 = "/app/inboxt/list"
export const URI_9 = "/app/modify_password"
export const URI_10 = "/app/personal_info"
export const URI_11 = "/app/log/list"
export const URI_12 = "/app/investor/my"
export const URI_13 = "/app/trader/my"

export const KEY_TO_URI = {
  "platform_projects": URI_1,
  "institution_management": URI_3,
  "email_management": URI_4,
  "timeline_management": URI_5,
  "user_management": URI_6,
  "dataroom_management": URI_7,
  "inbox_management": URI_8,
  "my_projects": URI_2,
  "myinvestor": URI_12,
  "mytrader": URI_13,
  "change_password": URI_9,
  "profile": URI_10,
  "reminder": URI_11
}

export const SOURCE = {
  "currency": [
    { "id": 1, "nameE": "CNY", "nameC": "人民币" },
    { "id": 2, "nameE": "USD", "nameC": "美元" },
    { "id": 3, "nameE": "CNY&USD", "nameC": "人民币和美元" }
  ],
  "audit": [
    { "id": 1, "nameE": "under_approval", "nameC": "待审核" },
    { "id": 2, "nameE": "recevied_approval", "nameC": "审核通过" },
    { "id": 3, "nameE": "reject_approval", "nameC": "审核退回" }
  ]
}
