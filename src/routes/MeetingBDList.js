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
  Form
} from 'antd';
import { Link } from 'dva/router';
import { MeetBDFilter } from '../components/Filter';
import { Search2 } from '../components/Search';
import { getUser } from '../api';
import { isLogin } from '../utils/util'
import {BasicFormItem} from '../components/Form'
const { TextArea } = Input;
function EditForm (props){
	return(
		<Form >
		<BasicFormItem name="comments" label={i18n('meeting_bd.meeting_notes')}>
			<TextArea rows={4}/>
		</BasicFormItem>
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
	        currentBD:null
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

  	showEditModal = (record) =>{
  		this.setState({visible:true, currentBD:record})
  	}

  	handleEdit = () =>{
		let form=this.refs.editForm
		const {currentBD} =this. state
		let id=currentBD.id
		form.validateFields((err, values) => {
      	if (!err) {
       		api.modifyMeetingBD(id,values)
       		.then(result=>{
       			this.setState({visible:false})
       			this.getMeetingBDList()
       		})
       		.catch(error=> handleError(error))
    	}
    	})
  	}
 
	render(){
		const {page, pageSize, total, list, loading, search, filters, visible, currentBD} = this.state
		const imgStyle={width:'15px',height:'20px'}
		const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
		const columns=[{title: i18n('meeting_bd.contact'), dataIndex: 'username', key:'username',sorter:true},
		{title: i18n('meeting_bd.meet_date'), key:'meet_date',sorter:true,render:(text,record)=>record.meet_date&&timeWithoutHour(record.meet_date + record.timezone)},
		{title: i18n('meeting_bd.manager'), dataIndex: 'manager.username', key:'manager', sorter:true},
		{title: i18n('meeting_bd.org'), render: (text, record) => record.org ? record.org.orgname : null, key:'org', sorter:true},
        {title: i18n('meeting_bd.project'), dataIndex: 'proj.projtitle', key:'proj', sorter:true, render: text => text || '暂无'},
        {title: i18n('meeting_bd.operation'), render: (text, record) =>{
		return <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
		<button style={buttonStyle} onClick={this.showEditModal.bind(this,record)}>{i18n('common.edit')}</button>
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
        >
        <Modal
         title={i18n('common.edit')}
         visible={visible}
         onOk={this.handleEdit}
         onCancel={()=>this.setState({visible:false})}
        >
			<EditMeetingForm ref="editForm" data={currentBD}/>
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



export default MeetingBDList