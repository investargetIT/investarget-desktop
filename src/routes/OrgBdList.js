import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import { 
  i18n, 
  time, 
} from '../utils/util';
import * as api from '../api';
import { 
  Table, 
  Button, 
  Popconfirm, 
  Pagination, 
} from 'antd';

class OrgBdList extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
        // filters: ProjectBDFilter.defaultValue,
        search: null,
        page: 1,
        pageSize: 10,
        total: 0,
        list: [],
        loading: false,
  
        visible: false,
        currentBDId: null,
        comments: [],
        newComment: '',
    }
  }

  componentDidMount() {
    this.getOrgBdList();
  }

  getOrgBdList = () => {
    const { page, pageSize } = this.state;
    const params = {
        page_index: page,
        page_size: pageSize,
    }
    api.getOrgBdList(params)
    .then(result => {
        this.setState({
            list: result.data.data,
            total: result.data.count,
          })
    })
  }

  handleDelete(id) {}

  render() {

    const { search, page, pageSize, total, list, loading } = this.state

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
                <Button size="small" style={{ marginRight: 4 }}>{i18n('project.modify_status')}</Button>
                <Popconfirm title="Confirm to delete?" onConfirm={this.handleDelete.bind(this, record.id)}>
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
        </LeftRightLayout>
    )
  }
}

export default OrgBdList;