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
      result: [
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
	  tags: [],
	  title: "董事长"
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
	  tags: [],
	  title: "董事长"
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
	  title: "董事长"
	}
      ]
    })
  },
  'GET /api/org': (req, res) => {
    console.log('GET /api/org/')
    res.json({
      code: 1000,
      errormsg: null,
      result: [
	{
	  value: '组织机构1'
	},
	{
	  value: '组织机构2'
	}
      ]
    })
  },
  'GET /api/source/tags': (req, res) => {
    console.log('GET /api/source/tags')
    res.json({
      code: 1000,
      errormsg: null,
      result: [
        {"tagName":"TMT","id":33},
        {"tagName":"大健康","id":34},
        {"tagName":"大数据","id":35},
        {"tagName":"房地产","id":36},
        {"tagName":"高端装备","id":37},
        {"tagName":"工业4.0","id":38},
        {"tagName":"互联网金融","id":39},
        {"tagName":"机器人","id":40},
        {"tagName":"清洁技术","id":41},
        {"tagName":"人工智能","id":42},
        {"tagName":"日用品","id":43},
        {"tagName":"生命科学","id":44},
        {"tagName":"时尚","id":45},
        {"tagName":"文化创意","id":46},
        {"tagName":"物联网","id":47},
        {"tagName":"消费电子","id":48},
        {"tagName":"新材料","id":49},
        {"tagName":"新媒体","id":50},
        {"tagName":"新能源","id":51},
        {"tagName":"新农业","id":52},
        {"tagName":"新型汽车","id":53},
        {"tagName":"虚拟/增强现实","id":54},
        {"tagName":"云计算","id":55},
        {"tagName":"智能硬件","id":56},
        {"tagName":"教育培训","id":57},
        {"tagName":"电子商务","id":58},
        {"tagName":"医疗器械","id":59},
        {"tagName":"泛娱乐","id":60},
        {"tagName":"大消费","id":61},
        {"tagName":"家具与家居","id":62},
        {"tagName":"旅游","id":63},
        {"tagName":"软件服务","id":64},
        {"tagName":"食品饮料","id":65},
        {"tagName":"国防军工","id":66}
      ]
    })
  },
}
