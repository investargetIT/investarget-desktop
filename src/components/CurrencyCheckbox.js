import { Checkbox } from 'antd'
const CheckboxGroup = Checkbox.Group
import styles from './CurrencyCheckbox.css'

const currencyOptions = [{ label: '美元', value: 1 },{ label: '人民币', value: 2 },{ label: '美元及人民币', value: 3 }]

function CurrencyCheckbox({ style, value, onChange }) {
  return (
    <div style={style}>
      <CheckboxGroup className={styles['currency-group']} options={currencyOptions} value={value} onChange={onChange} />
    </div>
  )
}

export default CurrencyCheckbox
