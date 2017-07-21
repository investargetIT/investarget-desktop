import React from 'react'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'

import { showError } from '../utils/util'

const iframeStyle = {
  border: 'none',
  width: '100%',
  height: '800px',
}


class MarketPlaceDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      marketPlace: null
    }
  }

  componentDidMount() {
    const id = Number(this.props.params.id)
    api.getProjDetail(id).then(result => {
      const marketPlace = result.data
      this.setState({ marketPlace })
    }, error => {
      showError(error.message)
    })
  }

  render() {
    const { marketPlace } = this.state

    let content = null

    if (marketPlace) {
      let fileUrl = marketPlace.linkpdfurl
      let viewerUrl = 'http://192.168.1.115:4040/pdf_viewer.html'
      let watermark = 'deal@investarget.com'
      let url = viewerUrl + '?file=' + encodeURIComponent(fileUrl) + '&watermark=' + encodeURIComponent(watermark);
      content = <iframe src={url} style={iframeStyle} ></iframe>
    }

    return (
      <MainLayout location={this.props.location}>
        <PageTitle title="Market Place 详情" />
        <div>
          { content }
        </div>
      </MainLayout>
    )
  }
}


export default MarketPlaceDetail
