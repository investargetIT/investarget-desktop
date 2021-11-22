import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, isLogin, hasPerm, getURLParamValue } from '../utils/util'
import * as api from '../api'
import LeftRightLayout from '../components/LeftRightLayout'
import { Form, Button, Modal } from 'antd'
import UserForm from '../components/UserForm'
import { routerRedux } from 'dva/router'
import { URI_12 } from '../constants'


function onValuesChange(props, values) {
  props.onValuesChange(values);
}
function mapPropsToFields(props) {
  return props.data;
}
// const AddUserForm = Form.create({ onValuesChange, mapPropsToFields })(UserForm);


class AddUser extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      confirmLoading: false,
      loadingAddUser: false,
    }
 
    this.redirectUrl = getURLParamValue(this.props, 'redirect');

    this.isTraderAddInvestor = this.redirectUrl === URI_12
    this.isAdminAddInvestor = this.redirectUrl ? this.redirectUrl.startsWith('/app/orguser/list') : false;
    this.orgID = this.redirectUrl && this.redirectUrl.indexOf('?') !== -1 ? this.redirectUrl.split('?')[1].split('=')[1] : null;
    this.existingUser = null;
    this.formData = { org: { value: this.orgID } };
    this.addUserFormRef = React.createRef();
  }

  getOrAddOrg = async values => {
    if (isNaN(values.org) && values.org != undefined) {
      const res = await api.getOrg({ search: values.org });
      if (res.data.count > 0) return { data: res.data.data[0] };
      const body = { orgnameC: values.org };
      if (values.cardKey) {
        body.orgstatus = 2;
      }
      return api.addOrg(body);
    }
  }

  handleSubmit = () => {
    this.addUserFormRef.current.validateFields()
      .then(values => {
        if (this.isTraderAddInvestor) {
          values.userstatus = 2
        }
        this.setState({ loadingAddUser: true });
        let isUserExist
        Promise.all([
          api.checkUserExist(values.mobile),
          api.checkUserExist(values.email)
        ]).then(data => {
          const isMobileExist = data[0].data.result
          const isEmailExist = data[1].data.result
          if (isMobileExist || isEmailExist) {
            isUserExist = true
            const user = data[0].data.user || data[1].data.user;
            if (!this.isTraderAddInvestor) {
              Modal.warning({ title: i18n('user.message.user_exist') })
            } else {
              this.setState({ visible: true, user });
            }
          } else {
            values['registersource'] = 3 // 标识注册来源
            return this.getOrAddOrg(values);
          }
        })
          .then(data => {
            if (data) values.org = data.data.id;
            if (!isUserExist) {
              if (values.cardKey) {
                values.cardBucket = 'image';
              }
              const registersource = this.isTraderAddInvestor ? 8 : 3;
              return api.addUser(values, registersource);
            }
          })
          .then(result => {
            if (this.isTraderAddInvestor && result) {
              const body = {
                relationtype: true,
                investoruser: result.data.id,
                traderuser: isLogin().id
              }
              return api.addUserRelation(body)
            }
          })
          .then(data => {
            this.setState({ loadingAddUser: false });
            if (!data && this.isTraderAddInvestor) return
            this.props.dispatch(
              routerRedux.replace(this.redirectUrl || '/app/user/list')
            )
          })
          .catch(error => {
            this.setState({ loadingAddUser: false });
            this.props.dispatch({ type: 'app/findError', payload: error })
          })
      })
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
      window.form = this.form
    }
  }

  async handleOnBlur(accountType, evt) {
    const account = evt.target.value;
    if (!account) return;
    const data = await api.checkUserExist(account);
    const { result: isExist } = data.data;
    if (!isExist) {
      if (accountType === 'mobile' && account.length === 11) {
        this.getPhoneAddress(account);
      }
      return;
    }
    if (!this.isTraderAddInvestor) {
      Modal.warning({ title: i18n('user.message.user_exist') });
    } else {
      this.setState({ visible: true, user: data.data.user });
    }
  }

  getPhoneAddress = async (mobile) => {
    const res = await api.getPhoneAddress(mobile);
    const { data: result } = res;
    const { city, province } = result;
    if (!city && !province) return;
    const country = '中国';
    const countryIndex = this.props.country.map(m => m.country).indexOf(country);
    if (countryIndex > -1) {
      const countryId = this.props.country[countryIndex].id;
      this.addUserFormRef.current.setFieldsValue({ country: countryId });
    }
    const cityIndex = this.props.orgarea.map(m => m.name).indexOf(city);
    const provinceIndex = this.props.orgarea.map(m => m.name).indexOf(province);
    if (cityIndex > -1) {
      const cityId = this.props.orgarea[cityIndex].id;
      this.addUserFormRef.current.setFieldsValue({ orgarea: cityId });
    } else if (provinceIndex > -1) {
      const provinceId = this.props.orgarea[provinceIndex].id;
      this.addUserFormRef.current.setFieldsValue({ orgarea: provinceId });
    }
    if (countryIndex > -1 || cityIndex > -1 || provinceIndex > -1) {
      this.forceUpdate();
    }
  }

  handleCnNameOnBlur(evt) {
    const name = evt.target.value;
    if (name) {
      this.checkIfExistsUserWithSameName(name);
    }
  }

  handleAddRelation = () => {
    this.setState({ confirmLoading: true })
    const body = {
      relationtype: true,
      investoruser: this.state.user.id,
      traderuser: isLogin().id
    }
    api.addUserRelation(body)
    .then(data => {
      this.setState({ visible: false, confirmLoading: false })
      this.props.dispatch(routerRedux.replace(this.redirectUrl));
    })
    .catch(err => {
      this.setState({ visible: false, confirmLoading: false })
      if (err.message.indexOf('身份类型不符合条件') > -1) {
        Modal.error({ title: '该用户是交易师无法添加' });
      } else {
        this.props.dispatch({ type: 'app/findError', payload: err });
      }
    })
  }

  handleCancel = () => this.setState({ visible: false })

  checkIfExistsUserWithSameName = async (username) => {
    const resUser = await api.getUser({ usernameC: username });
    const { count, data } = resUser.data;
    if (count === 0) return;

    const userID = data[0].id;
    const resRelation = await api.checkUserRelation(userID, isLogin().id);
    const { data: hasRelation } = resRelation;

    let editable = '';
    if (hasRelation || hasPerm('usersys.admin_manageuser')) {
      editable = 'edit/';
    }

    const react = this;
    Modal.confirm({
      title: '已有同名投资人',
      content: '点击确定查看该投资人',
      okText: '查看',
      cancelText: '继续编辑',
      onOk() {
        react.props.history.push(`/app/user/${editable}${userID}`);
      },
    });
  }

  handleAddFormValuesChange = values => {
    for (const prop in values) {
      this.formData[prop] = { value: values[prop] };
    }
  }

  render () {
    const title = (this.isTraderAddInvestor || this.isAdminAddInvestor)
                  ? i18n("user.add_investor")
                  : i18n("user.create_user")
    return (
      <LeftRightLayout
        location={this.props.location}
        title={title}>
        <UserForm
          type="add"
          ref={this.addUserFormRef}
          isTraderAddInvestor={this.isTraderAddInvestor}
          wrappedComponentRef={this.handleRef}
          onValuesChange={this.handleAddFormValuesChange}
          mobileOnBlur={this.handleOnBlur.bind(this, 'mobile')}
          cnNameOnBlur={this.handleCnNameOnBlur.bind(this)}
          data={this.formData}
          emailOnBlur={this.handleOnBlur.bind(this, 'email')} />

        <div style={{textAlign: 'center'}}>
          <Button
            type="primary"
            loading={this.state.loadingAddUser}
            size="large"
            onClick={this.handleSubmit}
          >{i18n("common.submit")}</Button>
        </div>

        <Modal title={i18n('user.message.user_exist')}
          visible={this.state.visible}
          onOk={this.handleAddRelation}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.handleCancel}>
          <p>{i18n('user.message.user_add_relation', {'username': this.state.user && this.state.user.username})}</p>
        </Modal>

      </LeftRightLayout>
    )
  }
}

function mapStateToProps(state) {
  const { country, orgarea } = state.app;
  return { country, orgarea };
}

export default connect(mapStateToProps)(AddUser);
