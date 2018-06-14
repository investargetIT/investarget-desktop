import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { 
  i18n, 
  isLogin, 
  getUserInfo, 
} from '../utils/util';
import { MyInvestorListFilter } from '../components/Filter'
import { Input, Table, Button, Popconfirm, Pagination, message, Modal } from 'antd'
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
class MyPartner extends React.Component {

  state = {
    list: [],
    loading: false,
    total: 0,
    pageSize: getUserInfo().page || 10,
    pageIndex: 1,
    friendList: [], 
    search: '', 
    filters: null,
  }
  investorList = []
  redirect = this.props.type === 'investor' && URI_12

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
    
    const params = Object.assign({}, param, this.state.filters);

    api.getUserRelation(params)
      .then(result => {
        this.setState({
          list: result.data.data,
          loading: false, 
          total: result.data.count
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

  handlePageChange = pageIndex => this.setState({ pageIndex }, this.getPartner)

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

  render() {
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none'}
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
            <Link to={'/app/user/edit/' + record.investoruser.id + '?redirect=' + this.redirect}>
              <Button style={buttonStyle} size="small">{i18n("common.edit")}</Button>
            </Link>
            { !this.state.friendList.includes(record.investoruser.id) ?
              <Button style={buttonStyle} disabled={record.isAlreadyAdded} onClick={this.handleAddFriend.bind(this, record.investoruser.id)} size="small">{i18n("add_friend")}</Button>
            : null}
          </span>
        )
      }, 
    ];

    const { list } = this.state

    return (
      <div>

      {this.props.type === "investor" ? (
        <MyInvestorListFilter 
          onReset={filters => this.setState({ filters, pageIndex: 1, search: null }, this.getPartner)}
          onFilter={filters => this.setState({ filters, pageIndex: 1 }, this.getPartner)} />
      ) : null}

      {this.props.type === "investor" ? (
        <Search
          size="large"
          style={{ width: 200, marginBottom: '16px', marginTop: '10px' }}
          value={this.state.search}
          onChange={search => this.setState({ search })}
          onSearch={search => this.setState({ search, pageIndex: 1 }, this.getPartner)} />
      ) : null}

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
          onShowSizeChange={(current, pageSize) => this.setState({ pageSize, pageIndex: 1 }, this.getPartner)}
        />

      </div>
    )
  }
}

function mapStateToProps(state) {
  const { title, tag, audit, famlv } = state.app;
  return { title, tag, audit, famlv };
}

export default connect(mapStateToProps)(MyPartner);


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
