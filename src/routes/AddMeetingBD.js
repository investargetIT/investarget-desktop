import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { getCurrentUser, hasPerm, i18n } from '../utils/util'
import { Button, Modal, DatePicker, Input, Row, Col, upload, Icon, Upload, message } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { SelectTrader } from '../components/ExtraInput';
import SelectInvestorAndTrader from '../components/SelectInvestorAndTrader'
import { baseUrl } from '../utils/request';

const { TextArea } = Input;
const officeFileTypes = [
  'application/msword',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
];
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
      ifContinue:false,
      notes:null,
      file:null
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
        'meet_date': this.state.date,
        'comments':this.state.notes || null,
        'attachment': this.state.file ? this.state.file.response.result.realfilekey :null,
        'attachmentbucket':'file'      
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

  setFile = file=>{
    this.setState({file})
  }

	changeDate = (date,datestring) =>{
    
		this.setState({date:date.format('YYYY-MM-DDTHH:mm:ss')})
	}

  changeText = e =>{
    this.setState({notes:e.target.value})
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
      <Row gutter={24} style={{marginBottom:20}}>
      <Col span={6}>{i18n('project.select_meeting_date')}:</Col>
      <Col span={18}>
        <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" style={{float:'left'}}  onChange={this.changeDate}/>
      </Col>
      </Row>
      <Row gutter={24} style={{marginBottom:20}}>
      <Col span={6}>{i18n('project.manager')}:</Col>
      <Col span={18} ><SelectTrader
          style={{ width: 200 }}
          mode="single"
          data={this.state.data}
          value={this.state.manager}
          onChange={manager => this.setState({ manager })} />
      </Col>
      </Row>
      <Row gutter={24} style={{marginBottom:20}}>
      <Col span={6}>{i18n('meeting_bd.meeting_notes')}:</Col>
      <Col span={18}><TextArea  rows={4} onChange={this.changeText} /></Col>
      </Row>
      <Row gutter={24} style={{marginBottom:20}}>
      <Col span={6}>{i18n('project.attachments')}:</Col>
      <Col span={18}>
        <UploadFile setFile={this.setFile.bind(this)}/>
      </Col>
      </Row>

      <Button style={{ marginLeft: 10 }} disabled={manager === null||date == ''} type="primary" onClick={this.createMeetingBD}>{i18n('common.confirm')}</Button>

      </Modal>

	
    	</LeftRightLayout>
		)
  	}
}

function UploadFile(props){
  const uploadProps = {
      name: 'file',
      action: baseUrl + '/service/qiniubigupload?bucket=file&topdf=false',
      beforeUpload: (file, fileList) => {
        const fileType = file.type
        if (!officeFileTypes.includes(fileType)) {
          Modal.error({
            title: '不支持的文件类型',
            content: '请上传 office 或 pdf 文档',
          })
          return false
        }
        return true
      },
      onChange:(info)=>{
      if (info.file.status === 'done') {
        if(info.fileList.length>1){
          info.fileList.splice(0,1)
        } 
        info.fileList[0].url=info.fileList[0].response.result.url
        props.setFile(info.file)
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      },
      onRemove:(file)=>{
        props.setFile(null)
      }
  }
  return(
    <Upload {...uploadProps}  >
        <Button>
          <Icon type="upload" />Upload
        </Button>
    </Upload>
  )
}

export default connect()(withRouter(AddMeetingBD))