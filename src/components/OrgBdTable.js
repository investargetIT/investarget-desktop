import React, { useState, useEffect } from 'react';
import { i18n } from '../utils/util';
import { Table, Popover } from 'antd';
import { connect } from 'dva';

function OrgBdTable(props) {

  const [orgBdList, setOrgBdList] = useState([]);

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });

    async function fetchData() {
      const params = {
        // org,
        // proj: proj || "none",
        // response,
        // manager,
        // createuser,
        // search: this.state.search,
        // page_size: 100,
        // isRead: this.state.showUnreadOnly ? false : undefined,
        page_size: 8,
        sort: 'createdtime',
        desc: 1,
      };

      const req = await api.getOrgBdList(params);
      setOrgBdList(req.data.data);
    }
    fetchData();
  }, []);

  const columns = [
    {
      title: "机构名称",
      dataIndex: ['org', 'orgname'],
      key: 'com_name',
    },
    {
      title: i18n('account.investor'),
      dataIndex: 'username',
      key: 'investor',
    },
    {
      title: i18n('account.position'),
      key: 'manager',
      dataIndex: ['usertitle', 'name'],
    },
    {
      title: i18n('project_bd.status'),
      key: 'status',
      dataIndex: 'response',
      render: text => props.orgbdres.length > 0 && text && props.orgbdres.filter(f => f.id === text)[0].name,
    },
    {
      title: i18n('timeline.latest_remark'),
      key: 'latest_remark',
      render: (_, record) => {
        let latestComment = record.BDComments && record.BDComments.length && record.BDComments[record.BDComments.length - 1].comments || null;
        return latestComment ? <Popover placement="leftTop" title="最新备注" content={<p style={{ maxWidth: 400 }}>{latestComment}</p>}>
          <div style={{ color: "#428bca", lineHeight: '27px' }}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment}</div>
        </Popover> : <div style={{ lineHeight: '27px' }}>暂无</div>;
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={orgBdList}
        rowKey={record => record.id}
        pagination={false}
      />
    </div>
  );
}

function mapStateToProps(state) {
  const { orgbdres } = state.app
  return { orgbdres };
}

export default connect(mapStateToProps)(OrgBdTable);
