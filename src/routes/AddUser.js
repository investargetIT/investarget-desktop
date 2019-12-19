import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, isLogin, hasPerm } from '../utils/util'
import * as api from '../api'
import LeftRightLayout from '../components/LeftRightLayout'
import { Form, Button, Modal } from 'antd'
import UserForm from '../components/UserForm'
import { routerRedux } from 'dva/router'
import { URI_12 } from '../constants'


function onValuesChange(props, values) {
  if (values.org) {
    props.onOrgChange(values.org);
  }
  props.onValuesChange(values);
}
function mapPropsToFields(props) {
  return props.data;
}
const AddUserForm = Form.create({ onValuesChange, mapPropsToFields })(UserForm);


class AddUser extends React.Component {

  state = {
    visible: false,
    confirmLoading: false,
  }

  isTraderAddInvestor = this.props.location.query.redirect === URI_12
  isAdminAddInvestor = this.props.location.query.redirect ?
    this.props.location.query.redirect.startsWith('/app/orguser/list') : false;

  orgID = this.props.location.query.redirect && this.props.location.query.redirect.indexOf('?') !== -1 ? this.props.location.query.redirect.split('?')[1].split('=')[1] : null;

  existingUser = null;

  formData = { org: { value: this.orgID } };

  handleSubmit = e => {
    this.form.validateFieldsAndScroll((err, values) => {
      window.echo('ddd', values);
      if(!err) {
        console.log('Received values of form: ', values)
        if (this.isTraderAddInvestor) {
          values.userstatus = 2
        }
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
            if(isNaN(values.org)&&values.org!=undefined){
              const body = { orgnameC: values.org };
              if (values.cardKey) {
                body.orgstatus = 2;
              }
              return api.addOrg(body);
            }      
          }
        })
        .then(data=>{
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
          if (!data && this.isTraderAddInvestor) return
          this.props.dispatch(
            routerRedux.replace(this.props.location.query.redirect || '/app/user/list')
          )
        })
        .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }))
      }
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
    window.echo('get phone address result', result);
    this.formData.orgarea = { value: 1 };
    this.formData.country = { value: 42 };
    this.forceUpdate();
  }

  handleCnNameOnBlur(evt) {
    const name = evt.target.value;
    const org = this.form.getFieldValue('org');
    if (name && org) {
      this.checkIfExistsUserWithSameNameInThisOrg(org, name);
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
      this.props.dispatch(routerRedux.replace(this.props.location.query.redirect))
    })
    .catch(err => {
      this.setState({ visible: false, confirmLoading: false })
      this.props.dispatch({ type: 'app/findError', payload: err })
    })
  }

  handleCancel = () => this.setState({ visible: false })

  handleOrgChange(org) {
    const usernameC = this.form.getFieldValue('usernameC');
    if (usernameC) {
      this.checkIfExistsUserWithSameNameInThisOrg(org, usernameC);
    }
  }

  checkIfExistsUserWithSameNameInThisOrg = (org, username) => {
    const react = this;
    let userID;
    api.getUser({ org, usernameC: username })
      .then(result => {
        if (result.data.count > 0) {
          userID = result.data.data[0].id;
          return api.checkUserRelation(userID, isLogin().id);
        }
      })
      .then(result => {
        if (result === undefined) return;
        let editable = '';
        if (result.data || hasPerm('usersys.admin_changeuser')) {
          editable = 'edit/';
        }
        Modal.warning({
          title: '该机构已有同名投资人',
          okText: '确定',
          onOk() {
            react.props.history.push(`/app/user/${editable}${userID}`);
          }
        });
      })
  };

  handleAddFormValuesChange = values => {
    window.echo('aa props value changes', values);
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

        <AddUserForm type="add"
          isTraderAddInvestor={this.isTraderAddInvestor}
          wrappedComponentRef={this.handleRef}
          onValuesChange={this.handleAddFormValuesChange}
          onOrgChange={this.handleOrgChange.bind(this)}
          mobileOnBlur={this.handleOnBlur.bind(this, 'mobile')}
          cnNameOnBlur={this.handleCnNameOnBlur.bind(this)}
          data={this.formData}
          emailOnBlur={this.handleOnBlur.bind(this, 'email')} />

        <div style={{textAlign: 'center'}}>
          <Button type="primary" size="large" onClick={this.handleSubmit}>{i18n("common.submit")}</Button>
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

export default connect()(AddUser)
