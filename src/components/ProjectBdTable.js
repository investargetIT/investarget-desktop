import React, { useState, useEffect } from 'react';
import { i18n, time, getCurrentUser, requestAllData } from '../utils/util';
import { Table, Popover } from 'antd';
import { connect } from 'dva';
import lodash from 'lodash';

function ProjectBdTable(props) {
  const [projBdList, setProjBdList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const params = {
        page_size: 8,
        sort: 'createdtime',
        desc: 1,
        manager: getCurrentUser(),
      }
      const req = await requestAllData(api.getProjBDList, params, 10);
      let { data: projBDList } = req.data;
      setProjBdList(projBDList);
      setLoading(false);
      const allBdStatus = await props.dispatch({ type: 'app/getSource', payload: 'bdStatus' });
      projBDList = projBDList.map(m => {
        const bdStatus = allBdStatus.find(f => f.id === m.bd_status);
        return { ...m, bd_status: bdStatus };
      });
      const allTitles = await props.dispatch({ type: 'app/getSource', payload: 'title' });
      projBDList = projBDList.map(m => {
        const userTitle = allTitles.find(f => f.id === m.usertitle);
        return { ...m, usertitle: userTitle };
      });
      setProjBdList(projBDList);
      
      if (projBDList.length === 0) return;
      const reqBDComments = await requestAllData(api.getProjBDCom, { projectBD: projBDList.map(m => m.id) }, 100);
      projBDList = projBDList.map(m => {
        const BDComments = reqBDComments.data.data.filter(f => f.projectBD === m.id);
        return { ...m, BDComments };
      });
      setProjBdList(projBDList);
    }
    fetchData();
  }, []);

  function showPhoneNumber(item) {
    const { usermobile } = item;
    if (!usermobile) return '暂无';
    const { bduser } = item;
    if (bduser || usermobile.startsWith('+')) return usermobile;
    return `+${usermobile}`;
  }

  const columns = [
    {
      title: i18n('project_bd.project_name'),
      dataIndex: 'com_name',
      key: 'com_name',
      render: (text, record) => (
        <div style={{ position: 'relative', lineHeight: '27px' }}>
          {record.isimportant ? <img style={{ position: 'absolute', height: '10px', width: '10px', marginTop: '-5px', marginLeft: '-5px' }} src="/images/important.png" /> : null}
          {record.source_type === 0 ?
            <Popover title="项目方联系方式" content={
              <div>
                <div>{`姓名：${record.username || '暂无'}`}</div>
                <div>{`职位：${record.usertitle ? record.usertitle.name : '暂无'}`}</div>
                <div>{`电话：${showPhoneNumber(record)}`}</div>
                <div>{`邮箱：${record.useremail || '暂无'}`}</div>
              </div>
            }>
              <a target="_blank" href={"/app/projects/library/" + encodeURIComponent(text)} style={{ color: '#339bd2' }}>{text}</a>
            </Popover>
            :
            <Popover title="项目方联系方式" content={
              <div>
                <div>{`姓名：${record.username || '暂无'}`}</div>
                <div>{`职位：${record.usertitle ? record.usertitle.name : '暂无'}`}</div>
                <div>{`电话：${showPhoneNumber(record)}`}</div>
                <div>{`邮箱：${record.useremail || '暂无'}`}</div>
              </div>
            }>
              <div style={{ color: "#339bd2" }}>{text}</div>
            </Popover>
          }
        </div>
      ),
    },
    {
      title: i18n('project_bd.status'),
      dataIndex: ['bd_status', 'name'],
      key: 'bd_status',
      width: '15%',
      render: text => <span style={{ color: '#595959' }}>{text}</span>
    },
    {
      title: i18n('project_bd.manager'),
      key: 'manager',
      render: (_, record) => {
        if (!record.manager) return null;
        let allManager = record.manager.map(m => m.manager);
        allManager = lodash.uniqBy(allManager, 'id');
        return <span style={{ color: '#595959' }}>{allManager.map(m => m.username).join('、')}</span>;
      },
    },
    {
      title: i18n('project_bd.created_time'),
      key: 'createdtime',
      width: '20%',
      render: (_, record) => (
        <span style={{ color: '#595959' }}>
          {record.createdtime.slice(0, 10)}
        </span>
      ),
    },
    {
      title: '行动计划',
      key: 'comment',
      render: (_, record) => {
        let latestComment = '';
        if (record.BDComments && record.BDComments.length) {
          const comments = record.BDComments;
          if (comments.length > 0) {
            latestComment = comments[0].comments;
          }
        }
        if (!latestComment) return '暂无';

        const popoverContent = record.BDComments.sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime))
          .map(comment => {
            let content = comment.comments;
            const oldStatusMatch = comment.comments.match(/之前状态(.*)$/);
            if (oldStatusMatch) {
              const oldStatus = oldStatusMatch[0];
              content = comment.comments.replace(oldStatus, `<span style="color:red">${oldStatus}</span>`);
            }
            return (
              <div key={comment.id} style={{ marginBottom: 8 }}>
                <p><span style={{ marginRight: 8 }}>{time(comment.createdtime + comment.timezone)}</span></p>
                <div style={{ display: 'flex' }}>
                  {comment.createuserobj &&
                    <div style={{ marginRight: 10 }}>
                      <a target="_blank" href={`/app/user/${comment.createuserobj.id}`}>
                        <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuserobj.photourl} />
                      </a>
                    </div>
                  }
                  <p dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}></p>
                </div>
              </div>
            );
          });
        return (
          <Popover title="行动计划" content={popoverContent}>
            <div style={{ color: "#428bca" }}>{latestComment.length >= 12 ? (latestComment.substr(0, 10) + "...") : latestComment}</div>
          </Popover>
        );
      },
    },
  ];

  return (
    <div style={{ height: 600 - 32, overflowY: 'scroll' }}>
      <Table
        columns={columns}
        dataSource={projBdList}
        rowKey={record => record.id}
        pagination={false}
        loading={loading}
      />
    </div>
  );
}

export default connect()(ProjectBdTable);
