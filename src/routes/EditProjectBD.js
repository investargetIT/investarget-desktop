import React from 'react'
import { Form, Button } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { connect } from 'dva';
import { i18n, handleError, exchange, getCurrencyFromId, subtracting } from '../utils/util'
import { withRouter } from 'dva/router'
import * as api from '../api'
import moment from 'moment';
import ProjectBDForm from '../components/ProjectBDForm'

function onValuesChange(props, values) {
  console.log(values)
}
function mapPropsToFields(props) {
  return props.data
}
const EditProjectBDForm = Form.create({onValuesChange, mapPropsToFields})(ProjectBDForm)

const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}

function toFormData(data) {
  var formData = { ...data, expirationtime: data.expirationtime && moment(data.expirationtime) };

  for (let prop in formData) {
    let value = formData[prop]
    if (['bd_status', 'location', 'usertitle', 'financeCurrency', 'contractors'].includes(prop)) {
      formData[prop] = value && value.id
    }
    if (prop === 'manager') {
      const { main, normal } = value;
      let allManagers = [];
      if (main) {
        allManagers.push(main.id.toString());
      }
      if (normal) {
        allManagers = allManagers.concat(normal.map(m => m.manager.id.toString()));
      }
      formData.manager = allManagers;
    }
  }

  // 如果 bduser 有值，则删除 username, usertitle, usermobile
  if (formData['bduser']) {
    delete formData['username']
    delete formData['usertitle']
    delete formData['usermobile']
  } else if (formData['usermobile']) {
    const mobileArr = formData['usermobile'].split('-');
    if (mobileArr.length > 1) {
    formData.mobileAreaCode = mobileArr[0];
    formData.mobile = mobileArr.slice(1).join('-'); 
    } else {
      formData.mobileAreaCode = '86';
      formData.mobile = formData['usermobile'];  
    }
  } 
  
  if (formData['country']) {
    formData.country = { value: formData['country'] };
  }

  for (let prop in formData) {
    formData[prop] = { value: formData[prop] }
  }
  return formData
}

function toData(formData) {
  if (!('bduser' in formData)) {
    formData['bduser'] = null
    formData['usermobile'] = (formData.mobileAreaCode && formData.mobile) ? formData.mobileAreaCode + '-' + formData.mobile : formData.mobile;
  }
  if (!['中国', 'China'].includes(formData.country.label)) {
    formData['location'] = null;
  }
  formData.country = formData.country.value;
  return formData
}


class EditProjectBD extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      id: parseInt(this.props.params.id),
      bd: {},
    }
  }

  goBack = () => {
    this.props.router.goBack()
  }

  handleFormSubmit = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        this.editProjectBD(values).then(this.props.router.goBack).catch(handleError);
      }
    })
  }

  editProjectBD = async (values) => {
    const param = toData(values);

    if (param.manager) {
      const { manager: newManager } = param;
      const { manager: oldManager, id: projectBdId } = this.state.bd;
      let { main: oldMainManager, normal: oldNormalManager } = oldManager;
      let newNormalManager = [];
      if (newManager.includes(oldMainManager.id.toString())) {
        param.manager = oldMainManager.id;
        newNormalManager = newManager.filter(f => f !== oldMainManager.id.toString());
      } else {
        param.manager = newManager[0];
        newNormalManager = newManager.slice(1);
      }

      if (oldNormalManager === null) {
        oldNormalManager = [];
      }

      const oldNormalManagerIds = oldNormalManager.map(m => m.manager.id);
      const newNormalManagerIds = newNormalManager.map(m => parseInt(m));

      const normalManagerToDel = subtracting(oldNormalManagerIds, newNormalManagerIds);
      await Promise.all(normalManagerToDel.map(m => {
        const relateManagerId = oldNormalManager.filter(f => f.manager.id === m)[0].id;
        return api.deleteProjectBdRelatedManager(relateManagerId);
      }));
      const normalManagerToAdd = subtracting(newNormalManagerIds, oldNormalManagerIds);
      await Promise.all(normalManagerToAdd.map(m => {
        const body = {
          manager: m,
          projectBD: projectBdId,
        };
        return api.addProjectBdRelatedManager(body);
      }));
    }

    const { bd_status: status } = param;
    // 状态改为暂不BD后，详细需求见bugClose #344
    if (status === 4 && this.state.bd.bd_status.id !== 4) {
      // param.contractors = null;
    }
    
    const { id } = this.state;
    await api.editProjBD(id, param);

    // 状态改为暂不BD后，详细需求见bugClose #344
    if (status === 4 && this.state.bd.bd_status.id !== 4) {
      const { bd_status, contractors } = this.state.bd;
      await api.addProjBDCom({
        projectBD: this.state.bd.id,
        comments: `之前状态：${bd_status.name}，签约负责人: ${contractors ? contractors.username : '无'}`,
      });
    }
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  componentDidMount() {
    const { id } = this.state
    let bd, financeValue;
    api.getProjBD(id).then(result => {
      bd = result.data;
      if (result.data['financeCurrency'] && result.data['financeAmount']) {
        const currency = result.data['financeCurrency'].id;
        financeValue = result.data['financeAmount'];
        return exchange(getCurrencyFromId(currency));
      } else {
        this.setState({ bd: result.data });
      }
    }).then(rate => {
      if (rate) {
        bd.financeAmount_USD = Math.round(financeValue * rate);
        this.setState({ bd });
      }
    })
    .catch(error => {
      handleError(error)
    })
    this.props.dispatch({ type: 'app/getSourceList', payload: ['country'] });
  }

  render() {
    const data = toFormData(this.state.bd)
    if (data) {
      const countryObj = data.country;
      if (countryObj && this.props.country.length > 0) {
        const country = this.props.country.filter(f => f.id === countryObj.value.value)[0];
        data.country.value.label = country.country
      }
    }
    return (
      <LeftRightLayout location={this.props.location} title={i18n('project_bd.edit_project_bd')}>
        <div>
          <EditProjectBDForm wrappedComponentRef={this.handleRef} data={data} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.handleFormSubmit}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }
}

function mapStateToProps(state) {
  const { country } = state.app;
  return { country };
}

export default connect(mapStateToProps)(withRouter(EditProjectBD));
