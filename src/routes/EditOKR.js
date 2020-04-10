import React from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import * as api from '../api'
import { i18n, handleError, subtracting } from '../utils/util';
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
      loading: false,
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
        this.setState({ loading: true });
        this.editOKR(values)
          .then(this.props.router.goBack)
          .catch(handleError)
          .finally(() => this.setState({ loading: false }));
      }
    });
  }

  editOKR = async (values) => {
    const id = Number(this.props.params.id);
    const res = await api.editOKR(id, values);
    const { id: okrId } = res.data;

    const krs = this.getOKRResultFormData(values);

    const newKrs = krs.filter(f => !f.key.startsWith('id'));
    await Promise.all(newKrs.map(m => api.addOKRResult({ ...m, okr: okrId })));

    const oldKrs = krs.filter(f => f.key.startsWith('id'));
    await Promise.all(oldKrs.map((m) => {
      const krsId = parseInt(m.key.split('-')[1], 10);
      return api.editOKRResult(krsId, m);
    }));

    const oldKrsIds = oldKrs.map(m => parseInt(m.key.split('-')[1], 10));
    const originalKrsIds = this.state.result.map(m => m.id);
    const toDeleteIds = subtracting(originalKrsIds, oldKrsIds);
    await Promise.all(toDeleteIds.map(m => api.deleteOKRResult(m)));
  }

  getOKRResultFormData = (values) => {
    const result = [];
    for (const property in values) {
      if (property.startsWith('krs')) {
        const krs = values[property];
        const infos = property.split('_');
        const key = infos[1];
        const confidence = values[`confidence_${key}`];
        const o = { key, krs, confidence };
        result.push(o);
      }
    }
    return result;
  }

  getFormData = () => {
    const formData = {};

    const { data: okr } = this.state;
    for (const prop in okr) {
      formData[prop] = { value: okr[prop] };
    }

    const krsKeys = this.state.result.map(m => `id-${m.id}`);
    formData.keys = { value: krsKeys };

    this.state.result.forEach((element) => {
      const m = `id-${element.id}`;
      formData[`krs_${m}`] = { value: element.krs };
      formData[`confidence_${m}`] = { value: element.confidence };
    });

    return formData;
  }

  render() {
    return (
      <LeftRightLayout location={this.props.location} title="编辑OKR">
        <div>
          <EditOKRForm wrappedComponentRef={this.handleRef} data={this.getFormData()} />
          <div style={{ textAlign: 'center' }}>
            <Button style={{ margin: '0 8px' }} loading={this.state.loading} type="primary" size="large" onClick={this.handleSubmit}>{i18n('common.submit')}</Button>
            <Button style={{ margin: '0 8px' }} size="large" onClick={this.handleCancel}>{i18n('common.cancel')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    );
  }
}

export default connect()(withRouter(EditOKR));
