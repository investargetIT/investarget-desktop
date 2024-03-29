import React from 'react'
import { connect } from 'dva'
import { Input, Select } from 'antd'
import { i18n } from '../utils/util'
const Option = Select.Option


class GlobalMobile extends React.Component {

  constructor(props) {
    super(props)
    const { areaCode, mobile } = props
    const countryId = this.findCountryIDByAreaCode(areaCode)
    this.state = {
      countryId: countryId == 'unknown' ? '' : countryId,
      areaCode: areaCode || '86',
      mobile: mobile || '',
    }
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps && nextProps.value) {
      let { areaCode, mobile } = nextProps.value
      this.setState({  areaCode, mobile });
    }
  }

  handleChangeCountry = (value) => {
    const countryId = Number(value)
    this.setState({ countryId })
    const areaCode = this.findAreaCodeByCountryID(countryId)
    this.triggerChange({ areaCode })
  }

  handleChangeAreaCode = (e) => {
    const areaCode = e.target.value
    this.setState({ areaCode })
    this.triggerChange({ areaCode })
  }

  handleChangeMobile = (e) => {
    const mobile = e.target.value
    this.setState({ mobile })
    this.triggerChange({ mobile })
  }

  triggerChange = (changedValue) => {
    const onChange = this.props.onChange
    const { areaCode, mobile } = this.state
    if (onChange) {
      onChange({ areaCode, mobile, ...changedValue })
    }
  }

  findAreaCodeByCountryID = (countryID) => {
    const country = this.props.country.filter(f => f.id === parseInt(countryID, 10))
    return country.length > 0 ? country[0].areaCode : null
  }

  findCountryIDByAreaCode = (areaCode) => {
    const country = this.props.country.filter(f => f.areaCode === areaCode)
    return country.length > 0 ? country[0].id : 'unknown'
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['country'] })
  }

  findChina = () => {
    if (this.props.country.length === 0) {
      return '';
    }
    const filterChina = this.props.country.filter(f => f.areaCode === '86');
    if (filterChina.length > 0) {
      return filterChina[0].id + '';
    }
    return '';
  }

  render() {
    const { countryId, areaCode, mobile } = this.state
    return (
      <Input.Group compact>
        <Select
          size="large"
          disabled={this.props.disabled}
          onChange={this.handleChangeCountry}
          value={countryId ? countryId + '' : this.findChina()}
          optionLabelProp="label"
          dropdownMatchSelectWidth={96}
        >
          {this.props.country.map(c => {
            return c.key ? <Option key={c.id} value={c.id + ''} label={<img src={c.url} style={{ width: 30, height: 20, marginTop: 9, verticalAlign: 'top' }} />}>{c.country}</Option> : null;
          })}
        </Select>
        <Input
          style={{ width: '15%' }}
          size="large"
          readOnly
          disabled={this.props.disabled}
          value={areaCode}
          onChange={this.handleChangeAreaCode}
        />
        <Input
          style={{ width: '65%' }}
          className="login-register-form__input"
          allowClear
          size="large"
          disabled={this.props.disabled}
          value={mobile}
          onChange={this.handleChangeMobile}
          onBlur={this.props.onBlur}
          placeholder={this.props.placeholder || i18n('account.account_warning')}
        />
      </Input.Group>
    )
  }
}


function mapStateToProps(state) {
  var { country } = state.app
  country = country.filter(item => item.level == 2)
  return { country }
}
export default connect(mapStateToProps)(GlobalMobile)
