import React from 'react'
import { connect } from 'dva'
import { Form, Icon, Row, Col, Tabs, Button, Modal, Popconfirm, message } from 'antd'
import * as api from '../api'
import YearFinanceForm from './YearFinanceForm'
import { SelectYear } from './ExtraInput'
import { i18n } from '../utils/util'
const TabPane = Tabs.TabPane

const titleStyle = {
  fontSize: '16px',
  lineHeight: 2,
}
const addStyle = {
  padding: '4px',
  cursor: 'pointer',
  color: '#108ee9',
}
const subTitleStyle = {
  fontSize: '14px',
  lineHeight: 1.5,
  margin: '4px 0',
}

function toFormData(data) {
  data = Object.assign({}, data)
  for (let i in data) {
    data[i] = { 'value': data[i] }
  }
  return data
}


// function onValuesChange(props, values) {
//   console.log(values)
// }
// function mapPropsToFields(props) {
//   return props.data
// }
// const AddYearForm = Form.create({ onValuesChange })(YearFinanceForm)
// const EditYearForm = Form.create({ onValuesChange, mapPropsToFields })(YearFinanceForm)


const Field = (props) => {
  return (
    <div style={{fontSize: '13px', margin: '0 8px', lineHeight: 1.5}}>
      <span style={{marginRight: '4px'}}>{props.label}</span>
      <span>{props.value}</span>
    </div>
  )
}

class ProjectYearFinance extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      finance: [],
      showAddModal: false,
      showEditModal: false,
      editId: null,
      editData: {},
    }
  }

  handleAddRef = (inst) => {
    if (inst) {
      this.addForm = inst.props.form
    }
  }

  handleEditRef = (inst) => {
    if (inst) {
      this.editForm = inst.props.form
    }
  }

  add = () => {
    this.setState({ showAddModal: true })
  }

  handleCancelAdd = () => {
    this.setState({ showAddModal: false })
  }

  handleConfirmAdd = () => {
    const id = this.props.projId
    this.addForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let data = values
        data['proj'] = id
        api.addProjFinance(data).then(result => {
          this.setState({ showAddModal: false })
          this.addForm.resetFields()
          this.getFinance()
        }, error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      }
    })
  }

  handleEditYear = (id) => {
    const data = this.state.finance.filter(item => item.id == id)[0]
    const formData = toFormData(data)
    this.setState({ showEditModal: true, editId: id, editData: formData })
  }

  handleConfirmEdit = () => {
    this.editForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = Object.assign({}, values)
        data['id'] = this.state.editId
        data['proj'] = this.props.projId
        api.editProjFinance(data).then(result => {
          this.setState({ showEditModal: false, editId: null, editData: {} })
          this.getFinance()
        }, error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      }
    })
  }

  handleCancelEdit = () => {
    this.setState({ showEditModal: false, editId: null, editData: {} })
  }

  handleDeleteYear = (id) => {
    api.deleteProjFinance(id).then(result => {
      this.getFinance()
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  getFinance = () => {
    const id = this.props.projId
    api.getProjFinance(id).then(result => {
      console.log(result.data)
      this.setState({ finance: result.data.data })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  componentDidMount() {
    this.getFinance()
  }

  render() {
    const disabledYears = this.state.finance.map(item => item.fYear)

    return (
      <div>

        <div style={{textAlign: 'left', marginBottom: '8px'}}>
          <Button type="dashed" style={{fontSize: '14px', fontWeight: 400}} onClick={this.add}>{i18n('project.add_fiscal_year')}</Button>
        </div>

        {
          this.state.finance.map(item => {
            return (
              <div style={{marginBottom: '24px'}} key={item.fYear}>
                <h3 style={subTitleStyle}>
                  {item.fYear}
                  <a style={{marginLeft: '8px'}} onClick={this.handleEditYear.bind(this, item.id)}>{i18n('common.edit')}</a>
                  <Popconfirm title={i18n('project.delete_fiscal_year') + '?'} onConfirm={this.handleDeleteYear.bind(this, item.id)}><a style={{marginLeft: '8px'}}>{i18n('common.delete')}</a></Popconfirm>
                </h3>
                <div style={{display:'flex', flexWrap: 'wrap'}}>
                  <Field label={i18n('project.revenue') + ' : '} value={item.revenue} />
                  <Field label={i18n('project.profits') + ' : '} value={item.netIncome} />
                  <Field label={i18n('project.EBITDA') + ' : '} value={item.EBITDA} />
                  <Field label={i18n('project.gross_profits') + ' : '} value={item.grossProfit} />
                  <Field label={i18n('project.total_assets') + ' : '} value={item.totalAsset} />
                  <Field label={i18n('project.net_assets') + ' : '} value={item.stockholdersEquity} />
                  <Field label={i18n('project.operating_cash_flow') + ' : '} value={item.operationalCashFlow} />
                  <Field label={i18n('project.net_cash_flow') + ' : '} value={item.grossMerchandiseValue} />
                </div>
              </div>
            )
          })
        }

        <Modal width={720} title={i18n('project.add_fiscal_year')} visible={this.state.showAddModal} onOk={this.handleConfirmAdd} onCancel={this.handleCancelAdd}>
          <YearFinanceForm wrappedComponentRef={this.handleAddRef} currencyType={this.props.currencyType} mode="add" disabledYears={disabledYears} />
        </Modal>

        <Modal width={720} title={i18n('project.edit_fiscal_year')} visible={this.state.showEditModal} onOk={this.handleConfirmEdit} onCancel={this.handleCancelEdit}>
          <YearFinanceForm wrappedComponentRef={this.handleEditRef} currencyType={this.props.currencyType} data={this.state.editData} mode="edit" />
        </Modal>

      </div>
    )
  }
}


export default connect()(ProjectYearFinance)
