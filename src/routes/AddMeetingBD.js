import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { getCurrentUser, hasPerm, i18n } from '../utils/util'
import { Button, Modal, DatePicker } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { SelectUser } from '../components/ExtraInput';
import SelectInvestorAndTrader from '../components/SelectInvestorAndTrader'
 
class AddMeetingBD extends React.Component{
	constructor(props) {
    super(props)

    this.state = {
      projId: Number(this.props.location.query.projId),
      projTitle: '',
      data: null,
      visible: false, 
      manager: null,
      date:'',
      ifContinue:false
    }
    this.selectedUsers = []; // 选中准备BD的投资人或机构
  	}

  	handleSelectUser = (selectedUsers) => {
	  this.selectedUsers = selectedUsers;
	  this.setState({ visible: true });
	}

	createMeetingBD = () =>{		
	this.setState({ visible: false });
    Promise.all(this.selectedUsers.map(m => {
      const body = {
        'bduser': m.investor,
        'manager': this.state.manager,
        'org': m.org,
        'proj': this.state.projId,
        'meet_date': this.state.date
      };
      return api.addMeetingBD(body);
    }))
    .then(result => {
        Modal.confirm({
            title: i18n('timeline.message.create_success_title'),
            content: i18n('create_orgbd_success'),
            okText:"继续创建BD",
            cancelText:"返回BD列表",
            onOk: () => { this.setState({ifContinue:true}) },
            onCancel: () => { 
              this.props.router.replace('/app/meeting/bd') 
              this.setState({ifContinue:false})
            }
            
          })
    })
    .catch(error => this.props.dispatch({
      type: 'app/findError',
      payload: error,
    }));
	}

	changeDate = (date,datestring) =>{
    
		this.setState({date:date.format('YYYY-MM-DDTHH:mm:ss')})
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
 
  	render(){
  		const { location }  = this.props
  		const {manager, date} = this.state
  		return(
  		<LeftRightLayout
        location={location}
        title={i18n('menu.bd_management')}
        breadcrumb={' > ' + i18n('menu.meeting_bd') + ' > ' + i18n('project.create_meeting_bd')}
      	>
      	<div>
          {this.state.projTitle ?
            <h3 style={{lineHeight: 2}}>{i18n('timeline.project_name')} : {this.state.projTitle}</h3>
            : null}

          { this.state.data ? <SelectInvestorAndTrader onSelect={this.handleSelectUser} options={this.state.data} source="meetingbd" ifContinue={this.state.ifContinue}/> : null }
        </div>

        <Modal
          title="请选择负责人"
          visible={this.state.visible}
          onOk={this.createMeetingBD}
          footer={null}
          onCancel={() => this.setState({ visible: false })}
          closable={false}
        >
        <div style={{width:300,marginBottom:20}}>
        {i18n('project.select_meeting_date')}:
        <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" style={{float:'right'}}  onChange={this.changeDate}/>
        </div>

         <SelectUser
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            style={{ width: 300 }}
            mode="single"
            data={this.state.data}
            value={this.state.manager}
            onChange={manager => this.setState({ manager })} />


          <Button style={{ marginLeft: 10 }} disabled={manager === null||date == ''} type="primary" onClick={this.createMeetingBD}>{i18n('common.confirm')}</Button>

        </Modal>

		
      	</LeftRightLayout>
  		)
  	}
}

export default connect()(withRouter(AddMeetingBD))