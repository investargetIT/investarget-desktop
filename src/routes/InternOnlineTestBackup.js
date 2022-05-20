import React from 'react';
import { Upload, Button, Modal } from 'antd';
import { withRouter } from 'dva/router';
import LeftRightLayout from '../components/LeftRightLayout';
import * as api from '../api';
import { customRequest, getCurrentUser } from '../utils/util';

class InternOnlineTest extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isUploading: false,
      attachmentUrl: null,
    };
    this.testId = null;
  }

  async componentDidMount() {
    api.downloadUrl('file', 'Order template.xlsx')
      .then((result) => {
        this.setState({ attachmentUrl: result.data });
      });

    const resOnlineTest = await api.getOnlineTest();
    const { data, count } = resOnlineTest.data;
    if (count === 0) {
      Modal.info({
        title: '答题时间：2.5小时。超时提交将酌情扣分。',
      });
      const resStartTest = await api.startOnlineTest();
      this.testId = resStartTest.data.id;
      return;
    }
    const test = data[0];
    if (!test.endTime) {
      this.testId = test.id;
      return;
    }
    const react = this;
    Modal.warning({
      title: '答题已结束，谢谢参与',
      onOk() {
        react.props.router.goBack();
      },
    });
  }

  handleFileChange = ({ file }) => {
    this.setState({ isUploading: true });
    if (file.status === 'done') {
      this.handleFileUploadDone(file);
    } 
  }

  handleFileUploadDone = file => {
    file.bucket = 'file'
    file.key = file.response.result.key
    file.url = file.response.result.url
    file.realfilekey = file.response.result.realfilekey;
    file.filename = file.name;
    this.submitAnswer(file);
  }

  submitAnswer = async (file) => {
    const { bucket, key, filename } = file;
    await api.endOnlineTest(this.testId, { key, bucket, filename });
    this.setState({ isUploading: false });
    const react = this;
    Modal.success({
      title: '答题已完成，谢谢',
      onOk() {
        react.props.router.goBack();
      },
    });
  }

  render() {
    return (
      <LeftRightLayout location={this.props.location} title="笔试">
        <div style={{ lineHeight: '28px', fontWeight: 'bold' }}>1.请将下文意译为英文：</div>
        <div style={{ lineHeight: '24px', paddingLeft: 20 }}>
          <p>随着数字经济社会的蓬勃发展，世界各国都将数字创新作为实现技术突破、经济发展的重中之重。从国家到社会，从企业到个人，都应在各自的领域和层面作出贡献，共同促进数字经济社会的协同发展。</p>
          <p style={{ paddingLeft: 10 }}>- 国家层面：加大基础科学研究的投入力度，掌握核心技术，通过相关政策法规的制定，为高校、企业大胆践行数字创新提供宽松的制度环境。</p>
          <p style={{ paddingLeft: 10 }}>- 产业层面：知识与信息作为数字经济社会的基本生产要素，对全社会的数字化水平提出了更高的要求。产业界应充分利用云计算、大数据、人工智能等前沿技术，大力推动数字化升级与改造。</p>
          <p style={{ marginTop: 10 }}>信息与知识在促进数字经济社会发展所扮演的角色越来越重要，许多专注于信息和知识收集、存储、编辑、共享、分享的知识管理场景的APP开始流行。</p>
          <p style={{ paddingLeft: 10 }}>- 从个人层面来看，作为数字经济时代下的每一个个体，都应当具有与时俱进的思想意识，保持进步，为国家实现跨越式发展做好知识与技能的储备。在数字时代海量的碎片化信息中有效地找到高价值信息，并将相关信息体系化结构化，建立知识图谱、形成个人的知识体系，将极大地提升个人在数字时代的学习能力，紧跟时代发展的步伐。</p>
          <p style={{ paddingLeft: 10 }}>- 从企业和团队层面来看，利用数字创新提高生产效率，积极打造学习型组织，为员工打造高效协同的办公环境，建立企业特有的知识库，为业务创新提供完整的知识储备。数字时代下对于团队高效协作的需求越来越大，将个人知识有效转化为团队知识，挖掘企业独特场景、提升团队协作效率，会加快企业和团队的发展速度，推动数字经济发展。</p>
          <p style={{ marginTop: 10 }}>科技进步一直是人类文化文明发展的推动力，纵观人类历史，每次文化内容生产的大爆发背后都是革命性的技术创新。源自中华民族的印刷术，成为人类近代文明的先导，为知识的广泛传播、交流创造了条件。20世纪以来电影、广播、电视的出现，带来更多、更丰富的内容，推动了人类文明的发展与进步。21世纪的互联网技术，特别是移动互联网以及4G的普及，使得内容生产更便捷，文化传播更广泛、迅速。</p>
        </div>
        <div style={{ marginTop: 20, lineHeight: '28px', fontWeight: 'bold' }}>2.请根据以下材料，整理1-2页介绍公司情况的PPT（可对材料进行筛选，无需呈现全部内容）</div>
        <div style={{ lineHeight: '28px', paddingLeft: 20 }}>
          <p>- 公司帮助中小企业代为管理物流业务，现阶段聚焦于为中小企业提供中长途运输业务代管服务</p>
          <p>- 目前拥有700+客户，2017-2019年收入年复合增长率150%，分拨中心55个，分布在25个城市，合作的运力供应商100+，2019年营收约1亿元，预计2020年营收可达2.5亿元，毛利率25%，远超行业平均水平</p>
          <p>- 市场：</p>
          <div style={{ paddingLeft: 20 }}>
            <p>▶ 2016年末，全国中小企业超过2000万家，个体工商户超过5400万户，中小企业占中国企业总数99%左右，但中小企业的物流服务长期处于高度碎片化状态，这种上下游碎片化的结构导致业务组织效率低下，中间环节过多，大量成本被损耗在漫长的链条之中</p>
            <p>▶ 根据市场调研和实测业务数据，以中小型制造业为例，44.2% 的企业年运费在20万以下 , 业务体量小造成了诸多客观限制。对中小企业来讲，没有能力为一年数万或十数万的物流费用专业物流团队，现实状况是:</p>
            <div style={{ paddingLeft: 20 }}>
              <p>a) 自身缺乏专业团队，导致物流运作专业度低下；</p>
              <p>b) 业务量小而琐碎，缺乏议价能力，导致物流成本长期居高不下；</p>
              <p>c) 缺乏有效采购渠道，信息获取面狭隘，价格透明度低；</p>
              <p>d) 缺乏专业化服务：物流公司（3PL和专线）基本上都不愿意为中小企业提供具有针对性的服务，通常作为散客对待（注：简单讲就是“门店接货”），导致中小企业存在服务体验差、物流信息反馈不及时、运作质量难保证等情况</p>
              <p>e) 缺乏有效保障：一旦出现货损货差，或出现运作质量问题，往往难以索赔。要么“店大欺客”，要么“店小跑路”</p>
            </div>
          </div>
          <p>- 核心竞争力：公司战略性在核心城市布局分拨中心，抢先搭建全国性网络，把控货物中转和仓储关键环节。其运力网络具有如下优势：</p>
          <div style={{ paddingLeft: 20 }}>▶ 分拨中心选址优异：</div>
          <div style={{ paddingLeft: 40 }}>
            <p>f) 全国性布局，覆盖范围广</p>
            <p>g) 数字化工具计算最优的分拨中心位置，确保地区间运力分配均匀</p>
            <p>h) 已开始前瞻性布局下沉市场</p>
          </div>
          <div style={{ paddingLeft: 20 }}>▶ 模式合理：</div>
          <div style={{ paddingLeft: 40 }}>
            <p>i) 与运力供应商建立了良好的合作关系，运力资源稳定</p>
            <p>j) 在战略性重点区域，与运力供应商签署长期合同</p>
            <p>k) 以更灵活的中短期合同补充季节性导致的短期内需求激增</p>
          </div>
          <p style={{ paddingLeft: 20 }}>▶ 物流代管业务高度标准化、数字化：</p>
          <div style={{ paddingLeft: 40 }}>
            <p>l) 根据货主需求计划，提供针对性运力组织和透明化采购，以及高效便捷的标准化运作服务和相关运作保障</p>
            <p>m) 根据客户发运计划，通过数字化工具合理安排运力解决方案，透明化采购</p>
            <p>n) 提供门到门全程服务，建立标准化运作跟踪和KPI管控，提供风险保障和异常处理，提供透明化过程管理和系统支撑</p>
          </div>
        </div>
        <div style={{ marginTop: 20, lineHeight: '28px' }}>
          <p style={{ fontWeight: 'bold' }}>3.“公司历史订单数据”tab中提供了公司在2019年的订单数据，包括：下单客户名称，下单金额，根据运输方式区分的两种承运类型（分为A、B类），下单时间。请根据以上数据计算分析如下指标：</p>
          <div style={{ paddingLeft: 20 }}>
            <p>- 2019年前十大客户及对应购买金额（模板在“运营指标分析”）</p>
            <p>- 每一类承运类型在每个月的下单金额、订单数量及每单平均金额（模板在“运营指标分析”）</p>
            <p>- 每月下单客户数量（模板在“运营指标分析”）</p>
            <p>- 已知：2020年1月，每类客户的每单平均金额相比2019年12月可能提升的情况有五种：20%，10%，0%，-10%，-20%。每类客户的订单数量相比2019年12月可能提升的情况有五种：15%，7%，0%，-7%，-15%。请通过模拟试算表，计算出在每种情况下，每类客户2020年1月的订单金额（模板在“运营指标分析”）</p>
            <p>- 请计算2019年客户留存数据（模板在“Cohort（客户留存）数据”）</p>
            <p style={{ paddingLeft: 20 }}>▶ 客户留存说明：请确认每个客户首次下单的月份，计算出每个月新增客户数量，以及这些新增客户在后续月份的数量留存变化</p>
          </div>
        </div>

        <div style={{ margin: '20px 0' }}>
          <a href={this.state.attachmentUrl} target="_blank">附件下载：公司订单数据（模版）.xlsx</a>
        </div>

        <div>
          <Upload
            customRequest={customRequest}
            data={{ bucket: 'file' }}
            // accept={fileExtensions.join(',')}
            onChange={this.handleFileChange}
            // onRemove={this.handleFileRemoveConfirm}
            showUploadList={false}
          >
            <Button loading={this.state.isUploading} style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>点击上传答案</Button>
          </Upload>
          <span style={{ marginLeft: 10, color: 'red' }}>请将完成的Word、PPT、Excel文件一起打包压缩成rar或zip格式，上传附件。</span>
        </div>
      </LeftRightLayout>
    );
  }

}

export default withRouter(InternOnlineTest);
