import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n, getImageUrl, isLogin, hasPerm } from '../utils/util'
import { 
  Form, 
  message, 
  Select, 
} from 'antd';
import { Group, Org, FullName, Position, Submit, UploadAvatar, BasicFormItem } from '../components/Form'
import { connect } from 'dva'
import { editUser } from '../api'
import { routerRedux } from 'dva/router'
import PropTypes from 'prop-types'
import { UploadImage } from '../components/Upload'
import { TreeSelectTag } from '../components/ExtraInput';
import { PAGE_SIZE_OPTIONS } from '../constants';

const Option = Select.Option;

class BasicInfo extends React.Component {

  state = {
    avatarUrl: this.props.currentUser.photourl,
    cardUrl:getImageUrl(this.props.currentUser.cardKey)
  }
  getChildContext() {
    return {
      form: this.props.form
    }
  }
  handleSubmit(e) {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        if (values.tags.length === 0) {
          message.error(i18n('personal_info.message.tag_required'))
          return
        }
        editUser([this.props.currentUser.id], {tags: values.tags, cardKey:values.cardKey, page: values.page}).then(data => {
          const tags = data.data[0].tags
          const card = data.data[0].cardKey
          const page = data.data[0].page;
          const userInfo = { ...this.props.currentUser, tags, card, page };
          localStorage.setItem('user_info', JSON.stringify(userInfo))
          this.props.dispatch({
            type: 'currentUser/save',
            userInfo
          })
          message.success(i18n('personal_info.message.update_success'))

          let url = '/app';
          if (!isLogin().is_superuser && hasPerm('usersys.as_investor')) {
            url = '/app/dataroom/project/list';
          }
          this.props.dispatch(routerRedux.replace(url));

        }, error => {
          this.props.dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      }
    })
  }

  handleUploaded(response) {
    this.setState({ avatarUrl: response.url })
    editUser([this.props.currentUser.id], { photoBucket: 'image', photoKey: response.key }).then(data => {
      const photoKey = data.data[0].photoKey
      const photourl = data.data[0].photourl
      const photoBucket = data.data[0].photoBucket
      const userInfo = { ...this.props.currentUser, photoKey, photourl, photoBucket }
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      this.props.dispatch({
        type: 'currentUser/save',
        userInfo
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  handleCardUploaded(response){
    this.setState({ cardUrl: response.url })
    editUser([this.props.currentUser.id], { cardBucket: 'image', cardKey: response.key }).then(data => {
      const cardKey = data.data[0].cardKey
      const cardBucket = data.data[0].cardBucket
      const userInfo = { ...this.props.currentUser, cardKey, cardBucket }
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      this.props.dispatch({
        type: 'currentUser/save',
        userInfo
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['title', 'tag'] })
  }
 
  render() {
  return (
    <LeftRightLayout
      location={this.props.location}
      title={i18n("menu.profile")}>

      <Form style={{ width: 500, margin: '0 auto' }} onSubmit={this.handleSubmit.bind(this)}>
        <UploadAvatar name="avatar" photoKey={this.props.currentUser.photoKey} avatarUrl={this.state.avatarUrl} onUploaded={this.handleUploaded.bind(this)} />
        <Group disabled />
        <Org disabled />
        <FullName disabled />
        <Position disabled title={this.props.title} />

        <BasicFormItem label="分页条数" name="page">
          <Select placeholder="请设置分页条数">
            { PAGE_SIZE_OPTIONS.map(m => <Option key={m} value={m}>{`${m} 条/页`}</Option>) }
          </Select>
        </BasicFormItem>

        <BasicFormItem label={i18n("user.tags")} name="tags" valueType="array">
          <TreeSelectTag />
        </BasicFormItem>
        <UploadAvatar name="card" photoKey={this.props.currentUser.cardKey} avatarUrl={this.state.cardUrl} onUploaded={this.handleCardUploaded.bind(this)} />
        <Submit />
      </Form>

    </LeftRightLayout>
  )
  }
}

function mapStateToProps(state) {
  const { tag, title } = state.app
  const { currentUser } = state
  return { tag, title, currentUser }
}

function mapPropsToFields(props) {
  return {
    readOnlyGroup: { value: props.currentUser.groups.length > 0 ? props.currentUser.groups[0].name : '' },
    organization: { value:  props.currentUser.org ? props.currentUser.org.orgname : ''},
    username: { value: props.currentUser.username },
    title: { value: props.currentUser.title && props.currentUser.title.id + ''},
    tags: { value: props.currentUser.tags ? props.currentUser.tags.map(m => '' + m.id) : [] },
    page: { value: props.currentUser.page + '' }, 
  }
}

BasicInfo.childContextTypes = {
  form: PropTypes.object
}

export default connect(mapStateToProps)(Form.create({mapPropsToFields})(BasicInfo))
