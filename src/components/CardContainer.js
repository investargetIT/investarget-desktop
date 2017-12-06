import React from 'react'
import { connect } from 'dva'


class CardContainer extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      width: '100%',
    }
  }

  handleResize = () => {
    let { cardWidth, gutter } = this.props
    if (this.containerEl) {
      let currWidth = this.containerEl.clientWidth
      console.log('resize> ',currWidth)
      // cardWidth * n + gutter * (n - 1) <= currWidth
      let n = Math.floor((currWidth + gutter) / (cardWidth + gutter))
      let width = cardWidth * n + gutter * (n - 1)
      this.setState({ width })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.collapsed != this.props.collapsed) {
      this.handleResize()
    }
  }

  componentDidMount() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  render() {
    const { gutter } = this.props
    const { width } = this.state
    return (
      <div
        ref={el => this.containerEl = el}
      >
        <div style={{margin: '0 auto', width: width}}>
          <div style={{marginLeft:(-gutter/2),marginRight:(-gutter/2)}} className="clearfix">
            {React.Children.map(this.props.children, (child) => {
              return (
                <div style={{padding: `0 ${gutter/2}px ${gutter}px`,float: 'left'}}>
                  {child}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}


function mapStateToProps(state) {
  const { collapsed } = state.app
  return { collapsed }
}

export default connect(mapStateToProps)(CardContainer)
