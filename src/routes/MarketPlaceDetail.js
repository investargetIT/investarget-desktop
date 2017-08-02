import React from 'react'
import { connect } from 'dva'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'


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


export default connect()(MarketPlaceDetail)
