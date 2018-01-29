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
  Popover,
  Row,
  Col,
  Form,
  Upload,
  Icon,
  message
} from 'antd';
import { Link } from 'dva/router';
import { MeetBDFilter } from '../components/Filter';
import { Search2 } from '../components/Search';
import { getUser } from '../api';
import { isLogin } from '../utils/util'
import {BasicFormItem} from '../components/Form'
import { baseUrl } from '../utils/request';
 
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

function EditForm (props){	
	let uploadProps = {
      name: 'file',
      action: baseUrl + '/service/qiniubigupload?bucket=file&topdf=false',
      defaultFileList:props.file?[props.file]:[],
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
      onChange(info) { 
   		
	    if (info.file.status === 'done') {
	      if(info.fileList.length>1){
	      	info.fileList.shift()
	      	props.removeFileAPI().then(data=>{
            props.onUploadFile(info.file)
          })
	      }else{	      
  	      props.onUploadFile(info.file)
        }
        info.fileList[0].url=info.fileList[0].response.result.url
	      message.success(`${info.file.name} file uploaded successfully`);
	    } else if (info.file.status === 'error') {
	      message.error(`${info.file.name} file upload failed.`);
	    }
      },
    }
	return(
		<Form >
		<BasicFormItem name="comments" label={i18n('meeting_bd.meeting_notes')}>
			<TextArea rows={4}/>
		</BasicFormItem>
		<FormItem {...formItemLayout} label={i18n('project.attachments')}>
		  <Upload {...uploadProps} onRemove={props.onRemove} >
		    <Button>
		      <Icon type="upload" />Upload
		    </Button>
		  </Upload>
		
		  <div></div>
		</FormItem>
		</Form>
	)
}
function mapPropsToFields(props){
	return {
		comments:{value:props.data.comments}
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
	        pageSize: 10,
	        total: 0,
	        list: [],
	        sort:undefined,
	        desc:undefined,
	        loading: false,
	        visible: false,
          viewModalVisible: false,
	        currentBD:null,
	        currentFile:null
		}
	}

	componentDidMount(){
		this.getMeetingBDList()
	}
	
	handleFilt = (filters) =>{
		this.setState({ filters, page: 1 }, this.getMeetingBDList)
	}

	handleReset = (filters) => {
    	this.setState({ filters, page: 1 }, this.getMeetingBDList)
  	}

	getMeetingBDList = () =>{
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
			this.setState({list:result.data.data, total:result.data.count,loading: false})
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
		let form=this.refs.editForm
		const {currentBD} =this. state
		let id=currentBD.id
		form.validateFields((err, values) => {
      	if (!err) {
       		api.modifyMeetingBD(id,values)
       		.then(result=>{
       			this.hideEditModal()
       			this.getMeetingBDList()
       		})
       		.catch(error=> handleError(error))
    	}
    	})
  	}

  	onUploadFile = (file) =>{
  		let id = this.state.currentBD.id
  		let body={
        attachment: file.response.result.realfilekey,
  			attachmentbucket:'file'
  		}
      console.log(body)
  		api.modifyMeetingBD(id,body)
  		.then(result=>{
        console.log(result)
			this.getMeetingBDList()
  		})
  		.catch(error=>handleError(error))
  	}

    removeFileAPI = ()=>{
      return api.deleteMeetingBDFile(this.state.currentBD.id)
    }  

  	removeFile = ()=>{
  		api.deleteMeetingBDFile(this.state.currentBD.id)
  		.then(result=>{
  			this.getMeetingBDList()
  		})
  		.catch(error=>handleError(error))
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

    const viewModalTitle=(
      <div style={{marginRight:32}}>
        {i18n('common.view')}        
        <a href="javascript:void(0)" style={bdTitleStyle} onClick={this.showEditModal}>{i18n('common.edit')}</a>
      </div>
      )
 
		return(
		<LeftRightLayout 
        location={this.props.location} 
        title={i18n('menu.meeting_bd')}
        action={hasPerm('BD.manageMeetBD')||hasPerm('BD.user_addMeetBD') ? {name:i18n('add_meetbd'),link:'app/meetingbd/add'} : undefined}
        >
        <Modal
         title={i18n('common.edit')}
         visible={visible}
         onOk={this.handleEdit}
         onCancel={()=>this.hideEditModal()}
        >
        {currentBD?
			<EditMeetingForm ref="editForm" key={currentBD.id} data={currentBD} onUploadFile={this.onUploadFile} onRemove={this.removeFile} removeFileAPI={this.removeFileAPI} file={this.state.currentFile}/>
			:null
        }
        </Modal>

        <Modal
         title={viewModalTitle}
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

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }} className="clearfix">
          <Search2
            defaultValue={search}
            placeholder={i18n('project_bd.project_name')}
            style={{ width: 200, float: 'right' }}
            onSearch={search => this.setState({ search, page: 1 }, this.getMeetingBDList)} 
          />
        </div>
        <Table
          onChange={this.handleTableChange}
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
        />
                
        <div style={{ margin: '16px 0' }} className="clearfix">
          <Pagination
            style={{ float: 'right' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={page => this.setState({ page }, this.getMeetingBDList)}
            showSizeChanger
            onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getMeetingBDList)}
            showQuickJumper
          />
        </div>
        </LeftRightLayout>
		)
	}
}

function Event(props) {
  console.log(props)
  return (
    <div>
      <Field title={i18n('meeting_bd.meeting_notes')} content={props.comments||i18n('common.none')} />
      <Field title={i18n('meeting_bd.meet_date')} content={props.meet_date? time(props.meet_date + props.timezone):i18n('common.none')} />
      <Row  gutter={24}>
      <Col span={6} >
        <div style={{textAlign: 'right'}}>{i18n('meeting_bd.attachments')}</div>
      </Col>
      <Col span={18} >
        <div><a href={props.attachmenturl}>{props.attachment}</a></div>
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