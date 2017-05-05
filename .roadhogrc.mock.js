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
    console.log('GET /api/user/')
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
  }
};
