export default {
  'POST /api/user/login/': (req, res) => {
    console.log('POST /api/user/login/')
    res.json({
      code: 1000,
      errormsg: null,
      result: {
        token: '00185b5e45edb2e97e61d9d5d129f70814c1ccfbaaa33aef',
        user_info: {
          company: '多维海滩',
          email: 'wjk@126.com',
          groups: [],
          id: 8,
          investor_relations: [],
          mobile: '18637760716',
          name: '无均可',
          org: {
            auditStatu: 1,
            id: 1,
            name: "还脱",
            org_users: [8, 10]
          },
          tags: [],
          title: "董事长"
        }
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

}
