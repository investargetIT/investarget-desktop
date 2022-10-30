// import _ from 'lodash';
// import React from 'react';
// import Datasheet from 'react-datasheet';
// import 'react-datasheet/lib/react-datasheet.css';
// import LeftRightLayout from '../components/LeftRightLayout';
// import { withRouter } from 'dva/router';
// import { i18n } from '../utils/util';
// import { Button } from 'antd';
// import {
//   CaretDownOutlined,
//   CaretRightOutlined,
// } from '@ant-design/icons';

// class BasicSheet extends React.Component {

//   constructor(props) {
//     super(props);

//     this.state = {
//       collapsePanel: [],
//     };
//   }

//   rand = (min, max) => {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
//   }

//   makeRandomScores = () => {
//     let scoreArray = [];
//     for (let inning = 1; inning < 10; inning++) {
//       scoreArray.push(this.rand(0, 4));
//     }
//     scoreArray.push(scoreArray.reduce((a, b) => a + b, 0));
//     return scoreArray;
//   }

//   handleTogglePanel = panel => {
//     const checkIndex = this.state.collapsePanel.indexOf(panel.id);
//     const newCollapsePanel = [...this.state.collapsePanel];
//     if (checkIndex > -1) {
//       newCollapsePanel.splice(checkIndex, 1);
//     } else {
//       newCollapsePanel.push(panel.id);
//     }
//     this.setState({ collapsePanel: newCollapsePanel });
//   }

//   getBackground = status => {
//     switch (status) {
//       case 'On going':
//         return 'antiquewhite';
//       case 'BD中':
//         return 'darkseagreen';
//     }
//   }
//   render() {

//     const teams = [
//       {
//         id: 1,
//         name: 'On going',
//         data: [
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决, 机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'On going', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//         ]
//       },
//       {
//         id: 2,
//         name: 'BD中',
//         data: [
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//           { "name": "Chapter家具", status: 'BD中', progress: '机构推进', manager: '尹乐鸣', makeUser: ['尹乐鸣', '雪珂'], ir: ['王菲'], latestComment: '机构尽调中，下周一最终投决', materials: ['BP', 'FM', 'Teaser', 'Roadshow材料', '投资人名单'], projectRemark: '', companyLink: 'https://www.qimingpian.cn/detailcom?src=magic&ticket=86cea831cc4a5a6ca92009f8b530f5ac&id=475b754413b4977cea1a03b257466f86', additionalComment: '', date: '2022/01/05', scores: this.makeRandomScores() },
//         ]
//       }
//     ];

//     const columns = [
//       {
//         title: 'Full Name',
//         width: 100,
//         dataIndex: 'name',
//         key: 'name',
//         fixed: 'left',
//       },
//       {
//         title: 'Age',
//         width: 100,
//         dataIndex: 'age',
//         key: 'age',
//         fixed: 'left',
//       },
//       {
//         title: 'Column 1',
//         dataIndex: 'address',
//         key: '1',
//         width: 150,
//       },
//       {
//         title: 'Column 2',
//         dataIndex: 'address',
//         key: '2',
//         width: 150,
//       },
//       {
//         title: 'Column 3',
//         dataIndex: 'address',
//         key: '3',
//         width: 150,
//       },
//       {
//         title: 'Column 4',
//         dataIndex: 'address',
//         key: '4',
//         width: 150,
//       },
//       {
//         title: 'Column 5',
//         dataIndex: 'address',
//         key: '5',
//         width: 150,
//       },
//       {
//         title: 'Column 6',
//         dataIndex: 'address',
//         key: '6',
//         width: 150,
//       },
//       {
//         title: 'Column 7',
//         dataIndex: 'address',
//         key: '7',
//         width: 150,
//       },
//       { title: 'Column 8', dataIndex: 'address', key: '8' },
//       {
//         title: 'Action',
//         key: 'operation',
//         fixed: 'right',
//         width: 100,
//         render: () => <a>action</a>,
//       },
//     ];
    
//     const data = [];
//     for (let i = 0; i < 100; i++) {
//       data.push({
//         key: i,
//         name: `Edrward ${i}`,
//         age: 32,
//         address: `London Park no. ${i}`,
//       });
//     }

//     return (
//       <LeftRightLayout
//         location={this.props.location}
//         title="Feishu"
//         style={{ paddingLeft: 30, paddingTop: 30, backgroundColor:'#fff' }}
//       >
//         <div className="wrapper">
//         <table>
//             <thead>
//               <tr>
//                 <th className="fixed-column">任务描述</th>
//                 <th>项目类型</th>
//                 <th>项目进度</th>
//                 <th>项目负责人</th>
//                 <th>项目承做</th>
//                 <th>项目配合IR</th>
//                 <th>项目最新进展</th>
//                 <th className="material-col">材料完成度</th>
//                 <th>项目评价/备注</th>
//                 <th>企名片链接</th>
//                 <th>补充材料</th>
//                 <th>更新日期</th>
//               </tr>
//             </thead>
            
//             { teams.map(m => {
//               return (
//                 <tbody key={m.id}>
//                   <tr>
//                     <th className="fixed-column">
//                       <div style={{ paddingLeft: 8, paddingRight: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <div style={{ display: 'flex', alignItems: 'center' }}>
//                           {this.state.collapsePanel.includes(m.id) ?  <CaretRightOutlined className="collapse-icon" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => this.handleTogglePanel(m)} /> :
//                           <CaretDownOutlined className="collapse-icon" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => this.handleTogglePanel(m)} />}
//                           <div style={{ padding: '0 8px', borderRadius: 11, marginLeft: 8, backgroundColor: this.getBackground(m.name) }}>{m.name}</div>
//                         </div>
//                         <div style={{ color: '#666', fontSize: 12 }}>{m.data.length} records</div>
//                       </div>
//                     </th>
//                     <td colSpan="11"></td>
//                   </tr>
//                   {this.state.collapsePanel.includes(m.id) ? null : m.data.map((n,i) => (
//                     <tr key={i}>
//                     <th><div style={{ paddingLeft: 40, display: 'flex', alignItems: 'center' }}>
//                       <div style={{ width: 50, color: '#999' }}>{i+1}</div>
//                       <div>{n.name}</div>
//                     </div></th>
//                     <td><span style={{ padding: '2px 8px', borderRadius: 10, backgroundColor: this.getBackground(n.status) }}>{n.status}</span></td>
//                     <td><span style={{ padding: '2px 8px', borderRadius: 10, backgroundColor: 'lightpink' }}>{n.progress}</span></td>
//                     <td><span style={{ padding: '2px 8px', borderRadius: 10, backgroundColor: 'lightskyblue' }}>{n.manager}</span></td>
//                     <td>{n.makeUser.map((o, i) => <span key={o} style={{ padding: '2px 8px', borderRadius: 10, backgroundColor: 'lightskyblue', marginLeft: i > 0 ? 4 : 0 }}>{o}</span>)}</td>
//                     <td>{n.ir.map((o, i) => <span key={o} style={{ padding: '2px 8px', borderRadius: 10, backgroundColor: 'lightskyblue', marginLeft: i > 0 ? 4 : 0 }}>{o}</span>)}</td>
//                     <td><div>{n.latestComment}</div></td>
//                     <td className="material-col">{n.materials.map((o, i) => <span key={o} style={{ padding: '2px 8px', borderRadius: 10, backgroundColor: 'lightskyblue', marginLeft: i > 0 ? 4 : 0 }}>{o}</span>)}</td> 
//                     <td>{n.projectRemark}</td>
//                     <td><div><a href={n.companyLink} target="_blank">{n.companyLink}</a></div></td>
//                     <td>{n.additionalComment}</td>
//                     <td>{n.date}</td>
//                   </tr> 
//                   ))}
//                 </tbody>
//               )
//             }) }


//             </table>
//         </div>
//       </LeftRightLayout>
//     );
//   }
// }

// export default withRouter(BasicSheet);
