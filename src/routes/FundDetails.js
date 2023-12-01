import React from 'react';
import { connect } from 'dva';
import LeftRightLayout from '../components/LeftRightLayout';
import FaFundPipeline from '../components/FaFundPipeline';

function FundDetails(props) {
  return (
    <LeftRightLayout title="上海健益兴禾创业投资中心" location={props.location} style={{}} innerStyle={{ background: 'unset' }}>
      <FaFundPipeline />
    </LeftRightLayout>
  );
}

export default connect()(FundDetails);
