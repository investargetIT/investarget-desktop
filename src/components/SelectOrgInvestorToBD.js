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
      pageSize: 10000,
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

    let params = { 
      search, 
      page_index: page, 
      page_size: pageSize, 
      groups: this.investorGroupIds, 
      starmobile: true, 
    }
    this.setState({ loading: true })

    Promise.all(this.props.selectedOrgs.map(m => api.getUser({ ...params, org: [m.id] })))
      .then(result => {
        const list = result.reduce((acc, value, index) => {
          if (value.data.count > 0) {
            return acc.concat(value.data.data.map(m => ({ ...m, org: this.props.selectedOrgs[index] })));
          } else {
            acc.push({
              username: null,
              org: this.props.selectedOrgs[index],
              title: { name: null },
              id: null,
            });
            return acc;
          }
        }, []);
        this.setState({ total: list.length, list, loading: false });
      })

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

  handleSwitchChange = (record, ifimportant) => {
    let id=record.id+"_"+record.org.id
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

  handleSelectChange = (investorIds, rows) => {
    const value = investorIds.map((investorId, index) => {
      const org = rows[index].org.id;
      const importantId=rows[index].id+"_"+org
      const isimportant=this.state.ifimportantMap[importantId]||false
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
      { title: i18n('mobile'), key: 'mobile', dataIndex: 'mobile', render: text => text || '暂无' },
      { title: i18n('account.email'), key: 'email', dataIndex: 'email', render: text => text || '暂无' },
      { title: i18n('user.trader'), key: 'transaction', render: (text, record) => record.id ? <Trader investor={record.id} /> : '暂无' }, 
      {title:i18n('org_bd.important'), render:(text,record)=>{
        return <SwitchButton onChange={this.handleSwitchChange.bind(this,record)} />
      }}
    ]

    const { filters, search, total, list, loading, page, pageSize } = this.state

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <Search2 style={{ width: 250 }} placeholder={[i18n('user.name')].join(' / ')} defaultValue={search} onSearch={this.handleSearch} />
        </div>
        <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={list} rowKey={record=>record.id + '-' + record.org.id} loading={loading} pagination={false} />
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
class Trader extends React.Component {
  state = {
    list: [], 
  }
  componentDidMount() {
    const param = { investoruser: this.props.investor}
    api.getUserRelation(param).then(result => {
      echo(result);
      const data = result.data.data.sort((a, b) => Number(b.relationtype) - Number(a.relationtype))
      const list = []
      data.forEach(item => {
        const trader = item.traderuser
        if (trader) {
          list.push({ label: trader.username, value: trader.id, onjob: trader.onjob })
        }
        this.setState({ list });
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }
  render () {
    return <div>
      { this.state.list.map(m => <span key={m.value} style={{ marginRight: 10, color: m.onjob ? 'rgb(34, 124, 205)' : 'rgb(165, 166, 167)' }}>{m.label}</span>) }
    </div>
  }
}

export default connect()(SelectOrgInvestorToBD)
