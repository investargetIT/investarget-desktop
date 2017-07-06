import React from 'react'
import * as api from '../api'

import { Timeline, Icon, Tag } from 'antd'
import MainLayout from '../components/MainLayout'



class ProjectDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      project: {}
    }
  }

  componentDidMount() {
    const id = this.props.params.id
    api.getProjLangDetail(id).then(result => {
      const project = result.data
      this.setState({ project })
    })
  }

  render() {
    const project = this.state.project
    return (
      <MainLayout location={this.props.location}>
        <h1>{project.projtitle}</h1>

        <div>
          <span>发布时间2016-10-12{/* time */}</span>
          <span>NO: P201610120002{/* NO. */}</span>
        </div>

        <div>
          <h2>项目审核流程</h2>
          <Timeline>
            <Timeline.Item dot={<Icon type="clock-circle-o" style={{ fontSize: '16px' }} />} color="red">内容完善</Timeline.Item>
            <Timeline.Item>内容校对</Timeline.Item>
            <Timeline.Item>终审发布</Timeline.Item>
            <Timeline.Item>交易中</Timeline.Item>
            <Timeline.Item>已完成</Timeline.Item>
            <Timeline.Item>已下架</Timeline.Item>
          </Timeline>
        </div>

        <div>
          <h2>项目简介</h2>
          <div>
            <div>简介</div>
            <div>
              <Tag color="orange">TMT</Tag>
              <Tag color="orange">大数据</Tag>
            </div>
            <div>
              <div style={{display: 'flex'}}>
                <span style={{width: '150px'}}>项目地区:</span>
                <span>美国</span>
              </div>
              <div style={{display: 'flex'}}>
                <span style={{width: '150px'}}>项目行业:</span>
                <span>化学药与生物药</span>
              </div>
              <div style={{display: 'flex'}}>
                <span style={{width: '150px'}}>项目类型:</span>
                <span>股权融资</span>
              </div>
              <div style={{display: 'flex'}}>
                <span style={{width: '150px'}}>我的角色:</span>
                <span>财务顾问</span>
              </div>
              <div style={{display: 'flex'}}>
                <span style={{width: '150px'}}>拟交易规模:</span>
                <span>$40,000,000</span>
              </div>
              <div style={{display: 'flex'}}>
                <span style={{width: '150px'}}>公司估值:</span>
                <span>$60,000,000</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2>项目详情</h2>
          <div>
            <div>
              <h3>目标市场</h3>
              <p>
                缺氧是包括中风、心肌梗死、呼吸道疾病和癌症在内的许多疾病死亡的原因，对抗缺氧的安全有效的新方法将代表医学的重大突破
                <br/><br/>这种新的缺氧治疗为肿瘤学、心血管、呼吸和神经退行性疾病这些尚有未满足的医疗需求的十亿级美元市场提供了大量机会
                <br/><br/>缺氧有关的癌症耐药性：胶质母细胞瘤全球市场超过50亿美元，在美国有17万患者，在全球有37.5万名患者；胰腺癌全球市场超过10亿美元，美国有1.2万患者，全球有2.8万患者；转移性脑癌全球市场超过30亿美元，美国有4.5万患者，全球有10万名患者
              </p>
            </div>
            <div>
              <h3>核心产品</h3>
              <p>
                TSC的机制是基于最基本层面的物理化学法，可适用于所有病人；也不需要额外的检查（X光等）来确定病人是否适合用药
                <br/><br/>在治疗癌症时，TSC作用于肿瘤缺氧的微环境，重新氧化组织，使肿瘤细胞更容易受到放射治疗和化疗的疗效
                <br/><br/>结合一线放疗和化疗的新诊断出患有脑癌（“胶质母细胞瘤”或“GBM”）病人的1/2期TSC临床试验在2015年完成；这个试验提供了有效性和安全性延长总生存期且不增加毒性的证据；基于这些结果，公司预备phase 3的关键阶段试验以支持认证
                <br/><br/>TSC被授予FDA治疗GBM的孤儿药认证
                <br/><br/>TSC在预备胰腺癌的phase 2阶段，进行由世界级胰腺癌专家指导设计的临床试验
                <br/><br/>TSC被授予FDA治疗转移性脑癌的孤儿药认证
                <br/><br/>TSC已经获得FDA在一些癌症治疗方面的孤儿药认证，对其他的癌症也是可行的
                <br/><br/>公司的TSC技术因为其新颖的安全氧化缺氧组织机制，可以治疗无数心血管、呼吸、神经退行性疾病及癌症，已有许多临床前数据支持，有合作协议之后这几类病症的phase 2可以迅速启动，包括慢性阻塞性肺病、肺气肿和急性呼吸窘迫(ARDS)，心血管/紧急情况（中风、心肌梗死、外周动脉疾病/危重肢体缺血和出血性休克）和神经退行性疾病（帕金森症和阿尔茨海默氏症）
              </p>
            </div>
          </div>
        </div>

        {/* TODO// 项目图片 */}
        {/* TODO// 收藏/取消收藏 */}
        {/* TODO// 感兴趣的人 */}
        {/* TODO// 联系交易师 */}
        {/* TODO// 下载 Teaser */}
        {/* TODO// 公共 dataroom */}
        {/* TODO// 项目进程（时间轴） */}


      </MainLayout>
    )
  }
}


export default ProjectDetail
