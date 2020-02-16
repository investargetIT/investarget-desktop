import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import * as api from '../api';
import { getUserInfo } from '../utils/util';
import { connect } from 'dva';

class ReportList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      pageSize: getUserInfo().page || 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  componentDidMount() {
    this.getReportList()
  }

  getReportList = () => {
    const { page, pageSize } = this.state
    const params = { page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getWorkReport(params).then(result => {
      const { count: total, data: list } = result.data
      window.echo('data', list);
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  render() {
    const { location } = this.props;
    return  (
    <LeftRightLayout location={location} title="工作报告列表">
    </LeftRightLayout>
    );
  }
}

export default connect()(ReportList);
