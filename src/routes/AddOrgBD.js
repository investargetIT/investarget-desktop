import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { getCurrentUser, hasPerm, i18n, requestAllData } from '../utils/util'
import { Button, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { SelectTrader } from '../components/ExtraInput';

import SelectInvestorAndTrader from '../components/SelectInvestorAndTrader'


class AddOrgBD extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      projId: Number(this.props.location.query.projId),
      projTitle: '',
      data: null,
      visible: false, 
      manager: null, 
      ifContinue:false
    }

    this.selectedUsers = []; // 选中准备BD的投资人或机构
  }

  handleCreate = () => {
    Modal.confirm({
      title: i18n('timeline.message.confirm_create_title'),
      content: i18n('timeline.message.confirm_create_content'),
      onOk: this.createTimeline,
    })
  }

  createOrgBD = () => {
    this.setState({ visible: false });
    Promise.all(this.selectedUsers.map(m => {
      const body = {
        'bduser': m.investor,
        'manager': this.state.manager,
        'org': m.org,
        'proj': this.state.projId,
        'isimportant':m.isimportant,
        'bd_status': 1,
      };
      console.log(m.isimportant)
      console.log(body)
      return api.addOrgBD(body);
    }))
      .then(result => {
        Modal.confirm({
            title: i18n('timeline.message.create_success_title'),
            content: i18n('create_orgbd_success'),
            okText:"继续创建BD",
            cancelText:"返回BD列表",
            onOk: () => { this.setState({ifContinue:true}, () => this.setState({ ifContinue: false })) },
            onCancel: () => { 
              this.props.router.replace('/app/org/bd') 
              this.setState({ifContinue:false})
            }
            
          })
      })
      .catch(error => this.props.dispatch({
        type: 'app/findError',
        payload: error,
      }));
  }
 
  handleSelectUser = (selectedUsers) => {
    this.selectedUsers = selectedUsers;
    this.setState({ visible: true });

    // 交易师选项按照要求排序
    const listWithInvestor = selectedUsers.filter(f => f.investor !== null);
    const sortedRelation = [];
    listWithInvestor.forEach(item => {
      sortedRelation.push(this.props.sortedTrader.filter(f => f.investor === item.investor)[0]);
    })
    const sortedTrader = sortedRelation.map(m => m.trader).reduce((previous, current) => {
      current.forEach(item => {
        if (previous.map(m => m.value).indexOf(item.value) === -1) {
          previous.push(item);
        }
      });
      return previous;
    }, []);

    const sortedData = [...this.state.data];
    sortedTrader.reverse().forEach(item => {
      const index = sortedData.map(m => m.id).indexOf(item.value);
      if (index > -1) {
        const trader = sortedData[index];
        sortedData.splice(index, 1);
        sortedData.unshift(trader);
      }
    });

    this.setState({ data: sortedData });
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

  render() {
    const { location }  = this.props
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

          <SelectInvestorAndTrader onSelect={this.handleSelectUser} bd ifContinue={this.state.ifContinue}/>
        </div>

        <Modal
          title="请选择负责人"
          visible={this.state.visible}
          onOk={this.createOrgBD}
          footer={null}
          onCancel={() => this.setState({ visible: false })}
          closable={false}
        >

         <SelectTrader
            style={{ width: 300 }}
            mode="single"
            data={this.state.data}
            value={this.state.manager}
            onChange={manager => this.setState({ manager })} />

          <Button style={{ marginLeft: 10 }} disabled={this.state.manager === null} type="primary" onClick={this.createOrgBD}>{i18n('common.confirm')}</Button>

        </Modal>

      </LeftRightLayout>
    )
  }
}

function mapStateToProps(state) {
  const { sortedTrader } = state.app;
  return { sortedTrader };
}
export default connect(mapStateToProps)(withRouter(AddOrgBD));
