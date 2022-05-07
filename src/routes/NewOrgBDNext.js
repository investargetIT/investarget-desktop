import { DeleteOutlined } from '@ant-design/icons';
import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import moment from 'moment';
import { 
  i18n, 
  timeWithoutHour, 
  handleError, 
  hasPerm, 
  requestAllData,
  getURLParamValue,
  getUserInfo,
} from '../utils/util';
import * as api from '../api';
import { 
  Table,
  Button, 
  Modal, 
  Popover,
  Row,
  Tag,
  Col,
  Popconfirm,
  Pagination,
  Typography,
} from 'antd';
import { OrgBDFilter } from '../components/Filter';
import { Search } from '../components/Search';
import BDModal from '../components/BDModal';
import { 
  checkRealMobile,
  getCurrentUser,
} from '../utils/util';
import { SelectTrader } from '../components/ExtraInput';
import { connect } from 'dva';
import './NewOrgBDNext.css';
import { PAGE_SIZE_OPTIONS } from '../constants';

const { Text } = Typography;

const paginationStyle = { textAlign: 'right', marginTop: window.innerWidth < 1200 ? 10 : undefined };

class H3 extends React.Component {
  render() { return <p style={{fontSize: this.props.size || '13px', fontWeight: 'bolder', marginTop: '5px', marginBottom: '10px', ...this.props.style}}>{this.props.children}</p> }
}

function tableToExcel(table, worksheetName) {
  var uri = 'data:application/vnd.ms-excel;base64,'
  var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
  var base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); }
  var format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }

  var ctx = { worksheet: worksheetName, table: table.outerHTML }
  var href = uri + base64(format(template, ctx))
  return href
}

function replaceUrlParam(url, paramName, paramValue) {
    if (paramValue == null) {
        paramValue = '';
    }
    var pattern = new RegExp('\\b('+paramName+'=).*?(&|#|$)');
    if (url.search(pattern)>=0) {
        return url.replace(pattern,'$1' + paramValue + '$2');
    }
    url = url.replace(/[?#]$/,'');
    return url + (url.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue;
}

class NewOrgBDList extends React.Component {
  
  constructor(props) {
    super(props);

    const projId = getURLParamValue(props, 'projId');
    const tags = getURLParamValue(props, 'tags');

    this.orgList = {}
    this.userList = {}
    this.projId = parseInt(projId, 10);
    this.projId = !isNaN(this.projId) ? this.projId : null;
    this.tags = (tags || "").split(",").map(item => parseInt(item, 10)).filter(item => !isNaN(item));
    this.projDetail = {}

    // 有以下这个参数说明用户是通过导出Excel表中的链接打开的页面，需要直接弹出为对应投资人创建BD的模态框
    this.activeUserKey = getURLParamValue(props, 'activeUserKey');

    this.state = {
        filters: OrgBDFilter.defaultValue,
        search: '',
        page: 1,
        pageSize: getUserInfo().page || 10,
        total: 0,
        manager: null,
        originalList: [],
        list: [],
        allLoaded: false,
        // 导出excel的完整数据列表
        exportList: [],
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
        source: getURLParamValue(props, 'status') || 0,
        expanded: [],
        selectedKeys: [],
        expirationtime: moment().add(1, 'weeks'),
        ifimportantMap: {},
        isimportant: 0,
        traderList: [],
        projTradersIds: [], // 项目承揽承做的 ID 数组
        activeUser: null, // 点击创建BD时对应的投资人

        // 从Excel链接进来的创建机构看板相关状态
        displayCreateBDModalFromExcel: false,
        activeUserFromExcel: null,
    }

    this.allTrader = [];
    this.investorGroup = [];
    // score >= 7 的职位列表
    this.highScoreTitles = [];
  }

  disabledDate = current => current && current < moment().startOf('day');

  componentDidMount() {
    this.props.dispatch({ type: 'app/getGroup' });
    this.props.dispatch({ type: 'app/getSource', payload: 'famlv' });
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    this.props.dispatch({ type: 'app/getSource', payload: 'tag' });
    this.props.dispatch({ type: 'app/getSource', payload: 'title' });

    this.getAllTrader().then(this.setDefaultTraderForExcelIfNecessary);
    api.getProjDetail(this.projId)
      .then(result => {
        this.projDetail = result.data || {}
        
        const { projTraders } = result.data;
        this.checkIfExistBDFromExcel(projTraders);
        if (projTraders) {
          this.setState({
            projTradersIds: projTraders.filter(f => f.user).map(m => m.user.id),
          });
        }

        this.getOrgBdList()
      })
      .catch(error => {
        this.getOrgBdList()
      })
    this.checkCreateBDFromExcel();
  }

  checkIfExistBDFromExcel = async projTraders => {
    if (!this.activeUserKey) return;
    const splitStrArr = this.activeUserKey.split('-');
    let activeUserID = splitStrArr[1];
    let activeOrgID = null;
    if (activeUserID === 'null') {
      activeOrgID = splitStrArr[2];
      activeUserID = null;
    }
    let projTradersIds = [];
    if (projTraders) {
      projTradersIds = projTraders.filter(f => f.user).map(m => m.user.id);
    }
    const params = { proj: this.projId || "none" };
    if (!hasPerm('BD.manageOrgBD') && !projTradersIds.includes(getCurrentUser())) {
      params.manager = getCurrentUser();
    }
    if (activeUserID) {
      params.bduser = activeUserID;
    }
    if (activeOrgID) {
      params.org = activeOrgID;
    }
    const reqBD = await api.getOrgBdList(params);
    const { count } = reqBD.data;
    if (count === 0) {
      // 说明已经不存在相关的机构看板，显示弹出框
      this.setState({ displayCreateBDModalFromExcel: true });
    }
  }

  checkCreateBDFromExcel = async () => {
    if (!this.activeUserKey) return;
    const splitStrArr = this.activeUserKey.split('-');
    const activeUserID = splitStrArr[1];
    if (activeUserID !== 'null') {
      const reqUserInfo = await api.getUserInfo(activeUserID);
      this.setState({ activeUserFromExcel: reqUserInfo.data });
    } else {
      // 暂无投资人
      const activeUserOrgID = splitStrArr[2];
      const reqOrgInfo = await api.getOrgDetailLang(activeUserOrgID);
      const { data: org } = reqOrgInfo;
      this.setState({ activeUserFromExcel: { org } });
    }
  }

  setDefaultTraderForExcelIfNecessary = () => {
    if (!this.activeUserKey || !this.state.displayCreateBDModalFromExcel) return;
    const splitStrArr = this.activeUserKey.split('-');
    const activeUserID = splitStrArr[1];
    if (activeUserID !== 'null') {
      this.setDefaultTrader(activeUserID);
    } else {
      // 暂无投资人的机构看板设置默认交易师
      this.setState({ traderList: this.allTrader, manager: this.allTrader[0].id.toString() });
    }
  }

  getOrgBdList = async () => {
    try {
      this.setState({ loading: true, expanded: [] });
      this.highScoreTitles = this.props.title.filter(({ score }) => score >= 7).map(({ id }) => id);
      const userResult = await api.queryUserGroup({ type: 'investor' })
      this.investorGroup = userResult.data.data.map(item => item.id);
      const params = {
        page_index: 1,
        tags: this.tags,
      }
      const orgResult = await requestAllData(api.searchOrg, params, 100);
      let list = orgResult.data.data
      list.forEach(item => {this.orgList[item.id] = item})
      list = list.map(item => ({
        id: `${item.id}-${this.projId}`,
        org: item, 
        proj: {id: this.projId, name: this.projDetail.projtitleC},
        loaded: false,
        items: []
      }));
      this.setState(
        {
          list,
          total: orgResult.data.count,
          loading: false,
          expanded: list.map(item => item.id),
        }, 
        () => this.loadOrgBDListDetail(this.state.list.map(m => m.org))
      );
    } catch (error) {
      handleError(error);
      this.setState({
        loading: false,
        list: [],
        total: 0,
        expanded: [],
      });
    }
  }

  loadOrgBDListDetail = async list => {
    for (let index = 0; index < list.length; index++) {
      const element = list[index];
      await this.loadDataForSingleOrg(element, true);
    }
  }

  loadDataForSingleOrg = async (orgDetail, initialLoad) => {

    const { id: org, orgname, orgfullname } = orgDetail;
    let dataForSingleOrg = [];

    // 首先加载机构的所有符合要求的投资人
    let reqUser = await requestAllData(api.getUser, {
      starmobile: true,
      org: [org],
      onjob: true,
      groups: this.investorGroup,
      title: this.highScoreTitles.join(','),
      tags: this.tags.join(','),
    }, 100);
    if (reqUser.data.count === 0) {
      reqUser = await requestAllData(api.getUser, {
        starmobile: true,
        org: [org],
        onjob: true,
        groups: this.investorGroup,
        tags: this.tags.join(','),
      }, 100);
    }
    if (reqUser.data.count === 0) {
      dataForSingleOrg = [];
    } else {
      const orgUser = reqUser.data.data;

      //获取投资人的交易师
      orgUser.forEach(element => {
        const relations = element.trader_relations == null ? [] : element.trader_relations;
        element.traders = relations.map(m => ({
          label: m.traderuser.username,
          value: m.traderuser.id,
          onjob: m.traderuser.onjob,
          familiar: m.familiar
        }))
      });
      dataForSingleOrg = [...orgUser];

      // const params = { org, proj: this.projId || "none" };
      // if (!hasPerm('BD.manageOrgBD') && !this.state.projTradersIds.includes(getCurrentUser())) {
      //   params.manager = getCurrentUser();
      // }
      // const reqBD = await api.getOrgBdList(params);
      // // 已经BD过的投资人
      // const regBDUser = reqBD.data.data.map(m => ({
      //   ...orgUser.find(f => f.id === m.bduser),
      //   bd: m,
      //   key: `${m.id}-${m.bduser}`
      // }));
      // // 未BD过的投资人
      // const unBDUser = orgUser.filter(f => !reqBD.data.data.map(m => m.bduser).includes(f.id))
      //   .map(m => ({ ...m, bd: null, key: `null-${m.id}` }));

      // dataForSingleOrg = regBDUser.concat(unBDUser);

      // 过滤掉重复的投资人
      dataForSingleOrg = dataForSingleOrg.filter((f, pos, arr) => arr.map(m => m.id).indexOf(f.id) === pos);
    }

    let newList = this.state.list.map(item => 
      item.id === `${org}-${this.projId}` ?
        {...item, items: dataForSingleOrg, loaded: true} :
        item
    );

    newList = newList.filter(f => !(f.loaded && f.items.length === 0));
    this.setState({
      list: newList,
      originalList: [...newList],
      expanded: newList.map(item => item.id),
      allLoaded: newList.every(({ loaded }) => loaded),
    });

    return dataForSingleOrg;
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
          <SimpleLine title={"BD状态"} value={orgbdres || '暂无'} />
          <SimpleLine title={"到期日期"} value={user.expirationtime ? timeWithoutHour(user.expirationtime + user.timezone) : "未设定"} />
          <SimpleLine title={"负责人"} value={user.manager.username || "暂无"} />
          <SimpleLine title={"创建人"} value={user.createuser.username || "暂无"} />
           </div>
  }

  onExpand(expanded, record) {
    let currentId = record.id

    let newExpanded = this.state.expanded
    let expandIndex = newExpanded.indexOf(currentId)

    if (expandIndex < 0) {
      newExpanded.push(currentId)
    } else {
      newExpanded.splice(expandIndex, 1)
    }

    this.setState({ expanded: newExpanded })
  }
  handleCreateBD = user => {
    this.setState({ selectVisible: true, activeUser: user });
    if (user.id) {
      // 在为投资人分配IR时默认选中熟悉程度最高的交易师
      this.setDefaultTrader(user.id);
    } else {
      this.setState({ traderList: this.allTrader, manager: this.allTrader[0].id.toString() });
    }
  }

  setDefaultTrader = activeInvestorID => {
    const params = {
      investoruser: activeInvestorID,
    };
    requestAllData(api.getUserRelation, params, 100)
      .then(result => {
        const newTraderList = [];
        result.data.data.forEach(element => {
          const familiar = this.props.famlv.filter(f => f.id === element.familiar)[0].score;
          // 由于#274，交易师列表并不一定包含所有交易师，所以这里要加上判断条件以免报错
          if (this.allTrader.filter(f => f.id === element.traderuser.id).length > 0) {
            const trader = { ...this.allTrader.filter(f => f.id === element.traderuser.id)[0] };
            trader.username += '(' + familiar + '分)';
            trader.familiar = familiar;
            newTraderList.push(trader);
          }
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

  getAllTrader = async () => {
    const reqUserGroup = await api.queryUserGroup({ type: 'trader' });
    const data = await requestAllData(api.getUser, { 
      groups: reqUserGroup.data.data.map(m => m.id), 
      userstatus: 2, 
      page_size: 100, 
    }, 100);
    this.allTrader = data.data.data; 
    this.setState({ traderList: this.allTrader });
  }

  createOrgBD = () => {
    const user = this.state.activeUser;
    const manager = this.state.traderList.filter(f => f.id === parseInt(this.state.manager, 10))[0];
    this.setState({ selectVisible: false });
    let body = {
      bduser: user.id,
      manager: this.state.manager,
      org: user.org.id,
      proj: this.projId,
      // isimportant: this.state.isimportant,
      bd_status: 1,
      expirationtime: this.state.expirationtime ? this.state.expirationtime.format('YYYY-MM-DDTHH:mm:ss') : null
    };
    api.getUserSession()
      .then(() => api.addOrgBD(body))
      .then(result => {
        Modal.success({
          title: '机构看板创建成功',
          content: `已经成功地为 ${user.org.orgfullname || user.org.orgname} ${user.username ? ` 的 ${user.username}` : ''} 创建了机构看板任务，该任务的交易师为 ${manager.username.split('(')[0]}`,
        });
        this.setState({ manager: null, expirationtime: moment().add(1, 'weeks'), isimportant: 0 });
        this.loadDataForSingleOrg(user.org);
      })
      .catch(handleError);
  }

  createOrgBDFromExcel = () => {
    const user = this.state.activeUserFromExcel;
    const manager = this.state.traderList.filter(f => f.id === parseInt(this.state.manager, 10))[0];
    this.setState({ displayCreateBDModalFromExcel: false });
    let body = {
      bduser: user.id,
      manager: this.state.manager,
      org: user.org.id,
      proj: this.projId,
      bd_status: 1,
      expirationtime: this.state.expirationtime ? this.state.expirationtime.format('YYYY-MM-DDTHH:mm:ss') : null
    };
    api.getUserSession()
      .then(() => api.addOrgBD(body))
      .then(() => {
        Modal.success({
          title: '机构看板创建成功',
          content: `已经成功地为 ${user.org.orgfullname || user.org.orgname} ${user.username ? ` 的 ${user.username}` : ''} 创建了机构看板任务，该任务的交易师为 ${manager.username.split('(')[0]}`,
        });
        this.setState({ manager: null, expirationtime: moment().add(1, 'weeks'), isimportant: 0 });
        this.loadDataForSingleOrg(user.org);
      })
      .catch(handleError);
  }

  handleSearch = async () => {
    if (!this.state.search) {
      const list = this.state.originalList;
      this.setState({
        page: 1,
        list,
        expanded: list.map(item => item.id),
      });
      return;
    }

    try {
      this.setState({ loading: true });
      const reqSearch = await requestAllData(api.getUser, { org: this.ids, search: this.state.search }, 100);
      this.setState({ loading: false });
      const searchResult = reqSearch.data.data.map(m => m.username);
      let newList = this.state.originalList.filter(f1 => 
        f1.items.filter(f2 => searchResult.includes(f2.username)).length > 0
      );
      newList = newList.map(m => 
        ({
          ...m,
          items: m.items.filter(f => searchResult.includes(f.username)) 
        })
      );
      this.setState({
        page: 1,
        list: newList,
        expanded: newList.map(item => item.id),
      });
    } catch (error) {
      handleError(error);
      this.setState({
        loading: false,
        page: 1,
        list: [],
        expanded: [],
      });
    }
  }

  handleDownload = async () => {
    try {
      const orgUserList = this.state.originalList
        .map(m => m.items)
        .reduce((previousValue, currentValue) => previousValue.concat(currentValue), []);
      // 机构的第一个联系人行才显示机构简介
      let uniqueOrgId = null;
      orgUserList.forEach((item) => {
        if (item.org.id !== uniqueOrgId) {
          uniqueOrgId = item.org.id;
          item.showOrgDescription = true;
        }
      });
      this.setState({
        exportList: orgUserList,
      }, () => {
        this.downloadExcel();
      });
    } catch (error) {
      this.setState({
        exportList: [],
      });
      handleError(error);
      return;
    }
  }

  downloadExcel = () => {
    var link = document.createElement('a');
    link.download = '创建机构看板.xls';

    var tableContainer = document.querySelector('.export-create-orgbd');
    var table = tableContainer.querySelector('table');
    table.border = '1';

    var cells = table.querySelectorAll('td, th');
    cells.forEach(element => {
      element.style.textAlign = 'center';
      element.style.verticalAlign = 'middle';
    });

    link.href = tableToExcel(table, '创建机构看板');
    link.click();
  };

  removeInvestorOnList = (investor) => {
    const { list, originalList } = this.state;
    const orgIndex = list.findIndex((item) => item.id.startsWith(investor.org.id.toString()));
    const orgInvestors = list[orgIndex].items;
    const orgInvestorIndex = orgInvestors.findIndex((item) => item.id === investor.id);
    let newList = [
      ...list.slice(0, orgIndex),
      {
        ...list[orgIndex],
        items: [
          ...orgInvestors.slice(0, orgInvestorIndex),
          ...orgInvestors.slice(orgInvestorIndex + 1),
        ],
      },
      ...list.slice(orgIndex + 1),
    ];
    newList = newList.filter(f => !(f.loaded && f.items.length === 0));

    const orgOriginalIndex = originalList.findIndex((item) => item.id.startsWith(investor.org.id.toString()));
    const orgOriginalInvestors = originalList[orgOriginalIndex].items;
    const orgOriginalInvestorIndex = orgOriginalInvestors.findIndex((item) => item.id === investor.id);
    let newOriginalList = [
      ...originalList.slice(0, orgOriginalIndex),
      {
        ...originalList[orgOriginalIndex],
        items: [
          ...orgOriginalInvestors.slice(0, orgOriginalInvestorIndex),
          ...orgOriginalInvestors.slice(orgOriginalInvestorIndex + 1),
        ],
      },
      ...originalList.slice(orgOriginalIndex + 1),
    ];
    newOriginalList = newOriginalList.filter(f => !(f.loaded && f.items.length === 0));

    this.setState({
      list: newList,
      originalList: newOriginalList,
      expanded: newList.map(item => item.id),
    });
  }

  handlePageChange = (page) => {
    this.setState({ page })
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 })
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading, source, managers, expanded, exportList, allLoaded } = this.state
    const pagedList = list.slice((page - 1) * pageSize, page * pageSize);

    const columns = [
        {title: i18n('org_bd.org'), render: (text, record) => {
          let org = record.org
          if (!org) return "无效机构"
          let selectedUsers = this.state.selectedKeys.filter(userid=>this.userList[userid].org.id === org.id)
          return <div>
                  {record.org.orgname}
                  {(selectedUsers.length ? <Tag color="green" style={{marginLeft: 15}}>{`已选 ${selectedUsers.length} 人`}</Tag> : null)}
                </div>
        }, key:'org', sorter:false},
      ]

    const expandedRowRender = (record) => {
      const columns = [
        {
          title: '',
          key: 'delete',
          render: (_, record) => (
            <Popconfirm
              title="是否删除该投资人？"
              onConfirm={() => this.removeInvestorOnList(record)}
              okText="删除"
              okButtonProps={{
                danger: true,
              }}
              cancelText="取消"
            >
              <Button shape="circle" size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          ),
        },
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
                return tagObj == null ? '' : tagObj.name;
              }).join('、');
            }
            return tags ? <div style={{ width: 200 }}>{tags}</div> : '暂无';
          },
        },
        { title: i18n('user.trader'), key: 'transaction', render: (text, record) => record.id ? <Trader traders={record.traders} /> : '暂无' }

      ]
      // if(this.props.source!="meetingbd"){
      //   columns.push({title:i18n('org_bd.important') + '/操作', render:(text,record)=>{
      //     if (!record.bd) return <Button onClick={this.handleCreateBD.bind(this, record)}>创建BD</Button>
      //     else return <div>{record.bd.isimportant ? "是" : "否"}</div>
      //   }})
      // }

      return (
        <div>
          <Table
            columns={columns}
            dataSource={record.items}
            rowKey={record=>record.key}
            pagination={false}
            loading={!record.loaded}
            size={"small"}
          />
        </div>

      );
    }

    const columnsForExportCreateOrgBD = [
      {
        title: '机构',
        key: 'org',
        dataIndex: ['org', 'orgname'],
      },
      {
        title: '机构简介',
        key: 'orgDescription',
        render: (text, record) => {
          if (record.showOrgDescription) {
            return record.org && record.org.description;
          }
        },
      },
      {
        title: i18n('user.name'),
        key: 'username',
        dataIndex: 'username',
        render: (text, record) => {
          // 可以新建的暂无联系人的BD
          if (!record.username) {
            return '暂无投资人';
          }

          // 可以新建的有联系人的BD
          return (
            <a target="_blank" href={`${window.location.origin}/app/user/${record.id}`}>
              <span style={{ color: '#428BCA' }}>{record.username}</span>
            </a>
          );
        },
      },
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
        render: text => (text && this.props.title.length > 0) ? this.props.title.filter(f => f.id === text)[0].name : '暂无',
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
              return tagObj == null ? '' : tagObj.name;
            }).join('、');
          }
          return tags ? <div style={{ width: 200 }}>{tags}</div> : '暂无';
        },
      },
      { title: i18n('user.trader'), key: 'transaction', render: (text, record) => record.id ? <Trader traders={record.traders} /> : '暂无' },
      // 暂时隐藏创建BD按钮
      // {
      //   title: i18n('org_bd.important') + '/操作',
      //   key: 'operation',
      //   render: (_, record) => {
      //     if (!record.bd) {
      //       const urlWithActiveUserKey = replaceUrlParam(window.location.href, 'activeUserKey', record.key);
      //       return <a target="_blank" href={urlWithActiveUserKey}>创建BD</a>;
      //     }
      //     return <div>{record.bd.isimportant ? "是" : "否"}</div>;
      //   },
      // },
    ];

    return (
      <LeftRightLayout 
        location={this.props.location} 
        breadcrumb={' > ' + i18n('menu.organization_bd') + ' > ' + i18n('project.create_org_bd') + ` > ${this.projDetail.projtitleC || "暂无项目"}`}
        title={i18n('menu.bd_management')}
        action={{ name: '返回机构看板', link: '/app/org/bd' }}
      >
      {source!=0 ? <BDModal source={source} element='org'/> : null}   

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div>
            <Button
              style={{ backgroundColor: 'orange', border: 'none' }}
              type="primary"
              disabled={!allLoaded}
              onClick={this.handleDownload}
            >
              {i18n('project_library.export_excel')}
            </Button>
            {!allLoaded && <Text type="warning" style={{ marginLeft: 8 }}>数据还在加载中，请稍后点击</Text>}
          </div>
          <Pagination
            style={paginationStyle}
            total={list.length}
            current={page}
            pageSize={pageSize}
            onChange={this.handlePageChange}
            showSizeChanger
            onShowSizeChange={this.handlePageSizeChange}
            showQuickJumper
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>

        <div style={{ marginTop: 20, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H3 size="1.2em" style={{ marginTop: 'unset', marginBottom: 'unset' }}>○ 选择机构列表</H3>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!allLoaded && <Text type="warning" style={{ marginRight: 8 }}>数据还在加载中，请稍后点击</Text>}
            <Search
              size="middle"
              style={{ width: 300 }}
              placeholder={[i18n('email.username'),i18n('organization.org'), i18n('mobile'), i18n('email.email')].join(' / ')}
              value={search}
              onChange={search => this.setState({ search })}
              disabled={!allLoaded}
              onSearch={this.handleSearch}
            />
          </div>
        </div>

        <Table
          columns={columns}
          expandedRowRender={expandedRowRender}
          dataSource={pagedList}
          rowKey={record=>record.id}
          loading={loading}
          onExpand={this.onExpand.bind(this)}
          expandedRowKeys={expanded}
          pagination={false}
          size={"middle"}
        />

        <Table
          className="export-create-orgbd"
          style={{ display: 'none' }}
          columns={columnsForExportCreateOrgBD}
          dataSource={exportList}
          rowKey={record => record.key}
          pagination={false}
          size={"middle"}
        />

        <div style={{ marginTop: 24, marginBottom: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div>
            <Button
              style={{ backgroundColor: 'orange', border: 'none' }}
              type="primary"
              disabled={!allLoaded}
              onClick={this.handleDownload}
            >
              {i18n('project_library.export_excel')}
            </Button>
            {!allLoaded && <Text type="warning" style={{ marginLeft: 8 }}>数据还在加载中，请稍后点击</Text>}
          </div>
          <Pagination
            style={paginationStyle}
            total={list.length}
            current={page}
            pageSize={pageSize}
            onChange={this.handlePageChange}
            showSizeChanger
            onShowSizeChange={this.handlePageSizeChange}
            showQuickJumper
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>

        {this.state.selectVisible &&
          <Modal
            title={`创建BD-${this.state.activeUser.org.orgname}-${this.state.activeUser.username || '暂无投资人'}`}
            visible={this.state.selectVisible}
            footer={null}
            onCancel={() => this.setState({ selectVisible: false, expirationtime: moment().add(1, 'weeks'), })}
            closable={true}
            maskClosable={false}
          >
            <div style={{ marginLeft: '15px' }}>
              <H3>选择交易师</H3>
              <SelectTrader
                style={{ width: 300 }}
                mode="single"
                data={this.state.traderList}
                value={this.state.manager}
                onChange={manager => this.setState({ manager })} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <Button disabled={this.state.manager === null} type="primary" onClick={this.createOrgBD.bind(this)}>{i18n('common.confirm')}</Button>
              </div>
            </div>
          </Modal>
        }

        {this.state.displayCreateBDModalFromExcel &&
          <Modal
            title={this.state.activeUserFromExcel ? `创建BD-${this.state.activeUserFromExcel.org.orgname}-${this.state.activeUserFromExcel.username || '暂无投资人'}` : '创建BD'}
            visible={this.state.displayCreateBDModalFromExcel}
            footer={null}
            onCancel={() => this.setState({ displayCreateBDModalFromExcel: false, expirationtime: moment().add(1, 'weeks'), })}
            closable={true}
            maskClosable={false}
          >
            <div style={{ marginLeft: '15px' }}>
              <H3>选择交易师</H3>
              <SelectTrader
                style={{ width: 300 }}
                mode="single"
                data={this.state.traderList}
                value={this.state.manager}
                onChange={manager => this.setState({ manager })} />
<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <Button disabled={this.state.manager === null} type="primary" onClick={this.createOrgBDFromExcel.bind(this)}>{i18n('common.confirm')}</Button>
            </div>
            </div>
          </Modal>
        }
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
