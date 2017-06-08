import React from 'react'
import { connect } from 'dva'
import { injectIntl, intlShape } from 'react-intl'
import { i18n, exchange } from '../utils/util'
import { Collapse, Form, Row, Col, Button, Icon, Input, Switch } from 'antd'
const FormItem = Form.Item
const Panel = Collapse.Panel
import MainLayout from '../components/MainLayout'
import {
  IsHidden,
  ProjectNameC,
  ProjectNameE,
  RealNameC,
  RealNameE,
  Tags,
  IndustryCascader,
  CountryCascader,
  ProjectRole,
  TrasactionType,
  Year,
  BasicFormItem,
  CurrencyTypeFormItem,
  CurrencyFormItem,
} from '../components/Form'
import styles from './AddProject.css'


let industryUuid = 1


function AddProject({ form, intl, tag, industry, continent, country, transactionType, currencyType }) {
  const { formatMessage } = intl

  const { getFieldDecorator, getFieldValue, setFieldsValue } = form

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  }
  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14, offset: 6 },
    }
  }

  const deleteIconStyle = {
    cursor: 'pointer',
    position: 'absolute',
    top: '4px',
    marginLeft: '8px',
    fontSize: '24px',
    color: '#999',
    transition: 'all .3s',
  }

  function onSubmit() {

  }

  const removeIndustry = (k) => {
    const keys = getFieldValue('industryKeys')
    if (keys.length === 1) {
      return
    }
    form.setFieldsValue({
      industryKeys: keys.filter(key => key !== k),
    })
  }

  const addIndustry = () => {
    industryUuid += 1
    const keys = getFieldValue('industryKeys')
    const nextKeys = keys.concat(industryUuid)
    form.setFieldsValue({
      industryKeys: nextKeys,
    })
  }



  getFieldDecorator('industryKeys', { initialValue: ['industry-1'] })
  const industryKeys = getFieldValue('industryKeys')
  const industryFormItems = industryKeys.map((k, index) => {
    return (
      <FormItem {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)} key={k} label={index === 0 ? i18n('industry') : ''}>
        {
          getFieldDecorator(`industry-${k}`, {
            rules: [
              { type: 'number', message: 'The input is not valid!'},
              { required: true, message: 'The input can not be empty!'},
            ]
          })(
            <IndustryCascader industry={industry} />
          )
        }
        <Icon
          type="minus-circle-o"
          disabled={industryKeys.length === 1}
          onClick={() => removeIndustry(k)}
          className={styles['dynamic-delete-button']}
        />
      </FormItem>
    )
  })

  // 处理货币相关表单联动
  const currencyMap = {
    '1': 'CNY',
    '2': 'USD',
    '3': 'CNY',
  }

  function handleCurrencyTypeChange(currency) {
    exchange(currencyMap[Number(currency)]).then((rate) => {
      setFieldsValue({
        'financedAmount_USD': Math.round(getFieldValue('financedAmount') * rate),
        'companyValuation_USD': Math.round(getFieldValue('companyValuation_USD') * rate),
      })
    })
  }

  function handleCurrencyValueChange(field, val) {
    var currency = getFieldValue('currencyType') || 2
    exchange(currencyMap[currency]).then((rate) => {
      setFieldsValue({
        [field + '_USD']: Math.round(getFieldValue(field) * rate),
      })
    })
  }





  return(
    <MainLayout location={location}>
      <div>
        <Row>
          <Col span={24} offset={0}>
            <h3 style={{textAlign: 'center', marginBottom: '24px', fontSize: '20px'}}>{}</h3>
          </Col>
        </Row>

        <Form onSubmit={onSubmit}>
          <Collapse>
            <Panel header="基本信息" key="1">
              <IsHidden />
              <ProjectNameC />
              <ProjectNameE />
              <RealNameC />
              <RealNameE />
              <Tags tag={tag} />
              {industryFormItems}
              <FormItem {...formItemLayoutWithOutLabel}>
                <Button type="dashed" onClick={addIndustry} style={{ width: '100%' }}>
                  <Icon type="plus" />
                  {i18n('add_field')}
                </Button>
              </FormItem>

              <BasicFormItem label={i18n('country')} name="country" required valueType="number">
                <CountryCascader continent={continent} country={country} />
              </BasicFormItem>
              <ProjectRole />
              <TrasactionType transactionType={transactionType} />
            </Panel>
            <Panel header="财务信息" key="2">

              <Year label="公司成立年份" name="companyYear" />

              <CurrencyTypeFormItem label={i18n('currency_type')} name="currencyType" onChange={handleCurrencyTypeChange} required currencyType={currencyType} />

              <CurrencyFormItem label="拟交易规模" name="financedAmount" required onChange={handleCurrencyValueChange.bind(null, 'financedAmount')} currencyType={getFieldValue('currencyType')} />

              <CurrencyFormItem label="公司估值" name="companyValuation" onChange={handleCurrencyValueChange.bind(null, 'companyValuation')} currencyType={getFieldValue('currencyType')} />

              <FormItem {...formItemLayout} label="公开财务信息">
                {
                  getFieldDecorator('financeIsPublic', {
                    rules: [{type: 'boolean'}],
                    valuePropName: 'checked',
                  })(
                    <Switch checkedChildren={'ON'} unCheckedChildren={'OFF'} />
                  )
                }
              </FormItem>

              <FormItem {...formItemLayout} label="财务年度">
                <div>
                  <Icon type="plus" />
                  <span style={{float: 'right'}}>收缩</span>
                </div>
              </FormItem>


            </Panel>
            <Panel header="联系方式" key="3">

            </Panel>
            <Panel header="项目详情" key="4">

            </Panel>
            <Panel header="附件上传" key="5">

            </Panel>
          </Collapse>
        </Form>
      </div>
    </MainLayout>
  )
}



AddProject.propTypes = {
  intl: intlShape.isRequired
}

function mapStateToProps(state) {
  const { tag, industry, continent, country, transactionType, currencyType } = state.app
  return { tag, industry, continent, country, transactionType, currencyType }
}

function onValuesChange(props, values) {
  console.log(props, values)
}

export default connect(mapStateToProps)(injectIntl(Form.create({onValuesChange})(AddProject)))
