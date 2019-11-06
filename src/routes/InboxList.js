import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { 
  Button, 
  Table, 
  Pagination,
} from 'antd';
import { Link, withRouter } from 'dva/router';
import { 
  getMsg, 
  readMsg, 
  getOrgBdDetail,
} from '../api';
import { 
  i18n, 
  handleError,
  getUserInfo,
} from '../utils/util';
import { PAGE_SIZE_OPTIONS } from '../constants';
import qs from 'qs';


const tableStyle = { marginBottom: '24px' }
const iconStyle = { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#108ee9' }
const backStyle = { fontSize: '13px', marginLeft: '8px' }
const detailTitleStyle = { textAlign:'center' }
const detailTimeStyle = { textAlign:'center', color: 'rgba(153, 153, 153, 0.85)' }
const lineStyle = { margin: '24px 0', height: '1px', backgroundColor: '#eaeaea' }



class InboxList extends React.Component {
  constructor(props) {
    super(props)

    const { page, pageSize } = props.location.query;

    this.state = {
      showDetail: false,
      data: [],
      total: 0,
      loading: false,
      pageIndex: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || getUserInfo().page || 10,
      selectedMsg: [],
      currentMsg: null,
    }
  }

  componentDidMount() {
    this.getMessageList()
  }

  componentWillReceiveProps(nextProps) {
    const { search: nextSearch } = nextProps.location;
    const { search: currentSearch } = this.props.location;
    if (nextSearch !== currentSearch) {
      const { page, pageSize } = nextProps.location.query;
      this.setState({
        selectedMsg: [],
        pageIndex: parseInt(page, 10) || 1,
        pageSize: parseInt(pageSize, 10) || getUserInfo().page || 10,
      }, this.getMessageList);
    }
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
    const { pageSize } = this.props.location.query;
    const parameters = { page, pageSize };
    this.props.router.push(`/app/inbox/list?${qs.stringify(parameters)}`);
    // this.setState({ pageIndex: page, selectedMsg: [] }, this.getMessageList)
  }

  handlePageSizeChange = (current, pageSize) => {
    const parameters = { page: 1, pageSize };
    this.props.router.push(`/app/inbox/list?${qs.stringify(parameters)}`);
    // this.setState({ pageSize, pageIndex: 1, selectedMsg: [] }, this.getMessageList)
  }

  getMessageList = async () => {
    this.setState({ loading: true });
    const param = {
      page_index: this.state.pageIndex,
      page_size: this.state.pageSize,
    };
    const allMsgRes = await getMsg(param);
    const allMsg = allMsgRes.data.data;
    for (let index = 0; index < allMsg.length; index++) {
      const m = allMsg[index];
      m.created = m.createdtime ? m.createdtime.slice(0, 19).replace('T', ' ') : undefined;
      if (m.sourcetype === 'OrgBD') {
        try {
          const bd = await getOrgBdDetail(m.sourceid);
          m.content = <Link to={`/app/org/bd?projId=${bd.data.proj.id}&manager=${bd.data.manager.id}`}>{m.content}</Link>;
        } catch (error) {
          console.error(error);
        }
      }
    }
    this.setState({
      data: allMsg,
      total: allMsgRes.data.count,
      loading: false,
    });
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
              <div dangerouslySetInnerHTML={{ __html: currentMsg.html ? currentMsg.html.replace(/\n/g, '<br>') : '' }} />
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

export default withRouter(InboxList);
