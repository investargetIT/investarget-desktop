import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import { 
  i18n, 
  timeWithoutHour, 
  time, 
  handleError, 
  hasPerm, 
  getUserInfo, 
} from '../utils/util';
import * as api from '../api';
import { 
  Table, 
  Button, 
  Popconfirm, 
  Pagination, 
  Modal, 
  Input, 
  Switch,
  Row,
  Col,
  Form,
  Upload,
  Icon,
  message,
  DatePicker
} from 'antd';
import moment from 'moment'
import { Link } from 'dva/router';
import { MeetBDFilter } from '../components/Filter';
import { Search } from '../components/Search';
import { getUser } from '../api';
import { isLogin } from '../utils/util'
import {BasicFormItem} from '../components/Form'
import { baseUrl } from '../utils/request';
import { PAGE_SIZE_OPTIONS } from '../constants';
import QRCode from 'qrcode.react';
import { mobileUploadUrl } from '../utils/request';

const urlPrefix = `${mobileUploadUrl}/share/meeting?key=`;
const { TextArea } = Input;
const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}
const bdTitleStyle = {
  float: 'right',
  fontSize: '12px',
  fontWeight: 'normal',
  marginLeft: 8,
}
const officeFileTypes = [
  'application/msword',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
];

class EditForm extends React.Component{	
  constructor(props){
    super(props)
  }
  onChange = info=>{
    if (info.file.status === 'done') {
        if(info.fileList.length>1){
          info.fileList.splice(0,1)
          this.props.removeFileAPI().then(data=>{
            this.props.onUploadFile(info.file)
          })
        }else{        
          this.props.onUploadFile(info.file)
        }
        info.fileList[0].url=info.fileList[0].response.result.url
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
  }
	
  render(){
  let uploadProps = {
      name: 'file',
      action: baseUrl + '/service/qiniubigupload?bucket=file&topdf=false',
      defaultFileList:this.props.file?[this.props.file]:[],
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
      onChange:this.onChange
    }
	return(
		<Form>
      <BasicFormItem name="meet_date" label={i18n('meeting_bd.meet_date')} valueType="object">
        <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" />
      </BasicFormItem>
		<BasicFormItem name="comments" label={i18n('meeting_bd.meeting_notes')}>
			<TextArea  rows={4}/>
		</BasicFormItem>
		<FormItem {...formItemLayout} label={i18n('project.attachments')}>
		  <Upload {...uploadProps} onRemove={this.props.onRemove} >
		    <Button>
		      <Icon type="upload" />Upload
		    </Button>
		  </Upload>
		
		  <div></div>
		</FormItem>

      <BasicFormItem label="是否对投资人展示" name="isShow" valueType="boolean" valuePropName="checked">
        <Switch />
      </BasicFormItem>
		</Form>
	)
}
}
function mapPropsToFields(props){
	return {
		comments:{value:props.data.comments},
    meet_date:{value:moment(props.data.meet_date)},
    isShow:{value:props.data.isShow},
	}
} 
const EditMeetingForm = Form.create({mapPropsToFields})(EditForm)
class MeetingBDList extends React.Component{
	constructor(props){
		super(props)
		this.state={
			filters: MeetBDFilter.defaultValue,
			search: null,
      page: 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      sort: undefined,
      desc: undefined,
      loading: false,
      visible: false,
      needRefresh: false,
      viewModalVisible: false,
      currentBD: null,
      currentFile:null,
      selectedIds: [],
      show: false,
      QRCodeKey: null,
		}
	}

	componentDidMount(){
		this.getMeetingBDList()
	}
	
	handleFilt = (filters) =>{
		this.setState({ filters, page: 1 }, this.getMeetingBDList)
	}

	handleReset = (filters) => {
    this.setState({ filters, page: 1, search: null }, this.getMeetingBDList);
  }

	getMeetingBDList = (values) =>{
		this.setState({ loading: true });
		const { page, pageSize, search, sort,filters,desc } = this.state;
	    const params = {
	        page_index: page,
	        page_size: pageSize,
	        ...filters,
	        search,	
	        sort,
	        desc  	        
	    }
		api.getMeetingBdList(params)
		.then(result=>{
			this.setState({
        list:result.data.data, 
        total:result.data.count,
        loading: false,
        currentBD:values?{...this.state.currentBD,...values}:this.state.currentBD
		  })
	  })
  }


	handleDelete = (id) =>{
		api.deleteMeetingBD(id)
		.then(result=>{
			this.getMeetingBDList()
		})
		.catch(error=>handleError(error))
	}

	handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getMeetingBDList
    );
  	}

	showEditModal = () =>{
		this.setState({visible:true, viewModalVisible:false})
	}

  showViewModal = (record) =>{
    let file=null
    if(record.attachment){
      file={
        uid:-1,
        name:record.attachment,
        status:'done',
        url:record.attachmenturl
      }
    }
    this.setState({viewModalVisible:true,currentBD:record, currentFile:file})
  }

  hideViewModal =()=>{
    this.setState({viewModalVisible:false, currentFile:null})
  }

	hideEditModal = () =>{
		this.setState({visible:false, currentFile:null})
	}

	handleEdit = () =>{
	const {currentBD} =this. state
	let id=currentBD.id
	this.form.validateFields((err, values) => {
    	if (!err) {
        let param = this.formatData(values)
     		api.modifyMeetingBD(id,param)
     		.then(result=>{
     			this.hideEditModal()
     			this.getMeetingBDList()
     		})
     		.catch(error=> handleError(error))
  	}
  	})
	}

  formatData = values =>{
    var data = {...values}
    data['meet_date'] = data['meet_date'].format('YYYY-MM-DDTHH:mm:ss')
    return data
  }

  handleRef = (inst) => {
  if (inst) {
    this.form = inst.props.form
  }
  }

	onUploadFile = (file) =>{   
    let params = this.getCurrentParam()
		let id = this.state.currentBD.id
		let body={
      attachment: file.response.result.realfilekey,
			attachmentbucket:'file'
		}
		api.modifyMeetingBD(id,body)
		.then(result=>{
		this.getMeetingBDList(params)
		})
		.catch(error=>handleError(error))
	}

  removeFileAPI = ()=>{
    return api.deleteMeetingBDFile(this.state.currentBD.id)
  }

  getCurrentParam = () =>{
    return{
      comments:this.form.getFieldValue('comments'),
      meet_date:this.form.getFieldValue('meet_date')
    }
  }  

	removeFile = ()=>{
    let params = this.getCurrentParam()
		api.deleteMeetingBDFile(this.state.currentBD.id)
		.then(result=>{
			this.getMeetingBDList(params)
		})
		.catch(error=>handleError(error))
	}

  viewModalTitle = currentBD => (
    <div style={{ marginRight: 32 }}>
      {i18n('common.view')}
      {hasPerm('BD.manageMeetBD') || (currentBD && getUserInfo().id === currentBD.manager.id) ?
        <a href="javascript:void(0)" style={bdTitleStyle} onClick={this.showEditModal}>{i18n('common.edit')}</a>
        : null}
    </div>
  );

  handleRowSelectionChange = selectedIds => {
    this.setState({ selectedIds })
  }

  handleShareBtnClicked = () => {
    this.setState({ show: true });
    api.shareMeetingBD({ meetings: this.state.selectedIds })
      .then(result => this.setState({ QRCodeKey: result.data }))
      .catch(handleError);
  }

  cancel () {
    this.setState({ QRCodeKey: null, show: false });
  }

	render(){
		const {page, pageSize, total, list, loading, search, filters, visible, currentBD, viewModalVisible} = this.state
		const imgStyle={width:'15px',height:'20px'}
		const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
		const columns=[{title: i18n('meeting_bd.contact'), dataIndex: 'username', key:'username',sorter:true},
		{title: i18n('meeting_bd.meet_date'), key:'meet_date',sorter:true,render:(text,record)=>record.meet_date&&timeWithoutHour(record.meet_date + record.timezone)},
		{title: i18n('meeting_bd.manager'), dataIndex: 'manager.username', key:'manager', sorter:true},
		{title: i18n('meeting_bd.org'), render: (text, record) => record.org ? record.org.orgname : null, key:'org', sorter:true},
        {title: i18n('meeting_bd.project'), dataIndex: 'proj.projtitle', key:'proj', sorter:true, render: text => text || '暂无'},
        {title: i18n('schedule.address'), dataIndex: 'address', key:'address', sorter:true},
        {title: i18n('meeting_bd.operation'), render: (text, record) =>{
		return <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
		<button style={buttonStyle} onClick={this.showViewModal.bind(this,record)}>{i18n('common.view')}</button>
		{hasPerm('BD.manageMeetBD')?
		<Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.handleDelete.bind(this, record.id)}>
        	<a type="danger"><img style={imgStyle} src="/images/delete.png" /></a>
       	</Popconfirm>:null}
       	</div>
        }}
		]

		return(
		<LeftRightLayout 
        location={this.props.location} 
        title={i18n('menu.meeting_bd')}
        action={hasPerm('BD.manageMeetBD')||hasPerm('BD.user_addMeetBD') ? {name:i18n('add_meetbd'),link:'app/meetingbd/add'} : undefined}
        >
        <Modal
         width={600}
         title={i18n('common.edit')}
         visible={visible}
         onOk={this.handleEdit}
         onCancel={()=>this.hideEditModal()}
        >
        {currentBD?
			<EditMeetingForm wrappedComponentRef={this.handleRef} key={currentBD.id} data={currentBD} onUploadFile={this.onUploadFile} onRemove={this.removeFile} removeFileAPI={this.removeFileAPI} file={this.state.currentFile}/>
			:null
        }
        </Modal>

        <Modal
         title={this.viewModalTitle(currentBD)}
         visible={viewModalVisible}
         onCancel={()=>this.hideViewModal()}
         footer={null}
        >
        {currentBD ? <Event {...currentBD}/>:null}
        </Modal>

 
        <MeetBDFilter
          defaultValue={filters}
          onSearch={this.handleFilt}
          onReset={this.handleReset}
          onChange={this.handleFilt}
        />

        {/* <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }} className="clearfix">
          <Search2
            defaultValue={search}
            placeholder={i18n('project_bd.project_name')}
            style={{ width: 200, float: 'right' }}
            onSearch={search => this.setState({ search, page: 1 }, this.getMeetingBDList)} 
          />
        </div> */}

        <div style={{ marginBottom: 16, textAlign: 'right' }} className="clearfix">
          <Search
            style={{ width: 200 }}
            placeholder={i18n('project_bd.project_name')}
            onSearch={search => this.setState({ search, page: 1 }, this.getMeetingBDList)}
            onChange={search => this.setState({ search })}
            value={search}
          />
        </div>

        <Table
          onChange={this.handleTableChange}
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
          rowSelection={{ onChange: this.handleRowSelectionChange, selectedRowKeys: this.state.selectedIds }}
        />
                
        <div style={{ margin: '16px 0' }} className="clearfix">

          <Button
            disabled={this.state.selectedIds.length == 0}
            type="primary"
            size="large"
            onClick={this.handleShareBtnClicked}>
            分享
          </Button>

          <Pagination
            style={{ float: 'right' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={page => this.setState({ page }, this.getMeetingBDList)}
            showSizeChanger
            onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getMeetingBDList)}
            showQuickJumper
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>

        <Modal
          width={230}
          visible={this.state.show}
          footer={null}
          onCancel={this.cancel.bind(this, null)}
        >
            <div style={{ width: 128, margin: '20px auto', marginBottom: 10 }}>
                {this.state.QRCodeKey === null
                    ? <Icon type="loading" />
                    : <QRCode value={urlPrefix + this.state.QRCodeKey} />}
            </div>
            <p style={{ marginBottom: 10 }}>请使用手机微信扫描二维码分享会议BD</p>
        </Modal>

        </LeftRightLayout>
		)
	}
}

function Event(props) {
  return (
    <div>
      <Field title={i18n('meeting_bd.meet_date')} content={props.meet_date? time(props.meet_date + props.timezone):i18n('common.none')} />
      <Field title={i18n('meeting_bd.meeting_notes')} content={props.comments||i18n('common.none')} />
      <Row  gutter={24}>
      <Col span={6} >
        <div style={{textAlign: 'right'}}>{i18n('meeting_bd.attachments')}</div>
      </Col>
      <Col span={18} >
        <div>{props.attachment? <a href={props.attachmenturl}>{props.attachment}</a>:i18n('common.none')}
        </div>
      </Col>
      </Row>
    </div>
  )
}


const Field = (props) => {
  return (
    <Row  gutter={24}>
      <Col span={6} >
        <div style={{textAlign: 'right'}}>{props.title}</div>
      </Col>
      <Col span={18} >
        <pre style={{background:'white',wordBreak:'break-all',maxWidth:'300px',border:'none',whiteSpace:'pre-wrap'}}>
        {props.content}
        </pre>
      </Col>
    </Row>
  )
}



export default MeetingBDList