import _ from 'lodash'
import { Card, Icon, Tag } from 'antd'

import styles from './Recommend.css'



function RecommendUsers({ users, onMouseEnter }) {

}

function RecommendProjects({ projects, selectedProjects, onProjectToggle }) {

  return (
    <div className="clearfix" className={styles.container}>

        {
          projects.map(item => {

            const cardBodyStyle = { padding: 0 }
            const cardContentStyle ={ backgroundImage: 'url(' + item.image + ')' }

            const isSelected = selectedProjects.includes(item.id)
            const cardCoverStyle = isSelected ? { display: 'flex' } : { display : 'none' }

            return (
                <Card key={item.id} className={styles.card} bordered={false} bodyStyle={cardBodyStyle} onClick={()=>{onProjectToggle(item.id)}}>
                  <div className={styles.cardContent} style={cardContentStyle}>
                    <div className={styles.cardDetail}>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      <div style={{textAlign: 'left'}}>
                        <Tag color="pink">美国</Tag>
                        <Tag color="red">TMT</Tag>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardCover} style={cardCoverStyle}>
                    <div className={styles.cardCoverWrap}>
                      <Icon type="check" className={styles.cardCoverIcon} />
                    </div>
                  </div>
                </Card>
            )
          })
        }

    </div>
  )

}


export { RecommendUsers, RecommendProjects }
