import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { queryDataRoom } from '../api'
import { Input, Button, Table } from 'antd'
import { getRandomInt } from '../utils/util'

const data = [
  {
    id: 1,
    name: 'Folder',
    rename: 'Folder',
    isFolder: true,
    size: '',
    date: '2017-06-27 14:51',
    parentId: 0
  }, {
    id: 2,
    name: 'Jim-Green.pdf',
    rename: 'Jim-Green.pdf',
    isFolder: false,
    size: '42.2M',
    date: '2014-04-16 15:05',
    parentId: 0
  }, {
    id: 3,
    name: 'Joe-Black.pdf',
    rename: 'Joe-Black.pdf',
    isFolder: false,
    size: '32.1K',
    date: '2015-04-16 15:04',
    parentId: 0
  }, {
    id: 4,
    name: 'Sub Folder',
    rename: 'Sub Folder',
    isFolder: true,
    size: '',
    date: '2017-06-27 14:51',
    parentId: 1
  }, {
    id: 5,
    name: 'Sub-Jim-Green.pdf',
    rename: 'Sub-Jim-Green.pdf',
    isFolder: false,
    size: '42.2M',
    date: '2014-04-16 15:05',
    parentId: 1
  }, {
    id: 6,
    name: 'Sub-Joe-Black.pdf',
    rename: 'Sub-Joe-Black.pdf',
    isFolder: false,
    size: '32.1K',
    date: '2015-04-16 15:04',
    parentId: 1
  }
]


class DataRoomList extends React.Component {

  constructor(props) {

    super(props)

    this. state = {
      data: data,
      parentId: 0,
      name: null,
      renameRows: [],
      selectedRows: [],
    }

    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleCreateFolder = this.handleCreateFolder.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleRename = this.handleRename.bind(this)
  }

  componentDidMount() {
    queryDataRoom()
  }

  folderClicked(id) {
    const folder = this.state.data.filter(f => f.id === id)
    if ((folder.length > 0 && folder[0].isFolder) || id === 0) {
      this.setState({parentId: id})
    }
  }

  handleNameChange(index, evt) {
    const newData = this.state.data.slice()
    newData[index].rename = evt.target.value
    this.setState({ data: newData })
  }

  current = []
  parentFolderFunc (parentId) {
    if (parentId === 0) return this.current
    const parentFolder = this.state.data.filter(f => f.id === parentId)[0]
    this.current.splice(0, 0, parentFolder)
    return this.parentFolderFunc(parentFolder.parentId)
  }

  handleCreateFolder() {
    const newData = this.state.data.slice()
    newData.splice(0, 0, {
      name: "新建文件夹",
      isFolder: true,
      date: '2015-04-15 13:30',
      parentId: this.state.parentId,
      rename: "新建文件夹",
    })
    this.setState({ data: newData, name: "新建文件夹" })
  }

  handleConfirm(index) {
    const value = this.state.data[index]
    const name = value.name
    if (!value.id) {
      const newData = this.state.data.slice()
      newData[index].id = getRandomInt(1, 100)
      newData[index].name = newData[index].rename
      this.setState({ data: newData })
    } else {
      const newData = this.state.data.slice()
      newData[index].name = newData[index].rename
      const newRenameRows = this.state.renameRows.slice()
      const rowIndex = newRenameRows.indexOf(value.id)
      newRenameRows.splice(rowIndex, 1)
      this.setState({ data: newData, renameRows: newRenameRows })
    }
  }

  handleCancel(index) {
    const value = this.state.data[index]
    const name = value.name
    if (!value.id) {
      const newData = this.state.data.slice()
      newData.splice(index, 1)
      this.setState({ data: newData })
    } else {
      const newData = this.state.data.slice()
      newData[index].rename = newData[index].name
      const newRenameRows = this.state.renameRows.slice()
      const rowIndex = newRenameRows.indexOf(value.id)
      newRenameRows.splice(rowIndex, 1)
      this.setState({ data: newData, renameRows: newRenameRows })
    }
  }

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      this.setState({ selectedRows: selectedRows })
    },
    getCheckboxProps: record => ({
      disabled: record.name === 'Disabled User',    // Column configuration not to be checked
    }),
  }

  handleRename() {
    this.setState({
      renameRows: this.state.selectedRows.map(m => m.id)
    })
  }

  render () {
    
    const columns = [{
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <div>
          <img style={{ width: 26, verticalAlign: 'middle' }} src={ record.isFolder ? "/images/folder.png" : "/images/pdf.png" } />
          { record.id && !this.state.renameRows.includes(record.id) ?
              <span onClick={this.folderClicked.bind(this, record.id)} style={{ cursor: 'pointer', verticalAlign: 'middle', marginLeft: 10 }}>{text}</span>
              : (<span>
          <Input style={{ width: '60%', marginLeft: 6, verticalAlign: 'middle' }} value={record.rename} onChange={this.handleNameChange.bind(this, index)} />
          <Button onClick={this.handleConfirm.bind(this, index)} type="primary" style={{ marginLeft: 6, verticalAlign: 'middle' }}>确定</Button>
          <Button onClick={this.handleCancel.bind(this, index)} style={{ marginLeft: 6, verticalAlign: 'middle' }}>取消</Button> </span>) }
        </div>
      ),
    }, {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    }, {
      title: '修改日期',
      dataIndex: 'date',
      key: 'date',
    }]


    this.current = []

    const currentFolder = this.state.data.filter(f => f.id === this.state.parentId)[0]
    const base = this.state.parentId === 0 ? "全部文件" : (
      <span>
        <a onClick={this.folderClicked.bind(this, currentFolder.parentId)}>返回上一级</a>
        &nbsp;|&nbsp;
        <a onClick={this.folderClicked.bind(this, 0)}>全部文件</a>
      </span>
    )

    return (
      <LeftRightLayout
        location={this.props.location}
        title="DataRoomList">

        <Button type="primary">上传</Button>
        <Button onClick={this.handleCreateFolder} style={{ marginLeft: 10 }}>新建文件夹</Button>
        { this.state.selectedRows.length > 0 ? <Button onClick={this.handleRename} style={{ marginLeft: 10 }}>重命名</Button> : null }

        <div style={{ margin: '10px 0' }}>
          { base }
          {
            this.parentFolderFunc(this.state.parentId)
              .map(
                (m, index) => m.id !== this.state.parentId ?
                <span key={index}>&nbsp;>&nbsp;<a onClick={this.folderClicked.bind(this, m.id)}>{m.name}</a></span>
                :
                <span key={index}>&nbsp;>&nbsp;{m.name}</span>
              )
          }
        </div>

        <Table
          columns={columns}
          rowKey={(record, index) => index}
          rowSelection={this.rowSelection}
          dataSource={this.state.data.filter(f => f.parentId === this.state.parentId)}
          pagination={false} />

      </LeftRightLayout>
    )
  }
}

export default DataRoomList
