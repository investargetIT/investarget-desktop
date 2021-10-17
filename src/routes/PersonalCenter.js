import React, { useEffect, useState } from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Breadcrumb, Card, Tabs, Table, Empty, Popover, Button, Modal, Form, Input, DatePicker } from 'antd';
import {
  ManOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import ProjectCardForUserCenter from '../components/ProjectCardForUserCenter';
import {
  hasPerm,
  getUserInfo,
} from '../utils/util';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

function PersonalCenter(props) {

  const userInfo = getUserInfo();

  const [projList, setProjList] = useState([]);
  const [displayPromotionHistoryModal, setDisplayPromotionHistoryModal] = useState(false);
  const [displayAssessmentHistoryModal, setDisplayAssessmentHistoryModal] = useState(false);


  useEffect(() => {
    async function loadWorkingProjects() {
      const params = {
        max_size: 2,
        sort: 'publishDate',
        desc: 1,
      }
      if (!hasPerm('proj.admin_getproj')) {
        params['user'] = userInfo.id;
      }
      const reqProj = await api.getProj(params);
      const { data: projList } = reqProj.data;
      setProjList(projList);
    }
    loadWorkingProjects();
  }, []);

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
    {
      title: '操作',
      align: 'center',
      key: 'operation',
      render: () => (
        <div>
          <Button type="link" onClick={() => setDisplayPromotionHistoryModal(true)}>编辑</Button>
          <Button type="link" icon={<DeleteOutlined />}>删除</Button>
        </div>
      ),
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
    },
    {
      title: '操作',
      align: 'center',
      key: 'operation',
      render: () => (
        <div>
          <Button type="link" onClick={() => setDisplayAssessmentHistoryModal(true)}>编辑</Button>
          <Button type="link" icon={<DeleteOutlined />}>删除</Button>
        </div>
      ),
    },
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

  const columns3 = [
    {
      title: '时间',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '工作单位',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '职位',
      dataIndex: 'address',
      key: 'address',
      render: text => <a href="#">{text}</a>,
    },
    {
      title: '主要职责',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      align: 'center',
      key: 'operation',
      render: () => (
        <div>
          <Button type="link">编辑</Button>
          <Button type="link" icon={<DeleteOutlined />}>删除</Button>
        </div>
      ),
    },
  ];

  const data3 = [
  ];

  const columns4 = [
    {
      title: '招聘方式',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '劳动合同签订/续签日期',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '劳动合同期限',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '附件',
      dataIndex: 'remark',
      key: 'remark',
      render: text => <a href="#">{text}</a>,
    },
    {
      title: '操作',
      align: 'center',
      key: 'operation',
      render: () => (
        <div>
          <Button type="link">编辑</Button>
          <Button type="link" icon={<DeleteOutlined />}>删除</Button>
        </div>
      ),
    },
  ];

  const data4 = [
    {
      key: '1',
      name: '公开招聘',
      age: '2020.10.01 - 2023.09.30',
      address: '三年',
      remark: '劳动合同.doc',
    },
  ];

  const columns5 = [
    {
      title: '日期',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '沟通方式',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '沟通人',
      dataIndex: 'address',
      key: 'address',
      render: text => <a href="#">{text}</a>,
    },
    {
      title: '沟通主要内容',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      align: 'center',
      key: 'operation',
      render: () => (
        <div>
          <Button type="link">编辑</Button>
          <Button type="link" icon={<DeleteOutlined />}>删除</Button>
        </div>
      ),
    },
  ];

  const data5 = [
    {
      key: '1',
      name: '2020.10.01',
      age: '1v1线下沟通',
      address: 'Amy Zhao',
      remark: '新人入职注意事项',
    },
    {
      key: '2',
      name: '2020.10.01',
      age: '1v1线下沟通',
      address: 'Amy Zhao',
      remark: '工作流程说明',
    },
  ];

  const columns6 = [
    {
      title: '日期',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '培训形式',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '培训内容',
      dataIndex: 'address',
      key: 'address',
      render: text => <a href="#">{text}</a>,
    },
    {
      title: '状态',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      align: 'center',
      key: 'operation',
      render: () => (
        <div>
          <Button type="link">编辑</Button>
          <Button type="link" icon={<DeleteOutlined />}>删除</Button>
        </div>
      ),
    },
  ];

  const data6 = [
    {
      key: '1',
      name: '2020.10.30',
      age: '线下',
      address: '新人入职注意事项',
      remark: '已完成',
    },
  ];

  function popoverContent() {
    return (
      <div>
        <img style={{ width: 240, height: 240 }} src="/images/avatar2.png" />
        <div style={{ padding: '30px 20px' }}>
          <div style={{ fontSize: 20, lineHeight: '28px', color: 'rgba(0, 0, 0, .85)', fontWeight: 500 }}>Vincent Chen</div>
          <div style={{ marginTop: 20, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>职位：</span>高级投资经理</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门：</span>战略投资</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>部门主管：</span>Eric Shen</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>直属上级：</span>Amy Zhao</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: '22px', color: '#595959' }}><span style={{ color: '#262626' }}>入职日期：</span>2020.10.01</div>
        </div>
      </div>
    );
  }

  const onFinish = (values) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

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
                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>岗位及晋升记录</div>
                  <Table columns={columns1} dataSource={data1} pagination={false} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />} onClick={() => setDisplayPromotionHistoryModal(true)}>新增记录</Button>
                  </div>
                </div>

                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>试用期内及年度考核记录</div>
                  <Table columns={columns2} dataSource={data2} pagination={false} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />} onClick={() => setDisplayAssessmentHistoryModal(true)}>新增记录</Button>
                  </div>
                </div>

                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>入职前工作经历</div>
                  <Table columns={columns3} dataSource={data3} pagination={false} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />}>新增记录</Button>
                  </div>
                </div>

                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>入职后工作概况<span style={{ fontWeight: 'normal', marginLeft: 10, fontSize: 14, color: '#989898' }}>推荐人：王大明/投资经理</span></div>
                  <Table columns={columns4} dataSource={data4} pagination={false} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />}>新增记录</Button>
                  </div>
                </div>

                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>入职后导师计划跟踪记录</div>
                  <Table columns={columns5} dataSource={data5} pagination={false} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />}>新增记录</Button>
                  </div>
                </div>

                <div style={{ marginBottom: 40 }}>
                  <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>入职后培训记录</div>
                  <Table columns={columns6} dataSource={data6} pagination={false} />
                  <div style={{ textAlign: 'center', lineHeight: '50px', borderBottom: '1px solid  #f0f0f0' }}>
                    <Button type="link" icon={<PlusOutlined />}>新增记录</Button>
                  </div>
                </div>

              </TabPane>
              <TabPane tab="参与过的项目" key="2">
                <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-18px 0 20px -18px' }}>
                  {projList.map(m => <div key={m.id} style={{ margin: '18px 0 0 18px' }}>
                    <ProjectCardForUserCenter record={m} country={props.country} />
                  </div>)}
                  {projList.length === 0 && <Empty style={{ margin: '20px auto' }} />}
                </div>
              </TabPane>
              <TabPane tab="职员列表" key="3">
                <div style={{ marginBottom: 20, fontSize: 16, lineHeight: '24px', fontWeight: 'bold', color: 'rgba(0, 0, 0, .85)' }}>部门名称</div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Popover placement="right" content={popoverContent()} overlayClassName="popover-staff">
                    <div style={{ marginRight: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 190, height: 216, border: '1px solid #e6e6e6', borderRadius: 4 }}>
                      <img style={{ marginBottom: 24, width: 72, height: 72, borderRadius: '50%' }} src="/images/avatar2.png" />
                      <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 16, lineHeight: '24px', color: 'rgba(0, 0, 0, .85)' }}>Eric Shen</div>
                      <div style={{ fontSize: 14, lineHeight: '20px', color: '#989898' }}>董事</div>
                    </div>
                  </Popover>

                  <Popover placement="right" content={popoverContent()} overlayClassName="popover-staff">
                    <div style={{ marginRight: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 190, height: 216, border: '1px solid #e6e6e6', borderRadius: 4 }}>
                      <img style={{ marginBottom: 24, width: 72, height: 72, borderRadius: '50%' }} src="/images/avatar3.png" />
                      <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 16, lineHeight: '24px', color: 'rgba(0, 0, 0, .85)' }}>Eric Shen</div>
                      <div style={{ fontSize: 14, lineHeight: '20px', color: '#989898' }}>董事</div>
                    </div>
                  </Popover>

                  <Popover placement="right" content={popoverContent()} overlayClassName="popover-staff">
                    <div style={{ marginRight: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 190, height: 216, border: '1px solid #e6e6e6', borderRadius: 4 }}>
                      <img style={{ marginBottom: 24, width: 72, height: 72, borderRadius: '50%' }} src="/images/avatar4.png" />
                      <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 16, lineHeight: '24px', color: 'rgba(0, 0, 0, .85)' }}>Eric Shen</div>
                      <div style={{ fontSize: 14, lineHeight: '20px', color: '#989898' }}>董事</div>
                    </div>
                  </Popover>

                  <Popover placement="right" content={popoverContent()} overlayClassName="popover-staff">
                    <div style={{ marginRight: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 190, height: 216, border: '1px solid #e6e6e6', borderRadius: 4 }}>
                      <img style={{ marginBottom: 24, width: 72, height: 72, borderRadius: '50%' }} src="/images/avatar5.png" />
                      <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 16, lineHeight: '24px', color: 'rgba(0, 0, 0, .85)' }}>Eric Shen</div>
                      <div style={{ fontSize: 14, lineHeight: '20px', color: '#989898' }}>董事</div>
                    </div>
                  </Popover>

                </div>
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

      <Modal
        title="新增岗位及晋升记录"
        visible={displayPromotionHistoryModal}
        onCancel={() => setDisplayPromotionHistoryModal(false)}
      >
        <Form
          style={{ width: 400 }}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="起止时间"
            name="duration"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <RangePicker />
          </Form.Item>

          <Form.Item
            label="任职部门"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="任职岗位"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input />
          </Form.Item>

        </Form>
      </Modal>

      <Modal
        title="新增试用期内及年度考核记录"
        visible={displayAssessmentHistoryModal}
        onCancel={() => setDisplayAssessmentHistoryModal(false)}
      >
        <Form
          style={{ width: 400 }}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="起止时间"
            name="duration"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <RangePicker />
          </Form.Item>

          <Form.Item
            label="任职部门"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="任职岗位"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input />
          </Form.Item>

        </Form>
      </Modal>

    </LeftRightLayoutPure>
  );
}

function mapStateToProps(state) {
  const { country } = state.app;
  return { country };
}

export default connect(mapStateToProps)(PersonalCenter);
