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
      okr: [],
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
    const userId = Number(this.props.params.id);
    const resOKR = await api.getOKRList({ createuser: userId });
    const { count } = resOKR.data;
    if (count === 0) {
      this.props.router.replace('/app/okr/list');
      return;
    }
    const resOKR1 = await api.getOKRList({ createuser: userId, page_size: count });
    const okr = resOKR1.data.data;
    const { year, okrType, quarter } = okr[0];

    for (let index1 = 0; index1 < okr.length; index1++) {
      const element1 = okr[index1];
      const okrResult = await api.getOKRResult({ okr: element1.id });
      const { count: count1 } = okrResult.data;
      if (count1 === 0) {
        element1.okrResult = [];
      } else {
        const okrResult1 = await api.getOKRResult({ okr: element1.id, page_size: count1 });
        element1.okrResult = okrResult1.data.data;
      }
    }
    window.echo('okr', okr);
    this.setState({ okr, data: { year, okrType, quarter } });
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

  addOKR = async (values, allOkr) => {
    const { year, okrType, quarter } = values;
    for (let index = 0; index < allOkr.length; index++) {
      const element = allOkr[index];
      const { target, krsArr } = element;
      const res = await api.addOKR({ year, okrType, quarter, target });
      const { id } = res.data;
      for (let index1 = 0; index1 < krsArr.length; index1++) {
        const element1 = krsArr[index1];
        await api.addOKRResult({ ...element1, okr: id });
      }
    }
  }

  editOldOKR = async (values, allOkr) => {
    const { year, okrType, quarter } = values;
    for (let index = 0; index < allOkr.length; index++) {
      const element = allOkr[index];
      const { target, krsArr } = element;
      const res = await api.editOKR(id, { year, okrType, quarter, target });
      const { id } = res.data;

      const newKrs = krsArr.filter(f => !f.key.startsWith('id'));
      await Promise.all(newKrs.map(m => api.addOKRResult({ ...m, okr: id })));

      const oldKrs = krsArr.filter(f => f.key.startsWith('id'));
      await Promise.all(oldKrs.map((m) => {
        const krsId = parseInt(m.key.split('-')[1], 10);
        return api.editOKRResult(krsId, m);
      }));

      // TODO
      const oldKrsIds = oldKrs.map(m => parseInt(m.key.split('-')[1], 10));
      const originalKrsIds = this.state.result.map(m => m.id);
      const toDeleteIds = subtracting(originalKrsIds, oldKrsIds);
      await Promise.all(toDeleteIds.map(m => api.deleteOKRResult(m)));
    }
  }

  editOKR = async (values) => {
    // const id = Number(this.props.params.id);
    // const res = await api.editOKR(id, values);
    // const { id: okrId } = res.data;

    const okr = this.getOKRFormData(values);

    const newOkr = okr.filter(f => !f.key.startsWith('id'));
    await this.addOKR(values, newOkr);

    const oldKrs = okr.filter(f => f.key.startsWith('id'));
    await Promise.all(oldKrs.map((m) => {
      const krsId = parseInt(m.key.split('-')[1], 10);
      return api.editOKRResult(krsId, m);
    }));

    const oldKrsIds = oldKrs.map(m => parseInt(m.key.split('-')[1], 10));
    const originalKrsIds = this.state.result.map(m => m.id);
    const toDeleteIds = subtracting(originalKrsIds, oldKrsIds);
    await Promise.all(toDeleteIds.map(m => api.deleteOKRResult(m)));
  }

  getOKRFormData = (values) => {
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
        krsArr.push({ krs, confidence, key: g });
      });
      result.push({ target, krsArr, key: e });
    });

    return result;
  }

  // getOKRResultFormData = (values) => {
  //   const result = [];
  //   for (const property in values) {
  //     if (property.startsWith('krs')) {
  //       const krs = values[property];
  //       const infos = property.split('_');
  //       const key = infos[1];
  //       const confidence = values[`confidence_${key}`];
  //       const o = { key, krs, confidence };
  //       result.push(o);
  //     }
  //   }
  //   return result;
  // }

  getFormData = () => {
    const formData = {};

    const { data: okrBasic } = this.state;
    for (const prop in okrBasic) {
      formData[prop] = { value: okrBasic[prop] };
    }

    const okrKeys = this.state.okr.map(m => `id-${m.id}`);
    formData.keys = { value: okrKeys };

    this.state.okr.forEach(element => {
      const m = `id-${element.id}`;
      formData[`okr_${m}`] = element.okrResult.map(m1 => `id-${m1.id}`);
      formData[`okr_${m}_target`] = { value: element.target };
      element.okrResult.forEach(e2 => {
        const n = `id-${e2.id}`;
        formData[`${m}_krs_${n}`] = { value: e2.krs };
        formData[`${m}_confidence_${n}`] = { value: e2.confidence };
      });
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
