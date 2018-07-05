import React from 'react'
import { connect } from 'dva'
import { Input, Select } from 'antd'
const Option = Select.Option


class GlobalMobile extends React.Component {

  constructor(props) {
    super(props)
    const { areaCode, mobile } = props
    const countryId = this.findCountryIDByAreaCode(areaCode)
    this.state = {
      countryId: countryId == 'unknown' ? 42 : countryId,
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

  render() {
    const { countryId, areaCode, mobile } = this.state
    return (
      <Input.Group compact className="it-mobile" style={{display: 'flex'}}>
        <Select size="large" disabled={this.props.disabled} onChange={this.handleChangeCountry} value={countryId + ''}>
          {this.props.country.map(c => {
            return c.key ?<Option key={c.id} value={c.id + ''}>
            <img src={c.url} style={{ width: 40, height: 28, marginLeft: 6, verticalAlign: 'top' }} />
          </Option> : null})}
        </Select>
        <Input size="large" readOnly style={{width: 60,height: 48,border: 'none',borderLeft: '1px solid #cfcfcf',fontSize:16,color:'#989898', ...this.props.inputStyle}} disabled={this.props.disabled} value={areaCode} onChange={this.handleChangeAreaCode} />
        <Input size="large" style={{flexGrow: 1,height: 48,border: 'none',fontSize:16,color:'#989898', ...this.props.inputStyle}} disabled={this.props.disabled} value={mobile} onChange={this.handleChangeMobile} onBlur={this.props.onBlur} />
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
