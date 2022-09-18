import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Table, Modal, Popover, Popconfirm, Select } from 'antd';
import React from 'react'
import { 
  handleError, 
  i18n, 
  hasPerm,
  getUserInfo,
  requestAllData,
  getCurrentUser,
} from '../utils/util';
import * as api from '../api'
import { isLogin, subtracting } from '../utils/util'
import { connect } from 'dva';
import BDComments from './BDComments';
import ModalEditProjBD from './ModalEditProjBD';
import ModalModifyProjectBDStatus from './ModalModifyProjectBDStatus';

class ReportProjectBDList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      userBdList: [],
      userBdId: null,
      addBdLoading: false,
      list: [],
      loading: false,

      visible: false,
      sort: 'isimportant',
      desc: 1,
      manager: getCurrentUser(),
      status: null, 
      isShowModifyStatusModal: false,
      currentBD:null,
      editModalVisible: false,
    }
  }

  getUserProjectBDList = () => {
    const { sort, desc, manager } = this.state
    const param = {
      sort,
      desc,
      manager,
    }
    let userBdList = [];
    return requestAllData(api.getProjBDList, param, 100)
    .then(allUserProjBDList => {
      userBdList = allUserProjBDList.data.data;
      return this.props.dispatch({ type: 'app/getSource', payload: 'bdStatus' });
    })
    .then(allBDStatus => {
      this.setState({
        userBdList: userBdList.map(m => {
          const bdStatus = allBDStatus.find(f => f.id === m.bd_status);
          return { ...m, bd_status: bdStatus };
        }),
      });
    }).catch(error => {
      handleError(error)
    })
  }

  getProjectBDList = () => {
    const { stimeM, etimeM } = this.props;
    const { sort, desc, manager } = this.state
    const param = {
      sort,
      desc,
      manager,
      stimeM,
      etimeM,
    }

    this.setState({ loading: true })
    let list = [];
    return requestAllData(api.getProjBDList, param, 100).then(result => {
      const { count: total, data: bdList } = result.data
      list = bdList;
      let promises = list.map(item=>{
        if(item.bduser){
          return api.checkUserRelation(isLogin().id, item.bduser)
        }
        else{
          return {data:false}
        }
      })
      Promise.all(promises).then(result=>{
        result.forEach((item,index)=>{
          list[index].hasRelation=item.data           
        })
        this.setState({ loading: false, total, list })
        // 更新 currentBD
        if (this.state.currentBD) {
          const index = list.findIndex((item) => item.id === this.state.currentBD.id);
          this.setState({
            currentBD: list[index],
          });
        }
      })
      return this.props.dispatch({ type: 'app/getSource', payload: 'bdStatus' });
    })
    .then(allBdStatus => {
      list = list.map(m => {
        const bdStatus = allBdStatus.find(f => f.id === m.bd_status);
        return { ...m, bd_status: bdStatus };
      });
      this.setState({ list });
    })
    .catch(error => {
      handleError(error)
      this.setState({ loading: false })
    })
  }

  // comments

  handleOpenModal = (bd) => {
    this.setState({ visible: true, currentBD: bd })
  }

  handleCloseModal = () => {
    this.setState({ visible: false, currentBD: null })
  }

  handleAddComment = async ({ comments, bucket, key, filename }, speechFile) => {
    let transid = null;
    if (speechFile && speechFile instanceof File) {
      try {
        const formData = new FormData();
        formData.append('file', speechFile);
        const { data } = await api.addAudioTranslate(formData);
        transid = data.id;
      } catch (error) {
        handleError(error)
        return
      }
    }

    const { currentBD } = this.state;
    const { stimeM } = this.props;
    const param = {
      projectBD: currentBD.id,
      comments,
      bucket,
      key,
      filename,
      transid,
    }
    let data = null;
    try {
      data = await api.addProjBDCom(param)
    } catch (error) {
      handleError(error);
      return;
    }

    this.getProjectBDList()
    api.editProjBD(currentBD.id, { lastmodifytime: stimeM });
  }

  handleEditComment = async (id, data, speechFile) => {
    let transid = null;
    if (speechFile && speechFile instanceof File) {
      try {
        const formData = new FormData();
        formData.append('file', speechFile);
        const { data } = await api.addAudioTranslate(formData);
        transid = data.id;
      } catch (error) {
        handleError(error)
        return
      }
    }

    const params = { ...data, transid };
    try {
      await api.editProjBDCom(id, params)
    } catch (error) {
      handleError(error)
      return
    }
    
    this.getProjectBDList()
    const { currentBD } = this.state;
    const { stimeM } = this.props;
    api.editProjBD(currentBD.id, { lastmodifytime: stimeM });
  }

  handleDeleteComment = (id) => {
    const { currentBD } = this.state;
    const { stimeM } = this.props;
    api.deleteProjBDCom(id).then(data => {
      this.getProjectBDList()
      api.editProjBD(currentBD.id, { lastmodifytime: stimeM });
    }).catch(error => {
      handleError(error)
    })
  }

  checkExistence = (mobile, email) => {
    return new Promise((resolve, reject) => {
      Promise.all([api.checkUserExist(mobile), api.checkUserExist(email)])
        .then(result => {
          for (let item of result) {
            if (item.data.result === true)
              resolve(true);
          }
          resolve(false);
        })
        .catch(err => reject(err));
    });
  }
  
  handleConfirm =(state)=>{
    if ( state.status === 3 && this.state.currentBD.bd_status.id !==3 && !this.state.currentBD.bduser){
      this.checkExistence(state.mobile, state.email).then(ifExist => {
          if (ifExist) {
            Modal.error({
              content: i18n('user.message.user_exist')
            });
          } else {
            this.setState({ isShowModifyStatusModal: false }, () => this.setState({ loading: true }));
            this.handleConfirmAudit(state);
          }
        })
    }
    else{
      this.handleConfirmAudit(state)
    }
  }

  handleUpdateContact = async (formData) => {
    const usermobile = (formData.mobileAreaCode && formData.mobile) ? `+${formData.mobileAreaCode}-${formData.mobile}` : formData.mobile;
    const body = { ...formData, usermobile, lastmodifytime: this.props.stimeM };
    try {
      await api.editProjBD(this.state.currentBD.id, body);
      const { username, usermobile: mobile, email } = body;
      await api.addProjBDCom({
        projectBD: this.state.currentBD.id,
        comments: `联系人姓名：${username}，电话：${mobile}，邮箱：${email || '暂无'}`,
      });
      this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList);
    } catch (error) {
      handleError(error);
    }
  }

  handleConfirmAudit = state => {
    const { status, usernameC, mobile, email } = state;
    const body = {
      bd_status: status,
      lastmodifytime: this.props.stimeM,
    }
    // 状态改为暂不BD后，详细需求见bugClose #344
    if (status === 4 && this.state.currentBD.bd_status.id !== 4) {
      const { bd_status, contractors } = this.state.currentBD;
      api.addProjBDCom({
        projectBD: this.state.currentBD.id,
        comments: `之前状态：${bd_status.name}，发起人: ${ contractors ? contractors.username : '无' }`,
      });
      // body.contractors = null;
    }
    api.editProjBD(this.state.currentBD.id, body)
      .then(result => 
        {
          if (status !== 3 || this.state.currentBD.bd_status.id === 3){
            this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList)
          }
        }
        );

    if (status !== 3 || this.state.currentBD.bd_status.id === 3) return;

    if (this.state.currentBD.bduser) {
      api.addUserRelation({
        relationtype: false,
        investoruser: this.state.currentBD.bduser,
        traderuser: this.state.currentBD.manager.id
      })
        .then(result => {
          this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList)
        })
        .catch(error => {
          this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList)
        });
              
    } else {
      api.addProjBDCom({
        projectBD: this.state.currentBD.id,
        comments: `${i18n('account.username')}: ${usernameC} ${i18n('account.mobile')}: ${mobile} ${i18n('account.email')}: ${email}`
      });
        const userBody = {...state, userstatus: 1};
        delete userBody.status;
        api.addUser(userBody)
          .then(result =>{
            if (this.state.currentBD.username === null) {
              api.editProjBD(this.state.currentBD.id, {
                bduser: result.data.id,
                lastmodifytime: this.props.stimeM,
              })
                .then(data => {
                  this.setState({ isShowModifyStatusModal: false }, this.getProjectBDList)
                })
            }
            api.addUserRelation({
              relationtype: false,
              investoruser: result.data.id,
              traderuser: this.state.currentBD.manager.id
            }).then(data=>{
              this.setState({ isShowModifyStatusModal: false, loading: false });
            })
          });
      }
    }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey || 'isimportant', 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getProjectBDList
    );
  }

  componentDidMount() {
    this.getUserProjectBDList();
    this.getProjectBDList();
    this.props.dispatch({ type: 'app/getGroup' });
    this.props.dispatch({ type: 'app/getSourceList', payload: ['bdStatus', 'country'] });
  }

  handleEdit = (record) => {
    this.setState({
      editModalVisible: true,
      currentBD: record,
    });
  };

  handleEditOk = (values) => {
    this.editProjectBD(values).then(() => {
      this.setState({
        editModalVisible: false,
        currentBD: null,
      });
      this.getProjectBDList();
    }).catch((error) => {
      handleError(error);
    });
  };

  editProjectBD = async (param) => {
    if (param.manager) {
      const { manager: newManager } = param;
      let { manager: oldManager, id: projectBdId } = this.state.currentBD;

      if (oldManager === null) {
        oldManager = [];
      }

      const oldNormalManagerIds = oldManager.map(m => m.manager.id);
      const newNormalManagerIds = newManager.map(m => parseInt(m));

      const normalManagerToDel = subtracting(oldNormalManagerIds, newNormalManagerIds);
      await Promise.all(normalManagerToDel.map(m => {
        const relateManagerId = oldNormalManager.filter(f => f.manager.id === m)[0].id;
        return api.deleteProjectBdRelatedManager(relateManagerId);
      }));
      const normalManagerToAdd = subtracting(newNormalManagerIds, oldNormalManagerIds);
      await Promise.all(normalManagerToAdd.map(m => {
        const body = {
          manager: m,
          projectBD: projectBdId,
          type: 3,
        };
        return api.addProjectBdRelatedManager(body);
      }));
    }

    const { bd_status: status } = param;
    // 状态改为暂不BD后，详细需求见bugClose #344
    if (status === 4 && this.state.currentBD.bd_status.id !== 4) {
      // param.contractors = null;
    }
    
    const { id } = this.state.currentBD;
    param.lastmodifytime = this.props.stimeM;
    await api.editProjBD(id, param);

    // 状态改为暂不BD后，详细需求见bugClose #344
    if (status === 4 && this.state.currentBD.bd_status.id !== 4) {
      const { bd_status, contractors } = this.state.currentBD;
      await api.addProjBDCom({
        projectBD: this.state.currentBD.id,
        comments: `之前状态：${bd_status.name}，发起人: ${contractors ? contractors.username : '无'}`,
      });
    }
  }

  handleEditCancel = () => {
    this.setState({
      editModalVisible: false,
      currentBD: null,
    });
  };

  handleDelete = (id) => {
    api.deleteProjBD(id).then(data => {
      this.getProjectBDList()
      this.getUserProjectBDList()
    }).catch(error => {
      handleError(error)
    })
  }

  handleStatusChange =(status)=>{
    this.setState({status})
  }

  handleModifyBDStatusBtnClicked = bd => {
    this.setState({currentBD:bd})
    this.setState({ isShowModifyStatusModal: true, status: bd.bd_status.id });
  }

  showPhoneNumber = item => {
    const { usermobile } = item;
    if (!usermobile) return '暂无';
    const { bduser } = item;
    if (bduser || usermobile.startsWith('+')) return usermobile;
    return `+${usermobile}`;
  }

  currentUserHasIndGroup = () => {
    const userInfo = getUserInfo();
    if (!userInfo) return false;
    if (!userInfo.indGroup) return false;
    if (!userInfo.indGroup.id) return false;
    return true;
  }

  handleUserBdChange = (value) => {
    this.setState({
      userBdId: value,
    });
  }

  handleAddBdToReport = () => {
    const { userBdId } = this.state;
    if (userBdId == null) return;
    this.setState({
      addBdLoading: true,
    });
    api.editProjBD(userBdId, { lastmodifytime: this.props.stimeM }).then(() => {
      this.setState({
        userBdId: null,
        addBdLoading: false,
      });
      this.getProjectBDList();
    }).catch((error) => {
      handleError(error);
      this.setState({
        addBdLoading: false,
      });
    }); 
  }

  render() {
    const { userBdList, userBdId, addBdLoading, list, loading } = this.state
    const columns = [
      {title: i18n('project_bd.project_name'), dataIndex: 'com_name', key:'com_name', sorter:true, 
        render: (text, record) => (
          <div style={{ position: 'relative' }}>
            {record.isimportant ? <img style={{ position: 'absolute', height:'10px',width:'10px',marginTop:'-5px',marginLeft:'-5px'}} src="/images/important.png" /> : null}
            {record.source_type === 0 ?
              <Popover title="项目方联系方式" content={
                <div>
                  <div>{`姓名：${record.username || '暂无'}`}</div>
                  <div>{`职位：${record.usertitle ? record.usertitle.name : '暂无'}`}</div>
                  <div>{`电话：${this.showPhoneNumber(record)}`}</div>
                  <div>{`邮箱：${record.useremail || '暂无'}`}</div>
                </div>
              }>
                <a target="_blank" href={"/app/projects/library/" + encodeURIComponent(text)}>{text}</a>
              </Popover>
              :
              <Popover title="项目方联系方式" content={
                <div>
                  <div>{`姓名：${record.username || '暂无'}`}</div>
                  <div>{`职位：${record.usertitle ? record.usertitle.name : '暂无'}`}</div>
                  <div>{`电话：${this.showPhoneNumber(record)}`}</div>
                  <div>{`邮箱：${record.useremail || '暂无'}`}</div>
                </div>
              }>
                <div style={{ color: "#428bca" }}>{text}</div>
              </Popover>
            }
          </div>
        )
      },
      {title: i18n('project_bd.status'), dataIndex: ['bd_status', 'name'], key:'bd_status', width: 80, sorter:true},
      {
        title: i18n('project_bd.manager'),
        key: 'manager',
        render: (_, record) => record.manager && record.manager.filter(f => f.type === 3).map(m => m.manager.username).join('、'),
      },
    ];

    const allCreateUser = list.map(m => m.createuser);
    const allContractor = list.filter(f => f.contractors).map(m => m.contractors.id);
    const allManager = list.filter(f => f.manager).map(m => m.manager.filter(f => f.type === 3).map(m => m.manager.id))
    .reduce((prev, curr) => prev.concat(curr), []);

    if (hasPerm('BD.manageProjectBD') || allCreateUser.includes(getUserInfo().id) || allContractor.includes(getUserInfo().id) || allManager.includes(getUserInfo().id)) {
      columns.push(
        {title: i18n('project_bd.operation'), width: 160, render: (text, record) => {
          
          let normalManagerIds = [];
          if (record.manager) {
            normalManagerIds = record.manager.filter(f => f.type === 3).map(m => m.manager.id);
          }

          return (<span style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              {hasPerm('BD.manageProjectBD') || getUserInfo().id === record.createuser ?
                <Button size="small" type="link" onClick={() => this.handleEdit(record)}><EditOutlined /></Button>
                :
                normalManagerIds.includes(getUserInfo().id) || (record.contractors && getUserInfo().id === record.contractors.id) ?
                <Button type="link" size="small" onClick={() => this.handleModifyBDStatusBtnClicked(record)}><EditOutlined /></Button>
                : null
              }
            </div>

            { hasPerm('BD.manageProjectBD') || getUserInfo().id === record.createuser ? 
            <div style={{ marginLeft: 7 }}>
            <Popconfirm title={i18n('message.confirm_delete')} onConfirm={() => this.handleDelete(record.id)}>
              <Button size="small" type="link">
                <DeleteOutlined />
              </Button>
            </Popconfirm>
            </div>
            : null }

            <div>
              {/* 备注按钮 */}
              { hasPerm('BD.manageProjectBD') || getUserInfo().id === record.createuser || normalManagerIds.includes(getUserInfo().id) || (record.contractors && getUserInfo().id === record.contractors.id) ?
              <Button style={{}} onClick={() => this.handleOpenModal(record)} type="link" size="small">行动计划</Button>
              : null }
            </div>

          </span>)
        }}
      );
    }

    const bdIdsInReport = list.map(({ id }) => id);
    const bdListNotInReport = userBdList.filter(({ id }) => !bdIdsInReport.includes(id));
    const userBdOptions = bdListNotInReport.map(({ id, com_name }) => ({
      value: id,
      label: com_name,
    }));

    return (
      <div>
        <Table
          onChange={this.handleTableChange}
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
        />
        <div style={{ marginTop: 24 }}>
          <Select
            style={{ width: 250 }}
            placeholder="选择项目BD"
            disabled={addBdLoading}
            value={userBdId}
            onChange={this.handleUserBdChange}
            options={userBdOptions}
          />
          <Popconfirm
            title="确定添加进周报吗？"
            onConfirm={this.handleAddBdToReport}
          >
            <Button
              style={{ marginLeft: 8 }}
              loading={addBdLoading}
              disabled={userBdId == null}
            >
              添加进周报
            </Button>
          </Popconfirm>
        </div>

        <Modal title="行动计划" visible={this.state.visible} footer={null} onCancel={this.handleCloseModal} maskClosable={false} destroyOnClose={true}>
          <BDComments
            BDComments={this.state.currentBD && this.state.currentBD.BDComments}
            onAdd={this.handleAddComment}
            onEdit={this.handleEditComment}
            onDelete={this.handleDeleteComment} />
        </Modal>

        {this.state.isShowModifyStatusModal?
        <ModalModifyProjectBDStatus 
          visible={this.state.isShowModifyStatusModal} 
          onCancel={() => this.setState({ isShowModifyStatusModal: false })} 
          onOk={this.handleConfirm}
          onUpdateContact={this.handleUpdateContact}
          bd={this.state.currentBD}
        />
        :null}

        {this.state.editModalVisible && (
          <ModalEditProjBD
            bd={this.state.currentBD}
            visible={this.state.editModalVisible}
            onCancel={this.handleEditCancel}
            onOk={this.handleEditOk}
          />
        )}
      </div>
    )
  }
}

export default connect()(ReportProjectBDList);
