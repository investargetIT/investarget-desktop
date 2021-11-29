import React from 'react'
import { Button, Table, Pagination } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import { WxMessageFilter } from '../components/Filter'
import { 
  handleError, 
  time, 
  hasPerm,
  getUserInfo, 
} from '../utils/util';
import * as api from '../api'
import { PAGE_SIZE_OPTIONS } from '../constants';

const RegExps = {
  jpg: /^https\:\/\/image\.investarget\.com\/\w+\.jpg/,
  url: /^https\:\/\/(\S+\.)+\w{2,12}/,
}

class WxMessage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      total: 0,
      list: [],
      filters: null,
      page: 1,
      pageSize: getUserInfo().page || 10,
      loading: false,
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getWxMsg)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getWxMsg)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getWxMsg)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getWxMsg)
  }

  getWxMsg = () => {
    this.setState({ loading: true })
    const { page, pageSize, filters } = this.state
    const param = { page_index: page, page_size: pageSize, ...filters }
    if (param['isShow'] == null) { delete param['isShow'] }
    api.getWxMsg(param).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }).catch(error => {
      handleError(error)
      this.setState({ loading: false })
    })
  }

  toggleMessage = (id) => {
    api.editWxMsg(id).then(() => {
      this.getWxMsg()
    }).catch(error => {
      console.error(error)
      handleError(error)
    })
  }

  componentDidMount() {
    this.getWxMsg()
  }

  render() {
    const { filters, total, list, page, pageSize, loading } = this.state

    const columns = [
      {title: '发布日期', key: 'createtime', render: (text, record) => {
        return record.createtime ? time(record.createtime + '+08:00') : ''
      }},
      {title: '内容', dataIndex: 'content', width: 500, render: (text, record) => {
        if (RegExps.jpg.test(text)) return <a target="_blank" href={text}><img src={text} style={{ maxHeight: 45, maxWidth: 500 }}></img></a>
        else if (RegExps.url.test(text)) return <a href={text}>{text}</a>
        else return text
      }},
      {title: '微信群', dataIndex: 'group_name'},
      {title: '用户', dataIndex: 'name'},
      // {title: '状态', key: 'status', render: (text, record) => {
      //   return record.isShow ? '显示' : '隐藏'
      // }},
      // {title: '操作', key: 'operation', render: (text, record) => {
      //   return (
      //     <Button onClick={this.toggleMessage.bind(this, record.id)}>{record.isShow ? '隐藏' : '显示'}</Button>
      //   )
      // }}
    ]

    
      columns.push({title: '状态', key: 'status', render: (text, record) => {
        return record.isShow ? '显示' : '隐藏'
      }});

    if (hasPerm('usersys.admin_managemongo')) {
      columns.push(
        {
          title: '操作', key: 'operation', render: (text, record) => {
            return (
              <Button onClick={this.toggleMessage.bind(this, record.id)}>{record.isShow ? '隐藏' : '显示'}</Button>
            )
          }
        });
    }
    
    return (
      <LeftRightLayout location={this.props.location} title="市场消息">

        
        {hasPerm('usersys.admin_managemongo') &&
          <WxMessageFilter defaultValue={this.state.filters} onSearch={this.handleFilt} onReset={this.handleReset} />
        }
        

        <Table
          columns={columns}
          dataSource={list}
          loading={loading}
          rowKey={record => record.id}
          pagination={false} />

        <Pagination
          className="ant-table-pagination"
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.handlePageChange}
          onShowSizeChange={this.handlePageSizeChange}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />

      </LeftRightLayout>
    )
  }
}

export default WxMessage
