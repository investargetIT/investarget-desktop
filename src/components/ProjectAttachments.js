import React from 'react'
import {
  Input,
  Button,
  Icon,
  Tabs,
  Upload,
  message,
  Modal,
} from 'antd'
const TabPane = Tabs.TabPane
const Dragger = Upload.Dragger


const fileExtensions = [
  '.pdf',
  '.doc',
  '.xls',
  '.ppt',
  '.docx',
  '.xlsx',
  '.pptx',
]
const mimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  'application/vnd.openxmlformats-officedocument.presentationml.template',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
]
const fixedDirs = ['NDA', 'Teaser', 'Executive Summary', 'BP', 'Presetation', 'Brochure', 'Financials', 'FAQ', 'Cap Table']

class ProjectAttachments extends React.Component {

  uploading = {}

  constructor(props) {
    super(props)

    let dirs = fixedDirs.slice()
    let panes = dirs.map(item => ({ title: item, closable: false, key: item }))

    let value = props.value || []
    value.forEach(item => {
      let dir = item.filetype
      if (dirs.indexOf(dir) == -1) {
        dirs.push(dir)
        panes.push({ title: dir, closable: true, key: dir })
      }
    })
    const fileList = value.map((item, index) => {
      return { uid: ('' + index), name: item.filename, dir: item.filetype, status: 'done' }
    })

    this.state = {
      value: value,
      activeDir: fixedDirs[0],
      fileList: fileList,
      panes: panes,
      newTitle: '',
    }

    //
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
    this.handleDirChange = this.handleDirChange.bind(this)
    this.handleFileChange = this.handleFileChange.bind(this)
    this.beforeUpload = this.beforeUpload.bind(this)
    this.handleFileRemove = this.handleFileRemove.bind(this)

  }

  componentWillReceiveProps(nextProps) {
    // setState: props.value => state.panes, state.fileList
    // value: [{bucket, key, filetype, filename}]
    // panes: [{title, closable, key}]
    // fileList: [{uid, name, status, response}]

    const value = nextProps.value
    this.setState({ value })

    let dirs = fixedDirs.slice()
    let panes = dirs.map(item => ({ title: item, closable: false, key: item }))
    value.forEach(item => {
      let dir = item.filetype
      if (dirs.indexOf(dir) == -1) {
        dirs.push(dir)
        panes.push({ title: dir, closable: true, key: dir })
      }
    })

    const fileList = value.map((item, index) => {
      return { uid: ('' + index), name: item.filename, dir: item.filetype, status: 'done' }
    })

    this.setState({ panes, fileList })

    // if (dirs.indexOf(this.state.activeDir) == -1) {
    //   this.setState({ activeDir: dirs[0] })
    // }
  }

  add() {
    const newTitle = this.state.newTitle
    const panes = this.state.panes.slice()
    if (panes.map(item => item.title).indexOf(newTitle) == -1) {
      panes.push({ title: newTitle, closable: true, key: newTitle })
      this.setState({ panes, activeDir: newTitle, newTitle: '' })
    }
  }

  remove(targetKey) {
    Modal.confirm({
      title: '删除目录',
      content: '该目录下的文件都将被删除',
      onOk: () => { this.removeDir(targetKey) },
    })
  }

  removeDir(targetKey) {

    let activeDir = this.state.activeDir;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    this.setState({ panes })

    if (lastIndex >= 0 && activeDir === targetKey) {
      activeDir = panes[lastIndex].key
      this.setState({ activeDir })
    }
    // 删除目录下文件，onChange
    let value = this.state.value.filter(item => item.filetype != targetKey)
    if (this.props.onChange) {
      this.props.onChange(value)
    } else {
      let fileList = this.state.fileList.filter(item => item.dir != targetKey)
      this.setState({ value, fileList })
    }
  }

  handleDirChange(activeDir) {
    this.setState({ activeDir })
  }

  handleFileChange({ file, fileList, event }) {
    // 添加或删除文件, onChange
    if (file.status == 'removed') {
      let value = this.state.value.filter(item => item.filename != file.name || item.filetype != file.dir)
      if (this.props.onChange) {
        this.props.onChange(value)
        return
      } else {
        this.setState({ value })
      }
    }

    if (file.status == 'uploading') {
      if (file.dir == undefined) {
        file.dir = this.state.activeDir
      }
    }

    if (file.status == 'done') {
      let value = this.state.value.slice()
      const item = { bucket: 'file', key: file.response.key, filename: file.name, filetype: file.dir }
      value.push(item)
      if (this.props.onChange) {
        this.props.onChange(value)
        return
      } else {
        this.setState({ value })
      }
    }

    this.setState({ fileList })
  }

  handleFileRemove(file) {
    return new Promise(function(resolve, reject) {
      Modal.confirm({
        title: '删除文件',
        content: file.name,
        onOk: function() { resolve(true) },
        onCancel: function() { resolve(false) },
      })
    })
  }

  beforeUpload(file) {
    if (mimeTypes.indexOf(file.type) == -1) {
      message.warning('不支持的文件格式', 2)
      return false
    }
    // 不允许重复上传
    const dir = this.state.activeDir // current dir
    for (let i = 0, len = this.state.fileList.length; i < len; i++) {
      let _file = this.state.fileList[i]
      if (dir == _file.dir && file.name == _file.name) {
        message.warning('不能上传同一文件', 2)
        return false
      }
    }
    return true
  }

  render() {
    let targetFileList = this.state.fileList.filter(item => item.dir == this.state.activeDir)
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Input
            value={this.state.newTitle}
            onChange={(e) => {this.setState({ newTitle: e.target.value })}}
            style={{width: 'auto', marginRight: '8px'}}
            placeholder="新建目录"
          />
          <Button onClick={this.add} disabled={this.state.newTitle == ''}>ADD</Button>
        </div>
        <Tabs
          hideAdd
          onChange={(activeKey) => {this.setState({activeDir: activeKey})}}
          activeKey={this.state.activeDir}
          type="editable-card"
          onEdit={(targetKey, action) => {this[action](targetKey)}}
        >
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key} closable={pane.closable}></TabPane>)}
        </Tabs>

        <Dragger
          action="http://192.168.1.201:8000/service/qiniubigupload?bucket=file"
          accept={fileExtensions.join(',')}
          beforeUpload={this.beforeUpload}
          fileList={targetFileList}
          onChange={this.handleFileChange}
          onRemove={this.handleFileRemove}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">点击或拖拽上传</p>
          <p className="ant-upload-hint">pdf, doc, docx, xls, xlsx, ppt, pptx</p>
        </Dragger>
      </div>
    )
  }
}

export default ProjectAttachments
