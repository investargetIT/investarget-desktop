import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { i18n, intersection, subtracting, hasPerm, isLogin, getUserGroupIdByName } from '../utils/util'
import LeftRightLayout from '../components/LeftRightLayout'
import { Form, Button, Modal } from 'antd'
import UserForm from '../components/UserForm'
import { routerRedux } from 'dva/router'
import * as api from '../api'
import { UserRemarkList } from '../components/RemarkList'

const confirm = Modal.confirm

function onValuesChange(props, values) {
  // console.log(values)
}
function mapPropsToFields(props) {
  return props.data
}
const EditUserForm = Form.create({ onValuesChange, mapPropsToFields })(UserForm)


class EditUser extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: {}
    }
    this.majorRelation = []
    this.minorRelation = []
  }

  handleSubmit = e => {
    const userId = Number(this.props.params.id)
    this.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        console.log('Received values of form: ', values, this.majorRelation, this.minorRelation)

        // 修改熟悉程度
        if (values.famlv) {
          const relation = {
            investoruser: userId,
            traderuser: isLogin().id
          };
          api.getUserRelation(relation)
            .then(result => api.editUserRelation(
              [{
                ...relation,
                familiar: values.famlv,
                id: result.data.data[0].id,
                relationtype: result.data.data[0].relationtype,
              }]
            ));
        }


        let body = values

        // #426
        if (body.userstatus === 2) {
          const juniorInvestorGroupId = getUserGroupIdByName(this.props.group, '初级投资人');
          const juniorTraderGroupId = getUserGroupIdByName(this.props.group, '初级交易师');
          if (body.groups[0] === juniorInvestorGroupId) {
            const investorGroupId = getUserGroupIdByName(this.props.group, '用户');
            body.groups = [investorGroupId];
          } else if (body.groups[0] === juniorTraderGroupId) {
            const traderGroupId = getUserGroupIdByName(this.props.group, '交易师');
            body.groups = [traderGroupId];
          }
        }

        if (body.tags) {
          body.tags = body.tags.reduce((prev, curr) => prev.concat(JSON.parse(curr)), []);
        }

        if (!hasPerm('usersys.admin_changeuser')) {
          body = { ...values, groups: undefined}
        }
        let promise = new Promise((resolve,reject)=>{
          if(isNaN(body.org)&&body.org!=undefined){
            resolve(api.addOrg({orgnameC:values.org}))
          }
          else{
            resolve(null);
          }
        })
        promise.then(data=>{
          if(data){
            body.org=data.data.id
          }
          return api.editUser([userId], body)
        })  
        .then(result => {
          let url = this.props.location.query.redirect || "/app/user/list"
          this.props.dispatch(routerRedux.replace(url))
        })
        .catch(error => {
          this.componentDidMount()
          this.props.dispatch({ type: 'app/findError', payload: error })
        })
        
        }
              
    })
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
      window.form = this.form
    }
  }

  getData = (data) => {
    let _data = {  ...data }
    _data['groups'] = data.groups && data.groups.map(item => item.id)
    _data['title'] = data.title && data.title.id
    _data['org'] = data.org && String(data.org.id);
    _data['orgarea'] = data.orgarea && data.orgarea.id
    _data['tags'] = data.tags ? data.tags.map(item => item.id) : []
    _data['userstatus'] = data.userstatus && data.userstatus.id
    _data['country'] = data.country && data.country.id
    _data['major_trader'] = data.majorTraderID
    _data['minor_traders'] = data.minorTraderIDArr || []
    _data['onjob'] = data.onjob;

    // 如果正在编辑我的投资人，获取并设置投资人和交易师的熟悉程度
    if (this.props.location.query.redirect === '/app/investor/my') {
      const relations = this.minorRelation.concat(this.majorRelation);
      const famlv = relations.filter(f => f.investoruser.id === parseInt(this.props.params.id) && f.traderuser.id === isLogin().id)[0].familiar;
      _data['famlv'] = famlv;
    }

    const textFields = ['targetdemand', 'mergedynamic', 'ishasfundorplan']
    textFields.forEach(item => {
      if (_data[item] == null) { _data[item] = '' }
    })

    for (let prop in _data) {
      _data[prop] = { value: _data[prop] }
    }
    _data['isInvestor'] = data.isInvestor
    return _data
  }


  componentDidMount() {
    const userId = Number(this.props.params.id)
    let userDetailInfo, investorGroup
    api.queryUserGroup({ type: 'investor', page_size: 100 })
    .then(data => {
      investorGroup = data.data.data.map(m => m.id)
      return api.getUserInfo(userId, true);
    })
    .then(result => {
      userDetailInfo = result.data
      if (intersection(result.data.groups.map(m => m.id), investorGroup).length > 0) {
        const param = { investoruser: userId }
        return api.getUserRelation(param)
      } else {
        return Promise.resolve()
      }
    }).then(result => {
      if (result) {
        const majorTraderArr = result.data.data.filter(f => f.relationtype)
        if (majorTraderArr.length > 0) {
          this.majorRelation = majorTraderArr[0]
          const majorTraderID = majorTraderArr[0].traderuser.id + ""
          userDetailInfo = { ...userDetailInfo, majorTraderID, isInvestor: true }
        }
        const minorTraderIDArr = result.data.data.filter( f => !f.relationtype).map(m => m.traderuser.id + "")
        this.minorRelation = result.data.data.filter(f => !f.relationtype)
        userDetailInfo = { ...userDetailInfo, minorTraderIDArr, isInvestor: true }
      }
      this.setState({ data: this.getData(userDetailInfo) })
    }).catch(error => console.error(error))
  }

  handleSelectTrader = (type, value) => {
    const isSelectMajorTrader = type === 'major'
    const body = {
      investoruser: this.props.params.id,
      traderuser: value,
      relationtype: isSelectMajorTrader
    }
    if (isSelectMajorTrader && !Array.isArray(this.majorRelation) && this.majorRelation) {
      api.editUserRelation([{ ...body, id: this.majorRelation.id }])
      .then(data => {
        this.majorRelation = data.data[0]
      })
      .catch(err => {
        this.form.setFieldsValue({ major_trader: this.majorRelation.traderuser.id + "" })
        this.props.dispatch({ type: 'app/findError', payload: err })
      })
      return
    }

    api.addUserRelation(body)
    .then(data => {
      if (isSelectMajorTrader) {
        this.majorRelation = data.data
      } else {
        this.minorRelation.push(data.data)
      }
    })
    .catch(err => {
      this.form.setFieldsValue({ minor_traders: this.minorRelation.map(m => m.traderuser.id + "") })
      this.props.dispatch({ type: 'app/findError', payload: err })
    })
  }

  handleDeselectTrader = value => {
    const index = this.minorRelation.map(m => m.traderuser.id).indexOf(parseInt(value, 10))
    if (index < 0) return
    const investor = this.minorRelation[index].investoruser.username
    const trader = this.minorRelation[index].traderuser.username
    const react = this
    confirm({
      title: i18n('user.message.user_remove_relation', {investor, trader}),
      onOk() {
        react.deleteUserRelation(index)
      },
      onCancel() {
        react.form.setFieldsValue({ minor_traders: react.minorRelation.map(m => m.traderuser.id + "") })
      }
    })
  }

  deleteUserRelation(index) {
    api.deleteUserRelation([this.minorRelation[index].id])
    .then(() => this.minorRelation.splice(index, 1))
    .catch(err => {
      this.form.setFieldsValue({ minor_traders: this.minorRelation.map(m => m.traderuser.id + "") })
      this.props.dispatch({ type: 'app/findError', payload: err })
    })
  }

  handleMajorTraderChange = (value) => {
    if (value == undefined) {
      let id = this.majorRelation.id
      let investor = this.majorRelation.investoruser.username
      let trader = this.majorRelation.traderuser.username
      let react = this
      confirm({
        title: i18n('user.message.user_remove_relation', {investor, trader}),
        onOk() {
          react.deleteUserMajorRelation(id)
        },
        onCancel() {
          react.form.setFieldsValue({ major_trader: react.majorRelation.traderuser.id + "" })
        }
      })
    }
  }

  deleteUserMajorRelation = (id) => {
    api.deleteUserRelation([id])
    .then(() => { this.majorRelation = null })
    .catch(err => {
      this.form.setFieldsValue({ major_trader: this.majorRelation.id + "" })
      this.props.dispatch({ type: 'app/findError', payload: err })
    })
  }

  handleOnBlur(accountType, evt) {
    const account = evt.target.value;
    if (!account) return
    const mobileAndEmail = [this.state.data.email.value, this.state.data.mobile.value];
    if (mobileAndEmail.includes(account)) {
      if (accountType === 'mobile' && account.length === 11) {
        this.getPhoneAddress(account);
      }
      return;
    }
    api.checkUserExist(account)
    .then(data => {
      const isExist = data.data.result
      if (isExist) {
        Modal.warning({ title: i18n('user.message.user_exist') })
      } else {
        if (accountType === 'mobile' && account.length === 11) {
          this.getPhoneAddress(account);
        }
      }
    })
  }

  getPhoneAddress = async (mobile) => {
    window.echo('org area', this.props.orgarea);
    window.echo('country', this.props.country);
    const res = await api.getPhoneAddress(mobile);
    const { data: result } = res;
    const { att } = result;
    if (!att) return;
    const [country, province, city] = att.split(',');
    const countryIndex = this.props.country.map(m => m.country).indexOf(country);
    if (countryIndex > -1) {
      const countryId = this.props.country[countryIndex].id;
      this.form.setFieldsValue({ country: countryId });
    }
    const cityIndex = this.props.orgarea.map(m => m.name).indexOf(city);
    const provinceIndex = this.props.orgarea.map(m => m.name).indexOf(province);
    if (cityIndex > -1) {
      const cityId = this.props.orgarea[cityIndex].id;
      this.form.setFieldsValue({ orgarea: cityId });
    } else if (provinceIndex > -1) {
      const provinceId = this.props.orgarea[provinceIndex].id;
      this.form.setFieldsValue({ orgarea: provinceId });
    }
    // if (countryIndex > -1 || cityIndex > -1 || provinceIndex > -1) {
    //   this.forceUpdate();
    // }
  }

  render () {
    const userId = Number(this.props.params.id)
    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n('user.edit_user')}>

        <EditUserForm
          wrappedComponentRef={this.handleRef}
          data={this.state.data}
          type="edit"
          onSelectMajorTrader={this.handleSelectTrader.bind(this, 'major')}
          onMajorTraderChange={this.handleMajorTraderChange}
          onSelectMinorTrader={this.handleSelectTrader.bind(this, 'minor')}
          onDeselectMinorTrader={this.handleDeselectTrader}
          mobileOnBlur={this.handleOnBlur.bind(this, 'mobile')}
          emailOnBlur={this.handleOnBlur.bind(this, 'email')}
          showFamlvRadio={this.props.location.query.redirect === '/app/investor/my'}
        />

        <div style={{textAlign: 'center'}}>
          <Button type="primary" size="large" onClick={this.handleSubmit}>{i18n("common.submit")}</Button>
        </div>

        <UserRemarkList typeId={userId} />

      </LeftRightLayout>
    )
  }
}

function mapStateToProps(state) {
  const { country, orgarea, group } = state.app;
  return { country, orgarea, group };
}

export default connect(mapStateToProps)(EditUser);
