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
  Col
} from 'antd';
import { Link } from 'dva/router';
import { OrgBDFilter } from '../components/Filter';
import { getUser } from '../api';
import { isLogin } from '../utils/util'
 
class MeetingBDList extends React.Component{
	constructor(props){
		super(props)
		this.state={
			search: null,
	        page: 1,
	        pageSize: 10,
	        total: 0,
	        list: [],
	        loading: false
		}
	}

	componentDidMount(){
		this.getMeetingBDList()
	}

	getMeetingBDList = () =>{
		this.setState({ loading: true });
		const { page, pageSize, search, sort } = this.state;
	    const params = {
	        page_index: page,
	        page_size: pageSize,
	        search,	
	        sort   	        
	    }
		api.getMeetingBdList(params)
		.then(result=>{
			console.log(result)
		})
	}

	render(){
		return(
		<LeftRightLayout 
        location={this.props.location} 
        title={i18n('menu.meeting_bd')}
        >
        helllo
        </LeftRightLayout>
		)
	}
}

export default MeetingBDList