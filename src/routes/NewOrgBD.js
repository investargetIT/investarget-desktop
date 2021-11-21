import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { browserHistory, withRouter } from 'dva/router'
import { getCurrentUser, hasPerm, i18n, requestAllData, getURLParamValue } from '../utils/util'
import { Button, Modal, Checkbox, Steps, Radio, Tag, Popover } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { SelectTrader, SelectOrgLevel } from '../components/ExtraInput';
import { OrgLevelFilter } from '../components/Filter';
import SelectOrganizationForOrgBd from '../components/SelectOrganizationForOrgBd'
import { Search } from '../components/Search';

const Step = Steps.Step;
const RadioGroup = Radio.Group;

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
      projId: Number(getURLParamValue(props, 'projId')),
      projTitle: '',
      selectedOrgs: [],
      selectedOrgDetails: [],
      showFilterOptionModal: false,
      removeInvestorWithoutRelatedTags: false,
      removeOrgWithNoInvestor: false,
      removeInvestorWithNoTrader: false,
      current: 0,
      lv: null,
      search: '',
    }
  }

  componentDidMount() {
    api.queryUserGroup({ type: this.props.type || 'trader' })
    .then(data => requestAllData(api.getUser, { groups: data.data.data.map(m => m.id), userstatus: 2 }, 100))
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
    const projId = getURLParamValue(this.props, 'projId') || null;
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

  handleDeleteOrgTag(tag, e) {
    const newOrg = this.state.selectedOrgs.filter(f => f !== tag.id);
    const newOrgDetails = this.state.selectedOrgDetails.filter(f => f.id !== tag.id);
    // this.props.onChange(newOrg, newOrgDetails);
    this.handleSelectOrg(newOrg, newOrgDetails);
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

          <div style={{ marginBottom: 10 }}>
            {selectedOrgDetails.length > 1 && <Button style={{ marginRight: 10 }} type="danger" onClick={() => this.setState({ selectedOrgs: [], selectedOrgDetails: [] })}>清空</Button>}
            {selectedOrgDetails.map(m =>
              <Tag
                key={m.id}
                closable
                style={{ marginBottom: 8 }}
                onClose={this.handleDeleteOrgTag.bind(this, m)}
              >
                {m.orgfullname}
              </Tag>
            )}
          </div>

          <div>
            <Steps style={{ margin: '20px 0' }} current={this.state.current}>
              {steps.map(item => <Step key={item.title} title={item.title} />)}
            </Steps>
            {this.state.current === 0 &&
              <div className="steps-content">

                <div style={{ marginBottom: 16, display: 'flex' }}>
                  <div>
                    <Popover content="支持多机构名搜索，机构之间用逗号或空格隔开">
                      <Search
                        style={{ width: 250 }}
                        placeholder={[i18n('organization.orgname'), i18n('organization.stock_code')].join(' / ')}
                        // onSearch={this.handleSearch}
                        onChange={search => this.setState({ searchOrgName: search })}
                        value={this.state.searchOrgName}
                      />
                    </Popover>
                  </div>
                  <div style={{ marginLeft: 20 }}>机构状态：</div>
                  <div style={{ flex: 1 }}>
                    {/* <OrgLevelFilter value={this.state.lv} onChange={value => this.setState({ lv: value })} /> */}
                    <SelectOrgLevel value={this.state.lv} onChange={value => this.setState({ lv: value })} />
                  </div>
                </div>

                <div>
                  <Search
                    style={{ width: 250 }}
                    placeholder="备注以及附件内文字"
                    onChange={search => this.setState({ search })}
                    value={this.state.search}
                  />
                </div>
              </div>
            }
            {this.state.current === 1 &&
              <div style={{ padding: '16px' }}>
                <SelectOrganizationForOrgBd
                  query={{ lv: this.state.lv, search: this.state.search, searchOrgName: this.state.searchOrgName }}
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
