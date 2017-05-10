import React from 'react'
import _styles from './FullPage.css'


function FullPage(props) {
    var len = props.children.length

    var widthVal = `${len}00%`
    var transformVal = `translate3d(${-props.currPage / len * 100}%,0,0)`
    var itemWidthVal = `${1 / len * 100}%`

    return (
      <div className={_styles.container}>

        <div className="clearfix" className={_styles.pages} style={{ width: widthVal , transform: transformVal, WebkitTransform: transformVal }}>
          {
            props.children.map((item, index) => {
              return (
                <div key={index} className={_styles.page} style={{ width: itemWidthVal }}>{item}</div>
              )
            })
          }
        </div>
      </div>
    )
}


export default FullPage
