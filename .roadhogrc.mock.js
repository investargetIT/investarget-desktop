export default {
  'POST /api/user/login/': (req, res) => {
    console.log('POST /api/user/login/')
    res.json({
      "errormsg": null,
      "code": 1000,
      "result": {
        "user_info": {
          "username": null,
          "tags": [],
          "mobile": "18637760716",
          "title": null,
          "userstatus": {
            "is_deleted": false,
            "id": 2,
            "name": "审核通过"
          },
          "investor_relation": null,
          "id": 8,
          "groups": [{
            "id": 1,
            "name": "投资人"
          }],
          "trader_relation": null,
          "org": {
            "orgname": "海图",
            "id": 1
          },
          "email": "wjk1397@126.com"
        },
        "token": "afd9a708d5e7da1878d510d5d13736a2963f4f78bc0a4c70",
        "menulist": [{
          "index": 1,
          "parentmenu": null,
          "namekey": "project_management",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 1
        }, {
          "index": 2,
          "parentmenu": 1,
          "namekey": "platform_projects",
          "icon_active": null,
          "icon_normal": "",
          "id": 10
        }, {
          "index": 3,
          "parentmenu": 1,
          "namekey": "my_projects",
          "icon_active": null,
          "icon_normal": "",
          "id": 11
        }, {
          "index": 4,
          "parentmenu": null,
          "namekey": "institution_management",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 2
        }, {
          "index": 5,
          "parentmenu": null,
          "namekey": "email_management",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 3
        }, {
          "index": 6,
          "parentmenu": null,
          "namekey": "user_management",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 5
        }, {
          "index": 7,
          "parentmenu": null,
          "namekey": "myinvestor",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 12
        }, {
          "index": 8,
          "parentmenu": null,
          "namekey": "mytrader",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 13
        }, {
          "index": 9,
          "parentmenu": null,
          "namekey": "timeline_management",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 4
        }, {
          "index": 10,
          "parentmenu": null,
          "namekey": "dataroom_management",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 6
        }, {
          "index": 11,
          "parentmenu": null,
          "namekey": "inbox_management",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 7
        }, {
          "index": 12,
          "parentmenu": 7,
          "namekey": "reminder",
          "icon_active": null,
          "icon_normal": "",
          "id": 16
        }, {
          "index": 13,
          "parentmenu": null,
          "namekey": "user_center",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 8
        }, {
          "index": 14,
          "parentmenu": 8,
          "namekey": "change_password",
          "icon_active": null,
          "icon_normal": "",
          "id": 14
        }, {
          "index": 15,
          "parentmenu": 8,
          "namekey": "profile",
          "icon_active": null,
          "icon_normal": "",
          "id": 15
        }, {
          "index": 16,
          "parentmenu": null,
          "namekey": "log",
          "icon_active": null,
          "icon_normal": "https://o79atf82v.qnssl.com/1024icon.png",
          "id": 9
        }],
        "permissions": ["proj.change_finance", "proj.admin_getfavorite", "auth.add_permission", "guardian.change_userobjectpermission", "timeline.change_timelinetransationstatu", "usersys.as_adminuser", "usersys.change_mytoken", "org.add_organization", "usersys.user_changeuserrelation", "sourcetype.change_webmenu", "org.add_orgremarks", "sourcetype.delete_datasource", "usersys.user_changeuser", "msg.delete_message", "timeline.user_addline", "usersys.admin_changefriend", "org.delete_orgtransactionphase", "admin.change_logentry", "proj.change_sharetoken", "sourcetype.delete_country", "timeline.admin_deletelineremark", "sourcetype.delete_titletype", "contenttypes.delete_contenttype", "dataroom.user_changedataroom", "proj.delete_sharetoken", "usersys.delete_userfriendship", "dataroom.admin_adddataroom", "usersys.admin_deletefriend", "dataroom.user_adddataroom", "proj.user_changeproj", "sourcetype.add_clienttype", "guardian.change_groupobjectpermission", "proj.delete_project", "org.delete_organization", "proj.delete_favoriteproject", "timeline.user_getlineremark", "org.user_addorg", "sessions.change_session", "usersys.delete_usertags", "org.user_getorgremark", "guardian.delete_userobjectpermission", "timeline.admin_changelineremark", "sourcetype.change_clienttype", "usersys.admin_getuserrelation", "dataroom.user_getdataroom", "APIlog.delete_viewprojlog", "proj.admin_changeproj", "proj.user_getfavorite", "proj.delete_projectindustries", "timeline.add_timelineremark", "proj.user_addproj", "sourcetype.add_auditstatus", "contenttypes.change_contenttype", "activity.delete_activity", "sourcetype.add_orgarea", "sourcetype.change_favoritetype", "proj.admin_deleteproj", "auth.change_permission", 
          "timeline.user_changeline", "org.user_deleteorg", "sourcetype.delete_transactionphases", "proj.delete_projecttransactiontype", "sourcetype.delete_continent", "APIlog.add_userviewprojlog", "sourcetype.add_school", "sourcetype.delete_messagetype", "sourcetype.delete_specialty", "usersys.admin_adduser", "dataroom.add_dataroomdirectoryorfile", "sourcetype.add_tag", "usersys.user_deleteuserrelation", "sourcetype.delete_projectstatus", "sourcetype.add_industry", "APIlog.change_apilog", "usersys.change_myuser", "org.admin_deleteorgremark", "dataroom.change_publicdirectorytemplate", "timeline.delete_timeline", "timeline.add_timeline", "sourcetype.add_favoritetype", "sourcetype.change_messagetype", "auth.delete_permission", "timeline.admin_addline", "proj.add_projecttags", "proj.add_project", "org.user_changeorgremark", "dataroom.add_dataroom", "timeline.admin_addlineremark", "proj.change_projecttransactiontype", "timeline.user_deleteline", "sourcetype.add_transactiontype", "auth.change_group", "sourcetype.add_titletype", "guardian.add_groupobjectpermission", "sourcetype.change_industry", "proj.add_projecttransactiontype", "auth.delete_group", "sourcetype.add_orgtype", "usersys.add_userfriendship", "timeline.admin_getlineremark", "usersys.user_getuser", "org.admin_getorg", "proj.admin_addfavorite", "sourcetype.add_projectstatus", "proj.change_project", "org.user_getorg", "sourcetype.add_messagetype", "usersys.user_adduser", "proj.change_projecttags", "sourcetype.delete_favoritetype", "usersys.admin_getfriend", "dataroom.delete_publicdirectorytemplate", "proj.change_projectindustries", "sourcetype.delete_orgarea", "third.change_mobileauthcode", "sourcetype.change_orgtype", "org.admin_changeorgremark", "third.delete_mobileauthcode", "timeline.change_timeline", "sessions.delete_session", "sourcetype.add_webmenu", 
          "admin.delete_logentry", "sourcetype.change_country", "auth.add_group", "sourcetype.delete_orgtype", "timeline.admin_changeline", "org.user_changeorg", "activity.change_activity", "dataroom.change_dataroomdirectoryorfile", "org.admin_addorgremark", "dataroom.admin_changedataroom", "sourcetype.delete_school", "usersys.change_usertags", "admin.add_logentry", "sourcetype.delete_transactiontype", "APIlog.add_loginlog", "org.user_deleteorgremark", "msg.change_message", "usersys.admin_adduserrelation", "timeline.delete_timelineremark", "third.add_mobileauthcode", "sourcetype.delete_auditstatus", "timeline.delete_timelinetransationstatu", "timeline.user_addlineremark", "sourcetype.add_datasource", "timeline.change_timelineremark", "proj.add_finance", "timeline.admin_deleteline", "org.delete_orgremarks", "proj.change_favoriteproject", "usersys.admin_deleteuserrelation", "dataroom.change_dataroom", "usersys.admin_deleteuser", "sourcetype.add_transactionstatus", "org.admin_changeorg", "proj.user_addfavorite", "usersys.user_getuserrelation", "sourcetype.delete_industry", "guardian.add_userobjectpermission", "sourcetype.add_currencytype", "sourcetype.change_orgarea", "sourcetype.change_continent", "APIlog.delete_apilog", "activity.add_activity", "proj.add_sharetoken", "timeline.user_changelineremark", "proj.admin_getproj", "proj.add_projectindustries", "sourcetype.change_specialty", "usersys.delete_userrelation", "proj.user_getproj", "APIlog.add_viewprojlog", "usersys.add_myuser", "usersys.user_deleteuser", "APIlog.add_apilog", "dataroom.add_publicdirectorytemplate", "dataroom.admin_deletedataroom", "guardian.delete_groupobjectpermission", "sourcetype.change_transactionstatus", "sourcetype.delete_currencytype", "org.change_organization", "sourcetype.change_transactiontype", "sessions.add_session", "usersys.add_userrelation", 
          "APIlog.change_viewprojlog", "dataroom.delete_dataroom", "dataroom.admin_closedataroom", "org.change_orgtransactionphase", "sourcetype.delete_tag", "proj.shareproj", "sourcetype.add_specialty", "msg.add_message", "sourcetype.change_auditstatus", "usersys.change_userfriendship", "APIlog.change_userviewprojlog", "APIlog.change_loginlog", "proj.user_deleteproj", "proj.add_favoriteproject", "dataroom.delete_dataroomdirectoryorfile", "sourcetype.change_school", "org.admin_addorg", "sourcetype.add_continent", "org.change_orgremarks", "sourcetype.delete_clienttype", "proj.admin_addproj", "sourcetype.add_country", "dataroom.user_closedataroom", "org.admin_deleteorg", "usersys.admin_changeuserrelation", "usersys.add_mytoken", "usersys.user_adduserrelation", "org.add_orgtransactionphase", "proj.admin_deletefavorite", "sourcetype.delete_transactionstatus", "sourcetype.change_projectstatus", "contenttypes.add_contenttype", "usersys.as_investoruser", "usersys.admin_addfriend", "usersys.admin_getuser", "usersys.change_userrelation", "timeline.add_timelinetransationstatu", "dataroom.user_deletedataroom", "sourcetype.change_currencytype", "usersys.as_traderuser", "sourcetype.delete_webmenu", "proj.delete_projecttags", "usersys.delete_mytoken", "dataroom.admin_getdataroom", "sourcetype.change_titletype", "org.admin_getorgremark", "usersys.admin_changeuser", "sourcetype.change_transactionphases", "timeline.user_deletelineremark", "sourcetype.change_datasource", "org.user_addorgremark", "APIlog.delete_userviewprojlog", "APIlog.delete_loginlog", "proj.delete_finance", "sourcetype.change_tag", "usersys.user_addfriend", "usersys.add_usertags", "timeline.admin_getline", "usersys.delete_myuser", "sourcetype.add_transactionphases"]
      }
    })
  },
  'GET /api/user/': (req, res) => {
    console.log(`${req.method} ${req.url}`)
    res.json({
      code: 1000,
      errormsg: null,
      result: {
        count: 3,
        data: [
          {
            action: {
              get: true,
              change: true,
              delete: true
            },
            company: '多维海滩1',
            email: 'wjk1111111@126.com',
            groups: [],
            id: 1,
            investor_relations: [],
            mobile: '11111111111',
            username: '杨晓明',
            org: {
              auditStatu: 1,
              id: 1,
              name: "还脱",
              org_users: [8, 10]
            },
            tags: [
              { id: 0, name: 'TMT' },
              { id: 1, name: '人工智能' },
            ],
            title: {
              id: 1,
              name: "董事长",
            },
            userstatus: {
              id: 1,
              name: "审核通过"
            },
            trader_relation: {
              traderuser: {
                name: '交易师'
              }
            },
          },
          {
            action: {
              get: true,
              change: true,
              delete: true
            },
            company: '多维海滩2',
            email: 'wjk222222@126.com',
            groups: [],
            id: 2,
            investor_relations: [],
            mobile: '22222222222222',
            username: '许志铭',
            org: {
              auditStatu: 1,
              id: 1,
              name: "还脱",
              org_users: [8, 10]
            },
            tags: [
              { id: 2, name: 'VR' },
              { id: 3, name: 'AR' },
            ],
            title: {
              id: 1,
              name: "董事长",
            },
            userstatus: {
              id: 1,
              name: "审核通过"
            },
          },
          {
            action: {
              get: true,
              change: true,
              delete: true
            },
            company: '多维海滩',
            email: 'wjk33333333333@126.com',
            groups: [],
            id: 3,
            investor_relations: [],
            mobile: '18637760716',
            username: '吴军柯',
            org: {
              auditStatu: 1,
              id: 1,
              name: "还脱",
              org_users: [8, 10]
            },
            tags: [],
            title: {
              id: 1,
              name: "董事长",
            },
            userstatus: {
              id: 1,
              name: "审核通过"
            },
          }
        ]
      }
    })
  },
  'GET /api/source/tag': (req, res) => {
    console.log('GET /api/source/tag')
    res.json({
      code: 1000,
      errormsg: null,
      result: [
        {"name":"TMT","id":33},
        {"name":"大健康","id":34},
        {"name":"大数据","id":35},
        {"name":"房地产","id":36},
        {"name":"高端装备","id":37},
        {"name":"工业4.0","id":38},
        {"name":"互联网金融","id":39},
        {"name":"机器人","id":40},
        {"name":"清洁技术","id":41},
        {"name":"人工智能","id":42},
        {"name":"日用品","id":43},
        {"name":"生命科学","id":44},
        {"name":"时尚","id":45},
        {"name":"文化创意","id":46},
        {"name":"物联网","id":47},
        {"name":"消费电子","id":48},
        {"name":"新材料","id":49},
        {"name":"新媒体","id":50},
        {"name":"新能源","id":51},
        {"name":"新农业","id":52},
        {"name":"新型汽车","id":53},
        {"name":"虚拟/增强现实","id":54},
        {"name":"云计算","id":55},
        {"name":"智能硬件","id":56},
        {"name":"教育培训","id":57},
        {"name":"电子商务","id":58},
        {"name":"医疗器械","id":59},
        {"name":"泛娱乐","id":60},
        {"name":"大消费","id":61},
        {"name":"家具与家居","id":62},
        {"name":"旅游","id":63},
        {"name":"软件服务","id":64},
        {"name":"食品饮料","id":65},
        {"name":"国防军工","id":66}
      ]
    })
  },
  'GET /api/source/title': (req, res) => {
    console.log('GET /api/source/title')
    res.json({
      code: 1000,
      errormsg: null,
      result: [
        {"name":"董事长","id":33},
        {"name":"总经理","id":34},
      ]
    })
  },
  'GET /api/source/country': (req, res) => {
    console.log('GET /api/source/country')
    res.json({
      code: 1000,
      errormsg: null,
      result: [
        {
          "is_deleted": false,
          "url": "https://o79atf82v.qnssl.com/01.jpg",
          "country": "美国",
          "bucket": "image",
          "continent": 1,
          "areaCode": "1",
          "key": "01.jpg",
          "id": 4
        },
        {
          "is_deleted": false,
          "url": "https://o79atf82v.qnssl.com/02.jpg",
          "country": "加拿大",
          "bucket": "image",
          "continent": 1,
          "areaCode": "1",
          "key": "02.jpg",
          "id": 5
        },
        {
          "is_deleted": false,
          "url": "https://o79atf82v.qnssl.com/03.jpg",
          "country": "墨西哥",
          "bucket": "image",
          "continent": 1,
          "areaCode": "52",
          "key": "03.jpg",
          "id": 6
        }
      ]
    })
  },
  'GET /api/source/transactionPhases': (req, res) => {
    console.log(`${req.method} ${req.url}`)
    res.json({
      code: 1000,
      errormsg: null,
      result: [
        {"id":1,"name":"种子天使轮"},
        {"id":4,"name":"A轮"},
        {"id":6,"name":"B轮"},
        {"id":7,"name":"C轮"},
        {"id":8,"name":"C+轮"},
        {"id":10,"name":"Pre-IPO"},
        {"id":11,"name":"兼并收购"}
      ]
    })
  },
  'GET /api/source/currencyType': (req, res) => {
    console.log(`${req.method} ${req.url}`)
    res.json({
      code: 1000,
      errormsg: null,
      result: [
        {"currency":"人民币","id":1},
        {"currency":"美元","id":2},
        {"currency":"人民币及美元","id":3}
      ]
    })
  },
  'GET /api/source/orgarea': (req, res) => {
    console.log(`${req.method} ${req.url}`)
    res.json({
      code: 1000,
      errormsg: null,
      result: [
        {"id":1, "name":"上海"},
        {"id":2,"name":"北京"},
        {"id":3,"name":"天津"},
        {"id":4,"name":"重庆"},
        {"id":5,"name":"深圳"},
        {"id":6,"name":"香港"},
        {"id":7,"name":"台湾"},
        {"id":8,"name":"广州"},
        {"id":9,"name":"杭州"},
        {"id":10,"name":"武汉"},
        {"id":11,"name":"成都"},
        {"id":12,"name":"沈阳"},
        {"id":13,"name":"南京"},
        {"id":14,"name":"济南"},
        {"id":15,"name":"郑州"} 
      ]
    })
  },
  'GET /api/org/': (req, res) => {
    console.log('GET /api/org/')
    res.json(
      {
        "errormsg": null,
        "code": 1000,
        "result": {
          "count": 8,
          "data": [{
            "decisionCycle": 1,
            "orgname": "海图",
            "industry": {
              "is_deleted": false,
              "industry": "可再生能源",
              "bucket": "image",
              "isPindustry": false,
              "key": "Web-KZSZY.png",
              "Pindustry": 8,
              "id": 18
            },
            "orgtype": null,
            "currency": {
              "currency": "人民币",
              "is_deleted": false,
              "id": 1
            },
            "action": {
              "get": true,
              "change": true,
              "delete": true
            },
            "orgcode": "",
            "orgtransactionphase": [{
              "is_deleted": false,
              "id": 1,
              "name": "种子天使轮"
            }, {
              "is_deleted": false,
              "id": 4,
              "name": "A轮"
            }],
            "id": 1
          }, {
            "decisionCycle": 2,
            "orgname": "标题",
            "industry": {
              "is_deleted": false,
              "industry": "能源设备与服务",
              "bucket": "image",
              "isPindustry": false,
              "key": "Web-Project-Renewable resources.png",
              "Pindustry": 8,
              "id": 19
            },
            "orgtype": null,
            "currency": {
              "currency": "美元",
              "is_deleted": false,
              "id": 2
            },
            "action": {
              "get": true,
              "change": true,
              "delete": true
            },
            "orgcode": null,
            "orgtransactionphase": [],
            "id": 2
          }, {
            "decisionCycle": 3,
            "orgname": "机构3",
            "industry": {
              "is_deleted": false,
              "industry": "矿业",
              "bucket": "image",
              "isPindustry": false,
              "key": "Web-Project-kc.png",
              "Pindustry": 8,
              "id": 20
            },
            "orgtype": null,
            "currency": null,
            "action": {
              "get": true,
              "change": true,
              "delete": true
            },
            "orgcode": null,
            "orgtransactionphase": [],
            "id": 3
          }, {
            "decisionCycle": 4,
            "orgname": "机构4",
            "industry": {
              "is_deleted": false,
              "industry": "矿业",
              "bucket": "image",
              "isPindustry": false,
              "key": "Web-Project-kc.png",
              "Pindustry": 8,
              "id": 20
            },
            "orgtype": null,
            "currency": {
              "currency": "人民币",
              "is_deleted": false,
              "id": 1
            },
            "action": {
              "get": true,
              "change": true,
              "delete": true
            },
            "orgcode": null,
            "orgtransactionphase": [],
            "id": 4
          }, {
            "decisionCycle": null,
            "orgname": "机构5",
            "industry": null,
            "orgtype": null,
            "currency": null,
            "action": {
              "get": true,
              "change": true,
              "delete": true
            },
            "orgcode": null,
            "orgtransactionphase": [],
            "id": 20
          }, {
            "decisionCycle": null,
            "orgname": "机构6",
            "industry": null,
            "orgtype": null,
            "currency": null,
            "action": {
              "get": true,
              "change": true,
              "delete": true
            },
            "orgcode": null,
            "orgtransactionphase": [],
            "id": 21
          }, {
            "decisionCycle": 5,
            "orgname": "测试34",
            "industry": {
              "is_deleted": false,
              "industry": "艺术品",
              "bucket": "image",
              "isPindustry": false,
              "key": "Web-Project-ysp.png",
              "Pindustry": 9,
              "id": 24
            },
            "orgtype": {
              "is_deleted": false,
              "id": 2,
              "name": "律所"
            },
            "currency": {
              "currency": "美元",
              "is_deleted": false,
              "id": 2
            },
            "action": {
              "get": true,
              "change": true,
              "delete": true
            },
            "orgcode": "2341",
            "orgtransactionphase": [{
              "is_deleted": false,
              "id": 7,
              "name": "C轮"
            }, {
              "is_deleted": false,
              "id": 8,
              "name": "C+轮"
            }, {
              "is_deleted": false,
              "id": 11,
              "name": "兼并收购"
            }, {
              "is_deleted": false,
              "id": 10,
              "name": "Pre-IPO"
            }],
            "id": 29
          }, {
            "decisionCycle": 7,
            "orgname": "POSTMAN 测试",
            "industry": {
              "is_deleted": false,
              "industry": "化妆品",
              "bucket": "image",
              "isPindustry": false,
              "key": "Web-Project-hzp.png",
              "Pindustry": 9,
              "id": 26
            },
            "orgtype": {
              "is_deleted": false,
              "id": 1,
              "name": "基金"
            },
            "currency": {
              "currency": "美元",
              "is_deleted": false,
              "id": 2
            },
            "action": {
              "get": true,
              "change": true,
              "delete": true
            },
            "orgcode": "0000",
            "orgtransactionphase": [],
            "id": 30
          }]
        }
      }
    )
  },
  'GET /api/source/industry': (req, res) => {
    console.log(`${req.method} ${req.url}`)
    res.json(
      {
        "code": 1000,
        "errormsg": null,
        "result": [{
          "is_deleted": false,
          "industry": "能源与自然资源",
          "bucket": "image",
          "isPindustry": true,
          "key": "Web-JNHB.png",
          "Pindustry": 8,
          "id": 8
        },
          {
            "is_deleted": false,
            "industry": "消费品",
            "bucket": "image",
            "isPindustry": true,
            "key": "Web-Project-ksxfp.png",
            "Pindustry": 9,
            "id": 9
          },
          {
            "is_deleted": false,
            "industry": "制造业",
            "bucket": "image",
            "isPindustry": true,
            "key": "Web-Project-zzygy.png",
            "Pindustry": 10,
            "id": 10
          },
          {
            "is_deleted": false,
            "industry": "科技媒体与通讯",
            "bucket": "image",
            "isPindustry": true,
            "key": "Web-Project-kjmttx.png",
            "Pindustry": 11,
            "id": 11
          },
          {
            "is_deleted": false,
            "industry": "医疗与健康",
            "bucket": "image",
            "isPindustry": true,
            "key": "Web-Project-ylfw.png",
            "Pindustry": 12,
            "id": 12
          },
          {
            "is_deleted": false,
            "industry": "金融",
            "bucket": "image",
            "isPindustry": true,
            "key": "Web-Project-dyjr.png",
            "Pindustry": 13,
            "id": 13
          }, {
            "is_deleted": false,
            "industry": "农业",
            "bucket": "image",
            "isPindustry": true,
            "key": "Web-Project-Agriculture.png",
            "Pindustry": 14,
            "id": 14
          }, {
            "is_deleted": false,
            "industry": "服务业",
            "bucket": "image",
            "isPindustry": true,
            "key": "Web-Project-fw.png",
            "Pindustry": 15,
            "id": 15
          }, {
            "is_deleted": false,
            "industry": "不动产",
            "bucket": "image",
            "isPindustry": true,
            "key": "Web-Project-bdc.png",
            "Pindustry": 16,
            "id": 16
          }, {
            "is_deleted": false,
            "industry": "节能环保",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-JNHB.png",
            "Pindustry": 8,
            "id": 17
          }, {
            "is_deleted": false,
            "industry": "可再生能源",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-KZSZY.png",
            "Pindustry": 8,
            "id": 18
          }, {
            "is_deleted": false,
            "industry": "能源设备与服务",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-Renewable resources.png",
            "Pindustry": 8,
            "id": 19
          }, {
            "is_deleted": false,
            "industry": "矿业",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-kc.png",
            "Pindustry": 8,
            "id": 20
          }, {
            "is_deleted": false,
            "industry": "石油和天然气",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Prpject-sytq.png",
            "Pindustry": 8,
            "id": 21
          }, {
            "is_deleted": false,
            "industry": "其他",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-qita.png",
            "Pindustry": 8,
            "id": 22
          }, {
            "is_deleted": false,
            "industry": "快速消费品",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-ksxfp.png",
            "Pindustry": 9,
            "id": 23
          }, {
            "is_deleted": false,
            "industry": "艺术品",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-ysp.png",
            "Pindustry": 9,
            "id": 24
          }, {
            "is_deleted": false,
            "industry": "奢侈品",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-scp.png",
            "Pindustry": 9,
            "id": 25
          }, {
            "is_deleted": false,
            "industry": "化妆品",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-hzp.png",
            "Pindustry": 9,
            "id": 26
          }, {
            "is_deleted": false,
            "industry": "服饰箱包",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-fsxb.png",
            "Pindustry": 9,
            "id": 27
          }, {
            "is_deleted": false,
            "industry": "家具与家居",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-jujj.png",
            "Pindustry": 9,
            "id": 28
          }, {
            "is_deleted": false,
            "industry": "食品饮料",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-spyl.png",
            "Pindustry": 9,
            "id": 29
          }, {
            "is_deleted": false,
            "industry": "文体用品",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-tyyp.png",
            "Pindustry": 9,
            "id": 30
          }, {
            "is_deleted": false,
            "industry": "其他",
            "bucket": "image",
            "isPindustry": false,
            "key": "Web-Project-qita.png",
            "Pindustry": 9,
            "id": 31
          }
        ]

      }
    )
  },
  'GET /api/source/orgtype': (req, res) => {
    console.log(`${req.method} ${req.url}`)
    res.json(
      {
        "errormsg": null,
        "code": 1000,
        "result": [{
          "is_deleted": false,
          "id": 1,
          "name": "基金"
        }, {
          "is_deleted": false,
          "id": 2,
          "name": "律所"
        }, {
          "is_deleted": false,
          "id": 3,
          "name": "投行"
        }, {
          "is_deleted": false,
          "id": 4,
          "name": "会计师事务所"
        }, {
          "is_deleted": false,
          "id": 5,
          "name": "咨询"
        }, {
          "is_deleted": false,
          "id": 6,
          "name": "证券"
        }, {
          "is_deleted": false,
          "id": 7,
          "name": "银行"
        }, {
          "is_deleted": false,
          "id": 8,
          "name": "信托"
        }, {
          "is_deleted": false,
          "id": 9,
          "name": "租赁"
        }, {
          "is_deleted": false,
          "id": 10,
          "name": "保险"
        }, {
          "is_deleted": false,
          "id": 11,
          "name": "期货"
        }, {
          "is_deleted": false,
          "id": 12,
          "name": "上市公司"
        }, {
          "is_deleted": false,
          "id": 13,
          "name": "新三板上市公司"
        }, {
          "is_deleted": false,
          "id": 14,
          "name": "非上市公司"
        }, {
          "is_deleted": false,
          "id": 15,
          "name": "政府引导性基金"
        }, {
          "is_deleted": false,
          "id": 16,
          "name": "金融机构直投基金"
        }, {
          "is_deleted": false,
          "id": 17,
          "name": "上市公司产业基金"
        }, {
          "is_deleted": false,
          "id": 18,
          "name": "其他"
        }, {
          "is_deleted": false,
          "id": 19,
          "name": "个人"
        }]
      }
    )
  },
  'GET /api/service/currencyrate': (req, res) => {
    console.log(`${req.method} ${req.url}`)
    res.json(
      {"errormsg":null,"code":1000,"result":{"status":"ALREADY","scur":"CNY","update":"2017-05-27 10:26:58","tcur":"USD","ratenm":"人民币/美元","rate":"0.145934"}}
    )
  },

}
