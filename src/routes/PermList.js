import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { message, Input, Popconfirm, Icon, Button, Checkbox, Table } from 'antd'
import { createGroup, deleteUserGroup, queryPermList, queryUserGroup, updateUserGroup } from '../api'
import { CONTENT_TYPE_ID_TO_PERM_GROUP } from '../constants'
import { connect } from 'dva'

class EditableCell extends React.Component {
  state = {
    value: this.props.value,
    editable: false,
  }
  handleChange = (e) => {
    const value = e.target.value
    this.setState({ value })
  }
  check = () => {
    this.setState({ editable: false })
    if (this.props.onChange) {
      this.props.onChange(this.state.value)
    }
  }
  edit = () => {
    this.setState({ editable: true })
  }
  render() {
    const { value, editable } = this.state
    return (
      <div style={{ position: 'relative' }}>
        {
          editable ?
            <div style={{ paddingRight: 24 }}>
              <Input
                size="large"
                value={value}
                onChange={this.handleChange}
                onPressEnter={this.check}
              />
              <Icon
                type="check"
                className="editable-cell-icon-check"
                onClick={this.check}
              />
            </div>
            :
            <div className="editable-cell-text-wrapper">
              {value || ' '}
              <Icon
                type="edit"
                className="editable-cell-icon"
                onClick={this.edit}
              />
            </div>
        }
      </div>
    )
  }
}

class PermList extends React.Component {

  constructor(props) {
    super(props)

    this.columns = [{
      title: 'name',
      dataIndex: 'name',
      width: '30%',
      render: (text, record, index) => (
        <EditableCell
          value={text}
          onChange={this.onCellChange(index, record.id)}
        />
      ),
    }, {
      title: i18n('common.operation'),
      dataIndex: 'operation',
      render: (text, record, index) => {
        return (
          this.state.groups.length > 1 ?
          (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(record.id)}>
              <a>{i18n("common.delete")}</a>
            </Popconfirm>
          ) : null
        )
      },
    }]

    this.state = {
      data: [],
      value: [],
      groups: [],
      newGroup: '',
      loading: false,
    }

    this.onChange = this.onChange.bind(this)
    this.savePerm = this.savePerm.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.onCellChange = this.onCellChange.bind(this)
    this.convertPermsToFormatted = this.convertPermsToFormatted.bind(this)
    this.setUserGroup = this.setUserGroup.bind(this)
    this.newGroupOnChange = this.newGroupOnChange.bind(this)
  }

  componentDidMount() {
    queryPermList().then(data => {
      const formattedPerm = data.data.reduce((acc, value) => {
        if (acc.length > 0) {
          let index = acc.map(item => item.id).indexOf('group-' + value.content_type)
          if(index > -1) {
            acc[index]["children"].push(value)
          } else {
            acc.push({ id: 'group-' + value.content_type, name: CONTENT_TYPE_ID_TO_PERM_GROUP[value.content_type], children: [value] })
          }
        } else {
          acc.push({ id: 'group-' + value.content_type, name: CONTENT_TYPE_ID_TO_PERM_GROUP[value.content_type], children: [value] })
        }
        return acc
      }, [])
      this.setState({ data: formattedPerm })
    }).catch(err => this.props.dispatch({
      type: 'app/findError',
      payload: err
    }))
    this.setUserGroup()
  }

  setUserGroup() {
    queryUserGroup().then(data => {
      const groupPerms = data.data.data.reduce((acc, val) => {
        const groupID = val.id
        acc = acc.concat(val.permissions.map(item => groupID + "-" + item.id))
        return acc
      }, [])
      this.setState({
        value: groupPerms,
        groups: data.data.data
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  onCellChange(index, key) {
    return (value) => {
      const groupToBeUpdated = this.convertPermsToFormatted().filter(f => f.id === key)[0] || this.state.groups.filter(f => f.id === key)[0]
      groupToBeUpdated.name = value
      updateUserGroup(key, groupToBeUpdated).then(data => this.setUserGroup(), error=> {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    }
  }

  onDelete(groupId) {
    deleteUserGroup(groupId).then(data => this.setUserGroup(), error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  onChange(checkedValues, second) {
    this.setState({ value: checkedValues })
  }

  savePerm() {
    this.setState({loading: true})
    const allRequest = this.convertPermsToFormatted().map(item => updateUserGroup(item.id, item))
    Promise.all(allRequest)
      .then(data => {
        this.setState({loading: false})
        console.log(data)
        message.success(i18n('perm.save_success'))
      })
      .catch(error => {
        this.setState({loading: false})
        console.error(error)
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
  }

  convertPermsToFormatted() {
    return this.state.value.reduce((acc, val) => {
      const group = parseInt(val.split('-')[0], 10)
      const perm = parseInt(val.split('-')[1], 10)
      const index = acc.map(item => item.id).indexOf(group)
      if (index > -1) {
        acc[index]['permissions'].push(perm)
      } else {
        acc.push({ id: group, permissions: [perm] })
      }
      return acc
    }, [])
      .map(item => {
        const obj = {}
        obj["id"] = item.id
        obj["permissions"] = item.permissions
        obj["name"] = this.state.groups.filter(f => f.id === item.id)[0]["name"]
        return obj
      })
  }

  handleAdd() {
    if (this.state.newGroup.length > 0) {
      createGroup(this.state.newGroup).then(date => {
        this.setUserGroup()
        this.setState({ newGroup: '' })
      }, error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    }
  }

  newGroupOnChange = e => {
    this.setState({ newGroup: e.target.value})
  }

  render() {

    const groups = this.state.groups.map(item => {
      const obj = {}
      obj["id"] = item.id
      obj["title"] = item.name
      obj["render"] = (text, record) => !record.children ? <Checkbox value={item.id + "-" + record.id} /> : null
      return obj
    })
    const firstColumn = [{
      title: 'Permission',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => process.env.NODE_ENV === 'development' ? `${text}-${record.codename}` : text,
    }]

    const columns = firstColumn.concat(groups)

    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("user.permission_management")}>

        <div style={{ width: 300, marginBottom: 10 }}>
          <Input size="large" value={this.state.newGroup} addonAfter={<Icon type="plus" onClick={this.handleAdd} />} onChange={this.newGroupOnChange} />
        </div>

        <Table
          dataSource={this.state.groups}
          columns={this.columns}
          rowKey={record => record.id}
          pagination={false}
          size="middle"
          showHeader={false} />

        <Checkbox.Group
          value={this.state.value}
          onChange={this.onChange}>

          <Table
            defaultExpandAllRows={true}
            columns={columns}
            dataSource={this.state.data}
            rowKey={record => record.id}
            pagination={false}
            loading={this.state.loading} />

        </Checkbox.Group>

        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <Button type="primary" onClick={this.savePerm}>{i18n('common.save')}</Button>
        </div>

      </LeftRightLayout>
    )
  }

}

export default connect()(PermList)
