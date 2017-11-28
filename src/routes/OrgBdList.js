import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import { 
  i18n, 
  time, 
  handleError, 
} from '../utils/util';
import * as api from '../api';
import { 
  Table, 
  Button, 
  Popconfirm, 
  Pagination, 
} from 'antd';
import { OrgBDFilter } from '../components/Filter';
import { Search2 } from '../components/Search';
import ModalModifyOrgBDStatus from '../components/ModalModifyOrgBDStatus';

class OrgBdList extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
        filters: OrgBDFilter.defaultValue,
        search: null,
        page: 1,
        pageSize: 10,
        total: 0,
        list: [],
        loading: false,
        visible: false,
        currentBD: null,
        comments: [],
        newComment: '',
        status: null,
    }
  }

  componentDidMount() {
    this.getOrgBdList();
  }

  getOrgBdList = () => {
    const { page, pageSize, search, filters } = this.state;
    const params = {
        page_index: page,
        page_size: pageSize,
        search,
        ...filters,
    }
    api.getOrgBdList(params)
    .then(result => {
        this.setState({
            list: result.data.data,
            total: result.data.count,
          })
    })
  }

  handleDelete(id) {
    api.deleteOrgBD(id)
      .then(data => this.getOrgBdList())
      .catch(error => handleError(error));
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrgBdList)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getOrgBdList)
  }

  handleModifyStatusBtnClicked(bd) {
    this.setState({ 
        visible: true, 
        currentBD: bd,
        status: bd.bd_status.id,
    });
  }

  handleStatusChange = (status) => {
    this.setState({ status })
  }

  handleConfirmAudit = () => {
    api.modifyOrgBDStatus(this.state.currentBD.id, this.state.status)
    .then(result => {
        this.setState({ visible: false }, this.getOrgBdList);
    });  
  }

  render() {

    const { filters, search, page, pageSize, total, list, loading } = this.state

    const columns = [
        {title: i18n('org_bd.project_name'), dataIndex: 'proj.projtitle'},
        {title: i18n('org_bd.contact'), dataIndex: 'username'},
        {title: i18n('org_bd.created_time'), render: (text, record) => {
            return time(record.createdtime + record.timezone)
        }},
        {title: i18n('org_bd.mobile'), dataIndex: 'usermobile'},
        {title: i18n('org_bd.manager'), dataIndex: 'manager.username'},
        {title: i18n('org_bd.org'), render: (text, record) => record.org ? record.org.orgname : null},
        {title: i18n('org_bd.status'), dataIndex: 'bd_status.name'},
        {
            title: i18n('org_bd.operation'), render: (text, record) => <span>
                <Button size="small" style={{ marginRight: 4 }} onClick={this.handleModifyStatusBtnClicked.bind(this, record)}>{i18n('project.modify_status')}</Button>
                <Popconfirm title={i18n('message.confirm_delete')} onConfirm={this.handleDelete.bind(this, record.id)}>
                    <Button size="small" type="danger">{i18n('common.delete')}</Button>
                </Popconfirm>
            </span>
        },
        // {title: 'Comments', render: (text, record) => {
        //   const latestComment = record.BDComments && record.BDComments[0]
        //   const comments = latestComment ? latestComment.comments : ''
        //   return (<div>
        //     <p style={{maxWidth: 250,overflow: 'hidden',whiteSpace: 'nowrap',textOverflow: 'ellipsis'}}>{comments}</p>
        //     <a href="javascript:void(0)" onClick={this.handleOpenModal.bind(this, record.id)}>{i18n('remark.view_add')}</a>
        //   </div>)
        // }},
      ]

    return (
      <LeftRightLayout 
        location={this.props.location} 
        title={i18n('menu.organization_bd')} 
      >

        <OrgBDFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />
        
        <div style={{ marginBottom: '16px' }} className="clearfix">
          <Search2
            defaultValue={search}
            placeholder={i18n('project_bd.project_name')}
            style={{ width: 200, float: 'left' }}
            onSearch={search => this.setState({ search, page: 1 }, this.getOrgBdList)} 
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
        />
                
        <div style={{ margin: '16px 0' }} className="clearfix">
          <Pagination
            style={{ float: 'right' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={page => this.setState({ page }, this.getOrgBdList)}
            showSizeChanger
            onShowSizeChange={(current, pageSize) => this.setState({ pageSize, page: 1 }, this.getOrgBdList)}
            showQuickJumper
          />
        </div>

        <ModalModifyOrgBDStatus 
          visible={this.state.visible} 
          onCancel={() => this.setState({ visible: false })} 
          status={this.state.status}
          onStatusChange={this.handleStatusChange}
          onOk={this.handleConfirmAudit}
        />

      </LeftRightLayout>
    );
  }
}

export default OrgBdList;