import { Divider } from 'antd';
import { connect } from 'dva';
import React from 'react'
import { 
  handleError, 
  requestAllData,
  time,
} from '../utils/util';
import * as api from '../api'
import { isLogin } from '../utils/util'
import FileLink from '../components/FileLink';

class ReportProjectBDDetails extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      list: [],
      loading: false,
      sort: 'isimportant',
      desc: 1,
    }
  }

  getProjectBDList = () => {
    const { manager, stimeM, etimeM } = this.props;
    const { sort, desc } = this.state
    const param = {
      sort,
      desc,
      stimeM,
      etimeM,
      manager,
    }

    this.setState({ loading: true })
    let bdList = [];
    return requestAllData(api.getProjBDList, param, 100)
    .then(result => {
      let { count: total, data: list } = result.data
      let promises = list.map(item=>{
        if(item.bduser){
          return api.checkUserRelation(isLogin().id, item.bduser)
        }
        else{
          return {data:false}
        }
      })
      Promise.all(promises).then(result=>{
        result.forEach((item,index)=>{
          list[index].hasRelation=item.data           
        })
        bdList = list;
        this.setState({ loading: false, total, list: bdList });
      })
      return this.props.dispatch({ type: 'app/getSource', payload: 'bdStatus' });
    })
    .then(allBdStatus => {
      bdList = bdList.map(m => {
        const bdStatus = allBdStatus.find(f => f.id === m.bd_status);
        return { ...m, bd_status: bdStatus };
      });
      this.setState({ list: bdList });
      if (bdList.length > 0) {
        return requestAllData(api.getProjBDCom, { projectBD: bdList.map(m => m.id) }, 100);
      }
    })
    .then(reqBDComments => {
      if (reqBDComments) {
        bdList = bdList.map(m => {
          const BDComments = reqBDComments.data.data.filter(f => f.projectBD === m.id);
          return { ...m, BDComments };
        });
        let promises2 = bdList.map((item) => {
          if (item.BDComments) {
            return this.updateComments(item.BDComments).then((BDComments) => ({ ...item, BDComments }));
          } else {
            return Promise.resolve(item);
          }
        });
        Promise.all(promises2).then((newList) => {
          bdList = newList;
          this.setState({ list: newList });
        })
      }
    })
    .catch(error => {
      handleError(error)
      this.setState({ loading: false })
    })
  }

  getManagerText = (manager) => {
    return manager && manager.filter(f => f.type === 3).map(m => m.manager.username).join('、');
  }

  updateComments = (BDComments) => {
    if (BDComments) {
      return Promise.all(BDComments.map((comment) => {
        if (!comment.url && comment.key && comment.bucket) {
          return api.downloadUrl(comment.bucket, comment.key)
            .then((res) => ({ ...comment, url: res.data }))
            .catch(() => comment);
        } else {
          return comment;
        }
      }));
    } else {
      return Promise.resolve([]);
    }
  };

  componentDidMount() {
    this.getProjectBDList()
    this.props.dispatch({ type: 'app/getGroup' });
  }

  render() {
    const { list } = this.state;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ padding: '0 10px' }}>
          {list.map(({ id, com_name, bd_status, manager, BDComments }, index) => (
            <div key={id} >
              {index > 0 && <Divider dashed />}
              <div style={{ display: 'flex' }}>
                <div style={{ width: 250, marginRight: 16 }}>
                  <div style={{ display: 'flex' }}>
                    <div>项目名称：</div>
                    <div style={{ flex: 1 }}>
                      {com_name}
                    </div>
                  </div>
                </div>

                <div style={{ width: 100, marginRight: 16 }}>
                  <div style={{ display: 'flex' }}>
                    <div>状态：</div>
                    <div style={{ flex: 1 }}>
                      {bd_status && bd_status.name}
                    </div>
                  </div>
                </div>

                <div style={{ width: 250, marginRight: 16 }}>
                  <div style={{ display: 'flex' }}>
                    <div>开发团队：</div>
                    <div style={{ flex: 1 }}>
                      {this.getManagerText(manager)}
                    </div>
                  </div>
                </div>

                <div style={{ width: 300, flex: 1 }}>
                  <div style={{ display: 'flex' }}>
                    <div>行动计划：</div>
                    <div style={{ flex: 1 }}>
                      {BDComments && BDComments.length > 0
                        ? BDComments.map((comment) => (
                          <div key={comment.id} style={{ marginBottom: 8 }}>
                            <span style={{ marginRight: 8 }}>{time(comment.createdtime)}</span>
                            <span>{comment.comments}</span>
                            {comment.url && (
                              <FileLink
                                style={{ marginLeft: 16 }}
                                filekey={comment.key}
                                url={comment.url}
                                filename={comment.filename || comment.key}
                              />
                            )}
                          </div>
                        ))
                        : '暂无'
                      }
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default connect()(ReportProjectBDDetails);
