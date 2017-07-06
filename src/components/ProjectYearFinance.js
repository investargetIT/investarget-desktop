import React from 'react'
import { Form, Icon, Row, Col, Tabs, Button, Modal, Popconfirm, message } from 'antd'
import * as api from '../api'
import YearFinanceForm from './YearFinanceForm'
import { SelectYear } from './ExtraInput'
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


function onValuesChange(props, values) {
  console.log(values)
}
function mapPropsToFields(props) {
  return props.data
}
const AddYearForm = Form.create({ onValuesChange })(YearFinanceForm)
const EditYearForm = Form.create({ onValuesChange, mapPropsToFields })(YearFinanceForm)


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
          message.error(error.message)
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
      message.error(error.message)
    })
  }

  getFinance = () => {
    const id = this.props.projId
    api.getProjFinance(id).then(result => {
      console.log(result.data)
      this.setState({ finance: result.data.data })
    })
  }

  componentDidMount() {
    this.getFinance()
  }

  render() {


    return (
      <div>

        <div style={{textAlign: 'left', marginBottom: '8px'}}>
          <Button type="dashed" style={{fontSize: '14px', fontWeight: 400}} onClick={this.add}>添加财务年度</Button>
        </div>

        {
          this.state.finance.map(item => {
            return (
              <div style={{marginBottom: '24px'}} key={item.fYear}>
                <h3 style={subTitleStyle}>
                  {item.fYear}
                  <a style={{marginLeft: '8px'}} onClick={this.handleEditYear.bind(this, item.id)}>编辑</a>
                  <Popconfirm title={`删除${item.fYear}财务年度?`} onConfirm={this.handleDeleteYear.bind(this, item.id)}><a style={{marginLeft: '8px'}}>删除</a></Popconfirm>
                </h3>
                <div style={{display:'flex', flexWrap: 'wrap'}}>
                  <Field label="营业收入：" value={item.revenue} />
                  <Field label="净利润：" value={item.netIncome} />
                  <Field label="息税折旧摊销前利润：" value={item.EBITDA} />
                  <Field label="毛利润：" value={item.grossProfit} />
                  <Field label="总资产：" value={item.totalAsset} />
                  <Field label="净资产：" value={item.stockholdersEquity} />
                  <Field label="经营性现金流：" value={item.operationalCashFlow} />
                  <Field label="净现金流：" value={item.grossMerchandiseValue} />
                </div>
              </div>
            )
          })
        }

        <Modal title="新增财务年度" visible={this.state.showAddModal} onOk={this.handleConfirmAdd} onCancel={this.handleCancelAdd}>
          <AddYearForm wrappedComponentRef={this.handleAddRef} currencyType={this.props.currencyType} />
        </Modal>

        <Modal title="修改财务年度" visible={this.state.showEditModal} onOk={this.handleConfirmEdit} onCancel={this.handleCancelEdit}>
          <EditYearForm wrappedComponentRef={this.handleEditRef} currencyType={this.props.currencyType} data={this.state.editData} />
        </Modal>

      </div>
    )
  }
}


export default ProjectYearFinance
