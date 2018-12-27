import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import moment from 'moment';
import { 
  i18n, 
  timeWithoutHour, 
  time, 
  handleError, 
  hasPerm, 
  getUserInfo,
  intersection, 
} from '../utils/util';
import * as api from '../api';
import { 
  message,
  Table,
  Button, 
  Popconfirm, 
  Pagination, 
  Modal, 
  Input, 
  Popover,
  Checkbox,
  DatePicker,
  Row,
  Tag,
  Col,
  Switch,
} from 'antd';
import { Link } from 'dva/router';
import { OrgBDFilter } from '../components/Filter';
import { Search } from '../components/Search';
import ModalAddUser from '../components/ModalAddUser';
import BDModal from '../components/BDModal';
import { getUser } from '../api';
import { 
  isLogin, 
  checkRealMobile,
} from '../utils/util';
import { PAGE_SIZE_OPTIONS } from '../constants';
import { SelectTrader } from '../components/ExtraInput';
import { SwitchButton } from '../components/SelectOrgInvestorToBD';
import OrgBDListComponent from '../components/OrgBDListComponent';
import { connect } from 'dva';
import './NewOrgBDNext.css';

var cloneObject = (obj) => JSON.parse(JSON.stringify(obj))

class H3 extends React.Component {
  render() { return <p style={{fontSize: this.props.size || '13px', fontWeight: 'bolder', marginTop: '5px', marginBottom: '10px', ...this.props.style}}>{this.props.children}</p> }
}

class NewOrgBDList extends React.Component {
  
  constructor(props) {
    super(props);

    this.orgList = {}
    this.userList = {}
    this.ids = (this.props.location.query.ids || "").split(",").map(item => parseInt(item, 10)).filter(item => !isNaN(item))
    this.projId = parseInt(this.props.location.query.projId, 10);
    this.projId = !isNaN(this.projId) ? this.projId : null;
    this.filterInvestorWithoutTrader = this.props.location.query.trader === 'true' ? true : false;
    this.filterInvestorWithoutRelatedTags = this.props.location.query.tag === 'true' ? true : false;
    this.filterOrgWithoutInvestor = this.props.location.query.investor === 'true' ? true : false;
    this.tags = (this.props.location.query.tags || "").split(",").map(item => parseInt(item, 10)).filter(item => !isNaN(item));
    this.projDetail = {}

    this.state = {
        filters: OrgBDFilter.defaultValue,
        search: null,
        page: 1,
        pageSize: this.props.location.query.ids ? this.ids.length + 1 : (getUserInfo().page || 10),
        total: 0,
        manager: null,
        list: [],
        loading: false,
        visible: false,
        currentBD: null,
        comments: [],
        newComment: '',
        status: null,
        commentVisible: false,
        selectVisible: false,
        sort:undefined,
        desc:undefined,
        source:this.props.location.query.status||0,
        expanded: [],
        selectedKeys: [],
        expirationtime: moment().add(1, 'weeks'),
        ifimportantMap: {},
        isimportant: false,
        traderList: [],
        org: null, // 为哪个机构添加投资人
        historyBDRefresh: 0,
    }

    this.allTrader = [];
    this.reqUser = {};
    this.orgUserRelation = {};
    this.reqBD = {};
  }

  disabledDate = current => current && current < moment().startOf('day');

  componentDidMount() {
    api.getProjDetail(this.projId)
      .then(result => {
        this.projDetail = result.data || {}
        this.getOrgBdList()
      })
      .catch(error => {
        this.getOrgBdList()
      })
    
    this.getAllTrader();
    this.props.dispatch({ type: 'app/getGroup' });
    this.props.dispatch({ type: 'app/getSource', payload: 'famlv' });
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    this.props.dispatch({ type: 'app/getSource', payload: 'tag' });
    this.props.dispatch({ type: 'app/getSource', payload: 'title' });
  }

  getOrgBdList = () => {
    this.setState({ loading: true, expanded: [] });
    const { page, pageSize } = this.state;
    const params = {
        page_size: 100,
        ids: this.ids
    }

    api.getOrg(params)
    .then(result => {
      let list = result.data.data
      list.forEach(item => {this.orgList[item.id] = item})
      this.setState({
        list: list.map(item => ({
          id: `${item.id}-${this.projId}`,
          org: item, 
          proj: {id: this.projId, name: this.projDetail.projtitleC},
          loaded: false,
          items: []
        })),
        total: result.data.count,
        loading: false,
        expanded: list.map(item => `${item.id}-${this.projId}`),
      }, 
      () => this.loadOrgBDListDetail(this.state.list.map(m => m.org.id))
    );
    })
  }

  loadOrgBDListDetail = async list => {
    const reqUser = await api.getUser({
      starmobile: true,
      org: list, 
      onjob: true, 
      page_size: 10000
    });
    console.log('reqUser', reqUser);
    this.reqUser = reqUser;

    const orgUser = reqUser.data.data;
    const orgUserRelation = await api.getUserRelation({
      investoruser: orgUser.map(m => m.id),
      page_size: 100000,
    });
    console.log('orgUserRelation', orgUserRelation);
    this.orgUserRelation = orgUserRelation;

    const reqBD = await api.getOrgBdList({ org: list, proj: this.projId || "none" });
    console.log('reqBD', reqBD);
    this.reqBD = reqBD;

    for (let index = 0; index < list.length; index++) {
      const element = list[index];
      await this.loadDataForSingleOrg(element);
    }
  }

  getUser = org => {
    const users = this.reqUser.data.data.filter(f => f.org && f.org.id === org);
    const result = { data: {
      count: users.length,
      data: users
    }};
    // echo('getUserResult', org, result);
    return result;
  }

  getUserRelation = investorUserArr => {
    const userRelation = this.orgUserRelation.data.data.filter(f => investorUserArr.includes(f.investoruser.id));
    const result = {
      data: {
        count: userRelation.length,
        data: userRelation
      }
    }
    // echo('getUserRelation', investorUserArr, result);
    return result;
  }

  getOrgBD = org => {
    const bdList = this.reqBD.data.data.filter(f => f.org.id === org);
    const result = {
      data: {
        count: bdList.length,
        data: bdList
      }
    }
    // echo('getOrgBD', org, result);
    return result;
  }

  loadDataForSingleOrg = async org => {

    let dataForSingleOrg;

    // 首先加载机构的所有符合要求的投资人
    // const reqUser = await api.getUser({starmobile: true, org: [org], onjob: true, page_size: 1000});
    const reqUser = this.getUser(org);
    if (reqUser.data.count === 0) {
      // 如果这个机构不存在符合要求的投资人，可以创建一条暂无投资人的BD
      dataForSingleOrg = [{ key: `null-null-${org}`, org: { id: org } }];
    } else {
      const orgUser = reqUser.data.data;

      //获取投资人的交易师
      // const orgUserRelation = await api.getUserRelation({
      //   investoruser: orgUser.map(m => m.id),
      //   page_size: 1000,
      // });
      const orgUserRelation = this.getUserRelation(orgUser.map(m => m.id));
      orgUser.forEach(element => {
        const relations = orgUserRelation.data.data.filter(f => f.investoruser.id === element.id);
        element.traders = relations.map(m => ({
          label: m.traderuser.username,
          value: m.traderuser.id,
          onjob: m.traderuser.onjob,
          familiar: m.familiar
        }))
      });

      const reqBD = await api.getOrgBdList({ org, proj: this.projId || "none" });
      // const reqBD = this.getOrgBD(org);
      // 已经BD过的投资人
      const regBDUser = reqBD.data.data.map(m => ({
        ...orgUser.find(f => f.id === m.bduser),
        bd: m,
        key: `${m.id}-${m.bduser}`
      }));
      // 未BD过的投资人
      const unBDUser = orgUser.filter(f => !reqBD.data.data.map(m => m.bduser).includes(f.id))
        .map(m => ({ ...m, bd: null, key: `null-${m.id}` }));

      dataForSingleOrg = regBDUser.concat(unBDUser);
    }

    let newList = this.state.list.map(item => 
      item.id === `${org}-${this.projId}` ?
        {...item, items: dataForSingleOrg, loaded: true} :
        item
    );

    echo(newList);
    if (this.filterOrgWithoutInvestor) {
      newList = newList.filter(f => !(f.items.length === 1 && f.items[0].key.startsWith('null-null')));
    }

    if (this.filterInvestorWithoutTrader) {
      newList = newList.map(item => {
        const newItems = item.items.filter(f => !(f.traders && f.traders.length === 0));
        return {...item, items: newItems};
      });
    }
    if (this.filterInvestorWithoutRelatedTags && this.tags.length > 0) {
      newList = newList.map(item => {
        const newItems = item.items.filter(f => !(f.tags && intersection(f.tags, this.tags).length === 0));
        return { ...item, items: newItems };
      });
    }
    newList = newList.filter(f => !(f.loaded && f.items.length === 0));
    this.setState({ list: newList }); 

    return dataForSingleOrg;
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getOrgBdList
    );
  }

  content(record) {
    const user = record.bd;
    const photourl=user.userinfo&&user.userinfo.photourl
    const tags=user.userinfo&&user.userinfo.tags ? user.userinfo.tags.map(item=>item.name).join(',') :''
    const comments = user.BDComments || [];
    const orgbdres = user.response && this.props.orgbdres.filter(f => f.id === user.response)[0].name;
    const wechat = user.userinfo && user.userinfo.wechat;
    return <div style={{minWidth: 250}}>
          <Row style={{textAlign:'center',margin:'10px 0'}}>
            {photourl ? <img src={photourl} style={{width:'50px',height:'50px', borderRadius:'50px'}}/>:'暂无头像'}
          </Row>
          {/* <SimpleLine title={"项目名称"} value={user.proj && user.proj.projtitle || "暂无"} /> */}
          <SimpleLine title={"BD状态"} value={orgbdres || '暂无'} />
          <SimpleLine title={"到期日期"} value={user.expirationtime ? timeWithoutHour(user.expirationtime + user.timezone) : "未设定"} />
          <SimpleLine title={"负责人"} value={user.manager.username || "暂无"} />
          <SimpleLine title={"创建人"} value={user.createuser.username || "暂无"} />
          {/* <Row style={{ lineHeight: '24px', borderBottom: '1px dashed #ccc' }}>
            <Col span={12}>{i18n('user.trader')}:</Col>
            <Col span={12} style={{wordBreak: 'break-all'}}>
            <Trader investor={user.bduser} />
            </Col>
          </Row> */}
          {/* <SimpleLine title={i18n('user.tags')} value={tags||'暂无'} /> */}

          {/* { wechat ? 
          <SimpleLine title={i18n('user.wechat')} value={wechat} />
          : null } */}

          {/* <Row style={{ lineHeight: '24px' }}>
            <Col span={12}>{i18n('remark.remark')}:</Col>
            <Col span={12} style={{wordWrap: 'break-word'}}>
            {comments.length>0 ? comments.map(item => <p key={item.id} >{item.comments}</p>) :'暂无'}
            </Col>
          </Row> */}
           </div>
  }

  onExpand(expanded, record) {
    let currentId = record.id

    let newExpanded = this.state.expanded
    let expandIndex = newExpanded.indexOf(currentId)

    if (expandIndex < 0) {
      newExpanded.push(currentId)
      this.loadDataForSingleOrg(record.org.id, record.proj.id)
    } else {
      newExpanded.splice(expandIndex, 1)
    }

    this.setState({ expanded: newExpanded })
  }

  handleMore(record) {
    // let key = Math.random()
    // let list = this.state.list.map(item => 
    //   item.id === `${record.org.id}-${record.proj.id}` ?
    //     {...item, items: item.items.concat({key, new: true, isimportant: false, orgUser: null, trader: null, org: record.org, proj: record.proj, expirationtime: null})} :
    //     item
    // )
    // this.setState({ list })
  }

  handleLoadTrader = investorUserRelation => {
    this.investorTrader.push(investorUserRelation);
    const listWithInvestor = this.state.list.filter(f => f.id !== null);
    if (this.investorTrader.length === listWithInvestor.length) {
      this.props.dispatch({
        type: 'app/setSortedTrader',
        payload: this.investorTrader, 
      }); 
    }
  }

  loadLabelByValue(type, value) {
    if (Array.isArray(value) && this.props.tag.length > 0) {
      return value.map(m => this.props[type].filter(f => f.id === m)[0].name).join(' / ');
    } else if (typeof value === 'number') {
      return this.props[type].filter(f => f.id === value)[0].name;
    }
  }

  handleSwitchChange = (record, ifimportant) => {
    let id=record.id
    this.setState({ifimportantMap:{...this.state.ifimportantMap,[id]:ifimportant}})
    const userList = this.props.value
    const index = _.findIndex(userList, function(item) {
      return item.investor+"_"+item.org == id
    })
    if (index > -1) {
      userList[index].isimportant=ifimportant
      this.props.onChange(userList)
    }
  }

  handleDeleteUser(userKey) {
    this.setState({ selectedKeys: this.state.selectedKeys.filter(key => key !== userKey) })
  }

  // createOrgBD = () => {
  //   this.setState({ selectVisible: false });
  //   Promise.all(this.state.selectedKeys.map(userKey => {
  //     let user = this.userList[userKey]
  //     let body = {
  //       bduser: userKey,
  //       manager: this.state.manager,
  //       org: user.org.id,
  //       proj: this.projId,
  //       isimportant:this.state.ifimportantMap[userKey] || false,
  //       bd_status: 1,
  //       expirationtime: this.state.expirationtime ? this.state.expirationtime.format('YYYY-MM-DDTHH:mm:ss') : null
  //     };
  //     return api.addOrgBD(body);
  //   }))
  //     .then(result => {
  //       Modal.confirm({
  //           title: i18n('timeline.message.create_success_title'),
  //           content: i18n('create_orgbd_success'),
  //           okText:"继续创建BD",
  //           cancelText:"返回BD列表",
  //           onOk: () => { this.props.history.push({ pathname: '/app/orgbd/add' }) },
  //           onCancel: () => { this.props.history.push({ pathname: '/app/org/bd' }) }
  //         })
  //     })
  //     .catch(error => {
  //       Modal.error({
  //         content: error.message
  //       });
  //     });
  // }
 
  // handleSelectUser = () => {
  //   this.setState({ selectVisible: true });
  // }

  handleCreateBD = user => {
    this.activeUser = user;
    this.setState({ selectVisible: true });
    // 在为投资人分配IR时默认选中熟悉程度最高的交易师
    this.setDefaultTrader();
  }

  setDefaultTrader = () => {
    const params = {
      investoruser: this.activeUser.id,
      page_size: 1000,
    };
    api.getUserRelation(params)
      .then(result => {
        const newTraderList = [];
        result.data.data.forEach(element => {
          const familiar = this.props.famlv.filter(f => f.id === element.familiar)[0].score;
          const trader = { ...this.allTrader.filter(f => f.id === element.traderuser.id)[0]};
          trader.username += '(' + familiar + '分)';
          trader.familiar = familiar;
          newTraderList.push(trader);
        });
        this.allTrader.forEach(element => {
          if (!newTraderList.map(m => m.id).includes(element.id)) {
            newTraderList.push({ ...element, familiar: -1 });
          }
        });

        // 按照熟悉程度排序
        newTraderList.sort(function(a, b) {
          return b.familiar - a.familiar;
        });

        this.setState({ traderList: newTraderList, manager: newTraderList[0].id.toString() });
      })
  }

  getAllTrader() {
    api.queryUserGroup({ type: 'trader' })
    .then(data => api.getUser({ groups: data.data.data.map(m => m.id), userstatus: 2, page_size: 1000 }))
    .then(data => {
      this.allTrader = data.data.data; 
      this.setState({ traderList: this.allTrader });
    })
  }

  createOrgBD = () => {
    const user = this.activeUser;
    const manager = this.state.traderList.filter(f => f.id === parseInt(this.state.manager, 10))[0];
    this.setState({ selectVisible: false });
    let body = {
      bduser: user.id,
      manager: this.state.manager,
      org: user.org.id,
      proj: this.projId,
      isimportant: this.state.isimportant,
      bd_status: 1,
      expirationtime: this.state.expirationtime ? this.state.expirationtime.format('YYYY-MM-DDTHH:mm:ss') : null
    };
    api.addOrgBD(body)
      .then(result => {
        Modal.success({
          title: '机构BD创建成功',
          content: `已经成功地为 ${user.org.orgfullname || user.org.orgname} 的 ${user.username} 创建了机构BD任务，该任务的交易师为 ${manager.username.split('(')[0]}`,
        });
        this.setState({ manager: null, expirationtime: moment().add(1, 'weeks'), isimportant: false, historyBDRefresh: this.state.historyBDRefresh + 1 });
        this.loadDataForSingleOrg(user.org.id);
      })
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading, source, managers, expanded } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}
    const imgStyle={width:'15px',height:'20px'}
    const importantImg={height:'10px',width:'10px',marginTop:'-15px',marginLeft:'-5px'}
    const columns = [
        {title: i18n('org_bd.org'), render: (text, record) => {
          let org = record.org
          if (!org) return "无效机构"
          let selectedUsers = this.state.selectedKeys.filter(userid=>this.userList[userid].org.id === org.id)
          return <div>
                  {record.org.orgname}
                  {(selectedUsers.length ? <Tag color="green" style={{marginLeft: 15}}>{`已选 ${selectedUsers.length} 人`}</Tag> : null)}
                  <a style={{ marginLeft: 10 }} onClick={() => this.setState({ org: record.org })}>添加投资人</a>
                </div>
        }, key:'org', sorter:false},
        // {title: i18n('org_bd.project_name'), dataIndex: 'proj.projtitle', key:'proj', sorter:true, render: (text, record) => record.proj.name || '暂无'},
      ]

    const expandedRowRender = (record) => {
      const columns = [
        {
          title: i18n('user.name'),
          key: 'username',
          dataIndex: 'username',
          render: (text, record) => {
            // 可以新建的暂无联系人的BD
            if (!record.username) {
              return '暂无投资人';
            }
            // 加载已经创建的BD
            if (record.bd) {
              return (
                <Popover placement="topLeft" content={this.content(record)}>
                  {record.id ?
                    <a target="_blank" href={'/app/user/' + record.id}>
                      <span style={{ color: '#428BCA' }}>{record.username}</span>
                    </a>
                    : <span style={{ color: '#428BCA' }}>{record.username}</span>}
                </Popover>
              );
            }
            // 可以新建的有联系人的BD
            return (
              <a target="_blank" href={'/app/user/' + record.id}>
                <span style={{ color: '#428BCA' }}>{record.username}</span>
              </a>
            );
          },
        },
        // { title: i18n('organization.org'), key: 'orgname', dataIndex: 'org.orgname' },
        // { title: i18n('user.position'), key: 'title', dataIndex: 'title', render: text => this.loadLabelByValue('title', text) || '暂无' },
        {
          title: i18n('mobile'), 
          key: 'mobile', 
          dataIndex: 'mobile', 
          render: text => !text || !checkRealMobile(text) ? '暂无' : text,
        },
        { 
          title: i18n('account.email'), 
          key: 'email', 
          dataIndex: 'email',
          render: text => !text || text.includes('@investarget') ? '暂无' : text,
        },
        {
          title: i18n('user.position'),
          key: 'position',
          dataIndex: 'title',
          render: text => text && this.props.title.filter(f => f.id === text)[0].name,
        },
        { 
          title: '标签', 
          key: 'tags', 
          dataIndex: 'tags', 
          render: (text, record) => {
            let tags;
            if (record.tags) {
              tags = record.tags.map(m => {
                const tagObj = this.props.tag.filter(f => f.id === m)[0];
                return tagObj.name;
              }).join('、');
            }
            return tags ? <div style={{ width: 200 }}>{tags}</div> : '暂无';
          },
        },
        { title: i18n('user.trader'), key: 'transaction', render: (text, record) => record.id ? <Trader traders={record.traders} /> : '暂无' }

      ]
      if(this.props.source!="meetingbd"){
        columns.push({title:i18n('org_bd.important') + '/操作', render:(text,record)=>{
          if (!record.bd) return <Button onClick={this.handleCreateBD.bind(this, record)}>创建BD</Button>
          else return <div>{record.bd.isimportant ? "是" : "否"}</div>
        }})
      }

      let allKeys = record.items.map(user=>user.id)
      const rowSelection = {
        selectedRowKeys: this.state.selectedKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          let selected = this.state.selectedKeys
          selected = selected.filter(key => !allKeys.includes(key))
          selected = selected.concat(selectedRowKeys.filter(key => !selected.includes(key)))
          this.setState({ selectedKeys: selected })
        },
        getCheckboxProps: record => ({
          disabled: Boolean(record.bd),
          name: record.name,
        }),
      };

      return (
        <div>
          <Table
            // showHeader={false}
            columns={columns}
            dataSource={record.items}
            rowKey={record=>record.key}
            pagination={false}
            loading={!record.loaded}
            size={"small"}
            // rowSelection={rowSelection}
          />
          {/* <Button 
            style={{float: 'right', margin: '15px 15px 0 0'}} 
            onClick={this.handleMore.bind(this, record)}
          >{"展示更多"}</Button> */}
        </div>

      );
    }

    return (
      <LeftRightLayout 
        location={this.props.location} 
        breadcrumb={' > ' + i18n('menu.organization_bd') + ' > ' + i18n('project.create_org_bd') + ` > ${this.projDetail.projtitleC || "暂无项目"}`}
        title={i18n('menu.bd_management')}
        action={{ name: '返回机构BD', link: '/app/org/bd' }}
      >
      {source!=0 ? <BDModal source={sourłe} element='org'/> : null}   

        {this.projId ?
          <div>
            <H3 size="1.2em">○ 该项目的历史BD</H3>
            <OrgBDListComponent refresh={this.state.historyBDRefresh} location={this.props.location} pageSize={5} pagination />
          </div>
        : null }

        <H3 size="1.2em" style={{marginTop: "2em"}}>○ 选择机构列表</H3>
        <Table
          className="new-org-db-style"
          onChange={this.handleTableChange}
          columns={columns}
          expandedRowRender={expandedRowRender}
          // expandRowByClick
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          onExpand={this.onExpand.bind(this)}
          expandedRowKeys={expanded}
          pagination={false}
          size={"middle"}
        />

        {/* <div style={{ marginTop: 10, marginBottom: 10 }}>
          {this.state.selectedKeys.map(user => 
            <Tag 
              key={this.userList[user].id} 
              closable 
              style={{ marginBottom: 8 }} 
              onClose={this.handleDeleteUser.bind(this, user)}
            >
              {`${this.userList[user].org.orgfullname || "无机构"} - ${this.userList[user].username}`}
            </Tag>
          )}
        </div> */}

        {/* <div style={{textAlign: 'right', padding: '0 16px', marginTop: 10 }}>
          <Button disabled={this.state.selectedKeys.length === 0} type="primary" onClick={this.handleSelectUser.bind(this)}>{i18n('common.create')}</Button>
        </div> */}

        <Modal
          title="创建BD"
          visible={this.state.selectVisible}
          footer={null}
          onCancel={() => this.setState({ selectVisible: false, expirationtime: moment().add(1, 'weeks'), })}
          closable={true}
          maskClosable={false}
        >
          <div style={{marginLeft: '15px'}}>
            <H3>1.选择交易师</H3>
            <SelectTrader
              style={{ width: 300 }}
              mode="single"
              data={this.state.traderList}
              value={this.state.manager}
              onChange={manager => this.setState({ manager })} />
            
            <H3>2.选择过期时间</H3>
            <DatePicker 
                  style={{ marginBottom: '15px' }}
                  placeholder="过期时间"
                  disabledDate={this.disabledDate}
                  // defaultValue={moment()}
                  showToday={false}
                  shape="circle"
                  value={this.state.expirationtime}
                  renderExtraFooter={() => {
                    return <div>
                      <Button type="dashed" size="small" onClick={()=>{this.setState({expirationtime: moment()})}}>Now</Button>
                      &nbsp;&nbsp;
                      <Button type="dashed" size="small" onClick={()=>{this.setState({expirationtime: moment().add(1, 'weeks')})}}>Week</Button>
                      &nbsp;&nbsp;
                      <Button type="dashed" size="small" onClick={()=>{this.setState({expirationtime: moment().add(1, 'months')})}}>Month</Button>
                    </div>
                  }}
                  onChange={v=>{this.setState({expirationtime: v})}}
                />
              <span style={{ marginLeft: 40 }}>重点BD</span>
              <Switch
                defaultChecked={this.state.isimportant}
                onChange={checked => this.setState({ isimportant: checked })}
              />

            <Button style={{ float: "right", marginRight: 30 }} disabled={this.state.manager === null} type="primary" onClick={this.createOrgBD.bind(this)}>{i18n('common.confirm')}</Button>
          </div>
        </Modal>

        {this.state.org ?
        <ModalAddUser
          onCancel={() => {
            this.loadDataForSingleOrg(this.state.org.id);
            this.setState({ org: null });
          }}
          org={this.state.org}
        />
        :null}

      </LeftRightLayout>
    );
  }
}

function mapStateToProps(state) {
  const { famlv, orgbdres, tag, title } = state.app;
  return { famlv, orgbdres, tag, title };
}
export default connect(mapStateToProps)(NewOrgBDList);

export class Trader extends React.Component {
  state = {
    list: this.props.traders || [], 
  }
  componentDidMount() {
    // if (this.props.investor === null) return;
    // const param = { investoruser: this.props.investor}
    // // api.queryUserGroup({ type: 'investor' }).then(data => {
    // // this.investorGroupIds = data.data.data.map(item => item.id);
    // // })
    // api.getUserRelation(param).then(result => {
    //   const data = result.data.data.sort((a, b) => Number(b.relationtype) - Number(a.relationtype))
    //   const list = []
    //   data.forEach(item => {
    //     const trader = item.traderuser
    //     if (trader) {
    //       list.push({ label: trader.username, value: trader.id, onjob: trader.onjob, familiar: item.familiar });
    //     }
    //     this.setState({ list });
    //   })
    // }, error => {
    //   this.props.dispatch({
    //     type: 'app/findError',
    //     payload: error
    //   })
    // })
  }
  render () {
    return <span>
      { this.state.list.length > 0 ? 
        this.state.list.map(m => <span key={m.value}>
          <span>{m.label}</span>
          <span style={{ color: 'red' }}>
            ({this.props.famlv.filter(f => f.id === m.familiar)[0].score})
          </span>
        </span>)
      : '暂无' }
    </span>
  }
}
Trader = connect(mapStateToProps)(Trader);

export function SimpleLine(props) {
  return (
    <Row style={{ lineHeight: '24px',borderBottom: '1px dashed #ccc' }}>
      <Col span={12}>{props.title + '：'}</Col>
      <Col span={12} style={{wordWrap: 'break-word'}}>{props.value}</Col>
    </Row>
  );
}
