import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import FileMgmt from '../components/FileMgmt'

const data = [
  {
    id: 1,
    name: 'Folder',
    rename: 'Folder',
    key: 1,
    isFolder: true,
    size: '',
    date: '2017-06-27 14:51',
    parentId: 0
  }, {
    id: 2,
    name: 'Jim-Green.pdf',
    rename: 'Jim-Green.pdf',
    key: 2,
    isFolder: false,
    size: '42.2M',
    date: '2014-04-16 15:05',
    parentId: 0
  }, {
    id: 3,
    name: 'Joe-Black.pdf',
    rename: 'Joe-Black.pdf',
    key: 3,
    isFolder: false,
    size: '32.1K',
    date: '2015-04-16 15:04',
    parentId: 0
  }, {
    id: 4,
    name: 'Sub Folder',
    rename: 'Sub Folder',
    key: 4,
    isFolder: true,
    size: '',
    date: '2017-06-27 14:51',
    parentId: 1
  }, {
    id: 5,
    name: 'Sub-Jim-Green.pdf',
    rename: 'Sub-Jim-Green.pdf',
    key: 5,
    isFolder: false,
    size: '42.2M',
    date: '2014-04-16 15:05',
    parentId: 1
  }, {
    id: 6,
    name: 'Sub-Joe-Black.pdf',
    rename: 'Sub-Joe-Black.pdf',
    key: 6,
    isFolder: false,
    size: '32.1K',
    date: '2015-04-16 15:04',
    parentId: 1
  }
]

class DataRoomList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    // queryDataRoom().then(data => (this.props.location.query.id))
  }

  handleCreateNewFolder(parentId, folderName) {
    console.log(parentId, folderName)
  }

  render () {
    return (
      <LeftRightLayout
        location={this.props.location}
        title="DataRoomList">

        <FileMgmt
          data={data}
          onCreateNewFolder={this.handleCreateNewFolder} />

      </LeftRightLayout>
    )
  }
}

export default DataRoomList
