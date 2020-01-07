import React from 'react'
import { 
  i18n, 
  isLogin, 
  getUserInfo, 
} from '../utils/util';
import { MyInvestorListFilter, FamiliarFilter } from '../components/Filter'
import { Tag, Table, Button, Pagination, Modal } from 'antd';
import * as api from '../api'
import { Link } from 'dva/router'
import { 
  URI_12, 
  URI_13, 
  PAGE_SIZE_OPTIONS, 
} from '../constants';
import { connect } from 'dva'
import CardContainer from '../components/CardContainer'
import { Search } from './Search';
import { withRouter } from 'dva/router';
import qs from 'qs';

const styles = {
  groupModifyButton: {
    position: "absolute",
    marginTop: -34,
    backgroundColor: "orange",
  },
  dialogBtnGroup: {
    textAlign: "right",
  },
  dialogBtnGroupItem: {
    marginLeft: 15,
  },
  radioGroup: {
    textAlign: "center",
    margin: "10px 0",
  }
}
const { CheckableTag } = Tag;

class MyPartner extends React.Component {

  constructor(props) {
    super(props);

    const { page, pageSize, search, filters } = props.location.query;

    let nextFilters = null;
    if (filters) {
      nextFilters = JSON.parse(decodeURIComponent(filters));
    }

    this.state = {
      list: [],
      loading: false,
      total: 0,
      pageSize: parseInt(pageSize, 10) || getUserInfo().page || 10,
      pageIndex: parseInt(page, 10) || 1,
      friendList: [],
      selectedRows: [],
      selectedRowKeys: [],
      showFamModifyDialog: false,
      search: search || '',
      filters: nextFilters,
      changedValue: null,
      isSubmitting: false,
      statistics: [],
    }
    this.investorList = []
    this.redirect = this.props.type === 'investor' && URI_12
  }

  getPartner = () => {
    this.setState({ loading: true })

    let param
    if (this.props.type === "investor") {
      param = { traderuser: isLogin().id}
    } else if (this.props.type == "trader") {
      param = { investoruser: isLogin().id }
    }
    param.page_size = this.state.pageSize;
    param.page_index = this.state.pageIndex;
    param.search = this.state.search;
    param.sort = 'createdtime';
    param.desc = 1;
    
    const params = Object.assign({}, param, this.state.filters);

    api.getUserRelation(params)
      .then(result => {
        this.setState({
          list: result.data.data,
          loading: false, 
          total: result.data.count,
          statistics: result.data.familiar_count,
        })
      })
  }

  getFriends = () => {
    api.getUserFriend({ page_size: 100 })
    .then(result => {
      const friendList = result.data.data.map(m => m.friend.id === isLogin().id ? m.user.id : m.friend.id);
      this.setState({ friendList })
    });
  }

  componentDidMount() {
    this.getPartner();
    this.getFriends();

    this.props.dispatch({ type: 'app/getSource', payload: 'title' });
    this.props.dispatch({ type: 'app/getSource', payload: 'famlv' }); 
    this.props.dispatch({ type: 'app/getGroup' });
  }

  componentWillReceiveProps(nextProps) {
    const { search: nextSearch } = nextProps.location;
    const { search: currentSearch } = this.props.location;
    if (nextSearch !== currentSearch) {
      const { filters, search, page, pageSize } = nextProps.location.query;
      let nextFilters = null;
      if (filters) {
        nextFilters = JSON.parse(decodeURIComponent(filters));
      }
      this.setState({
        pageIndex: parseInt(page, 10) || 1,
        pageSize: parseInt(pageSize, 10) || getUserInfo().page || 10,
        search: search || '',
        filters: nextFilters,
      }, this.getPartner);
    }
  }

  loadLabelByValue(type, value) {
    if (Array.isArray(value) && this.props.tag.length > 0) {
      return value.map(m => this.props[type].filter(f => f.id === m)[0].name).join(' / ');
    } else if (typeof value === 'number') {
      return this.props[type].filter(f => f.id === value)[0].name;
    }
  }

  handleDeleteUser(userID) {
    console.log(userID)
  }

  handlePageChange = pageIndex => {
    const { search, pageSize, filters } = this.props.location.query;
    const parameters = { filters, search, page: pageIndex, pageSize };
    this.props.router.push(`/app/investor/my?${qs.stringify(parameters)}`);
    // this.setState({ pageIndex }, this.getPartner);
  }

  handlePageSizeChange = (current, pageSize) => {
    const { search, filters } = this.props.location.query;
    const parameters = { filters, search, page: 1, pageSize };
    this.props.router.push(`/app/investor/my?${qs.stringify(parameters)}`);
    // this.setState({ pageSize, pageIndex: 1 }, this.getPartner);
  }

  handleSearch = search => {
    const { pageSize, filters } = this.props.location.query;
    const parameters = { filters, search, page: 1, pageSize };
    this.props.router.push(`/app/investor/my?${qs.stringify(parameters)}`);
    // this.setState({ search, pageIndex: 1 }, this.getPartner);
  }

  handleFilter = filters => {
    const stringfy = JSON.stringify(filters);
    const { search, pageSize } = this.props.location.query;
    const parameters = { filters: encodeURIComponent(stringfy), search, page: 1, pageSize };
    this.props.router.push(`/app/investor/my?${qs.stringify(parameters)}`);
    // this.setState({ filters, pageIndex: 1 }, this.getPartner);
  }

  handleFilterReset = filters => {
    let search = '';
    const { pageSize } = this.props.location.query;
    if (pageSize) {
      const parameters = { pageSize };
      search = `?${qs.stringify(parameters)}`;
    }
    this.props.router.push(`/app/investor/my${search}`);
    // this.setState({ filters, pageIndex: 1, search: null }, this.getPartner)
  }

  handleShowSizeChange(pageSize) {
    console.log(pageSize)
  }

  handleAddFriend(userID) {
    const index = this.state.list.map(m => m.investoruser.id).indexOf(userID)
    if (index < 0) return

    api.addUserFriend([userID])
    .then(() => {
      Modal.success({
        title: i18n('success'),
        content: i18n('request_sent_please_wait'),
      })
      const newList = [...this.state.list]
      newList[index].isAlreadyAdded = true
      this.setState({ list: newList })
    })
    .catch(err => this.props.dispatch({ type: 'app/findError', payload: err }))
  }

  submitModifyFamlv() {
    if (this.state.changedValue === null) {
      Modal.error({title: "错误", content: "您未勾选修改内容!"})
    } else {
      this.setState({isSubmitting: true})
      let params = {
        familiar: this.state.changedValue
      }
      api.editUserRelation(
        this.state.selectedRows.map(record => ({
          familiar: this.state.changedValue,
          id: record.id,
          investoruser: record.investoruser.id,
          traderuser: record.traderuser.id,
        }))
      ).then(result => {
        Modal.success({title: "成功", content: "修改熟悉程度成功!"})
        this.getPartner()
        this.setState({ showFamModifyDialog: false, selectedRows: [], selectedRowKeys: [], isSubmitting: false })
      }).catch(error => {
        Modal.success({title: "失败", content: "请求服务器失败, 请稍后再试!"})
        this.setState({ isSubmitting: false })
      })
    }
  }

  render() {
    const buttonStyle={textDecoration:'underline',border:'none',background:'none'}
    const columns = [
      {
        title: i18n("user.name"),
        key: 'username',
        render:(text, record) =>{
          const { investoruser: investor } = record;
          return <Link to={'/app/user/' + investor.id}>{investor.username}</Link>
        }
      },
      {
        title: i18n("organization.org"),
        dataIndex: 'investoruser.org.orgname',
        key: 'org'
      },
      {
        title: i18n("user.position"),
        dataIndex: 'investoruser.title.name',
        key: 'title',
      },
      {
        title: i18n("user.tags"),
        dataIndex: 'investoruser.tags',
        key: 'tags',
        render: tags => tags ? <span className="span-tag">{this.loadLabelByValue('tag', tags.map(m => m.id))}</span> : null,
      },
      {
        title: '熟悉程度',
        dataIndex: 'familiar',
        key: 'familiar',
        render: text => this.loadLabelByValue('famlv', text),
      },
      {
        title: i18n("user.status"),
        dataIndex: 'investoruser.userstatus.id',
        key: 'userstatus',
        render: value => this.loadLabelByValue('audit', value),
      },
      {
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => (
          <span>
            <Link to={'/app/user/edit/' + record.investoruser.id + '?redirect=' + this.redirect} target="_blank">
              <Button style={buttonStyle} size="small">{i18n("common.edit")}</Button>
            </Link>
            {/* { !this.state.friendList.includes(record.investoruser.id) ?
              <Button style={buttonStyle} disabled={record.isAlreadyAdded} onClick={this.handleAddFriend.bind(this, record.investoruser.id)} size="small">{i18n("add_friend")}</Button>
            : null} */}
          </span>
        )
      }, 
    ];

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ 
          selectedRowKeys, 
          selectedRows: this.state.selectedRows
                          .concat(selectedRows.filter(r=>!this.state.selectedRowKeys.includes(r.id)))
                          .filter(r=>selectedRowKeys.includes(r.id))
        })
      },
    };
    const famliarStatistics = this.state.statistics.map(m => {
      const famObj = this.props.famlv.filter(f => f.id === m.familiar)[0];
      if (famObj) {
        return `${famObj.name}(${m.count})`;
      } else {
        return '';
      }
    });

    const { list, filters } = this.state;

    return (
      <div>

      {this.props.type === "investor" ? (
        <MyInvestorListFilter
          value={filters}
          onReset={this.handleFilterReset}
          onFilter={this.handleFilter} />
      ) : null}

      {this.props.type === "investor" ? (
        <Search
          size="large"
          style={{ width: 200, marginBottom: '16px', marginTop: '10px' }}
          value={this.state.search}
          onChange={search => this.setState({ search })}
          onSearch={this.handleSearch} />
      ) : null}

      { this.props.type === "investor" ? 
      <div style={{ float: 'right', lineHeight: '48px' }}>
        {famliarStatistics.map(m => <Tag key={m}>{m}</Tag>)}
      </div>
      : null }

      {this.props.type === "trader" ? (
          <CardContainer gutter={28} cardWidth={240}>
            {list.map(item => {
              return <Card key={item.traderuser.id} {...item.traderuser} />
            })}
          </CardContainer>
      ) : null}

        {this.props.type === "investor" ? (
          <Table
            columns={columns}
            dataSource={this.state.list}
            loading={this.state.loading}
            rowKey={record => record.id}
            rowSelection={rowSelection}
            pagination={false} />
        ) : null}

        <Pagination
          style={{marginTop: 20, textAlign: 'center'}}
          total={this.state.total}
          current={this.state.pageIndex}
          pageSize={this.state.pageSize}
          onChange={this.handlePageChange}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onShowSizeChange={this.handlePageSizeChange}
        />

        {this.props.type === "investor" ? (
            <Button 
              style={styles.groupModifyButton}
              disabled={this.state.selectedRows.length === 0}
              onClick={()=>{this.setState({showFamModifyDialog: true, changedValue: null})}}
            >批量修改熟悉程度</Button>
        ) : null}

        <Modal
          title="批量修改熟悉程度"
          visible={this.state.showFamModifyDialog}
          onCancel={()=>{this.setState({showFamModifyDialog: false})}}
          footer={null}
        >
          <div style={styles.radioGroup}>
            <FamiliarFilter 
              hideLabel
              // vertical
              value={this.state.changedValue} 
              onChange={(v)=>{this.setState({changedValue: v})}}
            />
          </div>
          <div style={styles.dialogBtnGroup}>
            <Button 
                type="primary"
                onClick={this.submitModifyFamlv.bind(this)}
                style={styles.dialogBtnGroupItem}
                loading={this.state.isSubmitting}
              >确定</Button>
            <Button
                onClick={()=>{this.setState({showFamModifyDialog: false})}}
                style={styles.dialogBtnGroupItem}
              >取消</Button>
          </div>
        </Modal>

      </div>
    )
  }
}

function mapStateToProps(state) {
  const { title, tag, audit, famlv } = state.app;
  return { title, tag, audit, famlv };
}

export default connect(mapStateToProps)(withRouter(MyPartner));


function Card(props) {
  const { id, photourl, username } = props
  const containerStyle = {display:'block',width: 240,height: 280,backgroundColor:'#fff',border:'1px solid #ccc',overflow:'hidden',cursor:'pointer',textDecoration:'none'}
  const photoStyle = {width:'100%',height:216,backgroundPosition:'center',backgroundSize:'cover',backgroundRepeat:'no-repeat',backgroundImage:`url("${photourl}")`}
  const nameStyle = {margin:'0 auto',fontSize:18,textAlign:'center',color:'#333',marginTop:8}
  return (
    <Link to={'/app/trader/' + id} style={containerStyle}>
      <div style={photoStyle}></div>
      <div>
        <p style={nameStyle}>{username}</p>
      </div>
    </Link>
  )
}
