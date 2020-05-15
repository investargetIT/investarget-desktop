import React from 'react';
import { Upload, Button, Modal } from 'antd';
import { withRouter } from 'dva/router';
import LeftRightLayout from '../components/LeftRightLayout';
import { baseUrl } from '../utils/request';
import * as api from '../api';
import { getCurrentUser } from '../utils/util';

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
      title: '你已经答过题了',
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
    this.props.router.goBack();
  }

  render() {
    return (
      <LeftRightLayout location={this.props.location} title="笔试">
        <div style={{ lineHeight: '28px', fontWeight: 'bold' }}>1.请根据以下材料，整理1-2页介绍公司情况的PPT（可对材料进行筛选，无需呈现全部内容）</div>
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
          <p style={{ fontWeight: 'bold' }}>2.“公司历史订单数据”tab中提供了公司在2019年的订单数据，包括：下单客户名称，下单金额，根据运输方式区分的两种承运类型（分为A、B类），下单时间。请根据以上数据计算分析如下指标：</p>
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

        <Upload
          action={`${baseUrl}/service/qiniubigupload?bucket=file`}
          // accept={fileExtensions.join(',')}
          onChange={this.handleFileChange}
          // onRemove={this.handleFileRemoveConfirm}
          showUploadList={false}
        >
          <Button loading={this.state.isUploading} style={{ padding: '4px 20px', color: 'white', backgroundColor: '#237ccc', borderRadius: 4, cursor: 'pointer' }}>点击上传答案</Button>
        </Upload>
      </LeftRightLayout>
    );
  }

}

export default withRouter(InternOnlineTest);
