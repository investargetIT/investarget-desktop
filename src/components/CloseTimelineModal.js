import React from 'react'
import { Modal, Input, Button } from 'antd'
import { i18n } from '../utils/util'


const titleStyle = { marginBottom: '4px' }
const starStyle = {
  display: 'inline-block',
  marginRight: '4px',
  fontFamily: 'SimSun',
  lineHeight: 1,
  fontSize: '12px',
  color: '#f04134',
}


function CloseTimelineModal(props) {

    function handleReasonChange(e) {
      props.onChange(e.target.value)
    }

    return (
      <Modal
        title={i18n('timeline.close_timeline')}
        visible={props.visible}
        onOk={props.onOk}
        onCancel={props.onCancel}
        footer={[
          <Button key="cancel" size="large" onClick={props.onCancel}>{i18n('common.cancel')}</Button>,
          <Button key="confirm" size="large" type="primary" disabled={props.reason == ''} onClick={props.onOk}>{i18n('common.confirm')}</Button>,
        ]}
      >
        <h3 style={titleStyle}><span style={starStyle}>*</span>{i18n('timeline.close_reason')} : </h3>
        <div>
          <Input size="large" value={props.reason} onChange={handleReasonChange} />
        </div>
      </Modal>
    )

}


export default CloseTimelineModal
