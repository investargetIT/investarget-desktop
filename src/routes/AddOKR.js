import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { withRouter, Link } from 'dva/router'
import * as api from '../api'
import { i18n } from '../utils/util'


import { Form, Button, message } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import OKRForm from '../components/OKRForm';


const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}


function onValuesChange(props, values) {
  console.log(values)
}
const AddOKRForm = Form.create({onValuesChange})(OKRForm);

class AddOKR extends React.Component {

  constructor(props) {
    super(props);
  }

  goBack = () => {
    this.props.router.goBack();
  }

  handleSubmitBtnClick = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        // let param = toData(values)
        this.addOKR(values)
          .then(() => {
            this.props.router.goBack();
          })
          .catch((error) => {
            this.props.dispatch({
              type: 'app/findError',
              payload: error,
            });
          });
      }
    });
  }

  getOKRResultFormData = (values) => {
    const result = [];
    for (const property in values) {
      if (property.startsWith('krs')) {
        const krs = values[property];
        const infos = property.split('_');
        const key = infos[1];
        const confidence = values[`confidence_${key}`];
        const o = { krs, confidence };
        result.push(o);
      }
    }
    return result;
  }

  getOKR = (values) => {
    let result1 = [];
    for (const property in values) {
      if (property.startsWith('okr')) {
        const value = values[property];
        const infos = property.split('_');
        const key = infos[1];
        const fieldName = infos[2];
        const krsKey = infos[3];
        const o = { key, fieldName, krsKey, value };
        result1.push(o);
      }
    }

    result1 = result1.filter(f => f.fieldName === 'target' && !f.value);
    window.echo('result1', result1);

    const okrKeys = result1.map(m => m.key);
    const uniqueOkrKeys = okrKeys.filter((v, i, a) => a.indexOf(v) === i);
    const result = [];
    uniqueOkrKeys.forEach((e) => {
      const krsArr = [];
      const target = result1.filter(f => f.key === e && f.fieldName === 'target')[0].value;
      const krsData = result1.filter(f => f.key === e && f.krsKey);
      const krsKeys = krsData.map(m => m.krsKey);
      const uniqueKrsKeys = krsKeys.filter((v, i, a) => a.indexOf(v) === i);
      uniqueKrsKeys.forEach((g) => {
        const krs = krsData.filter(f => f.krsKey === g && f.fieldName === 'krs')[0].value;
        const confidence = krsData.filter(f => f.krsKey === g && f.fieldName === 'confidence')[0].value;
        krsArr.push({ krs, confidence });
      });
      result.push({ target, krsArr });
    });
    
    return result;
  }

  addOKR = async (values) => {
    const res = await api.addOKR(values);
    window.echo('add okr', res);
    const { id } = res.data;
    const okrResult = this.getOKRResultFormData(values);
    window.echo('okrResult', okrResult);
    await Promise.all(okrResult.map(m => api.addOKRResult({ ...m, okr: id })));
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  render() {
    return (
      <LeftRightLayout location={this.props.location} title="编辑OKR">
        <div>
          <AddOKRForm wrappedComponentRef={this.handleRef} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.handleSubmitBtnClick}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }

}

export default connect()(withRouter(AddOKR));
