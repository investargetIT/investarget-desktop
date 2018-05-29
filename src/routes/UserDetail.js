import React from 'react'
import { 
  Row, 
  Col, 
  Tabs,
  Icon,
  Modal,
} from 'antd';
import LeftRightLayout from '../components/LeftRightLayout'
import UserInfo from '../components/UserInfo'
import TransactionInfo from '../components/TransactionInfo'
import { UserRemarkList } from '../components/RemarkList'
import { i18n } from '../utils/util'

const TabPane = Tabs.TabPane

const rowStyle = {
  borderBottom: '1px dashed #eee',
  padding: '8px 0',
}
const detailStyle={
  marginTop:'64px',
  marginBottom:'24px'
}

const Field = (props) => {
  return (
    <Row style={rowStyle}>
      <Col span={6}>{props.title}</Col>
      <Col span={18}>{props.value}</Col>
    </Row>
  )
}


class UserDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userId: Number(this.props.params.id),
      isShowForm: false,
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState(
      { userId: null }, 
      () => this.setState({ userId: Number( newProps.params.id )}), 
    );
  }

  render() {
    const { userId } = this.state;
    return userId && (
      <LeftRightLayout location={this.props.location} title={i18n('menu.user_management')} name={i18n('user.user_detail')}>
        <UserRemarkList typeId={userId} />

        <h3 style={detailStyle}>{i18n('user.detail')}:          
          <Icon 
            type="plus" 
            style={{ cursor: 'pointer', padding: '4px', color: '#108ee9'}} 
            onClick={() => this.setState({ isShowForm: true })} 
          />
        </h3>

        <Row gutter={48}>
          <Col span={12}>
            <UserInfo userId={userId} />
          </Col>
          <Col span={12}>
            <TransactionInfo userId={userId} />
          </Col>
        </Row>

        {this.state.isShowForm ?
          <Modal
            title="添加投资事件"
            visible={true}
            footer={null}
            onCancel={() => this.setState({ isShowForm: false })}
          >
          <h1>add</h1>
            {/* <Form onSubmit={this.handleSubmit}>

              <BasicFormItem label="合作投资机构" name="cooperativeOrg" >
                <SelectExistOrganization allowCreate formName="userform" />
              </BasicFormItem>

              <BasicFormItem label="投资时间" name="investDate" valueType="object">
                <DatePicker format="YYYY-MM-DD" />
              </BasicFormItem>

              <BasicFormItem label="合作投资企业" name="comshortname">
                <Input />
              </BasicFormItem>

              <FormItem style={{ marginLeft: 120 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={hasErrors(getFieldsError())}
                >
                  确定
  </Button>
              </FormItem>

            </Form> */}

          </Modal>
          : null}

      </LeftRightLayout>
    )
  }
}

export default UserDetail
