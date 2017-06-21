import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { queryDataRoom } from '../api'
import { Table } from 'antd'


const data = [
  {
    id: 1,
    name: 'Folder',
    isFolder: true,
    size: '',
    date: '2017-06-27 14:51',
    parentId: 0
  }, {
    id: 2,
    name: 'Jim-Green.pdf',
    isFolder: false,
    size: '42.2M',
    date: '2014-04-16 15:05',
    parentId: 0
  }, {
    id: 3,
    name: 'Joe-Black.pdf',
    isFolder: false,
    size: '32.1K',
    date: '2015-04-16 15:04',
    parentId: 0
  }, {
    id: 4,
    name: 'Sub Folder',
    isFolder: true,
    size: '',
    date: '2017-06-27 14:51',
    parentId: 1
  }, {
    id: 5,
    name: 'Sub-Jim-Green.pdf',
    isFolder: false,
    size: '42.2M',
    date: '2014-04-16 15:05',
    parentId: 1
  }, {
    id: 6,
    name: 'Sub-Joe-Black.pdf',
    isFolder: false,
    size: '32.1K',
    date: '2015-04-16 15:04',
    parentId: 1
  }
]


class DataRoomList extends React.Component {

  state = {
    parentId: 0
  }

  componentDidMount() {
    queryDataRoom()
  }

  folderClicked(id) {
    const folder = data.filter(f => f.id === id)
    if ((folder.length > 0 && folder[0].isFolder) || id === 0) {
      this.setState({parentId: id})
    }
  }

  render () {
    
    const columns = [{
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <img style={{ width: 26, verticalAlign: 'middle' }} src={ record.isFolder ? "/images/folder.png" : "/images/pdf.png" } />
          <span onClick={this.folderClicked.bind(this, record.id)} style={{ cursor: 'pointer', verticalAlign: 'middle', marginLeft: 10 }}>{text}</span>
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

    const parentFolderFunc = function (parentId) {
      if (parentId === 0) return current
      const parentFolder = data.filter(f => f.id === parentId)[0]
      current.splice(0, 0, parentFolder)
      return parentFolderFunc(parentFolder.parentId)
    }

    const currentFolder = data.filter(f => f.id === this.state.parentId)[0]
    let current = []
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

        <div style={{ marginBottom: 10 }}>
          { base }
          {
            parentFolderFunc(this.state.parentId)
              .map(
                m => m.id !== this.state.parentId ?
                <span key={m.id}>&nbsp;>&nbsp;<a onClick={this.folderClicked.bind(this, m.id)}>{m.name}</a></span>
                :
                <span key={m.id}>&nbsp;>&nbsp;{m.name}</span>
              )
          }
        </div>

        <Table
          columns={columns}
          rowKey={record => record.id}
          dataSource={data.filter(f => f.parentId === this.state.parentId)}
          pagination={false} />

      </LeftRightLayout>
    )
  }
}

export default DataRoomList
