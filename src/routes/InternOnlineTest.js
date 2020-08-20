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
          <p>很多时候人们会搞混自私和自利两个概念。</p>
          <p style={{ marginTop: 10 }}>所有生物的几乎所有行为，都是出于自利。不懂得趋利避害，就不可能作为生命体存活下来。吃饭是自利，睡觉是自利，努力赚钱等等都是自利。但在我们的常识道德中，自利行为妨害他人或群体到某种程度时，才被指为自私。</p>
          <p style={{ marginTop: 10 }}>这个程度，也就是自利与自私之间的边界，会因事易时移而发生变化。吃饱这种自利行为，在资源匮乏的情况下就会成为自私；“杀人利己”这种自私行为，在战争年代，两军对垒时就没什么道德负累。常识道德乃是一种俗约，为了圈定“公认的边界”而存在。我们的道德直觉，通常映照着当前时代、环境、意识形态下的俗约。也正因此，曾经大行其道的很多俗约在今天看来都无法被多数人接受。当环境发生突变，已形成的道德直觉会受到冲击，许多文艺作品也是建立在这种冲突之上的。</p>
        </div>
        <div style={{ marginTop: 20, lineHeight: '28px', fontWeight: 'bold' }}>2.请根据以下材料，整理1-2页介绍公司情况的PPT（可对材料进行筛选，无需呈现全部内容）</div>
        <div style={{ lineHeight: '28px', paddingLeft: 20 }}>
          <p>- 公司主要为企业级客户提供智能运维全栈式解决方案。公司是国内首家专注布局于智能运维领域的供应商，目前客户群已经遍布银行、保险、证券、制造、能源及交通运输等各个行业。</p>
          <p>- 市场：</p>
          <div style={{ paddingLeft: 20 }}>
            <p>▶ 根据IDC预测，中国IT运维管理软件市场预计2020年会达到250亿元左右，从2016年起平均每年的增幅约为20%；</p>
            <p>▶ 企业数字化转型中面临IT系统规模持续扩大、系统架构复杂度提高、IT运维数据大量增加等情况，为企业带来运维挑战：</p>
            <div style={{ paddingLeft: 20 }}>
              <p>a) IT运维的复杂度大幅增加，云化、虚拟化、微服务带来成百上千倍增长的被管理对象；</p>
              <p>b) 数字化业务的客户体验要求极高，因此任何运维故障导致的客户流失都是巨大的风险；</p>
              <p>c) 传统运维严重依赖人的技能和经验，而优秀的运维人员成本还在不断上涨，供不应求。</p>
            </div>
            <p>▶ 随着企业数字化进程的加速，未来IT投入增大后运维复杂度的大幅度增长，以及运维整体费用占比的不断增加，传统的人力运维管理将逐渐被更高效的运维管理工具所替代。因此智能运维不仅仅可以作为传统运维软件的替代，更可以重构整个IT运维服务的交付模式，其最终的发展目标是颠覆并重构IT运维服务行业。</p>
            <p>▶ 2017年中国IT系统集成市场规模超过万亿元，这个市场将是智能运维的未来潜在渗透空间。根据Gartner预测，2017年智能运维在企业间的渗透率仅为5%，而到2020年，此数字将增至50%。</p>
          </div>
          <p>- 公司优势：</p>
          <div style={{ paddingLeft: 20 }}>▶ 现阶段对于智能运维需求最强烈的行业包括金融、保险、券商、运输等。这几类客户的共同特点为IT系统规模庞大复杂，运维数据量极大，而任何运维故障导致的失误对于客户的不利影响巨大。此类客户对于价格并不敏感，普遍具有客单价高、复购续约意愿强等特点。公司已在以上各个行业中积累了标杆客户和案例，为之后在同行业中的布局打下良好的基础。</div>
          <div style={{ paddingLeft: 20 }}>▶ 公司产品解决方案的先进性和成熟度、场景化覆盖的完善度、相关服务的全面性和专业度均处于市场领先地位。其他竞争者仍处于仅提供单一产品模块，甚至尚未产品化的阶段。</div>
          <p style={{ paddingLeft: 20 }}>▶ 公司核心管理及研发团队均具备十年以上IT运维领域相关经验积累，并和K大学智能运维实验室达成了产学研联动合作关系。公司拥有自主知识产权的智能运维算法模型近十个，是国内拥有开箱即用算法场景最多的智能运维企业。</p>
        </div>
        <div style={{ marginTop: 20, lineHeight: '28px' }}>
          <p style={{ fontWeight: 'bold' }}>3.“公司历史订单数据”tab中提供了公司在2019年的订单数据，包括：下单客户名称，下单金额，根据运输方式区分的两种承运类型（分为A、B类），下单时间。请根据以上数据计算分析如下指标：</p>
          <div style={{ paddingLeft: 20 }}>
            <p>- 2019年前十大客户及对应购买金额（模板在“运营指标分析”）</p>
            <p>- 每一类承运类型在每个月的下单金额、订单数量及每单平均金额（模板在“运营指标分析”）</p>
            <p>- 每月下单客户数量（模板在“运营指标分析”）</p>
            <p>- 已知：2020年1月，每类客户的每单平均金额相比2019年12月可能提升的情况有五种：20%，10%，0%，-10%，-20%。每类客户的订单数量相比2019年12月可能提升的情况有五种：15%，7%，0%，-7%，-15%。请通过模拟试算表，计算出在每种情况下，每类客户2020年1月的订单金额（模板在“运营指标分析”）</p>
            <p>- 请计算2019年客户留存数据（模板在“Cohort（客户留存）数据，可参考批注”）</p>
            <p style={{ paddingLeft: 20 }}>▶ 客户留存说明：请确认每个客户首次下单的月份，计算出每个月新增客户数量，以及这些新增客户在后续月份的数量留存变化</p>
          </div>
        </div>

        <div style={{ margin: '20px 0' }}>
          <a href={this.state.attachmentUrl} target="_blank">附件下载：公司订单数据（模版）.xlsx</a>
        </div>

        <div>
          <Upload
            action={`${baseUrl}/service/qiniubigupload?bucket=file`}
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
