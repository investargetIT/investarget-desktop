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
