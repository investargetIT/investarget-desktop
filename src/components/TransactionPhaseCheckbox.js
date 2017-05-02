import { Checkbox } from 'antd'
const CheckboxGroup = Checkbox.Group
import styles from './TransactionPhaseCheckbox.css'


const transactionOptions = [
  { label: '种子天使轮', value: 1 },
  { label: 'A轮', value: 4 },
  { label: 'B轮', value: 6 },
  { label: 'C轮', value: 7 },
  { label: 'C+轮', value: 8 },
  { label: 'Pre-IPO', value: 10 },
  { label: '兼并收购', value: 11 },
]

function TransactionPhaseCheckbox({ style, value, onChange }) {
  return (
    <div style={style}>
      <CheckboxGroup className={styles['transaction-phase-group']} options={transactionOptions} value={value} onChange={onChange} />
    </div>
  )
}

export default TransactionPhaseCheckbox
