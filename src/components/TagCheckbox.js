import { Checkbox } from 'antd'
const CheckboxGroup = Checkbox.Group
import styles from './TagCheckbox.css'


const tagData = [{"tagName":"TMT","id":33},{"tagName":"大健康","id":34},{"tagName":"大数据","id":35},{"tagName":"房地产","id":36},{"tagName":"高端装备","id":37},{"tagName":"工业4.0","id":38},{"tagName":"互联网金融","id":39},{"tagName":"机器人","id":40},{"tagName":"清洁技术","id":41},{"tagName":"人工智能","id":42},{"tagName":"日用品","id":43},{"tagName":"生命科学","id":44},{"tagName":"时尚","id":45},{"tagName":"文化创意","id":46},{"tagName":"物联网","id":47},{"tagName":"消费电子","id":48},{"tagName":"新材料","id":49},{"tagName":"新媒体","id":50},{"tagName":"新能源","id":51},{"tagName":"新农业","id":52},{"tagName":"新型汽车","id":53},{"tagName":"虚拟/增强现实","id":54},{"tagName":"云计算","id":55},{"tagName":"智能硬件","id":56},{"tagName":"教育培训","id":57},{"tagName":"电子商务","id":58},{"tagName":"医疗器械","id":59},{"tagName":"泛娱乐","id":60},{"tagName":"大消费","id":61},{"tagName":"家具与家居","id":62},{"tagName":"旅游","id":63},{"tagName":"软件服务","id":64},{"tagName":"食品饮料","id":65},{"tagName":"国防军工","id":66}]


const tagOptions = tagData.map(item => {
  return { label: item.tagName, value: item.id }
})


function TagCheckbox({ style, value, onChange }) {
  return (
    <div style={style}>
      <CheckboxGroup className={styles['tag-group']} options={tagOptions} value={value} onChange={onChange} />
    </div>
  )
}

export default TagCheckbox
