import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { browserHistory, withRouter } from 'dva/router'
import { getCurrentUser, hasPerm, i18n } from '../utils/util'
import { Button, Modal, Checkbox, Steps } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { SelectTrader } from '../components/ExtraInput';
import { OrgLevelFilter } from '../components/Filter';
import SelectOrganizationForOrgBd from '../components/SelectOrganizationForOrgBd'

const Step = Steps.Step;

const steps = [{
  title: '机构筛选',
}, {
  title: '机构列表',
}];

class NewOrgBD extends React.Component {

  constructor(props) {
    super(props)

    const userId = getCurrentUser()
    const traderId = (!hasPerm('usersys.as_admin') && hasPerm('usersys.as_trader')) ? userId : null

    this.tags = [];

    this.state = {
      traderId,
      projId: Number(this.props.location.query.projId),
      projTitle: '',
      selectedOrgs: [],
      selectedOrgDetails: [],
      showFilterOptionModal: false,
      removeInvestorWithoutRelatedTags: false,
      removeOrgWithNoInvestor: false,
      removeInvestorWithNoTrader: false,
      current: 0,
      lv: null,
    }
  }

  componentDidMount() {
    api.queryUserGroup({ type: this.props.type || 'trader' })
    .then(data => api.getUser({ groups: data.data.data.map(m => m.id), userstatus: 2, page_size: 1000 }))
    .then(data => this.setState({ data: data.data.data }))
    .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }));

    if (isNaN(this.state.projId)) return;

    api.getProjLangDetail(this.state.projId).then(result => {
      const projTitle = result.data.projtitle
      this.setState({ projTitle })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      })
    })
  }

  handleSelectOrg = (selectedOrgs, selectedOrgDetails) => {

    if (selectedOrgs.length > 100) {
      Modal.error({
        title: '无效操作',
        content: '最多选择100家机构',
      })
      return;
    }


    let newOrgDetails = selectedOrgDetails.filter(item => 
      !this.state.selectedOrgs.includes(item.id)
    );

    newOrgDetails = this.state.selectedOrgDetails.concat(newOrgDetails).filter(item => 
      selectedOrgs.includes(item.id)
    );

    this.setState({ selectedOrgs, selectedOrgDetails: newOrgDetails});
  }

  handleNext = () => {
    this.setState({ showFilterOptionModal: true });
  }

  confirmFilterOption = () => {
    const ids = this.state.selectedOrgs.join(',');
    const projId = this.props.location.query.projId || null;
    const { removeInvestorWithNoTrader, removeInvestorWithoutRelatedTags, removeOrgWithNoInvestor } = this.state;
    window.open(`/app/org/newbd?ids=${encodeURIComponent(ids)}&projId=${projId}&trader=${removeInvestorWithNoTrader}&tag=${removeInvestorWithoutRelatedTags}&investor=${removeOrgWithNoInvestor}&tags=${encodeURIComponent(this.tags.join(','))}`);
  }

  handleFilterChange = filters => {
    this.tags = filters.tags;
  }

  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }
  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  render() {

    const { location }  = this.props
    const { traderId, selectedOrgs, selectedOrgDetails } = this.state

    return (
      <LeftRightLayout
        location={location}
        title={i18n('menu.bd_management')}
        breadcrumb={' > ' + i18n('menu.organization_bd') + ' > ' + i18n('project.create_org_bd')}
      >
        <div>
          {this.state.projTitle ?
            <h3 style={{lineHeight: 2}}>{i18n('timeline.project_name')} : {this.state.projTitle}</h3>
            : null}

          {/* <div style={{padding: '8px 0'}}>
            <p style={{fontSize: '13px'}}>
              <span style={{fontWeight: 'bold', color: 'black'}}>1. {i18n('timeline.select_institution')}</span>
            </p>
          </div> */}

          <div>
            <Steps style={{ margin: '20px 0' }} current={this.state.current}>
              {steps.map(item => <Step key={item.title} title={item.title} />)}
            </Steps>
            {this.state.current === 0 &&
              <div className="steps-content">
                <OrgLevelFilter value={this.state.lv} onChange={value => this.setState({ lv: value })} />
              </div>
            }
            {this.state.current === 1 &&
              <div style={{ padding: '16px' }}>
                <SelectOrganizationForOrgBd
                  traderId={this.props.bd ? undefined : traderId}
                  value={selectedOrgs}
                  details={selectedOrgDetails}
                  onChange={this.handleSelectOrg}
                  onFilterChange={this.handleFilterChange}
                  onReset={() => this.setState({ selectedOrgs: [], selectedOrgDetails: [] })}
                />
              </div>
            }
            <div className="steps-action" style={{ textAlign: 'right' }}>
              {this.state.current > 0 && <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>上一步</Button>}
              {this.state.current < steps.length - 1 && <Button type="primary" onClick={() => this.next()}>下一步</Button>}
              {this.state.current === steps.length - 1 && <Button style={{ marginLeft: 10 }} type="primary" disabled={selectedOrgs.length === 0} onClick={this.handleNext}>完成</Button>}
            </div>
          </div>

          {/* <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
            <Button disabled={selectedOrgs.length == 0} type="primary" onClick={this.handleNext}>{i18n('common.next')}</Button>
          </div> */}
        </div>

        <Modal
          title="结果筛选"
          visible={this.state.showFilterOptionModal}
          onOk={this.confirmFilterOption}
          onCancel={() => this.setState({ showFilterOptionModal: false })}
        >
          <div><Checkbox
            checked={this.state.removeInvestorWithoutRelatedTags}
            onChange={e => this.setState({ removeInvestorWithoutRelatedTags: e.target.checked })}
          >
            投资人是否匹配标签
          </Checkbox></div>
          <div><Checkbox
            checked={this.state.removeOrgWithNoInvestor}
            onChange={e => this.setState({ removeOrgWithNoInvestor: e.target.checked })}
          >
            去除暂无投资人数据
          </Checkbox></div>
          <div><Checkbox
            checked={this.state.removeInvestorWithNoTrader}
            onChange={e => this.setState({ removeInvestorWithNoTrader: e.target.checked })}
          >
            去除暂无交易师数据
          </Checkbox></div>
        </Modal>
          
      </LeftRightLayout>
    )
  }
}

function mapStateToProps(state) {
  const { sortedTrader } = state.app;
  return { sortedTrader };
}
export default connect(mapStateToProps)(withRouter(NewOrgBD));
