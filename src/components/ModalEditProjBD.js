import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';
import { formItemLayout } from '../constants';
import { SelectBDStatus, SelectPartner, SelectTitle, SelectTrader } from './ExtraInput';
import { hasPerm, getUserInfo, i18n, checkMobile } from '../utils/util';
import LayoutItem from './LayoutItem';
import { connect } from 'dva';

const checkMobileInfo = (_, value) => {
  if (value && !checkMobile(value)) {
    return Promise.reject(new Error(i18n('mobile_incorrect_format')));
  }
  return Promise.resolve();
}

const getAllManagers = (manager) => {
  let allManagers = [];
  if (manager) {
    allManagers = manager.filter(f => f.type === 3).map(item => item.manager.id.toString());
  }
  return allManagers;
}

const getDefaultAreaCode = (bd, country) => {
  const currentCountry = (bd.country && country) ? country.find(({ id }) => id === bd.country) : null;
  return currentCountry ? currentCountry.areaCode : '86';
};

const getInitialValues = (bd, defaultAreaCode) => {
  const { com_name, bd_status, manager, bduser, username, usertitle, usermobile, useremail } = bd || {};
  
  let areaCode = null;
  let phone = null;
  if (usermobile) {
    const mobileArr = usermobile.split('-');
    if (mobileArr.length > 1) {
      areaCode = mobileArr[0];
      phone = mobileArr[1];
    } else {
      phone = usermobile;
      areaCode = defaultAreaCode;
    }
  } else {
    areaCode = defaultAreaCode;
  }

  return {
    com_name,
    bd_status: bd_status && bd_status.id,
    manager: manager && getAllManagers(manager),
    mobileAreaCode: areaCode,
    bduser,
    username,
    usertitle: usertitle && usertitle.id,
    usermobile: phone,
    useremail,
  };
};

function ModalEditProjBD({ country, bd, visible, onOk, onCancel }) {
  const canEditManager = hasPerm('BD.manageProjectBD') || getUserInfo().id === (bd && bd.createuser);
  const defaultAreaCode = getDefaultAreaCode(bd, country);
  const initialValues = getInitialValues(bd, defaultAreaCode);
  const initialTempBduser = {
    bduser: null,
    username: null,
    usertitle: null,
    mobileAreaCode: null,
    usermobile: null,
    useremail: null,
  };

  const [form] = Form.useForm();
  const [isLibrarySelect, setIsLibrarySelect] = useState(bd.bduser ? true : false);
  const [bduser, setBduser] = useState(null);
  const [tempBduser, setTempBduser] = useState(initialTempBduser);

  const handleOK = () => {
    form
      .validateFields()
      .then((values) => {
        const { mobileAreaCode, ...valuesToKeep } = values;
        const usermobile = (!values.bduser && mobileAreaCode && values.usermobile)
          ? `${mobileAreaCode}-${values.usermobile}`
          : values.usermobile;
        const newValues = {
          ...valuesToKeep,
          usermobile,
        };
        onOk(newValues);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const getUserDetail = (id) => {
    api.getUserInfo(id).then(result => {
      const { username, title, mobile, email } = result.data
      form.setFieldsValue({
        username,
        usertitle: title && title.id,
        usermobile: mobile,
        useremail: email,
      });
      setBduser({ title, mobile, email });
    });
  }

  const handleChangeBduser = (id) => {
    if (id) {
      getUserDetail(id);
    }
  };

  const saveTempBduser = () => {
    const { bduser, username, usertitle, mobileAreaCode, usermobile, useremail } = form.getFieldsValue();
    form.setFieldsValue({
      bduser: tempBduser.bduser,
      username: tempBduser.username,
      usertitle: tempBduser.usertitle,
      mobileAreaCode: tempBduser.mobileAreaCode || defaultAreaCode,
      usermobile: tempBduser.usermobile,
      useremail: tempBduser.useremail,
    });
    setTempBduser({ bduser, username, usertitle, mobileAreaCode, usermobile, useremail });
  }

  const handleManualInput = () => {
    setIsLibrarySelect(false);
    saveTempBduser();
  };

  const handleLibrarySelect = () => {
    setIsLibrarySelect(true);
    saveTempBduser();
  };

  useEffect(() => {
    if (bd.bduser) {
      getUserDetail(bd.bduser);
    }
  }, [bd]);

  return (
    <Modal
      visible={visible}
      title="修改线索项目"
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
        <Form.Item
          hidden={!isLibrarySelect}
          label={i18n('project_bd.contact')}
          name="bduser"
          rules={[
            { type: 'number' },
          ]}
          extra={(
            <div>联系人不在库里？<a onClick={handleManualInput}>手动输入</a></div>
          )}
        >
          <SelectPartner onChange={handleChangeBduser} />
        </Form.Item>
        {isLibrarySelect && bduser && (
          <div>
            <LayoutItem label={i18n('project_bd.contact_title')}>
              {bduser.title && bduser.title.name}
            </LayoutItem>
            <LayoutItem label={i18n('project_bd.contact_mobile')}>
              {bduser.mobile}
            </LayoutItem>
            <LayoutItem label={i18n('project_bd.email')}>
              {bduser.email}
            </LayoutItem>
          </div>
        )}
        <Form.Item
          hidden={isLibrarySelect}
          label={i18n('project_bd.contact_name')}
          name="username"
          extra={!isLibrarySelect && (
            <div>联系人在库里？<a onClick={handleLibrarySelect}>选择联系人</a></div>
          )}
        >
          <Input />
        </Form.Item>
        <Form.Item
          hidden={isLibrarySelect}
          label={i18n('project_bd.contact_title')}
          name="usertitle"
          rules={[
            { type: 'number' }
          ]}
        >
          <SelectTitle showSearch />
        </Form.Item>
        <Form.Item
          hidden={isLibrarySelect}
          {...formItemLayout}
          label={i18n('project_bd.contact_mobile')}
        >
          <Row gutter={8}>
            <Col span={6}>
              <Form.Item
                name="mobileAreaCode"
              >
                <Input prefix="+" />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item
                name="usermobile"
                rules={[
                  isLibrarySelect ? {} : { validator: checkMobileInfo },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item
          hidden={isLibrarySelect}
          label={i18n('project_bd.email')}
          name="useremail"
          rules={[
            { type: 'email' }
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function mapStateToProps(state) {
  const { country } = state.app;
  return { country };
}

export default connect(mapStateToProps)(ModalEditProjBD);
