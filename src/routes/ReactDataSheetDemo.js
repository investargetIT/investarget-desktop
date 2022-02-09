import _ from 'lodash';
import React from 'react';
import Datasheet from 'react-datasheet';
import 'react-datasheet/lib/react-datasheet.css';
import LeftRightLayout from '../components/LeftRightLayout';
import { withRouter } from 'dva/router';
import { i18n } from '../utils/util';
import { Button } from 'antd';
import {
  CaretDownOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';

class BasicSheet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      collapsePanel: [],
    };
  }

  rand = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  makeRandomScores = () => {
    let scoreArray = [];
    for (let inning = 1; inning < 10; inning++) {
      scoreArray.push(this.rand(0, 4));
    }
    scoreArray.push(scoreArray.reduce((a, b) => a + b, 0));
    return scoreArray;
  }

  handleTogglePanel = panel => {
    const checkIndex = this.state.collapsePanel.indexOf(panel.id);
    const newCollapsePanel = [...this.state.collapsePanel];
    if (checkIndex > -1) {
      newCollapsePanel.splice(checkIndex, 1);
    } else {
      newCollapsePanel.push(panel.id);
    }
    this.setState({ collapsePanel: newCollapsePanel });
  }

  render() {

    const teams = [
      {
        id: 1,
        name: 'ongoing',
        data: [
          { "name": "Milwaukee Brewers", scores: this.makeRandomScores() },
          { "name": "Los Angles Dodgers", scores: this.makeRandomScores() },
          { "name": "New York Mets", scores: this.makeRandomScores() },
          { "name": "St. Louis Cardinals", scores: this.makeRandomScores() },
          { "name": "Houston Astros", scores: this.makeRandomScores() },
          { "name": "Toronto Blue Jays", scores: this.makeRandomScores() },
          { "name": "Boston Red Sox", scores: this.makeRandomScores() },
          { "name": "Chicago Cubs", scores: this.makeRandomScores() },
          { "name": "Philadelphia Phillies", scores: this.makeRandomScores() },
          { "name": "Chicago White Sox", scores: this.makeRandomScores() },
          { "name": "San Diego Padres", scores: this.makeRandomScores() },
          { "name": "Cleveland Indians", scores: this.makeRandomScores() },
          { "name": "San Francisco Giants", scores: this.makeRandomScores() },
          { "name": "Cincinatti Reds", scores: this.makeRandomScores() },
          { "name": "Minnesota Twins", scores: this.makeRandomScores() },
          { "name": "Tampa Bay Rays", scores: this.makeRandomScores() },
          { "name": "Miami Marlins", scores: this.makeRandomScores() },
          { "name": "Oakland Athletics", scores: this.makeRandomScores() },
          { "name": "Detroit Tigers", scores: this.makeRandomScores() },
          { "name": "Pittsburgh Pirates", scores: this.makeRandomScores() },
          { "name": "Seattle Mariners", scores: this.makeRandomScores() },
          { "name": "Atlanta Braves", scores: this.makeRandomScores() }
        ]
      },
      {
        id: 2,
        name: 'BD中',
        data: [
          { "name": "Milwaukee Brewers", scores: this.makeRandomScores() },
          { "name": "Los Angles Dodgers", scores: this.makeRandomScores() },
          { "name": "New York Mets", scores: this.makeRandomScores() },
          { "name": "St. Louis Cardinals", scores: this.makeRandomScores() },
          { "name": "Houston Astros", scores: this.makeRandomScores() },
          { "name": "Toronto Blue Jays", scores: this.makeRandomScores() },
          { "name": "Boston Red Sox", scores: this.makeRandomScores() },
          { "name": "Chicago Cubs", scores: this.makeRandomScores() },
          { "name": "Philadelphia Phillies", scores: this.makeRandomScores() },
          { "name": "Chicago White Sox", scores: this.makeRandomScores() },
          { "name": "San Diego Padres", scores: this.makeRandomScores() },
          { "name": "Cleveland Indians", scores: this.makeRandomScores() },
          { "name": "San Francisco Giants", scores: this.makeRandomScores() },
          { "name": "Cincinatti Reds", scores: this.makeRandomScores() },
          { "name": "Minnesota Twins", scores: this.makeRandomScores() },
          { "name": "Tampa Bay Rays", scores: this.makeRandomScores() },
          { "name": "Miami Marlins", scores: this.makeRandomScores() },
          { "name": "Oakland Athletics", scores: this.makeRandomScores() },
          { "name": "Detroit Tigers", scores: this.makeRandomScores() },
          { "name": "Pittsburgh Pirates", scores: this.makeRandomScores() },
          { "name": "Seattle Mariners", scores: this.makeRandomScores() },
          { "name": "Atlanta Braves", scores: this.makeRandomScores() }
        ]
      }
    ];

    const columns = [
      {
        title: 'Full Name',
        width: 100,
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
      },
      {
        title: 'Age',
        width: 100,
        dataIndex: 'age',
        key: 'age',
        fixed: 'left',
      },
      {
        title: 'Column 1',
        dataIndex: 'address',
        key: '1',
        width: 150,
      },
      {
        title: 'Column 2',
        dataIndex: 'address',
        key: '2',
        width: 150,
      },
      {
        title: 'Column 3',
        dataIndex: 'address',
        key: '3',
        width: 150,
      },
      {
        title: 'Column 4',
        dataIndex: 'address',
        key: '4',
        width: 150,
      },
      {
        title: 'Column 5',
        dataIndex: 'address',
        key: '5',
        width: 150,
      },
      {
        title: 'Column 6',
        dataIndex: 'address',
        key: '6',
        width: 150,
      },
      {
        title: 'Column 7',
        dataIndex: 'address',
        key: '7',
        width: 150,
      },
      { title: 'Column 8', dataIndex: 'address', key: '8' },
      {
        title: 'Action',
        key: 'operation',
        fixed: 'right',
        width: 100,
        render: () => <a>action</a>,
      },
    ];
    
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        key: i,
        name: `Edrward ${i}`,
        age: 32,
        address: `London Park no. ${i}`,
      });
    }

    return (
      <LeftRightLayout
        location={this.props.location}
        title="Feishu"
        style={{ paddingLeft: 30, paddingTop: 30, backgroundColor:'#fff' }}
      >
        <div className="wrapper">
        <table>
            <thead>
              <tr>
                <th className="fixed-column"></th>
                <th>column 1</th>
                <th>column 2</th>
                <th>column 1</th>
                <th>column 2</th>
                <th>column 1</th>
                <th>column 2</th>
              </tr>
            </thead>
            
            { teams.map(m => {
              return (
                <tbody key={m.id}>
                  <tr>
                    <th className="fixed-column">
                      <div style={{ paddingLeft: 8, paddingRight: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {this.state.collapsePanel.includes(m.id) ?  <CaretRightOutlined className="collapse-icon" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => this.handleTogglePanel(m)} /> :
                          <CaretDownOutlined className="collapse-icon" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => this.handleTogglePanel(m)} />}
                          <div style={{ padding: '0 8px', borderRadius: 11, marginLeft: 8, backgroundColor: 'lightskyblue' }}>On going</div>
                        </div>
                        <div style={{ color: '#666', fontSize: 12 }}>{m.data.length} records</div>
                      </div>
                    </th>
                    <td colSpan="6"></td>
                  </tr>
                  {this.state.collapsePanel.includes(m.id) ? null : m.data.map((n,i) => (
                    <tr key={n.name}>
                    <th>{i+1}{n.name}</th>
                    <td>{n.name}</td>
                    <td>{n.name}</td>
                    <td>{n.scores}</td>
                    <td>{n.scores}</td>
                    <td>{n.scores}</td>
                    <td>{n.scores}</td>
                  </tr> 
                  ))}
                </tbody>
              )
            }) }


            </table>
        </div>
      </LeftRightLayout>
    );
  }
}

export default withRouter(BasicSheet);
