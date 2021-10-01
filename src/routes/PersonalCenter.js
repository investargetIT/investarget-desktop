import React from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Breadcrumb, Card, Tabs, Table } from 'antd';
import {
  ManOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;

function PersonalCenter(props) {

  function tabChange(key) {
    console.log(key);
  }

  const columns1 = [
    {
      title: '起止时间',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '任职部门',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '任职岗位',
      dataIndex: 'address',
      key: 'address',
    },
  ];

  const data1 = [
    {
      key: '1',
      name: '2020.10.01 - 2021.09.30',
      age: '战略投资',
      address: '投资经理',
    },
    {
      key: '2',
      name: '2021.10.01 - 现在',
      age: '战略投资',
      address: '高级投资经理',
    },
  ];

  const columns2 = [
    {
      title: '年度',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '绩效考核结果',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '附件',
      dataIndex: 'address',
      key: 'address',
      render: text => <a href="#">{text}</a>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    }
  ];

  const data2 = [
    {
      key: '1',
      name: '2020.10.01 - 2021.09.30',
      age: '合格',
      address: 'Vincent Ch…年绩效考核.doc',
      remark: '沟通能力必须提高',
    },
  ];

  return (
    <LeftRightLayoutPure location={props.location}>

      <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Link to="/app">首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>用户中心</Breadcrumb.Item>
        <Breadcrumb.Item>个人中心</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ display: 'flex' }}>
        <div style={{ width: 280, marginRight: 20 }}>
          <Card bodyStyle={{ padding: 0 }}>
            <div style={{ padding: '40px 60px' }}>
              <div style={{ textAlign: 'center' }}>
                <img style={{ width: 100, height: 100, borderRadius: '50%' }} src="/images/avatar1.png" />
              </div>
              <div style={{ marginTop: 12, fontSize: 20, textAlign: 'center', lineHeight: '28px', color: 'rgba(0, 0, 0, .85)', fontWeight: 500 }}>Vincent Chen <ManOutlined style={{ color: '#339bd2', marginLeft: 4, fontSize: 18 }} /></div>
              <div style={{ marginTop: 20, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>职位：</span>高级投资经理</div>
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门：</span>战略投资</div>
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门主管：</span>Eric Shen</div>
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>直属上级：</span>Amy Zhao</div>
              <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>入职日期：</span>2020.10.01</div>
            </div>
            <div style={{ width: 240, margin: '0 auto', marginBottom: 100, padding: '20px 0', borderTop: '1px solid #E6E6E6' }}>
              <div style={{ marginBottom: 20, fontSize: 14, lineHeight: '20px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>基本信息</div>
              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/birthday.svg" />
                  <div>出生日期</div>
                </div>
                <div style={{ color: '#595959' }}>1990.10.01</div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/school.svg" />
                  <div>毕业学校</div>
                </div>
                <div style={{ color: '#595959' }}>上海交通大学</div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/education.svg" />
                  <div>学历</div>
                </div>
                <div style={{ color: '#595959' }}>学士</div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/profession.svg" />
                  <div>专业</div>
                </div>
                <div style={{ color: '#595959' }}>工商管理</div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/specialty.svg" />
                  <div>特长爱好</div>
                </div>
                <div style={{ color: '#595959' }}>打球、听音乐</div>
              </div>

              <div style={{ marginBottom: 12, fontSize: 14, lineHeight: '22px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img style={{ marginRight: 8 }}  src="/images/others.svg" />
                  <div>其他</div>
                </div>
                <div style={{ color: '#595959' }}>暂无</div>
              </div>

            </div>
          </Card>
        </div>
        <div style={{ flex: 1 }}>
          <Card>
            <Tabs defaultActiveKey="1" onChange={tabChange}>
              <TabPane tab="人事档案及绩效" key="1">
                <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>岗位及晋升记录</div>
                <Table style={{ marginBottom: 40 }} columns={columns1} dataSource={data1} pagination={false} />

                <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>试用期内及年度考核记录</div>
                <Table style={{ marginBottom: 40 }} columns={columns2} dataSource={data2} pagination={false} />

              </TabPane>
              <TabPane tab="参与过的项目" key="2">
                Content of Tab Pane 2
              </TabPane>
              <TabPane tab="职员列表" key="3">
                Content of Tab Pane 3
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

    </LeftRightLayoutPure>
  );
}



export default connect()(PersonalCenter);
