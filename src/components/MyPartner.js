import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n, isLogin } from '../utils/util'
import { MyInvestorListFilter } from '../components/Filter'
import { Input, Table, Button, Popconfirm, Pagination, message, Modal } from 'antd'
import * as api from '../api'
import { Link } from 'dva/router'
import { URI_12, URI_13 } from '../constants'
import { connect } from 'dva'
import CardContainer from '../components/CardContainer'

const Search = Input.Search

class MyPartner extends React.Component {

  state = {
    list: [],
    loading: false,
    total: 0,
    pageSize: 10, // todo
    pageIndex: 1,
    friendList: [], 
  }
  investorList = []
  redirect = this.props.type === 'investor' && URI_12

  getPartner = () => {
    this.setState({ loading: true })

    let title, param
    if (this.props.type === "investor") {
      title = "investoruser"
      param = { traderuser: isLogin().id}
    } else if (this.props.type == "trader") {
      title = "traderuser"
      param = { investoruser: isLogin().id }
    }
    param.page_size = this.state.pageSize;
    param.page_index = this.state.pageIndex;

    api.getUserRelation(param)
      .then(result => {
        this.setState({
          list: result.data.data.map(m => m[title]),
          loading: false, 
          total: result.data.count
        })
        echo(this.state.list)
      })
  }

  componentDidMount() {
    this.getPartner();
    api.getUserFriend()
    .then(result => {
      const friendList = result.data.data.map(m => m.friend.id === isLogin().id ? m.user.id : m.friend.id);
      this.setState({ friendList })
    })
    // Promise.all([api.getUserRelation(param), api.getUserFriend()])
    // .then(data => {
    //   const investorRelationShip = data[0].data.data.map(m => m[title])
    //   const investorIdArr = new Set(investorRelationShip.map(m => m.id))
    //   const investorList = [...investorIdArr].reduce((acc, value) => {
    //     acc.push(investorRelationShip.filter(f => f.id === value)[0])
    //     return acc
    //   }, [])
    //   echo('list', investorList.length);
    //   const list = investorList.map(m => {
    //     let isAlreadyAdded = false
    //     if (data[1].data.data.filter(f => (f.friend && f.friend.id === m.id) || (f.user && f.user.id === m.id)).length > 0) {
    //       isAlreadyAdded = true
    //     }
    //     return {...m, isAlreadyAdded}
    //   })
    //   this.setState({
    //     list,
    //     loading: false,
    //     total: investorList.length
    //   })
    //   this.investorList = investorList
    // }).catch(err => this.props.dispatch({
    //   type: 'app/findError',
    //   payload: err
    // }))
  }

  handleSearch(value) {

    let params
    if (typeof value === 'string') {
      // Search
      if (value.length === 0) {
        this.setState({ list: this.investorList })
        return
      }
      params = { search: value }
    } else if (typeof value === 'object') {
      // Filter
      if (value.orgtransactionphases.length === 0 && value.tags.length === 0 && value.currency.length === 0 && !value.userstatus && value.areas.length === 0) {
        this.setState({ list: this.investorList })
        return
      }
      params = value
    }

    this.setState({ loading: true })
    api.getUser(params).then(data => {
      const searchResult = data.data.data.map(m => m.id)
      const newList = []
      this.investorList.map((m, index) => {
        if (searchResult.includes(m.id)) {
          newList.push(m)
        }
      })
      this.setState({
        list: newList,
        loading: false
      })
    }).catch(err => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
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
        dataIndex: 'username',
        key: 'username'
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
        key: 'userstatus'
      })
      columns.push({
        title: i18n("common.operation"),
        key: 'action',
        render: (text, record) => (
          <span>
            <Link to={'/app/user/' + record.id}>
              <Button style={buttonStyle} size="small">{i18n("common.view")}</Button>
            </Link>
            &nbsp;
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
        <MyInvestorListFilter onFilter={this.handleSearch.bind(this)} />
      ) : null}

      {this.props.type === "investor" ? (
        <Search
          size="large"
          style={{ width: 200, marginBottom: '16px', marginTop: '10px' }}
          onSearch={this.handleSearch.bind(this)} />
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
        />

      </div>
    )
  }
}

export default connect()(MyPartner)


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
