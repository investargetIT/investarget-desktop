import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { Button, Table, Pagination } from 'antd'
import { getMsg, readMsg } from '../api'
import { 
  i18n, 
  handleError,
  getUserInfo,
} from '../utils/util';
import { PAGE_SIZE_OPTIONS } from '../constants';


const tableStyle = { marginBottom: '24px' }
const iconStyle = { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#108ee9' }
const backStyle = { fontSize: '13px', marginLeft: '8px' }
const detailTitleStyle = { textAlign:'center' }
const detailTimeStyle = { textAlign:'center', color: 'rgba(153, 153, 153, 0.85)' }
const lineStyle = { margin: '24px 0', height: '1px', backgroundColor: '#eaeaea' }



class InboxList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showDetail: false,
      data: [],
      total: 0,
      loading: false,
      pageIndex: 1,
      pageSize: getUserInfo().page || 10,
      selectedMsg: [],
      currentMsg: null,
    }
  }

  componentDidMount() {
    this.getMessageList()
  }

  handleItemClicked = (record) => {
    const { id } = record
    const msg = this.state.data.filter(item => item.id == id)[0]
    if (msg) {
      this.setState({ showDetail: true, currentMsg: msg })
      if (!msg.isRead) {
        readMsg(id).then(() => {})
          .catch(error => { handleError(error) })
      }
    }
  }

  // pageIndex, pageSize 变化时，重置 selectedMsg

  handlePageChange = (page) => {
    this.setState({ pageIndex: page, selectedMsg: [] }, this.getMessageList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, pageIndex: 1, selectedMsg: [] }, this.getMessageList)
  }

  getMessageList = () => {
    this.setState({ loading: true })
    const param = {
      page_index: this.state.pageIndex,
      page_size: this.state.pageSize,
    }
    getMsg(param).then(data => {
      const list = data.data.data.map(m => {
        m.created = m.createdtime ? m.createdtime.slice(0,19).replace('T', ' ') : undefined;
        return m
      })
      this.setState({
        data: list,
        total: data.data.count,
        loading: false,
      })
    })
  }

  handleReadMsg = () => {
    const ids = this.state.selectedMsg
    const q = ids.map(id => readMsg(id))
    Promise.all(q)
      .then(() => {
        this.setState({ selectedMsg: [] })
        this.getMessageList()
      })
      .catch(error => {
        handleError(error)
      })
  }

  handleBackToList = () => {
    this.setState({
      showDetail: false,
      currentMsg: null,
    })
    this.getMessageList()
  }

  onSelectChange = (selectedMsg) => {
    this.setState({ selectedMsg })
  }

  render () {
    const { showDetail, total, data, loading, pageIndex, pageSize, selectedMsg, currentMsg } = this.state

    const columns = [
      { title: ' ', key: 'isRead', width: 24, render: (text, record) => {
        return record.isRead ? null : <div style={iconStyle}></div>
      }},
      { title: i18n('inbox.title'), key: 'title', dataIndex: 'messagetitle', className: 'pointer', onCellClick: this.handleItemClicked },
      { title: i18n('inbox.time'), key: 'time', dataIndex: 'created', width: 200 },
    ]
    const rowSelection = {
      selectedRowKeys: selectedMsg,
      onChange: this.onSelectChange,
    }

    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n('menu.reminder')}
      >
        {
          showDetail ? (
            <div>
              <a href="javascript:void(0)" onClick={this.handleBackToList} style={backStyle}>&lt; {i18n('inbox.back_to_list')}</a>
              <h1 style={detailTitleStyle}>{currentMsg.messagetitle}</h1>
              <h3 style={detailTimeStyle}>{currentMsg.created}</h3>
              <div style={lineStyle}></div>
              <p>{currentMsg.content}</p>
            </div>
          ) : (
            <div>
              <Table style={tableStyle} rowSelection={rowSelection} columns={columns} dataSource={data} rowKey={record=>record.id} loading={loading} pagination={false} />

              <div className="clearfix" style={{marginBottom: '24px'}}>
                <div style={{ float: 'left' }}>
                  <Button size="large" style={{marginLeft: '8px'}} disabled={selectedMsg.length == 0} onClick={this.handleReadMsg}>{i18n('inbox.mark_as_read')}</Button>
                </div>
                
                <Pagination 
                  style={{ float: 'right' }} 
                  total={total} 
                  current={pageIndex} 
                  pageSize={pageSize} 
                  onChange={this.handlePageChange} 
                  showSizeChanger 
                  onShowSizeChange={this.handlePageSizeChange} 
                  showQuickJumper 
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                />

              </div>
            </div>
          )
        }

      </LeftRightLayout>
    )
  }
}

export default InboxList
