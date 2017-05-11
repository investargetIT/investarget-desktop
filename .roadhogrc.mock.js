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
    console.log(`${req.method} ${req.url}`)
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
}
