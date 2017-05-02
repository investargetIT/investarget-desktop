import { Radio } from 'antd'
const RadioGroup = Radio.Group
import styles from './AuditRadio.css'

const auditOptions = [
  { label: '待审核', value: 0 },
  { label: '审核通过', value: 1 },
  { label: '审核退回', value: 2 },
]


function AuditRadio ({ style, onChange, value }) {

  function changeHandler(event) {
    onChange(event.target.value)
  }

  return (
    <div style={style}>
      <RadioGroup className={styles['audit-group']} options={auditOptions} onChange={changeHandler} value={value} />
    </div>
  )
}

export default AuditRadio
