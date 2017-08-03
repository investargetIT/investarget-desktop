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
        title="关闭时间轴"
        visible={props.visible}
        onOk={props.onOk}
        onCancel={props.onCancel}
        footer={[
          <Button key="cancel" size="large" onClick={props.onCancel}>取消</Button>,
          <Button key="confirm" size="large" type="primary" disabled={props.reason == ''} onClick={props.onOk}>确定</Button>,
        ]}
      >
        <h3 style={titleStyle}><span style={starStyle}>*</span>结束理由：</h3>
        <div>
          <Input value={props.reason} onChange={handleReasonChange} />
        </div>
      </Modal>
    )

}


export default CloseTimelineModal
