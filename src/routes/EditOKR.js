import React from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import * as api from '../api'
import { i18n, handleError } from '../utils/util'
import { Form, Button, InputNumber, Modal } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import OKRForm from '../components/OKRForm';


function onValuesChange(props, values) {
  console.log(values);
}
function mapPropsToFields(props) {
  return props.data;
}
const EditOKRForm = Form.create({ onValuesChange, mapPropsToFields })(OKRForm);


class EditOKR extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      result: [],
    };
  }

  componentDidMount() {
    this.getOkrAndResult().catch((error) => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      });
    });
  }

  getOkrAndResult = async () => {
    const id = Number(this.props.params.id);
    const resOKR = await api.getOKRDetail(id);
    const { data: okr } = resOKR;
    this.setState({ data: okr });
    const { id: okrId } = okr;
    const resRes = await api.getOKRResult({ okr: okrId });
    this.setState({ result: resRes.data.data });
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
      window.form = this.form
    }
  }

  handleCancel = () => {
    this.props.history.goBack();
  }

  handleSubmit = () => {
    this.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.editOKR(values)
          .then(this.props.router.goBack)
          .catch(handleError);
      }
    });
  }

  editOKR = async (values) => {
    const id = Number(this.props.params.id);
    await api.editOKR(id, values);
  }

  getFormData = () => {
    const formData = {};

    const { data: okr } = this.state;
    for (const prop in okr) {
      formData[prop] = { value: okr[prop] };
    }

    const krsKeys = this.state.result.map(m => `id-${m.id}`);
    formData.keys = krsKeys;

    this.state.result.forEach((element) => {
      const m = `id-${element.id}`;
      formData[`krs_${m}`] = { value: element.krs };
      formData[`confidence_${m}`] = { value: element.confidence };
    });

    window.echo('get form data', formData);
    return formData;
  }

  render() {
    return (
      <LeftRightLayout location={this.props.location} title="编辑OKR">
        <div>
          <EditOKRForm wrappedComponentRef={this.handleRef} data={this.getFormData()} />
          <div style={{ textAlign: 'center' }}>
            <Button style={{ margin: '0 8px' }} type="primary" size="large" onClick={this.handleSubmit}>{i18n('common.submit')}</Button>
            <Button style={{ margin: '0 8px' }} size="large" onClick={this.handleCancel}>{i18n('common.cancel')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    );
  }
}

export default connect()(withRouter(EditOKR));
