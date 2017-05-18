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
            company: '多维海滩1',
            email: 'wjk1111111@126.com',
            groups: [],
            id: 1,
            investor_relations: [],
            mobile: '11111111111',
            name: '无均可1',
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
            company: '多维海滩2',
            email: 'wjk222222@126.com',
            groups: [],
            id: 2,
            investor_relations: [],
            mobile: '22222222222222',
            name: '无均可2',
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
            company: '多维海滩',
            email: 'wjk33333333333@126.com',
            groups: [],
            id: 3,
            investor_relations: [],
            mobile: '18637760716',
            name: '无均可3',
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
  'GET /api/org/': (req, res) => {
    console.log('GET /api/org/')
    res.json({
      code: 1000,
      errormsg: null,
      result: [{"name":"chao chen","nameEn":"chao chen","overSeasProject":false,"companyEmail":"","orgType":null,"currency":null,"description":"","orgAreas":null,"transactionPhases":[],"transactionAmountF":null,"transactionAmountF_USD":null,"transactionAmountT":null,"transactionAmountT_USD":null,"decisionCycle":null,"decisionMakingProcess":"","industry":null,"weChat":"chao chen","fundSize":null,"fundSize_USD":null,"address":"128 Louis Ave, Apt 4","typicalCase":"","partnerOrInvestmentCommitteeMember":"","phone":"","webSite":"","stockCode":"","auditStatus":1,"id":2484},{"name":"测试股票代码","nameEn":"","overSeasProject":false,"companyEmail":"","orgType":8,"currency":null,"description":"","orgAreas":null,"transactionPhases":[],"transactionAmountF":null,"transactionAmountF_USD":null,"transactionAmountT":null,"transactionAmountT_USD":null,"decisionCycle":null,"decisionMakingProcess":"","industry":null,"weChat":"","fundSize":null,"fundSize_USD":null,"address":"","typicalCase":"","partnerOrInvestmentCommitteeMember":"","phone":"","webSite":"","stockCode":"4000080","auditStatus":1,"id":2482},{"name":"testover","nameEn":"","overSeasProject":true,"companyEmail":"","orgType":null,"currency":null,"description":"","orgAreas":null,"transactionPhases":[],"transactionAmountF":null,"transactionAmountF_USD":0,"transactionAmountT":null,"transactionAmountT_USD":0,"decisionCycle":null,"decisionMakingProcess":"","industry":null,"weChat":"","fundSize":null,"fundSize_USD":0,"address":"","typicalCase":"","partnerOrInvestmentCommitteeMember":"","phone":"","webSite":"","stockCode":"300008","auditStatus":1,"id":2481},{"name":"新的机构行业测试机","nameEn":"4343","overSeasProject":true,"companyEmail":"","orgType":3,"currency":3,"description":"","orgAreas":null,"transactionPhases":[{"name":"C轮","id":7},{"name":"B轮","id":6},{"name":"A轮","id":4}],"transactionAmountF":400000,"transactionAmountF_USD":57952,"transactionAmountT":600000,"transactionAmountT_USD":86928,"decisionCycle":7,"decisionMakingProcess":"","industry":{"industryName":"其他","pIndustryId":9,"bucket":null,"key":null,"imgUrl":null,"id":31},"weChat":"","fundSize":null,"fundSize_USD":0,"address":"","typicalCase":"","partnerOrInvestmentCommitteeMember":"","phone":"","webSite":"","stockCode":null,"auditStatus":1,"id":2480},{"name":"testNNNNNN","nameEn":"","overSeasProject":null,"companyEmail":"","orgType":null,"currency":null,"description":"","orgAreas":null,"transactionPhases":[],"transactionAmountF":null,"transactionAmountF_USD":0,"transactionAmountT":null,"transactionAmountT_USD":0,"decisionCycle":null,"decisionMakingProcess":"","industry":{"industryName":"电子元器件","pIndustryId":11,"bucket":null,"key":null,"imgUrl":null,"id":53},"weChat":"","fundSize":null,"fundSize_USD":0,"address":"","typicalCase":"","partnerOrInvestmentCommitteeMember":"","phone":"","webSite":"","stockCode":null,"auditStatus":1,"id":2479},{"name":"特殊1123","nameEn":"特殊1123","overSeasProject":null,"companyEmail":"cxz@fs.com","orgType":11,"currency":1,"description":"深圳歌力思服饰股份有限公司（以下简称“公司”），于1999年6月8日在深圳市工商行政管理局登记成立，2011年11月4日变更为外商投资股份制企业。2015年4月22日于上海证券交易所首次公开发行A股上市。公司自成立以来，就始终围绕中国高级时装领域提供优质的产品和服务，将目标市场锁定在有较高消费水平的人群。公司未来战略目标是成长为“中国高级时装集团”。\n公司的主营业务为品牌时装的设计研发、生产和销售。自公司成立以来，一直专注于高级时装品牌的发展，主营业务未发生变化。\n截至目前，目前公司旗下共有成熟的时装品牌5个，其中ELLASSAY、WITH SONG为公司自有品牌，Laurèl、Ed Hardy、IRO为公司通过收购方式持有的国际品牌。通过五大品牌不同的市场定位，公司逐步拓宽目标市场的覆盖率。\n    2016年，我们期待更多优秀人才的加入，我们的事业将更加辉煌！深圳歌力思服饰股份有限公司（以下简称“公司”），于1999年6月8日在深圳市工商行政管理局登记成立，2011年11月4日变更为外商投资股份制企业。2015年4月22日于上海证券交易所首次公开发行A股上市。公司自成立以来，就始终围绕中国高级时装领域提供优质的产品和服务，将目标市场锁定在有较高消费水平的人群。公司未来战略目标是成长为“中国高级时装集团”。\n公司的主营业务为品牌时装的设计研发、生产和销售。自公司成立以来，一直专注于高级时装品牌的发展，主营业务未发生变化。\n截至目前，目前公司旗下共有成熟的时装品牌5个，其中ELLASSAY、WITH SONG为公司自有品牌，Laurèl、Ed Hardy、IRO为公司通过收购方式持有的国际品牌。通过五大品牌不同的市场定位，公司逐步拓宽目标市场的覆盖率。\n    2016年，我们期待更多优秀人才的加入，我们的事业将更加辉煌！","orgAreas":null,"transactionPhases":[{"name":"C+轮","id":8}],"transactionAmountF":10000,"transactionAmountF_USD":1453,"transactionAmountT":40000,"transactionAmountT_USD":5812,"decisionCycle":8,"decisionMakingProcess":"","industry":null,"weChat":"","fundSize":800,"fundSize_USD":116,"address":"","typicalCase":"","partnerOrInvestmentCommitteeMember":"","phone":"","webSite":"ht.investarget.com","stockCode":null,"auditStatus":2,"id":2478},{"name":"快捷键","nameEn":"","overSeasProject":null,"companyEmail":"","orgType":null,"currency":null,"description":"","orgAreas":null,"transactionPhases":[],"transactionAmountF":null,"transactionAmountF_USD":0,"transactionAmountT":null,"transactionAmountT_USD":0,"decisionCycle":null,"decisionMakingProcess":"","industry":null,"weChat":"","fundSize":null,"fundSize_USD":0,"address":"","typicalCase":"","partnerOrInvestmentCommitteeMember":"","phone":"","webSite":"","stockCode":null,"auditStatus":2,"id":2477},{"name":"去问问","nameEn":"tttt","overSeasProject":null,"companyEmail":"ttttt@qq.com","orgType":13,"currency":3,"description":"","orgAreas":null,"transactionPhases":[{"name":"B轮","id":6}],"transactionAmountF":21,"transactionAmountF_USD":3,"transactionAmountT":123,"transactionAmountT_USD":17,"decisionCycle":null,"decisionMakingProcess":"","industry":null,"weChat":"wechat","fundSize":213,"fundSize_USD":30,"address":"","typicalCase":"","partnerOrInvestmentCommitteeMember":"","phone":"","webSite":"","stockCode":null,"auditStatus":2,"id":2474},{"name":"苏美达资本控股有限公司","nameEn":null,"overSeasProject":null,"companyEmail":null,"orgType":1,"currency":1,"description":"","orgAreas":null,"transactionPhases":[{"name":"C+轮","id":8},{"name":"Pre-IPO","id":10},{"name":"兼并收购","id":11}],"transactionAmountF":null,"transactionAmountF_USD":0,"transactionAmountT":null,"transactionAmountT_USD":0,"decisionCycle":null,"decisionMakingProcess":"","industry":{"industryName":"机械设备制造","pIndustryId":10,"bucket":null,"key":null,"imgUrl":null,"id":38},"weChat":"","fundSize":null,"fundSize_USD":0,"address":"南京市长江路198号//北京市朝外大街19号","typicalCase":"","partnerOrInvestmentCommitteeMember":"","phone":"","webSite":"www.sumec-capital.com","stockCode":null,"auditStatus":2,"id":2470},{"name":"宁波圣龙（集团）有限公司","nameEn":null,"overSeasProject":null,"companyEmail":null,"orgType":12,"currency":1,"description":"","orgAreas":null,"transactionPhases":[{"name":"C+轮","id":8},{"name":"Pre-IPO","id":10},{"name":"兼并收购","id":11}],"transactionAmountF":null,"transactionAmountF_USD":0,"transactionAmountT":null,"transactionAmountT_USD":0,"decisionCycle":null,"decisionMakingProcess":"","industry":null,"weChat":"","fundSize":null,"fundSize_USD":0,"address":"中国宁波鄞州区金达路788号","typicalCase":"","partnerOrInvestmentCommitteeMember":"","phone":"","webSite":"http://www.sheng-long.com","stockCode":null,"auditStatus":null,"id":2469}]
    })
  },
}
