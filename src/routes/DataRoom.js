import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import FileMgmt from '../components/FileMgmt'
import { getDataRoomFile, queryDataRoom, queryDataRoomDetail } from '../api'

class DataRoomList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      title: '项目名称',
      data: [
        {
          id: -3,
          name: 'Investor Folder',
          rename: 'Investor Folder',
          key: -3,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        },
        {
          id: -2,
          name: 'Project Owner Folder',
          rename: 'Project Owner Folder',
          key: -2,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        },
        {
          id: -1,
          name: 'Public Folder',
          rename: 'Public Folder',
          key: -1,
          isFolder: true,
          size: null,
          date: null,
          parentId: -999
        }
      ]
    }
  }

  componentDidMount() {
    queryDataRoomDetail(this.props.location.query.id).then(data => {
      const project = data.data.proj
      const investor = data.data.investor
      const projectOwner = project.supportUser
      const newData = this.state.data.slice()
      newData[0].name = investor.username
      newData[0].rename = investor.username
      newData[1].name = projectOwner.username
      newData[1].rename = projectOwner.username
      this.setState({
        title: project.projtitle,
        data: newData
      })

      const queryDataRoomArr = [
        // Public Folder
        queryDataRoom({
          proj: project.id,
          isPublic: 1
        }),
        // Project Owner Folder
        queryDataRoom({
          proj: project.id,
          user: projectOwner.id
        }),
      ]
      return Promise.all(queryDataRoomArr)
    }).then(data => {
      const getDataRoomFileArr = [
        getDataRoomFile({ dataroom: this.props.location.query.id }), // Investor Folder
        getDataRoomFile({ dataroom: data[1].data.data[0].id}), // Project Owner Folder
        getDataRoomFile({ dataroom: data[0].data.data[0].id}) // Public Folder
      ]
      return Promise.all(getDataRoomFileArr)
    }).then(data => {
      const formattedData = data.map((m, index) => m.data.data.map(item => {
        let parent
        switch (index) {
          case 0:
          parent = -3
          break
          case 1:
          parent = -2
          break
          case 2:
          parent = -1
          break
        }
        const parentId = item.parent || parent
        const name = item.filename
        const rename = item.filename
        const key = item.id
        const isFolder = !item.isFile
        const date = item.lastmodifytime
        return { ...item, parentId, name, rename, key, isFolder, date }
      })).reduce((acc, val) => acc.concat(val), [])
      const newData = this.state.data.concat(formattedData)
      this.setState({ data: newData })
    }).catch(err => console.error(err))
  }

  handleCreateNewFolder(parentId, folderName) {
    console.log(parentId, folderName)
  }

  render () {
    return (
      <LeftRightLayout
        location={this.props.location}
        title={'项目名称：' + this.state.title}>

        <FileMgmt
          data={this.state.data}
          onCreateNewFolder={this.handleCreateNewFolder} />

      </LeftRightLayout>
    )
  }
}

export default DataRoomList
