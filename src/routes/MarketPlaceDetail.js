import React from 'react'
import { connect } from 'dva'
import LeftRightLayout from '../components/LeftRightLayout'

import { i18n } from '../utils/util'


const iframeStyle = {
  border: 'none',
  width: '100%',
  height: '800px',
}


class MarketPlaceDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      linkpdfurl: null
    }
  }

  componentDidMount() {
    const id = Number(this.props.params.id)
    api.getProjDetail(id).then(result => {
      const { linkpdfkey } = result.data

      api.downloadUrl('file', linkpdfkey).then(result => {
        const linkpdfurl = result.data
        this.setState({ linkpdfurl })
      }, error => {
        this.props.dispatch({
          type: 'app/findError',
          payload: error
        })
      })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const { linkpdfurl } = this.state

    let content = null

    if (linkpdfurl) {
      let fileUrl = linkpdfurl
      let viewerUrl = '/pdf_viewer.html'
      let watermark = 'deal@investarget.com'
      let url = viewerUrl + '?file=' + encodeURIComponent(fileUrl) + '&watermark=' + encodeURIComponent(watermark);
      content = <iframe src={url} style={iframeStyle} ></iframe>
    }

    return (
      <LeftRightLayout location={this.props.location} title={i18n('project.marketplace_detail')}>
        <div>
          { content }
        </div>
      </LeftRightLayout>
    )
  }
}


export default connect()(MarketPlaceDetail)
