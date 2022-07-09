import { Row, Col } from 'antd';

function LayoutItem({ label, children, style }) {
  return (
    <Row style={{marginBottom:24,...style}}>
      <Col sm={6} xs={24}>
        {label ? (
          <span style={{float:'right',color:'rgba(0, 0, 0, 0.85)'}}>{label}<span style={{margin: '0 8px 0 2px'}}>:</span></span>
        ) : null}
      </Col>
      <Col sm={14} xs={24}>{children}</Col>
    </Row>
  )
}

export default LayoutItem;
