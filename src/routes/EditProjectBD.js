import React from 'react'
import { Form, Button } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'
import { connect } from 'dva';
import { i18n, handleError, exchange, getCurrencyFromId, subtracting } from '../utils/util'
import { withRouter } from 'dva/router'
import * as api from '../api'
import moment from 'moment';
import ProjectBDForm from '../components/ProjectBDForm'
import lodash from 'lodash';

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
      let allManagers = [];
      if (value) {
        let allManager = value.map(m => m.manager);
        allManager = lodash.uniqBy(allManager, 'id');
        allManagers = allManager.map(item => item.id.toString());
      }
      formData.manager = allManagers;
    }
  }

  // 如果 bduser 有值，则删除 username, usertitle, usermobile, userwechat
  if (formData['bduser']) {
    delete formData['username']
    delete formData['usertitle']
    delete formData['usermobile']
    delete formData['useremail']
    delete formData['usewechat']
  } else {
    if (formData['usermobile']) {
      const mobileArr = formData['usermobile'].split('-');
      if (mobileArr.length > 1) {
        formData.mobileAreaCode = mobileArr[0].replace('+', '');
        formData.mobile = mobileArr.slice(1).join('-');
      } else {
        formData.mobileAreaCode = '86';
        formData.mobile = formData['usermobile'];
      }
    }
    if (formData['useremail']) {
      formData.email = formData['useremail'];
    }
    if (formData['userwechat']) {
      formData.wechat = formData['userwechat'];
    }
  } 
  
  if (formData['country']) {
    formData.country = { value: formData['country'] };
  }

  return formData
}

function toData(formData) {
  if (!('bduser' in formData)) {
    formData['bduser'] = null
    formData['useremail'] = formData.email;
    formData['userwechat'] = formData.wechat;
    formData['usermobile'] = (formData.mobileAreaCode && formData.mobile) ? formData.mobileAreaCode + '-' + formData.mobile : formData.mobile;
  }
  // 如果国家不是中国，则设置地区为null
  if (formData.country.value !== 42) {
    formData['location'] = null;
  }
  formData.country = formData.country.value;
  return formData
}


class EditProjectBD extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      id: parseInt(props.match.params.id),
      bd: {},
      loadingEditProjectBD: false,
    }
    this.editProjectBDFormRef = React.createRef();
  }

  goBack = () => {
    this.props.history.goBack()
  }

  handleFormSubmit = () => {
    this.editProjectBDFormRef.current.validateFields()
      .then(values => {
        this.setState({ loadingEditProjectBD: true });
        this.editProjectBD(values)
        .then(this.goBack)
        .catch(handleError)
        .finally(() => this.setState({ loadingEditProjectBD: false }));
      });
  }

  editProjectBD = async (values) => {
    const param = toData(values);

    if (param.manager) {
      const { manager: newManager } = param;
      let { manager: oldManager, id: projectBdId } = this.state.bd;

      if (oldManager === null) {
        oldManager = [];
      }

      const oldNormalManagerIds = oldManager.map(m => m.manager.id);
      const newNormalManagerIds = newManager.map(m => parseInt(m));

      // 可能会出现重复 id 的执行团队需要删除
      const normalManagerToDel = subtracting(oldNormalManagerIds, newNormalManagerIds);
      await Promise.all(normalManagerToDel.map(m => {
        const index = oldManager.map(m => m.manager.id).indexOf(m);
        const relateManagerId = oldManager[index].id;
        oldManager.splice(index, 1);
        return api.deleteProjectBdRelatedManager(relateManagerId);
      }));
      const normalManagerToAdd = subtracting(newNormalManagerIds, oldNormalManagerIds);
      await Promise.all(normalManagerToAdd.map(m => {
        const body = {
          manager: m,
          projectBD: projectBdId,
          type: 3,
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
    await api.editProjBD(id, { ...param, manager: undefined });

    // 状态改为暂不BD后，详细需求见bugClose #344
    if (status === 4 && this.state.bd.bd_status.id !== 4) {
      const { bd_status, contractors } = this.state.bd;
      await api.addProjBDCom({
        projectBD: this.state.bd.id,
        comments: `之前状态：${bd_status.name}，发起人: ${contractors ? contractors.username : '无'}`,
      });
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
        this.setState({ bd: result.data }, this.setEditProjectBDFormValues);
      }
    }).then(rate => {
      if (rate) {
        bd.financeAmount_USD = Math.round(financeValue * rate);
        this.setState({ bd }, this.setEditProjectBDFormValues);
      }
    })
    .catch(error => {
      handleError(error)
    })
    this.props.dispatch({ type: 'app/getSourceList', payload: ['country'] });
  }

  setEditProjectBDFormValues = () => {
    const data = this.getFormData();
    this.editProjectBDFormRef.current.setFieldsValue(data);
  }

  getFormData = () => {
    const data = toFormData(this.state.bd)
    if (data) {
      const countryObj = data.country;
      if (countryObj && this.props.country.length > 0) {
        const country = this.props.country.filter(f => f.id === countryObj.value.value)[0];
        if (country) {
          data.country.label = country.country
        }
      }
    }
    return data; 
  }

  render() {
    return (
      <LeftRightLayout location={this.props.location} title={i18n('project_bd.edit_project_bd')}>
        <div>
          <ProjectBDForm ref={this.editProjectBDFormRef} data={this.getFormData()} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" loading={this.state.loadingEditProjectBD} size="large" style={actionBtnStyle} onClick={this.handleFormSubmit}>{i18n('common.submit')}</Button>
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
