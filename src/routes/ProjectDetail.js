import React from 'react'
import * as api from '../api'
import { formatMoney } from '../utils/util'

import { Timeline, Icon, Tag, Button, message } from 'antd'
import MainLayout from '../components/MainLayout'
import { SelectNumber } from '../components/ExtraInput'


const userInfo = JSON.parse(localStorage.getItem('user_info'))
const currentUserId = userInfo ? userInfo.id : null


function Field (props) {
  return (
    <div style={{display: 'flex'}}>
      <span style={{width: '150px'}}>{props.label}</span>
      <span>{props.value}</span>
    </div>
  )
}


class ProjectFinanceYear extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      finance: []
    }
  }

  componentDidMount() {
    const id = this.props.projId
    api.getProjFinance(id).then(result => {
      this.setState({ finance: result.data.data })
    })
  }

  render() {
    const { finance } = this.state
    return finance.length > 0 ? (
      <div>
        <h2>财务年度</h2>
        <div>
          {
            finance.map(item =>
              <div key={item.fYear}>
                <h3>财务年度 {item.fYear}</h3>
                <div>
                  <Field label="营收(美元)" value={item.revenue_USD ? formatMoney(item.revenue_USD) : 'N/A'} />
                  <Field label="净利润(美元)" value={item.netIncome_USD ? formatMoney(item.netIncome_USD) : 'N/A'} />
                  <Field label="毛利润(美元)" value={item.grossProfit ? formatMoney(item.grossProfit) : 'N/A'} />
                  <Field label="总资产(美元)" value={item.totalAsset ? formatMoney(item.totalAsset) : 'N/A'} />
                  <Field label="净资产(美元)" value={item.stockholdersEquity ? formatMoney(item.stockholdersEquity) : 'N/A'} />
                  <Field label="净现金流(美元)" value={item.grossMerchandiseValue ? formatMoney(item.grossMerchandiseValue) : 'N/A'} />
                  <Field label="经营性现金流(美元)" value={item.operationalCashFlow ? formatMoney(item.operationalCashFlow) : 'N/A'} />
                  <Field label="息税折旧摊销前利润(美元)" value={item.EBITDA ? formatMoney(item.EBITDA) : 'N/A'} />
                </div>
              </div>
            )
          }
        </div>
      </div>
    ) : null
  }

}



class ProjectDetail extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      id: Number(this.props.params.id),
      project: {},
      isFavorite: false,
      favorId: null,
      traderOptions: [],
      trader: null,
    }
  }

  getFavorProject = () => {
    const param = {
      favoritetype: 4,
      user: currentUserId,
      proj: this.state.id,
    }
    api.getFavoriteProj(param).then(result => {
      const data = result.data.data
      const isFavorite = data.length == 1
      const favorId = data[0] && data[0].id
      this.setState({ isFavorite, favorId })
    }, error => {
      error.message(error.message, 2)
    })
  }

  favorProject = () => {
    const param = {
      favoritetype: 4,
      user: currentUserId,
      projs: [this.state.id],
    }
    api.projFavorite(param).then(result => {
      this.setState({ isFavorite: true })
      message.success('收藏成功', 2)
      this.getFavorProject()
    }, error => {
      message.error(error.message, 2)
    })
  }

  unfavorProject = () => {
    const param = {
      favoriteids: [this.state.favorId],
    }
    api.projCancelFavorite(param).then(result => {
      this.setState({ isFavorite: false, favorId: null })
      message.success('取消收藏成功', 2)
    }, error => {
      message.error(error.message, 2)
    })
  }

  handleTraderChange = (trader) => {
    this.setState({ trader })
  }

  haveInterest = () => {
    const { id, trader } = this.state
    const params = {
      favoritetype: 5,
      projs: [id],
      user: currentUserId,
      trader: trader,
    }
    api.projFavorite(params).then(result => {
      message.success('感兴趣成功', 2)
    }, error => {
      message.error(error.message, 2)
    })
  }

  componentDidMount() {
    const { id } = this.state
    api.getProjLangDetail(id).then(result => {
      const project = result.data
      this.setState({ project })
    })

    this.getFavorProject()

    // 获取投资人的交易师
    api.getUserRelation({ investoruser: currentUserId }).then(result => {
      const data = result.data.data
      const relation = data.filter(item => item.relationtype)[0]
      const trader = relation && relation.traderuser.id
      const traderOptions = data.map(item => ({ value: item.traderuser.id, label: item.traderuser.username }))
      this.setState({ traderOptions, trader })
    })
  }

  render() {
    const { id, project, isFavorite, trader, traderOptions } = this.state

    return (
      <MainLayout location={this.props.location}>
        <h1>{project.projtitle}</h1>

        <div>
          <span>发布时间 {project.createdtime && project.createdtime.substr(0,10)}</span>
        </div>

        <div>
          <h2>项目审核流程</h2>
          <div>
            <Tag color={project.projstatus && project.projstatus.id == 2 ? 'pink' : null}>内容完善</Tag>
            <Tag color={project.projstatus && project.projstatus.id == 3 ? 'pink' : null}>内容校对</Tag>
            <Tag color={project.projstatus && project.projstatus.id == 4 ? 'pink' : null}>终审发布</Tag>
            <Tag color={project.projstatus && project.projstatus.id == 6 ? 'pink' : null}>交易中</Tag>
            <Tag color={project.projstatus && project.projstatus.id == 7 ? 'pink' : null}>已完成</Tag>
            <Tag color={project.projstatus && project.projstatus.id == 8 ? 'pink' : null}>已下架</Tag>
          </div>
        </div>

        <div>
          <img src={(project.industries && project.industries[0]) ? project.industries[0].url : 'defaultUrl' } />
        </div>

        <div>
          <h2>项目简介</h2>
          <div>
            <div>
              {project.p_introducte}
            </div>
            <div>
              {
                project.tags && project.tags.map(item =>
                  <Tag key={item.id} color="orange">{item.name}</Tag>
                )
              }
            </div>
            <div>
              <Field label="项目地区:" value={project.country && project.country.country} />
              <Field label="项目行业:" value={project.industries && project.industries[0] && project.industries[0].industry} />
              <Field label="项目类型:" value={project.transactionType && project.transactionType[0] && project.transactionType[0].name} />
              <Field label="我的角色:" value={project.character && project.character.character} />
              <Field label="拟交易规模:" value={project.financeAmount_USD ? formatMoney(project.financeAmount_USD) : 'N/A'} />
              <Field label="公司估值:" value={project.companyValuation_USD ? formatMoney(project.companyValuation_USD) : 'N/A'} />
            </div>
          </div>
        </div>

        <div>
          <h2>保密信息</h2>
          <div>
            <Field label="姓名：" value={project.contactPerson} />
            <Field label="电话：" value={project.phoneNumber} />
            <Field label="邮箱：" value={project.email} />
            <Field label="上传者：" value={project.supportUser && project.supportUser.username} />
            <Field label="负责人：" value={project.makeUser && project.makeUser.username} />
          </div>
        </div>

        <ProjectFinanceYear projId={id} />

        <div>
          <h2>项目详情</h2>
          <div>
            {
              project.targetMarket ? (
                <div>
                  <h3>目标市场</h3>
                  <p>{project.targetMarket}</p>
                </div>
              ) : null
            }
            {
              project.productTechnology ? (
                <div>
                  <h3>核心产品</h3>
                  <p>{project.productTechnology}</p>
                </div>
              ): null
            }
            {
              project.businessModel ? (
                <div>
                  <h3>商业模式</h3>
                  <p>{project.businessModel}</p>
                </div>
              ) : null
            }
            {
              project.brandChannel ? (
                <div>
                  <h3>品牌渠道</h3>
                  <p>{project.brandChannel}</p>
                </div>
              ) : null
            }
            {
              project.managementTeam ? (
                <div>
                  <h3>管理团队</h3>
                  <p>{project.managementTeam}</p>
                </div>
              ) : null
            }
            {
              project.Businesspartners ? (
                <div>
                  <h3>商业伙伴</h3>
                  <p>{project.Businesspartners}</p>
                </div>
              ) : null
            }
            {
              project.useOfProceed ? (
                <div>
                  <h3>资金用途</h3>
                  <p>{project.useOfProceed}</p>
                </div>
              ) : null
            }
            {
              project.financingHistory ? (
                <div>
                  <h3>融资历史</h3>
                  <p>{project.financingHistory}</p>
                </div>
              ) : null
            }
            {
              project.operationalData ? (
                <div>
                  <h3>经营数据</h3>
                  <p>{project.operationalData}</p>
                </div>
              ) : null
            }
          </div>
        </div>

        <div>
          {
            isFavorite ? <Button onClick={this.unfavorProject}>取消收藏</Button>
                                  : <Button onClick={this.favorProject}>加入收藏</Button>
          }
        </div>


        <div>
          <SelectNumber options={traderOptions} value={trader} onChange={this.handleTraderChange} />
          <Button onClick={this.haveInterest} disabled={traderOptions.length == 0}>感兴趣</Button>
        </div>



        {/* TODO// 下载 Teaser */}
        {/* TODO// 公共 dataroom */}
        {/* TODO// 项目进程（时间轴） */}


      </MainLayout>
    )
  }
}


export default ProjectDetail
