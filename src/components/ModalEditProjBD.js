import React from 'react';
import { Modal, Form, Input } from 'antd';
import { formItemLayout } from '../constants';
import { SelectBDStatus, SelectTrader } from './ExtraInput';
import { hasPerm, getUserInfo, i18n } from '../utils/util';

function getAllManagers(manager) {
    const { main, normal } = manager;
    let allManagers = [];
    if (main) {
      allManagers.push(main.id.toString());
    }
    if (normal) {
      allManagers = allManagers.concat(normal.map(m => m.manager.id.toString()));
    }
    return allManagers;
}

function ModalEditProjBD({ bd, visible, onOk, onCancel }) {
  const [form] = Form.useForm();

  const handleOK = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        onOk(values);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const canEditManager = hasPerm('BD.manageProjectBD') || getUserInfo().id === (bd && bd.createuser);

  const { com_name, bd_status, manager } = bd || {};
  const initialValues = {
    com_name,
    bd_status: bd_status && bd_status.id,
    manager: manager && getAllManagers(manager),
  };

  return (
    <Modal
      visible={visible}
      title="修改项目BD"
      okText="提交"
      cancelText="取消"
      onCancel={handleCancel}
      onOk={handleOK}
    >
      <Form
        form={form}
        initialValues={initialValues}
        {...formItemLayout}
      >
        <Form.Item
          label={i18n('project_bd.project_name')}
          name="com_name"
          rules={[{ required: true, message: '该字段不能为空' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={i18n('project_bd.bd_status')}
          name="bd_status"
          rules={[
            { required: true, message: '该字段不能为空' },
            { type: 'number' },
          ]}
        >
          <SelectBDStatus />
        </Form.Item>
        {canEditManager && (
          <Form.Item
            label={i18n('project_bd.manager')}
            name="manager"
            rules={[
              { required: true, message: '该字段不能为空' },
              { type: 'array' },
            ]}
          >
            <SelectTrader mode="multiple" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default ModalEditProjBD;
