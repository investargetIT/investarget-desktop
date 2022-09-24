import React from 'react'
import { connect } from 'dva';
import { Icon, Input, Button, Modal, Popconfirm } from 'antd'
import { handleError, time, i18n, hasPerm, getUserInfo, requestAllData } from '../utils/util';
import * as api from '../api'
import RemarkList2 from './RemarkList2'
import {
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';

const addIconStyle = {
  cursor: 'pointer',
  padding: '4px',
  color: '#108ee9',
}
const remarkTitleStyle = {
  lineHeight: 2,
  marginBottom: '8px',
  borderBottom: '1px solid #eee',
}
const remarkStyle = {
  margin: '8px 0',
}
const remarkTimeStyle = {
  fontSize: '12px',
}
const remarkActionStyle = {
  marginLeft: '8px',
}
const remarkTextStyle = {
  fontSize: '13px',
  paddingLeft: '16px',
}

const divStyle={
  marginTop:'16px',
  textAlign:'center',
  fontSize:'14px'
}

class RemarkList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      showAdd: false,
      showEdit: false,
      editId: null,
      remark: '',
    }
  }

  updateRemark = (e) => {
    this.setState({ remark: e.target.value })
  }

  showAddRemark = () => {
    this.setState({ showAdd: true })
  }

  confirmAddRemark = () => {
    const { remark } = this.state
    this.setState({ showAdd: false, remark: '' })
    this.props.addRemark(remark)
  }

  cancelAddRemark = () => {
    this.setState({ showAdd: false, remark: '' })
  }

  showEditRemark = (id) => {
    const { list } = this.props
    const remark = list.filter(item => item.id == id)[0]
    this.setState({ showEdit: true, editId: id, remark: remark.remark })
  }

  confirmEditRemark = () => {
    const { editId, remark } = this.state
    this.setState({ showEdit: false, remark: '', editId: null })
    this.props.editRemark(editId, remark)
  }

  cancelEditRemark = () => {
    this.setState({ showEdit: false, editId: null, remark: '' })
  }

  confirmDeleteRemark = (id) => {
    this.props.deleteRemark(id)
  }

  render() {
    if (this.props.readOnly) {
      return (
        <div>
          <h3 style={remarkTitleStyle}>{i18n('remark.remark')}</h3>
          <div>
            {
              this.props.list.map(item =>
                <div key={item.id} style={remarkStyle}>
                  <p style={remarkTimeStyle}>
                    { time(item.createdtime+item.timezone) }
                  </p>
                  <p style={remarkTextStyle}>{item.remark}</p>
                </div>
              )
            }
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <h3 style={remarkTitleStyle}>{i18n('remark.remark_info')}<Icon type="plus" style={addIconStyle} onClick={this.showAddRemark} /></h3>
          <div>
            {
              this.props.list.map(item =>
                <div key={item.id} style={remarkStyle}>
                  <p style={remarkTimeStyle}>
                    { time(item.createdtime+item.timezone) }
                    {/* TODO// 操作与权限挂钩 */}
                    {/* <a style={remarkActionStyle} onClick={this.showEditRemark.bind(this, item.id)}>{i18n('common.edit')}</a> */}
                    <Button type="link" onClick={this.showEditRemark.bind(this, item.id)}><EditOutlined /></Button>
                    <Popconfirm title={i18n('remark.remove_remark')} onConfirm={this.confirmDeleteRemark.bind(this, item.id)}>
                      {/* <a style={remarkActionStyle}>{i18n('common.delete')}</a> */}
                      <Button type="link"><DeleteOutlined /></Button>
                    </Popconfirm>
                  </p>
                  <p style={remarkTextStyle}>{item.remark}</p>
                </div>
              )
            }
          </div>
          <Modal title={i18n('remark.add_remark')} visible={this.state.showAdd} onOk={this.confirmAddRemark} onCancel={this.cancelAddRemark}>
            <Input type="textarea" rows={4} value={this.state.remark} onChange={this.updateRemark} />
          </Modal>
          <Modal title={i18n('remark.edit_remark')} visible={this.state.showEdit} onOk={this.confirmEditRemark} onCancel={this.cancelEditRemark}>
            <Input type="textarea" rows={4} value={this.state.remark} onChange={this.updateRemark} />
          </Modal>
        </div>
      )
    }
  }
}


function sortByTime(list) {
  list.sort((a, b) => {
    const aTimezone = a.timezone || '+08:00';
    const bTimezone = b.timezone || '+08:00';
    const aTimestamp = Date.parse(a.createdtime + aTimezone);
    const bTimeStamp = Date.parse(b.createdtime + bTimezone);
    return bTimeStamp - aTimestamp;
  });
}

// HOC
function remarkListWithApi(type) {

  const getApi = api.getRemark.bind(null, type)
  const addApi = api.addRemark.bind(null, type)
  const editApi = api.editRemark.bind(null, type)
  const deleteApi = api.deleteRemark.bind(null, type)

  class CommonRemarkList extends React.Component {

    constructor(props) {
      super(props)

      this.state = {
        list: [],
        currentList:[],
        currentListNum:0,
        initComNum:2,
        displayNum:2
      }
    }

    getRemarkList = () => {
      const param = {
        [type]: this.props.typeId,
        page_size: 100,
      }
      const {initComNum,list,currentList,currentListNum}=this.state
      requestAllData(getApi, param, 100).then(result => {
        const list = result.data.data
        sortByTime(list)
        this.setState({ list })

        if(['user', 'org', 'timeline'].includes(type)){
          if(currentListNum>initComNum){
            this.setState({currentList:list.slice(0,currentListNum)})
          }else{
          this.setState({currentList:list.slice(0,initComNum),currentListNum:initComNum})
          }
        }
      }, error => {
        handleError(error)
      })
    }

    addRemark = (remark) => {
      const params = { [type]: this.props.typeId, remark }
      addApi(params).then(result => {
        this.getRemarkList()
        if (type === 'org') {
          this.props.dispatch({
            type: 'app/getOrgRemarks',
            payload: {
              orgIDArr: [parseInt(this.props.typeId, 10)],
              forceUpdate: true
            }
          });
        }
      }, error => {
        handleError(error)
      })
    }

    editRemark = (editId, remark) => {
      const params = { remark };
      editApi(editId, params).then(result => {
        this.getRemarkList()
      }, error => {
        handleError(error)
      })
    }

    deleteRemark = (id) => {
      deleteApi(id).then(result => {
        this.getRemarkList()
        if (type === 'org') {
          this.props.dispatch({
            type: 'app/getOrgRemarks',
            payload: {
              orgIDArr: [parseInt(this.props.typeId, 10)],
              forceUpdate: true
            }
          });
        }
      }, error => {
        handleError(error)
      })
    }
    
    displayMore = () =>{
    const {initComNum,list,currentList,currentListNum,displayNum}=this.state  
    if(list.length-currentList.length>=displayNum)
    {this.setState({currentList:list.slice(0,currentListNum+displayNum),
      currentListNum:currentListNum+displayNum})
    }
    else{
    this.setState({currentList:list,currentListNum:list.length})
   }
   }

    collapseAll = () =>{
      const {initComNum,list,currentList,currentListNum}=this.state
      this.setState({currentList:list.slice(0,initComNum),currentListNum:initComNum})
    }
    componentDidMount() {
      this.getRemarkList()
    }

    render() {
      const readOnly = 'readOnly' in this.props
      const {initComNum,list,currentList,currentListNum}=this.state
      const ifUser = ['user', 'org', 'timeline'].includes(type);
      return (
        <div>
        {ifUser ? <div>
      <RemarkList2
        list={this.state.currentList}
        onAdd={this.addRemark}
        onEdit={this.editRemark}
        onDelete={this.deleteRemark}
        type={type}
      />
      <div style={divStyle}>
              {list.length <= initComNum ? null :
                (
                  currentListNum === list.length ?
                    <a onClick={this.collapseAll}>{i18n('common.collapse')}</a>
                    :
                    <a onClick={this.displayMore}>{i18n('common.view_more')}</a>
                )
              }
      </div>
      </div> : 
        <RemarkList
          list={this.state.list}
          readOnly={readOnly}
          addRemark={this.addRemark}
          editRemark={this.editRemark}
          deleteRemark={this.deleteRemark}
        />}
        </div>
        // <RemarkList
        //   list={this.state.list}
        //   readOnly={readOnly}
        //   addRemark={this.addRemark}
        //   editRemark={this.editRemark}
        //   deleteRemark={this.deleteRemark}
        // />
      )
    }

  }

  return connect()(CommonRemarkList);
}


const TimelineRemarkList = remarkListWithApi('timeline')
const OrganizationRemarkList = remarkListWithApi('org')
const UserRemarkList = remarkListWithApi('user')


class LibProjRemarkList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      list: [],
      currentList:[],
      currentListNum:0,
      initComNum:2,
      displayNum:2
    }
  }

  getRemarkList = () => {
    const { com_id, com_name } = this.props;
    const params = { com_id }
    const {initComNum,list,currentList,currentListNum}=this.state
    api.getLibProjRemark(params).then(result => {
      const list = result.data.data.map(item => {
        return {
          ...item,
          createdtime: item.date,
          timezone: '+08:00',
        }
      }).concat(this.state.list);
      sortByTime(list)
      this.setState({ list })
      
      if(currentListNum>initComNum){
        this.setState({currentList:list.slice(0,currentListNum)})
      }else{
      this.setState({currentList:list.slice(0,initComNum),currentListNum:initComNum})
      }
      
    }, error => {
      handleError(error)
    })
    if (!hasPerm('usersys.as_investor') || getUserInfo().is_superuser) {
      api.getProjBDList({ search: com_name })
        .then(result => {
          if (result.data.data.length > 0) {
            return requestAllData(api.getProjBDCom, { projectBD: result.data.data.map(m => m.id) }, 100);
          }
          return Promise.resolve({
            data: { data: [] },
          });
        })
        .then((result) => {
          const list = result.data.data
            .reduce((prev, curr) => prev.concat(curr), [])
            .filter(f => f !== null)
            .map(m => ({ ...m, remark: m.comments }))
            .concat(this.state.list);

          sortByTime(list);
          this.setState({ list });

          if (currentListNum > initComNum) {
            this.setState({ currentList: list.slice(0, currentListNum) });
          } else {
            this.setState({ currentList: list.slice(0, initComNum), currentListNum: initComNum });
          }
        })
        .catch(handleError);
    }
  }

  addRemark = (remark) => {
    const { com_id, com_name } = this.props
    const params = { com_id, com_name, remark }
    api.addLibProjRemark(params).then(result => {
      this.getRemarkList()
    }, error => {
      handleError(error)
    })
  }

  editRemark = (remark, content) => {
    this.asyncEdit(remark, content).catch(handleError);
  }

  asyncEdit = async (remark, content) => {
    if (remark.com_id) {
      const params = { remark: content };
      await api.editLibProjRemark(remark.id, params);
    } else {
      const body = { comments: content };
      await api.editProjBDCom(remark.id, body);
    }
    this.setState({ list: [] }, this.getRemarkList);
  }

  deleteRemark = (id) => {
    this.asyncDelete(id).catch(handleError);
  }

  asyncDelete = async (id) => {
    if (isNaN(id)) {
      await api.deleteLibProjRemark(id);
    } else {
      await api.deleteProjBDCom(id);
    }
    this.setState({ list: [] }, this.getRemarkList);
  }

  displayMore = () =>{
    const {initComNum,list,currentList,currentListNum,displayNum}=this.state  
    if(list.length-currentList.length>=displayNum)
    {this.setState({currentList:list.slice(0,currentListNum+displayNum),
      currentListNum:currentListNum+displayNum})
    }
    else{
    this.setState({currentList:list,currentListNum:list.length})
   }
 }

  collapseAll = () =>{
    const {initComNum,list,currentList,currentListNum}=this.state
    this.setState({currentList:list.slice(0,initComNum),currentListNum:initComNum})
  }
    
  
  componentDidMount() {
    this.getRemarkList()   
  }

  render() {
    const {initComNum,list,currentList,currentListNum}=this.state
    console.log('state', this.state);
    return (
      // <RemarkList
      //   list={this.state.currentList}
      //   addRemark={this.addRemark}
      //   editRemark={this.editRemark}
      //   deleteRemark={this.deleteRemark}
      // />
      <div>
      <RemarkList2
        list={this.state.currentList}
        onAdd={this.addRemark}
        onEdit={this.editRemark}
        onDelete={this.deleteRemark}
        type="library"
      />
      <div style={divStyle}>
          {list.length <= initComNum ? null : (
            currentListNum === list.length ? <a onClick={this.collapseAll}>{i18n('common.collapse')}</a> :
              <a onClick={this.displayMore}>{i18n('common.view_more')}</a>
          )}
      </div>
      </div>
    )
  }
}

export {
  TimelineRemarkList,
  OrganizationRemarkList,
  UserRemarkList,
  LibProjRemarkList,
}
