import React from 'react'
import * as api from '../api'

const style = {
  display: 'inline-block',
  width: '120px',
  height: '120px',
  padding: '2px',
  border: '1px solid #eaeaea',
  textAlign: 'center',
  cursor: 'pointer',
}
const disabledStyle = {
  ...style,
  cursor: 'not-allowed',
}
const imgStyle = {
  width: '100%',
  height: '100%',
}

const now = +(new Date())
let index = 0
function getUid() {
  return `upload-${now}-${++index}`
}


class IndustryImage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      uid: getUid(),
    }
  }

  onClick = e => {
    const el = this.refs.file
    if (!el) {
      return
    }
    el.click()
  }

  onChange = e => {
    const file = e.target.files[0]
    this.uploadFile(file)
    this.reset()
  }

  reset() {
    this.setState({ uid: getUid() })
  }

  uploadFile(file) {
    api.qiniuUpload('image', file).then(result => {
      const { key } = result.data
      this.props.onChange(key)
    })
  }

  render() {
    const { disabled, value } = this.props
    return (
      <span style={disabled ? disabledStyle : style} onClick={this.onClick}>
        <input
          disabled={disabled}
          type="file"
          ref="file"
          key={this.state.uid}
          style={{ display: 'none' }}
          accept="jpeg,png"
          onChange={this.onChange}
        />
        <img style={imgStyle} src={ value ? "https://o79atf82v.qnssl.com/" + value : '' } alt="没有图片" />
      </span>
    )
  }
}

export default IndustryImage
