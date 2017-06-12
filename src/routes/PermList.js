import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { Input, Popconfirm, Icon, Button, Checkbox, Table } from 'antd'
import { queryPermList, queryUserGroup, updateUserGroup } from '../api'

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
      title: 'operation',
      dataIndex: 'operation',
      render: (text, record, index) => {
        return (
          this.state.groups.length > 1 ?
          (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(index)}>
              <a href="#">Delete</a>
            </Popconfirm>
          ) : null
        )
      },
    }]

    this.state = {
      data: [],
      value: [],
      groups: [],
    }

    this.onChange = this.onChange.bind(this)
    this.savePerm = this.savePerm.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.onCellChange = this.onCellChange.bind(this)
    this.convertPermsToFormatted = this.convertPermsToFormatted.bind(this)
    this.setUserGroup = this.setUserGroup.bind(this)
  }

  componentDidMount() {
    queryPermList().then(data => {
      const formattedPerm = data.data.reduce((acc, value) => {
        if (acc.length > 0) {
          let index = acc.map(item => item.id).indexOf(value.content_type)
          if(index > -1) {
            acc[index]["children"].push(value)
          } else {
            acc.push({ id: value.content_type, name: 'aa' + value.content_type, children: [value] })
          }
        } else {
          acc.push({ id: value.content_type, name: 'aa' + value.content_type, children: [value] })
        }
        return acc
      }, [])

      this.setState({ data: formattedPerm })
    })
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
    })
  }

  onCellChange(index, key) {
    return (value) => {
      const groupToBeUpdated = this.convertPermsToFormatted().filter(f => f.id === key)[0] || this.state.groups.filter(f => f.id === key)[0]
      groupToBeUpdated.name = value
      updateUserGroup(key, groupToBeUpdated).then(data => this.setUserGroup())
    }
  }

  onDelete(index) {
    const dataSource = [...this.state.dataSource]
    dataSource.splice(index, 1)
    this.setState({ dataSource })
  }

  onChange(checkedValues, second) {
    this.setState({ value: checkedValues })
  }

  savePerm() {
    const allRequest = this.convertPermsToFormatted().map(item => updateUserGroup(item.id, item))
    Promise.all(allRequest)
      .then(data => console.log(data))
      .catch(error => console.error(error))
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
    const { count, dataSource } = this.state
    const newData = {
      key: count,
      name: `Edward King ${count}`,
      age: 3,
      address: `London, Park Lane no. ${count}`,
    }
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    })
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
    }]

    const columns = firstColumn.concat(groups)

    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("permission_management")}>

        <Button className="editable-add-btn" onClick={this.handleAdd}>Add</Button>

        <Table
          dataSource={this.state.groups}
          columns={this.columns}
          rowKey={record => record.id}
          pagination={false} />

        <Checkbox.Group
          value={this.state.value}
          onChange={this.onChange}>

          <Table
            defaultExpandAllRows={true}
            columns={columns}
            dataSource={this.state.data}
            rowKey={record => record.id}
            pagination={false} />

        </Checkbox.Group>

        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <Button type="primary" onClick={this.savePerm}>保存</Button>
        </div>

      </LeftRightLayout>
    )
  }

}

export default PermList
