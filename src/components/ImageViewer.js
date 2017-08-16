import React from 'react'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'


class ImageViewer extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.viewer = new Viewer(this.refs.img, {
      navbar: false,
      scalable: false,
      fullscreen: false,
    })
  }

  componentWillUnmount() {
    this.viewer.destroy()
  }

  render() {
    var child = React.Children.only(this.props.children)
    return React.cloneElement(child, { ref: 'img' })
  }
}

export default ImageViewer
