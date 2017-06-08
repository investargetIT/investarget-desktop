import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { i18n } from '../utils/util'
import { Button, Checkbox, Table } from 'antd'
import { queryPermList, queryUserGroup } from '../api'

class PermList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      columns: [],
      data: [],
      value: []
    }

    this.onChange = this.onChange.bind(this)
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

    queryUserGroup().then(data => {
      const groups = data.data.data.map(item => {
        const obj = {}
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

      const groupPerms = data.data.data.reduce((acc, val) => {
        const groupID = val.id
        acc = acc.concat(val.permissions.map(item => groupID + "-" + item.id))
        return acc
      }, [])
      this.setState({
        value: groupPerms,
        columns: columns
      })
    })

  }

  onChange(checkedValues, second) {
    this.setState({ value: checkedValues })
  }

  savePerm() {
    console.log('save permission')
  }

  render() {
    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n("permission_management")}>

        <Checkbox.Group
          value={this.state.value}
          onChange={this.onChange}>

          <Table
            defaultExpandAllRows={true}
            columns={this.state.columns}
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
