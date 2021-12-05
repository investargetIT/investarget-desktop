import React, { useState, useEffect } from 'react';
import { hasPerm, i18n, getCurrentUser } from '../utils/util';
import { Table, Popover } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';

const progressStyles = {
  margin: 2,
  backgroundColor: 'rgba(250, 221, 20, .15)',
  fontSize: 14,
  lineHeight: '20px',
  padding: '4px 10px',
  borderRadius: 20,
  color: '#262626',
};

function getProgressBackground(id) {
  if (id === 6) {
    return 'rgba(230, 69, 71, .15)';
  }
  if ([4, 5].includes(id)) {
    return 'rgba(250, 173, 20, .15)';
  }
  return 'rgba(82, 196, 26, .15)';
}

function OrgBdTable(props) {

  const [orgBdList, setOrgBdList] = useState([]);
  const [loading, setLoading] = useState(false);

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
        manager: getCurrentUser(),
      };
      // if (!hasPerm('BD.manageOrgBD')) {
      //   params.manager = getCurrentUser();
      // }
      setLoading(true);
      const req = await api.getOrgBdList(params);
      setOrgBdList(req.data.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const columns = [
    {
      title: '项目',
      key: 'project',
      dataIndex: ['proj', 'projtitle'],
      render: (text, record) => <Link to={`/app/org/bd?projId=${record.proj.id}`}>{text}</Link>,
    },
    {
      title: "机构",
      dataIndex: ['org', 'orgname'],
      key: 'com_name',
    },
    {
      title: '联系人',
      dataIndex: 'username',
      key: 'investor',
    },
    {
      title: i18n('account.position'),
      key: 'title',
      dataIndex: ['usertitle', 'name'],
    },
    {
      title: '负责人',
      key: 'manager',
      dataIndex: ['manager', 'username'],
    },
    {
      title: '机构进度/材料',
      key: 'status',
      dataIndex: 'response',
      render: (text, record) => {
        let progress = null;
        if (text) {
          progress = <div style={{ ...progressStyles, backgroundColor: getProgressBackground(text) }}>{props.orgbdres.length > 0 && props.orgbdres.filter(f => f.id === text)[0].name}</div>;
        }
        let material = null;
        if (record.material) {
          material = <div style={{ ...progressStyles, backgroundColor: 'rgba(51, 155, 210, .15)' }}>{record.material}</div>;
        }
        return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{progress}{material}</div>;
      },
    },
    // {
    //   title: i18n('timeline.latest_remark'),
    //   key: 'latest_remark',
    //   render: (_, record) => {
    //     let latestComment = record.BDComments && record.BDComments.length && record.BDComments[record.BDComments.length - 1].comments || null;
    //     return latestComment ? <Popover placement="leftTop" title="最新备注" content={<p style={{ maxWidth: 400 }}>{latestComment}</p>}>
    //       <div style={{ color: "#428bca", lineHeight: '27px' }}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment}</div>
    //     </Popover> : <div style={{ lineHeight: '27px' }}>暂无</div>;
    //   },
    // },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={orgBdList}
        rowKey={record => record.id}
        pagination={false}
        loading={loading}
      />
    </div>
  );
}

function mapStateToProps(state) {
  const { orgbdres } = state.app
  return { orgbdres };
}

export default connect(mapStateToProps)(OrgBdTable);
