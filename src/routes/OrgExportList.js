import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import { 
  i18n,
  getUserInfo,
  time,
} from '../utils/util';
import * as api from '../api';
import {
  Table,
  Pagination,
} from 'antd';
import { PAGE_SIZE_OPTIONS } from '../constants';
import { connect } from 'dva';

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }

class OrgExportList extends React.Component {
  
  constructor (props) {
    super(props);
    this.state = {
      list: [],
      page: 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      loading: false,
      downloadUrl: null,
    }
  }

  componentDidMount () {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    const { page, pageSize } = this.state;
    const params = { page_index: page, page_size: pageSize };
    api.getOrgExportList(params)
      .then(result => {
        const { count: total, data: list } = result.data
        this.setState({ total, list, loading: false })
      })
      .catch(error => {
        this.setState({ loading: false })
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      });
  }

  handleDownloadBtnClicked = record => {
    echo(record)
    this.setState({ downloadUrl: api.getOrgExportDownloadUrl(record.id) });
    // 重置下载链接， 防止相同下载链接不执行
    setTimeout(() => this.setState({ downloadUrl: null }), 1000);
  }

  render () {
    const { total, list, loading, page, pageSize } = this.state;
    const columns = [
      { 
        title: '创建时间', 
        key: 'createdtime', 
        dataIndex: 'createdtime', 
        render: text => time(text)
      },
      {
        title: '创建人',
        key: 'createuser',
        dataIndex: 'createuser.username'
      },
      { 
        title: '完成时间', 
        key: 'completetime', 
        dataIndex: 'completetime', 
        render: text => text && time(text) 
      },
      {
        title: '状态', 
        key: 'status', 
        dataIndex: 'status', 
        render: text => this.props.exportStatus.filter(f => f.id === text)[0].name
      },
      {
        title: '操作',
        key: 'action',
        render: (undefined, record) => {
          if (record.status === 5) {
            return <a href="#" onClick={this.handleDownloadBtnClicked.bind(this, record)}>下载</a>;
          }
        }
      }
    ]; 

    return (
      <LeftRightLayout location={this.props.location} title={i18n('menu.exportexcel_organization')}>
        <Table
          style={tableStyle}
          columns={columns}
          dataSource={list}
          rowKey={record => record.id}
          loading={loading}
          pagination={false}
        />
        <Pagination
          style={paginationStyle}
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={page => this.setState({ page }, this.getData)}
          showSizeChanger
          onShowSizeChange={(undefined, pageSize) => this.setState({ pageSize, page: 1 }, this.getData)}
          showQuickJumper
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
        <iframe style={{ display: 'none' }} src={this.state.downloadUrl}></iframe>
      </LeftRightLayout>
    );
  }
}

function mapStateToProps(state) {
  const { exportStatus } = state.app;
  return { exportStatus };
}

export default connect(mapStateToProps)(OrgExportList);