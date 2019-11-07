import React from 'react'
import { connect } from 'dva'
import { Link, withRouter } from 'dva/router';
import { 
  i18n, 
  hasPerm, 
  getCurrentUser,
  getUserInfo,
  time,
  handleError,
} from '../utils/util';
import ModalModifyOrgBDStatus from '../components/ModalModifyOrgBDStatus';
import { Input, Icon, Button, Popconfirm, Modal, Table, Pagination, Popover } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import qs from 'qs';
import { TimelineFilter } from '../components/Filter'
import CloseTimelineModal from '../components/CloseTimelineModal'
import { Search } from '../components/Search'
import { PAGE_SIZE_OPTIONS } from '../constants';

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class TimelineList extends React.Component {

  constructor(props) {
    super(props)

    const { proj, investor, trader } = props.location.query;

    let filters, search, page;
    if (proj && investor && trader) {
      filters = { investor, proj, trader, isClose: null };
    } else {
      // const setting = this.readSetting();
      const setting = null;
      filters = setting ? setting.filters : TimelineFilter.defaultValue;
      search = setting ? setting.search : null;
      page = setting ? setting.page : 1;
    }


    this.state = {
      filters,
      search,
      page,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
      visible: false,
      id: null,
      reason: '',
      desc: undefined,
      sort: undefined,
      currentBD: null,
      commentVisible: false,
      comments: [],
      newComment: '',
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getTimeline)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1, search: null }, this.getTimeline)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getOrgBdList);
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getOrgBdList);
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getOrgBdList)
  }

  getTimeline = () => {
    const { filters, search, page, pageSize, sort, desc } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize, sort, desc }
    this.setState({ loading: true })
    api.getTimeline(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })

      const ids = list.map(item => item.id)
      const investorIds = list.map(item => item.investor.id)

      Promise.all([this.getInvestorOrganization(investorIds), this.getLatestRemark(ids)])
        .then(data => {
          const orgs = data[0]
          const remarks = data[1]
          const list = this.state.list.map((item, index) => {
            return { ...item, org: orgs[index], latestremark: remarks[index] }
          })
          this.setState({ list })
        })
        .catch(error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error,
          })
        })

      if (this.props.location.query.proj === undefined) {
        this.writeSetting()
      }
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  deleteTimeline = (id) => {
    api.deleteTimeline(id).then(result => {
      this.getTimeline()
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  showOpenTimelineModal = (id) => {
    Modal.confirm({
      title: i18n('timeline.open_timeline'),
      onOk: () => {
        api.openTimeline(id).then(result => {
          this.getTimeline()
        }, error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error,
          })
        })
      },
    })
  }
  // 关闭时间轴

  showCloseTimelineModal = (id) => {
    this.setState({ visible: true, id, reason: '' })
  }

  handleReasonChange = (reason) => {
    this.setState({ reason })
  }

  handleCancelClose = () => {
    this.setState({ visible: false })
  }

  handleConfirmClose = () => {
    const { id, reason } = this.state
    api.closeTimeline(id, reason).then(result => {
      this.setState({ visible: false })
      // refresh
      this.getTimeline()
      // 结束理由，添加一条备注
      const data = { timeline: id, remark: reason }
      api.addTimelineRemark(data).then(result => {
        //
      }, error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error,
        })
      })
    }, error => {
      this.setState({ visible: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      })
    })
  }


  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page, pageSize }
    localStorage.setItem('TimelineList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('TimelineList')
    return data ? JSON.parse(data) : null
  }

  getInvestorOrganization = (investorIds) => {

    const q = investorIds.map(id => {
      return api.getUserInfo(id).then(result => {
        const user = result.data
        return user.org
      })
    })

    return Promise.all(q)
  }

  getLatestRemark = (timelineIds) => {
    const userId = getCurrentUser()

    const q = timelineIds.map(id => {
      const params = { timeline: id, createuser: userId }
      return api.getTimelineRemark(params).then(result => {
        const { count, data } = result.data
        return count > 0 ? data[0] : ''
      })
    })

    return Promise.all(q)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    this.getOrgBdList();
  }

  getOrgBdList = async () => {
    const { filters, search, page, pageSize, sort, desc } = this.state
    const params = { page_index: page, page_size: pageSize, search, sort, desc };
    this.setState({ loading: true });
    const res = await api.getOrgBdList(params);
    const { data: list, count: total } = res.data;
    let comments = [];
    if (this.state.currentBD) {
      comments = list.filter(item => item.id == this.state.currentBD.id)[0].BDComments || [];
    }
    this.setState({ list, total, loading: false, comments });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getOrgBdList
    );
  };

  isAbleToModifyStatus = record => {
    if (hasPerm('BD.manageOrgBD')) {
      return true;
    }
    const currentUserID = getUserInfo() && getUserInfo().id;
    if ([this.state.makeUser, this.state.takeUser, record.manager.id, record.createuser.id].includes(currentUserID)) {
      return true;
    }
    return false;
  }

  handleModifyStatusBtnClicked(bd) {
    this.setState({ 
        visible: true, 
        currentBD: bd,
    });
  }

  handleOpenModal = bd => {
    this.setState({ commentVisible: true, currentBD: bd, comments: bd.BDComments || [] });
  }

  handleConfirmBtnClicked = state => {
    let comments = '';
    // 由非空状态变为不跟进，记录之前状态，相关issue #285
    if (state.status === 6 && ![6, null].includes(this.state.currentBD.response)) {
      const oldStatus = this.props.orgbdres.filter(f => f.id === this.state.currentBD.response)[0].name;
      comments = [state.comment.trim(), `之前状态${oldStatus}`].filter(f => f !== '').join('，');
    } else {
      comments = state.comment.trim();
    }
    // 添加备注
    if (comments.length > 0) {
      const body = {
        orgBD: this.state.currentBD.id,
        comments,
      };
      api.addOrgBDComment(body);
    }

    // 如果状态改为了已见面、已签NDA或者正在看前期资料，则同步时间轴
    // if ([1, 2, 3].includes(state.status) && this.state.currentBD.response !== state.status) {
      // this.syncTimeline(state).then(() => this.wechatConfirm(state));
    // } else {
      this.wechatConfirm(state);
    // }
  }

  wechatConfirm = state => {
    const react = this;
    // 如果修改状态为2或者3即已签NDA或者正在看前期资料
    if (state.status !== this.state.currentBD.response && [2, 3].includes(state.status) && ![2, 3].includes(this.state.currentBD.response)) {
      if (!this.state.currentBD.bduser) {
        this.checkExistence(state.mobile, state.email).then(ifExist => {
          if (ifExist) {
            Modal.error({
              content: i18n('user.message.user_exist')
            });
          } else {
            this.handleConfirmAudit(state, true);
          }
        })
      } else {
        // 已经有联系人时
        if (this.state.currentBD.userinfo.wechat && this.state.currentBD.userinfo.wechat.length > 0 && state.wechat.length > 0) {
          // 该联系人已经有微信
          Modal.confirm({
            title: '警告',
            content: '联系人微信已存在，是否覆盖现有微信',
            onOk: () => this.handleConfirmAudit(state, true), 
            onCancel:  () => this.handleConfirmAudit(state),
          });
        } else {
          // 该联系人没有微信
          this.handleConfirmAudit(state, true);
        }
      }
    } else {
      this.handleConfirmAudit(state, true);
    }
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

  handleConfirmAudit = ({ status, isimportant, username, mobile, wechat, email, group, mobileAreaCode, comment }, isModifyWechat) => {
    const body = {
      response: status,
      isimportant: isimportant ? 1 : 0,
      remark: comment,
    }
    api.modifyOrgBD(this.state.currentBD.id, body)
      .then(result => {
        if (status === this.state.currentBD.response || ![1, 2, 3].includes(status) || ([1, 2, 3].includes(status) && [1, 2, 3].includes(this.state.currentBD.response))) {
          this.setState({ visible: false }, this.getOrgBdList);
        }
      }
      );

    if (status === this.state.currentBD.response || ![1, 2, 3].includes(status) || ([1, 2, 3].includes(status) && [1, 2, 3].includes(this.state.currentBD.response))) return;
    // 如果机构BD存在联系人
    if (this.state.currentBD.bduser) {
      // 首先检查经理和投资人的关联
      api.checkUserRelation(this.state.currentBD.bduser, this.state.currentBD.manager.id)
        .then(result => {
          // 如果存在关联或者有相关权限并且确定覆盖微信，则直接修改用户信息
          if ((result.data || hasPerm('usersys.admin_changeuser')) && isModifyWechat) {
            api.addUserRelation({
              relationtype: true,
              investoruser: this.state.currentBD.bduser,
              traderuser: this.state.currentBD.manager.id
            })
            api.editUser([this.state.currentBD.bduser], { wechat: wechat === '' ? undefined : wechat });
          } else {
            api.addUserRelation({
              relationtype: true,
              investoruser: this.state.currentBD.bduser,
              traderuser: this.state.currentBD.manager.id
            })
              .then(result => {
                if (isModifyWechat) {
                  api.editUser([this.state.currentBD.bduser], { wechat: wechat === '' ? undefined : wechat });
                }
              })
              .catch(error => {
                if (!isModifyWechat) return;
                if (error.code === 2025) {
                  Modal.error({
                    content: '该用户正处于保护期，无法建立联系，因此暂时无法修改微信',
                  });
                }
              });
          }
          this.getOrgBdList();
          // 重新加载这条记录，保证修改了的微信能在鼠标hover时正确显示
          // this.getOrgBdListDetail(this.state.currentBD.org.id, this.state.currentBD.proj && this.state.currentBD.proj.id);
        });

      // 承做和投资人建立联系
      this.addRelation(this.state.currentBD.bduser);

      if (wechat.length > 0) {
        api.addOrgBDComment({
          orgBD: this.state.currentBD.id,
          comments: `${i18n('user.wechat')}: ${wechat}`
        }).then(data => {
          this.setState({ visible: false }, this.getOrgBdList)
        });
      } else {
        this.setState({ visible: false }, this.getOrgBdList)
      }
      // 如果机构BD不存在联系人
    } else {
      api.addOrgBDComment({
        orgBD: this.state.currentBD.id,
        comments: `${i18n('account.username')}: ${username} ${i18n('account.mobile')}: ${mobile} ${i18n('user.wechat')}: ${wechat} ${i18n('account.email')}: ${email}`
      });
      const newUser = { mobile, wechat, email, mobileAreaCode, groups: [Number(group)], userstatus: 2 };
      if (window.LANG === 'en') {
        newUser.usernameE = username;
      } else {
        newUser.usernameC = username;
      }
      this.checkExistence(mobile, email).then(ifExist => {
        if (ifExist) {
          Modal.error({
            content: i18n('user.message.user_exist')
          });
        }
        else {
          api.addUser(newUser)
            .then(result => {
              api.addUserRelation({
                relationtype: true,
                investoruser: result.data.id,
                traderuser: this.state.currentBD.manager.id
              }).then(data => {
                this.setState({ visible: false }, this.getOrgBdList)
              })
            });
        }
      })
    }
  }

  // 如果机构BD有项目并且这个项目有承做，为承做和联系人建立联系
  addRelation = investorID => {
    if (this.state.currentBD.makeUser && this.state.currentBD.proj) {
      api.addUserRelation({
        relationtype: false,
        investoruser: investorID,
        traderuser: this.state.currentBD.makeUser,
        proj: this.state.currentBD.proj.id,
      })
    }
  }

  handleAddComment = () => {
    const body = {
      orgBD: this.state.currentBD.id,
      comments: this.state.newComment,
    };
    api.addOrgBDComment(body)
      .then(data => this.setState({ newComment: '' }, this.getOrgBdList))
      .catch(handleError);
  }

  handleDeleteComment = id => {
    api.deleteOrgBDComment(id)
    .then(this.getOrgBdList)
    .catch(handleError);
  }

  render() {

    const { location } = this.props
    // const buttonStyle={textDecoration:'underline',border:'none',background:'none'}
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
    const imgStyle={width:'15px',height:'20px'}
    const columns = [
      { 
        title: i18n('timeline.project_name'), 
        key: 'proj', 
        render: (text, record) => record.proj && <Link to={'/app/projects/' + record.proj.id}>{ record.proj.projtitle }</Link>, 
        sorter: true,
      },
      { 
        title: i18n('timeline.investor'), 
        key: 'username', 
        dataIndex: 'username', 
        sorter: true,
      },
      {
        title: i18n('user.position'),
        key: 'usertitle',
        dataIndex: 'usertitle.name',
        sorter: true, 
      },
      { 
        title: i18n('org_bd.manager'), 
        key: 'manager', 
        dataIndex: 'manager.username', 
        sorter: true,
      },
      { 
        title: i18n('org_bd.status'), 
        key: 'response',
        dataIndex: 'response',
        sorter: true,
        render: text => text && this.props.orgbdres.length > 0 && this.props.orgbdres.filter(f => f.id === text)[0].name,
      },
      {
        title: "最新备注",
        key: 'bd_latest_info',
        render: (text, record) => {
          let latestComment = record.BDComments && record.BDComments.length && record.BDComments[record.BDComments.length-1].comments || null;
          return latestComment ?
            <Popover placement="leftTop" title="最新备注" content={<p style={{maxWidth: 400}}>{latestComment}</p>}>
              <div style={{color: "#428bca"}}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment }
              </div>
            </Popover>
            : "暂无";
        },
      },
      {
        title: i18n('org_bd.operation'),
        key: 'operation',
        render: (text, record) => {
          return this.isAbleToModifyStatus(record) ?
            <span>
              <button style={{ ...buttonStyle, marginRight: 4 }} size="small" onClick={this.handleModifyStatusBtnClicked.bind(this, record)}>{i18n('project.modify_status')}</button>
              <a style={{ ...buttonStyle, marginRight: 4 }} href="javascript:void(0)" onClick={this.handleOpenModal.bind(this, record)}>{i18n('remark.comment')}</a>
            </span>
            : null;
        },
      },
    ]

    const { filters, search, total, list, loading, page, pageSize, visible, id, reason } = this.state

    return (
      <LeftRightLayout location={location} title={i18n('menu.timeline_management')}>
        <div>
          <div>
            {/* <TimelineFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} /> */}

            <div style={{ marginBottom: 24, textAlign: 'right' }} className="clearfix">
              <Search
                style={{ width: 250 }}
                placeholder={[i18n('timeline.project_name'), i18n('timeline.investor'), i18n('timeline.trader')].join(' / ')}
                onSearch={this.handleSearch}
                onChange={search => this.setState({ search })}
                value={search}
              />
            </div>
            <Table
              onChange={this.handleTableChange}
              style={tableStyle}
              columns={columns} 
              dataSource={list} 
              rowKey={record=>record.id} 
              loading={loading} 
              pagination={false} 
            />

            <Pagination 
              style={paginationStyle} 
              total={total} 
              current={page} 
              pageSize={pageSize} 
              onChange={this.handlePageChange} 
              showSizeChanger 
              onShowSizeChange={this.handlePageSizeChange} 
              showQuickJumper
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />

          </div>
        </div>

        {this.state.visible ?
          <ModalModifyOrgBDStatus
            visible={this.state.visible}
            onCancel={() => this.setState({ visible: false })}
            onOk={this.handleConfirmBtnClicked}
            bd={this.state.currentBD}
          />
          : null}

        <Modal
          title={i18n('remark.comment')}
          visible={this.state.commentVisible}
          footer={null}
          onCancel={() => this.setState({ commentVisible: false, newComment: '', currentBD: null, comments: [] })}
          maskClosable={false}
        >
          <BDComments
            comments={this.state.comments}
            newComment={this.state.newComment}
            onChange={e => this.setState({ newComment: e.target.value })}
            onAdd={this.handleAddComment}
            onDelete={this.handleDeleteComment}
          />
        </Modal>

      </LeftRightLayout>
    )
  }
}

function BDComments(props) {
  const { comments, newComment, onChange, onDelete, onAdd } = props
  return (
    <div>
      <div style={{marginBottom:'16px',display:'flex',flexDirection:'row',alignItems:'center'}}>
        <Input.TextArea rows={3} value={newComment} onChange={onChange} style={{flex:1,marginRight:16}} />
        <Button onClick={onAdd} type="primary" disabled={newComment == ''}>{i18n('common.add')}</Button>
      </div>
      <div>
        {comments.length ? comments.map(comment => {
          let content = comment.comments;
          const oldStatusMatch = comment.comments.match(/之前状态(.*)$/);
          if (oldStatusMatch) {
            const oldStatus = oldStatusMatch[0];
            content = comment.comments.replace(oldStatus, `<span style="color:red">${oldStatus}</span>`);
          }
          return (
            <div key={comment.id} style={{ marginBottom: 8 }}>
              <p>
                <span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span>
                {hasPerm('BD.manageOrgBD') ?
                  <Popconfirm title={i18n('message.confirm_delete')} onConfirm={onDelete.bind(this, comment.id)}>
                    <a href="javascript:void(0)">{i18n('common.delete')}</a>
                  </Popconfirm>
                  : null}
              </p>
              <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
            </div>
          );
        }) : <p>{i18n('remark.no_comments')}</p>}
      </div>
    </div>
  )
}

function mapStateToProps(state) {
  const { orgbdres } = state.app;
  return { orgbdres };
}
export default connect(mapStateToProps)(withRouter(TimelineList));
