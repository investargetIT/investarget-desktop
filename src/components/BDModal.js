import React from 'react';
import * as api from '../api';
import { 
  Table, 
  Modal, 
} from 'antd';


class BDModal extends React.Component{
  constructor(props){
    super(props)
    this.state={
      source:this.props.source,
      visible:true,
      managers:null,
      element:this.props.element
    }
  }

  handleCancel = (e) =>{
    this.setState({
      visible:false
    })
  }
  
  mapIdToManager = () =>{
    let {managers}=this.state   
    var promises=managers.map(item=>{
      return api.getUserInfo(item.manager).then(result=>{
      item.manager=result.data.username 
    })
    })
    Promise.all(promises).then(()=>{
      this.setState({managers})
    })
    
  }
  getBdList = () =>{
    let param={bd_status:this.state.source}
    if(this.state.element=='org'){
      api.getOrgBdList(param).then(result=>{
        this.setState({managers:result.data.manager_count},this.mapIdToManager)
      })
    }
    else if(this.state.element=='proj'){
      api.getProjBDList(param).then(result=>{
        this.setState({managers:result.data.manager_count},this.mapIdToManager)
      })
    }
  }
  
  componentDidMount(){
    this.getBdList()
  }
  render(){

    const {source, managers, element} =this.state
    const component = (element=='proj' ? '项目' : '机构')
    const columnName = (source==3 ? component+'BD成功数量' : component+'未BD数量')
    const dataSource = managers;
    const columns = [{
      title: '负责人', dataIndex:'manager'
    }, {
      title: columnName, dataIndex:'count'
    }];

    return (
      <div>
        <Modal
          visible={this.state.visible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <Table columns={columns} dataSource={dataSource} size="small" />
        </Modal>
      </div>
    )
  }
}

export default BDModal