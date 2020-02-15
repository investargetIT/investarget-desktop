import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { withRouter, Link } from 'dva/router'
import * as api from '../api'
import { i18n, getCurrentUser } from '../utils/util'
import moment from 'moment';

import { Form, Button, message } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import ReportForm from '../components/ReportForm'


const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 8px'}


function onValuesChange(props, values) {
  console.log(values)
}
function mapPropsToFields(props) {
  return props.data
}
const AddReportForm = Form.create({onValuesChange, mapPropsToFields})(ReportForm)


function toData(formData) {
  var data = {}
  for (let prop in formData) {
    if (!/industries-.*/.test(prop) && !/industries-image-.*/.test(prop) && prop !== 'industriesKeys' && prop !== 'isAgreed') {
      data[prop] = formData[prop]
    }
  }
  data['industries'] = formData['industriesKeys'].map(key => {
    return {
      industry: formData['industries-' + key],
      bucket: 'image',
      key: formData['industries-image-' + key],
    }
  })
  return data
}


class AddReport extends React.Component {

  constructor(props) {
    super(props)

    this.initialFormData = {
      time: {
        value: [moment('2020-02-02'), moment('2020-02-20')]
      }
    };
  }

  goBack = () => {
    this.props.router.goBack()
  }

  addReport = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        window.echo('values', values);
        const result = this.getExistingOrgBdInfo(values);
        window.echo('getExistingOrgBdInfo', result);
        return;
        const { proj, bduser, org } = values;
        const body = {
          bduser,
          manager: getCurrentUser(),
          org,
          proj,
          // 'isimportant':m.isimportant,
          // 'bd_status': 1,
        };
        api.getUserSession()
        .then(() => api.addOrgBD(body));
      }
    })
  }

  getExistingOrgBdInfo = values => {
    const orgBdInfos = [];
    for (const property in values) {
      const value = values[property];
      if (property.startsWith('orgbd')) {
        const infos = property.split('_');
        const proj = parseInt(infos[1]);
        const key = infos[2];
        const index = infos[3];
        const o = { proj, key, index, value };
        orgBdInfos.push(o);
      }
    }
    const projIds = orgBdInfos.map(m => m.proj);
    const uniqueProjIds = projIds.filter((v, i, a) => a.indexOf(v) === i);
    const result = [];
    uniqueProjIds.forEach(e => {
      const thisProj = orgBdInfos.filter(f => f.proj === e);
      const indexIds = thisProj.map(m => m.index);
      const uniqueKeyIds = indexIds.filter((v, i, a) => a.indexOf(v) === i);
      uniqueKeyIds.forEach(e1 => {
        const thisProjItem = thisProj.filter(f => f.index === e1);
        const proj = e;
        const org = thisProjItem.filter(f => f.key === 'org')[0].value;
        const bduser = thisProjItem.filter(f => f.key === 'bduser')[0].value;
        const bdstatus = thisProj.filter(f => f.key === 'bdstatus')[0].value;
        result.push({ proj, org, bduser, bdstatus });
      })
    });
    return result;
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  render() {
    return(
      <LeftRightLayout location={this.props.location} title="投行业务岗位工作周报">
        <div>
          <AddReportForm wrappedComponentRef={this.handleRef} data={this.initialFormData} />
          <div style={actionStyle}>
            <Button size="large" style={actionBtnStyle} onClick={this.goBack}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" style={actionBtnStyle} onClick={this.addReport}>{i18n('common.submit')}</Button>
          </div>
        </div>
      </LeftRightLayout>
    )
  }

}

export default connect()(withRouter(AddReport))
