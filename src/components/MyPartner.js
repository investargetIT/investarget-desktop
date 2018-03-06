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

const Search = Input.Search

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
      param = { trader: isLogin().id}
    } else if (this.props.type == "trader") {
      param = { investor: isLogin().id }
    }
    param.page_size = this.state.pageSize;
    param.page_index = this.state.pageIndex;
    param.search = this.state.search;
    
    const params = Object.assign({}, param, this.state.filters);

    api.getUser(params)
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
  }

  handleDeleteUser(userID) {
    console.log(userID)
  }

  handlePageChange = pageIndex => this.setState({ pageIndex }, this.getPartner)

  handleShowSizeChange(pageSize) {
    console.log(pageSize)
  }

  handleAddFriend(userID) {
    const index = this.state.list.map(m => m.id).indexOf(userID)
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
          return <Link to={'/app/user/' + record.id}>{record.username}</Link>
        }
      },
      {
        title: i18n("organization.org"),
        dataIndex: 'org.orgname',
        key: 'org'
      },
      {
        title: i18n("user.position"),
        dataIndex: 'title.name',
        key: 'title'
      },
      {
        title: i18n("user.tags"),
        dataIndex: 'tags',
        key: 'tags',
        render: tags => tags ? tags.map(t => t.name).join(' ') : null
      }
    ]
    if (this.props.type === 'investor') {
      columns.push({
        title: i18n("user.status"),
        dataIndex: 'userstatus.name',
        key: 'userstatus',
      })
      columns.push({
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => (
          <span>
          <Link to={'/app/user/edit/' + record.id + '?redirect=' + this.redirect}>
              <Button style={buttonStyle} size="small">{i18n("common.edit")}</Button>
            </Link>
            &nbsp;
            { this.props.type !== 'investor' ?
          <Popconfirm title="Confirm to delete?" onConfirm={this.handleDeleteUser.bind(null, record.id)}>
              <Button type="danger" size="small">{i18n("common.delete")}</Button>
            </Popconfirm>
            : null }
            &nbsp;
            {!this.state.friendList.includes(record.id) ? 
            <Button style={buttonStyle} disabled={record.isAlreadyAdded} onClick={this.handleAddFriend.bind(this, record.id)} size="small">{i18n("add_friend")}</Button>
            : null}
          </span>
        )
      })
    } else {
      columns.push({
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => <Button disabled={record.isAlreadyAdded} onClick={this.handleAddFriend.bind(this, record.id)} size="small">{i18n("add_friend")}</Button>,
      })
    }

    const { list } = this.state

    return (
      <div>

      {this.props.type === "investor" ? (
        <MyInvestorListFilter onFilter={filters => this.setState({ filters, pageIndex: 1 }, this.getPartner)} />
      ) : null}

      {this.props.type === "investor" ? (
        <Search
          size="large"
          style={{ width: 200, marginBottom: '16px', marginTop: '10px' }}
          onSearch={search => this.setState({ search, pageIndex: 1 }, this.getPartner)} />
      ) : null}

      {this.props.type === "trader" ? (
          <CardContainer gutter={28} cardWidth={240}>
            {list.map(item => {
              return <Card key={item.id} {...item} />
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

export default connect()(MyPartner);


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
