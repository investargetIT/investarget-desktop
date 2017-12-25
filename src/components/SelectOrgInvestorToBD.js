import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { 
  i18n, removeFromArray, 
} from '../utils/util';
import * as api from '../api'
import { Button, Popconfirm, Modal, Table, Pagination } from 'antd'
import { SelectNumber, SelectUser } from './ExtraInput'
import { Search2 } from './Search'

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }


class SelectUserTransaction extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const param = { investoruser: this.props.userId }
    api.getUserRelation(param).then(result => {
      const data = result.data.data
      var options = []
      data.forEach(item => {
        const trader = item.traderuser
        if (trader) {
          options.push({ label: trader.username, value: trader.id })
        }
      })
      this.props.onOptionsChange(options)
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    return (
      <SelectNumber style={{width: '80px'}} options={this.props.options} value={this.props.value} onChange={this.props.onChange} />
    )
  }
}



class SelectOrgInvestorToBD extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      search: null,
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
      traderMap: {},
      traderOptionsMap: {},
      ifimportantMap:{},
    }
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getUser)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getUser)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getUser)
  }

  getUser = () => {
    const { search, page, pageSize, traderMap } = this.state
    if (this.props.traderId) {
      let params = { search, page_index: page, page_size: pageSize, traderuser: this.props.traderId, orgs: this.props.selectedOrgs.map(m => m.id) }
      this.setState({ loading: true })
      api.getUserRelation(params).then(result => {
        const { count: total, data: _list } = result.data
        const list = _list.map(item => item.investoruser)
        this.setState({ total, list, loading: false })
      }, error => {
        this.setState({ loading: false })
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    } else {
      let params = { search, page_index: page, page_size: pageSize, org: this.props.selectedOrgs.map(m => m.id), groups: this.investorGroupIds }
      this.setState({ loading: true })
      api.getUser(params).then(result => {
        const { count: total, data: list } = result.data
        const orgWithoutInvestor = removeFromArray(this.props.selectedOrgs.map(m => m.id), list.map(m => m.org.id));
        orgWithoutInvestor.forEach(element => {
          const org = this.props.selectedOrgs.filter( f => f.id === element)[0];
          list.push({
            username: null,
            org,
            title: { name: null },
            id: null, 
          })
        });
        const investorList = list
        const _traderMap = {}
        investorList.forEach(item => {
          const investorId = item.id
          const traderId = item.trader_relation && item.trader_relation.traderuser.id
          if (!traderMap[investorId]) {
            _traderMap[investorId] = traderId
          }
        })
        this.setState({ total, list, loading: false, traderMap: { ...traderMap, ..._traderMap } })
      }, error => {
        this.setState({ loading: false })
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    }
  }

  handleChangeTrader = (investorId, traderId) => {
    let { traderMap } = this.state
    traderMap = { ...traderMap, [investorId]: traderId }
    this.setState({ traderMap })

    const userList = this.props.value
    const index = _.findIndex(userList, function(item) {
      return item.investor == investorId
    })
    if (index > -1) {
      let user = { investor: investorId, trader: traderId }
      this.props.onChange([ ...userList.slice(0, index), user, ...userList.slice(index + 1) ])
    }
  }

  handleSwitchChange = (id, ifimportant) => {
    this.setState({ifimportantMap:{...this.state.ifimportantMap,[id]:ifimportant}})
    const userList = this.props.value
    const index = _.findIndex(userList, function(item) {
      return item.investor == id
    })
    if (index > -1) {
      userList[index].isimportant=ifimportant
      this.props.onChange(userList)
    }
  }

  handleSelectChange = (investorIds, rows) => {
    const value = investorIds.map((investorId, index) => {
      const org = rows[index].org.id;
      const isimportant=this.state.ifimportantMap[investorId]||false
      return {
        investor: rows[index].id,
        org,
        isimportant
      }
    });
    this.props.onChange(value)
  }

  handleTraderOptionsChange = (investorId, traderOptions) => {
    const { traderOptionsMap } = this.state
    this.setState({
      traderOptionsMap: { ...traderOptionsMap, [investorId]: traderOptions }
    })
  }

  getTrader = () => {
    api.getUserDetailLang(this.props.traderId).then(result => {
      const trader = result.data
      this.setState({ trader })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      })
    })
  }

  componentDidMount() {
    api.queryUserGroup({ type: 'investor' }).then(data => {
      this.investorGroupIds = data.data.data.map(item => item.id)
      this.getUser()
      if (this.props.traderId) {
        this.getTrader()
      }
    })
  }

  render() {
    const rowSelection = {
      selectedRowKeys: this.props.value.map(item => item.investor + '-' + item.org),
      onChange: this.handleSelectChange,
      onSelect: this.handleSelect,
    }

    const columns = [
      { title: i18n('user.name'), key: 'username', dataIndex: 'username', render: text => text || '暂无投资人' },
      { title: i18n('organization.org'), key: 'orgname', dataIndex: 'org.orgname' },
      { title: i18n('user.position'), key: 'title', dataIndex: 'title.name', render: text => text || '暂无' },
      { title: i18n('user.trader'), key: 'transaction', render: (text, record) => {
        if (this.props.traderId) {
          return this.state.trader ? this.state.trader.username : ''
        } else {
          return <SelectUser
            style={{ width: 100 }}
            mode="single"
            data={this.props.options}
            value={this.state.traderMap[record.id] ? String(this.state.traderMap[record.id]) : ''}
            onChange={this.handleChangeTrader.bind(this, record.id)} />;
         }
      }},
      {title:i18n('org_bd.important'), render:(text,record)=>{
        return <SwitchButton onChange={this.handleSwitchChange.bind(this,record.id)} />
      }}
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <Search2 style={{ width: 250 }} placeholder={[i18n('user.name')].join(' / ')} defaultValue={search} onSearch={this.handleSearch} />
        </div>
        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id + '-' + record.org.id} loading={loading} pagination={false} />
        <Pagination style={paginationStyle} total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} onShowSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
      </div>
    )

  }

}

class SwitchButton extends React.Component{
  constructor(props){
    super(props);
    this.state={
      ifimportant:false,
      leftBgColor:'white',
      leftColor:'gray',
      rightBgColor:'#428BCA',
      rightColor:'white',
    }
  }
  change = () =>{
    if(this.state.ifimportant==false){
      this.setState({
        leftBgColor:'#428BCA',
        leftColor:'white',
        rightBgColor:'white',
        rightColor:'gray',
        ifimportant:true,
      },()=>{this.props.onChange(this.state.ifimportant)})
    }
    else if(this.state.ifimportant==true){
      this.setState({
        leftBgColor:'white',
        leftColor:'gray',
        rightBgColor:'#428BCA',
        rightColor:'white',
        ifimportant:false,
      },()=>{this.props.onChange(this.state.ifimportant)})
    }
  }

  render(){
    const container={width:'100px',
                    height:'25px',
                    borderRadius:'6px',
                    border:'1px solid gray',
                    display:'flex',
                    cursor:'pointer'}

    const left={width:'50%',
                height:'100%',
                borderRadius:'5px',
                textAlign: 'center',
                transitionProperty:'backgroundColor color',
                transitionDuration:'0.5s'}
    const {leftBgColor,leftColor,rightColor,rightBgColor} = this.state           
    return (
      <div style={container} onClick={this.change.bind(this)}>
        <div id="left" style={{backgroundColor:leftBgColor,color:leftColor, ...left}}>是</div>
        <div id="right" style={{backgroundColor:rightBgColor, color:rightColor, ...left }}>否</div>
      </div>
    )
  }
}

export default connect()(SelectOrgInvestorToBD)
