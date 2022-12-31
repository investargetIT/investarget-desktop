import React, { useState, useEffect } from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import { withRouter } from 'dva/router';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Table, Typography, message, Popconfirm, Button, Tooltip } from 'antd';
import * as api from '../api';
import { UploadFile } from '../components/Upload';
import { connect } from 'dva';
import {
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { handleError, i18n, requestAllData } from '../utils/util';
import styles from './OrgCoverage.css';
import moment from 'moment';

const { Text, Title } = Typography;

const data = [
  {
    label: "未覆盖",
    value: 120,
  },
  {
    label: "有覆盖",
    value: 180,
  },
];

const barData2 = [
  {
    label: "未覆盖(0%)",
    ibd: 120,
    ecm: 150,
  },
  {
    label: "低覆盖(50%以下)",
    ibd: 180,
    ecm: 130,
  },
  {
    label: "高覆盖(50%以上)",
    ibd: 120,
    ecm: 150,
  },
  {
    label: "全覆盖",
    ibd: 180,
    ecm: 130,
  },
];

const pieChartData = [
  {
    label: "未覆盖（0%）",
    value: 120,
  },
  {
    label: "低覆盖（50%以下）",
    value: 180,
  },
  {
    label: '高覆盖（50%以上）',
    value: 200,
  },
  {
    label: '全覆盖（100%）',
    value: 200,
  }
];
const totalValue = pieChartData.reduce((prev, curr) => prev + curr.value, 0);

// let verticalBarChartData = [
//   {
//     label: '高级总监',
//     value: 1,
//   },
//   {
//     label: '高级副总裁',
//     value: 2,
//   },
//   {
//     label: '助理',
//     value: 3,
//   },
//   {
//     label: '总裁助理',
//     value: 4,
//   },
//   {
//     label: '董事长助理',
//     value: 5,
//   },
//   {
//     label: '其它',
//     value: 10,
//   },
//   {
//     label: '董事长',
//     value: 2,
//   },
//   {
//     label: '助理经理',
//     value: 3,
//   },
// ];
// const totalVerticalValue = verticalBarChartData.reduce((prev, curr) => prev + curr.value, 0);
// verticalBarChartData = verticalBarChartData.map(m => {
//   const value = (m.value / totalVerticalValue) * 100;
//   const number = m.value;
//   return { ...m, value: parseInt(value.toFixed()), number };
// })

const barColors = ['rgb(34, 93,131)', 'rgb(135, 172, 193)', 'rgb(216, 235, 238)'];
const pieColors = ['rgb(175, 171, 171)', 'rgb(221, 238, 241)', 'rgb(34, 138, 157)', 'rgb(34, 93,131)'];

const pieChartLabelContainerStyle = {
  display: 'flex',
  alignItems: 'center',
};

const pieChartLabelColorStyle = {
  marginRight: 10,
  width: 10,
  height: 10,
  opacity: 0.7,
  background: '#339bd2',
  borderRadius: '50%',
};
const pieChartLabelTextStyle = {
  marginRight: 8,
  color: '#595959',
};

const columns = [
  {
    title: '职位',
    dataIndex: 'label',
  },
  {
    title: '覆盖投资人人数',
    dataIndex: 'number',
    align: 'center',
  },
  {
    title: '覆盖投资人占比',
    dataIndex: 'digits',
    align: 'center',
    render: text => `${text}%`,
  },
];

function OrgCoverage(props) {

  const [loading, setLoading] = useState(false);
  const [coverageList, setCoverageList] = useState([]);
  const [coverageData, setCoverageData] = useState([]);
  const [currentCoverageID, setCurrentCoverageID] = useState(null);

  async function getUserCoverage() {
    try {
      setLoading(true);
      const req = await requestAllData(api.getUserCoverage, {}, 10);
      setCoverageList(req.data.data);
    } catch (error) {
      props.dispatch({
        type: 'app/findError',
        payload: error,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUserCoverage();
  }, []);

  function calculateMax(dataMax) {
    const intDigits = dataMax.toString().length;
    let divider = 1;
    for (let index = 0; index < intDigits - 1; index++) {
      divider *= 10;
    }
    return Math.ceil(dataMax / divider) * divider;
  }

  function calculatePercentage(entry) {
    if (coverageData.length === 0) return '0%';
    let num = entry.value / coverageData.length * 100;
    num = num.toFixed(2);
    return `${num}%`;
  }

  function calculatePercentage2(entry) {
    const hasCoverage = coverageData.filter(f => parseInt(f['覆盖投资人 数量']) > 0);
    if (hasCoverage.length === 0) return '0%';
    let num = entry.value / hasCoverage.length * 100;
    num = num.toFixed(2);
    return `${num}%`;
  }

  function calculateDataForBarChart1() {
    const hasCoverage = coverageData.filter(f => parseInt(f['覆盖投资人 数量']) > 0);
    const result = [{ label: '未覆盖', value: coverageData.length - hasCoverage.length }];
    result.push({ label: '有覆盖', value: hasCoverage.length });
    return result;
  }

  function calculateDataForBarChart2() {
    const hasCoverage = coverageData.filter(f => parseInt(f['覆盖投资人 数量']) > 0);
    const fullCoverage = hasCoverage.filter(f => f['投资人总数'] === f['覆盖投资人 数量']);
    const moreCoverage = hasCoverage.filter(f => parseInt(f['覆盖投资人 数量']) / parseInt(f['投资人总数']) >= 0.5);
    const result = [{ label: '全覆盖', value: fullCoverage.length }];
    result.push({ label: '50%以上', value: moreCoverage.length });
    result.push({ label: '50%以下', value: hasCoverage.length - fullCoverage.length - moreCoverage.length });
    return result;
  }

  function calculateDataForPieChart1() {
    const hasCoverage = coverageData.filter(f => parseInt(f['覆盖投资人 数量']) > 0);
    const fullCoverage = hasCoverage.filter(f => f['投资人总数'] === f['覆盖投资人 数量']);
    const moreCoverage = hasCoverage.filter(f => {
      const rate = parseInt(f['覆盖投资人 数量']) / parseInt(f['投资人总数']);
      return rate >= 0.5 && rate < 1;
    });
    const result = [{ label: '未覆盖（0%）', value: coverageData.length - hasCoverage.length }];
    result.push({ label: '低覆盖（50%以下）', value: hasCoverage.length - fullCoverage.length - moreCoverage.length });
    result.push({ label: '高覆盖（50%以上）', value: moreCoverage.length });
    result.push({ label: '全覆盖（100%）', value: fullCoverage.length });
    return result;
  }

  function calculateDataForBarChart3() {
    const hasCoverage = coverageData.filter(f => parseInt(f['覆盖投资人 数量']) > 0);
    const ibdFullCoverage = hasCoverage.filter(f => f['覆盖投资人（IBD）'] === f['覆盖投资人 数量']);
    const ecmFullCoverage = hasCoverage.filter(f => f['覆盖投资人（ECM）'] === f['覆盖投资人 数量']);
    const ibdMoreCoverage = hasCoverage.filter(f => {
      const rate = parseInt(f['覆盖投资人（IBD）']) / parseInt(f['覆盖投资人 数量']);
      return rate >= 0.5 && rate < 1;
    });
    const ecmMoreCoverage = hasCoverage.filter(f => {
      const rate = parseInt(f['覆盖投资人（ECM）']) / parseInt(f['覆盖投资人 数量']);
      return rate >= 0.5 && rate < 1;
    });
    const ibdNoCoverage = hasCoverage.filter(f => parseInt(f['覆盖投资人（IBD）']) == 0);
    const ecmNoCoverage = hasCoverage.filter(f => parseInt(f['覆盖投资人（ECM）']) == 0);
    const ibdLessCoverage = hasCoverage.length - ibdFullCoverage.length - ibdNoCoverage.length - ibdMoreCoverage.length;
    const ecmLessCoverage = hasCoverage.length - ecmFullCoverage.length - ecmNoCoverage.length - ecmMoreCoverage.length;
    const result = [{ label: '未覆盖', ibd: ibdNoCoverage.length, ecm: ecmNoCoverage.length }];
    result.push({ label: '低覆盖', ibd: ibdLessCoverage, ecm: ecmLessCoverage });
    result.push({ label: '高覆盖', ibd: ibdMoreCoverage.length, ecm: ecmMoreCoverage.length });
    result.push({ label: '全覆盖', ibd: ibdFullCoverage.length, ecm: ecmFullCoverage.length });
    return result;
  }

  function calculateDataForPieChart2() {
    const hasCoverage = coverageData.filter(f => parseInt(f['覆盖投资人 数量']) > 0);
    const noDuplicate = hasCoverage.filter(f => parseInt(f['覆盖投资人（ECM）']) + parseInt(f['覆盖投资人（IBD）']) == parseInt(f['覆盖投资人 数量']));
    const moreDuplicate = hasCoverage.filter(f => {
      const rate = (parseInt(f['覆盖投资人（ECM）']) + parseInt(f['覆盖投资人（IBD）']) - parseInt(f['覆盖投资人 数量'])) / parseInt(f['覆盖投资人 数量']);
      return rate >= 0.5 && rate < 1;
    });
    const lessDuplicate = hasCoverage.filter(f => {
      const rate = (parseInt(f['覆盖投资人（ECM）']) + parseInt(f['覆盖投资人（IBD）']) - parseInt(f['覆盖投资人 数量'])) / parseInt(f['覆盖投资人 数量']);
      return rate > 0 && rate < 0.5;
    });
    const result = [{ label: '无重复', value: noDuplicate.length }];
    result.push({ label: '低重复率（50%以下）', value: lessDuplicate.length });
    result.push({ label: '高重复率（50%以上）', value: moreDuplicate.length });
    result.push({ label: '完全重复', value: hasCoverage.length - noDuplicate.length - moreDuplicate.length - lessDuplicate.length });
    return result;
  }

  function handleFinishUploadExcel(_, realfilekey, filename) {
    message.success('文件上传成功，数据正在统计中，请稍后再试');
    api.addUserCoverageStatistics({ key: realfilekey, file_name: filename })
      .then(() => getUserCoverage())
      .catch(error => {
        props.dispatch({
          type: 'app/findError',
          payload: error,
        });
      });
  }

  async function handleDelete(item) {
    try {
      setLoading(true);
      const req = await api.deleteUserCoverage(item.id);
      getUserCoverage();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewBtnClicked(item) {
    try {
      setLoading(true);
      const req = await api.getUserCoverageDetails(item.id);
      setCoverageData(req.data);
      setCurrentCoverageID(item.id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadBtnClicked(item) {
    try {
      setLoading(true);
      const data = await api.getUserCoverageDetailsForExcel(item.id);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.download = `机构投资人覆盖率统计报表_${moment().format('YYYYMMDD_HHmm')}`;
      var blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      link.href = window.URL.createObjectURL(blob);
      link.click();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileNameClicked(record) {    
    try {
      setLoading(true);
      const { key } = record;
      const req = await api.downloadUrl('file', key);
      const { data: url } = req;
      window.open(url);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  const coverageListColumns = [
    {
      title: '文件名称',
      dataIndex: 'filename',
      key: 'filename',
      align: 'center',
      render: (text, record) => <Tooltip title="点击下载原文件">
        <Button type="link" onClick={() => handleFileNameClicked(record)}>{text}</Button>
      </Tooltip>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdtime',
      key: 'time',
      render: text => text.slice(0, 16).replace('T', ' '),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: text => text == 3 ? '已完成' : '未完成',
    },
    {
      title: '操作',
      key: 'operations',
      align: 'center',
      render: (_, record) => {
        return <span>
          <Button type="link" disabled={record.status != 3} onClick={() => handleViewBtnClicked(record)}><EyeOutlined /></Button>
          <Button type="link" disabled={record.status != 3} onClick={() => handleDownloadBtnClicked(record)}><DownloadOutlined /></Button>
          <Popconfirm
            title={i18n('message.confirm_delete')}
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link"><DeleteOutlined /></Button>
          </Popconfirm>
        </span>
      },
    },
  ];

  function calaulateDataForPositions() {
    const allTitleData = coverageData.filter(f => parseInt(f['覆盖投资人 数量']) > 0).map(m => JSON.parse(m['覆盖投资人 职位'].replace(/'/g, '"')));
    const overallData = {};
    for (let index = 0; index < allTitleData.length; index++) {
      const element = allTitleData[index];
      for (const key in element) {
        if (Object.hasOwnProperty.call(element, key)) {
          const value = element[key];
          if (key in overallData) {
            overallData[key] += value;
          } else {
            overallData[key] = value;
          }
        }
      }
    }
    const result = [];
    for (const key in overallData) {
      if (Object.hasOwnProperty.call(overallData, key)) {
        const element = overallData[key];
        result.push({ label: key, value: element });
      }
    }
    return result;
  }

  let verticalBarChartData = calaulateDataForPositions();
  const totalVerticalValue = verticalBarChartData.reduce((prev, curr) => prev + curr.value, 0);
  verticalBarChartData = verticalBarChartData.map(m => {
    const value = (m.value / totalVerticalValue) * 100;
    const number = m.value;
    return { ...m, value: Number(value.toFixed()), number, digits: Number(value.toFixed(2)) };
  })
  return (
    <LeftRightLayout
      location={props.location}
      title="机构投资人覆盖率"
    >
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <UploadFile
          keepUploadBtn
          accept=".xlsx,.xls"
          name="上传Excel文件"
          onChange={handleFinishUploadExcel}
        />
      </div>
      <div style={{ marginBottom: 50 }}>
        <Table
          size="small"
          rowClassName={record => record.id === currentCoverageID ? styles['current-row'] : ''}
          columns={coverageListColumns}
          dataSource={coverageList}
          rowKey={record => record.id}
          loading={loading}
          pagination={false}
        />
      </div>

      {coverageData && coverageData.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>

            <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={5}>所有员工覆盖机构数量（共{coverageData.length}家）</Title>
              <BarChart
                width={360}
                height={330}
                data={calculateDataForBarChart1()}
                margin={{ top: 30 }}
              >
                <XAxis dataKey="label" />
                <YAxis domain={[0, calculateMax]} />
                <Bar dataKey="value" fill="#8884d8" barSize={40} isAnimationActive={false}>
                  {
                    calculateDataForBarChart1().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % 2]} />
                    ))
                  }
                  <LabelList dataKey="value" position="top" fill="black" />
                </Bar>
              </BarChart>
            </div>

            <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={5}>有覆盖中不同投资者覆盖率机构数量</Title>
              <BarChart
                width={360}
                height={330}
                data={calculateDataForBarChart2()}
                margin={{ top: 30 }}
              >
                <XAxis dataKey="label" />
                <YAxis domain={[0, calculateMax]} />
                <Bar dataKey="value" fill="#8884d8" barSize={40} isAnimationActive={false}>
                  {
                    calculateDataForBarChart2().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % 3]} />
                    ))
                  }
                  <LabelList dataKey="value" position="top" fill="black" />
                </Bar>
              </BarChart>
            </div>

            <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={5}>不同投资者覆盖率机构数量占比</Title>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <PieChart width={400} height={360}>
                  <Pie
                    data={calculateDataForPieChart1()}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    isAnimationActive={false}
                    label={calculatePercentage}
                  >
                    {calculateDataForPieChart1().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % 4]} />
                    ))}
                  </Pie>
                </PieChart>
                <div style={{ width: 250 }}>
                  <div style={{ ...pieChartLabelTextStyle, textAlign: 'center', marginBottom: 20 }}></div>
                  {calculateDataForPieChart1().map((m, i) => (
                    <div key={i} style={{ ...pieChartLabelContainerStyle, justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={pieChartLabelContainerStyle}>
                        <div style={{ ...pieChartLabelColorStyle, background: pieColors[i] }} />
                        <div style={pieChartLabelTextStyle}>{m.label}</div>
                      </div>
                      <div style={pieChartLabelTextStyle}>{calculatePercentage(m)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={5}>IBD与ECM部门对投资人不同覆盖率的机构数量</Title>
              <BarChart
                width={540}
                height={330}
                data={calculateDataForBarChart3()}
                margin={{ top: 30 }}
              >
                <XAxis dataKey="label" />
                <YAxis domain={[0, calculateMax]} />
                <Legend verticalAlign="top" height={50} />
                <Bar dataKey="ibd" fill={barColors[1]} barSize={40} name="IBD部门" isAnimationActive={false}>
                  <LabelList dataKey="ibd" position="top" fill="black" />
                </Bar>
                <Bar dataKey="ecm" fill={barColors[0]} barSize={40} name="ECM部门" isAnimationActive={false}>
                  <LabelList dataKey="ecm" position="top" fill="black" />
                </Bar>
              </BarChart>
            </div>

            <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={5}>不同重复覆盖率的机构数量比例</Title>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <PieChart width={400} height={360}>
                  <Pie
                    data={calculateDataForPieChart2()}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    isAnimationActive={false}
                    label={calculatePercentage2}
                  >
                    {calculateDataForPieChart2().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % 4]} />
                    ))}
                  </Pie>
                </PieChart>
                <div style={{ width: 250 }}>
                  <div style={{ ...pieChartLabelTextStyle, textAlign: 'center', marginBottom: 20 }}></div>
                  {calculateDataForPieChart2().map((m, i) => (
                    <div key={i} style={{ ...pieChartLabelContainerStyle, justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={pieChartLabelContainerStyle}>
                        <div style={{ ...pieChartLabelColorStyle, background: pieColors[i] }} />
                        <div style={pieChartLabelTextStyle}>{m.label}</div>
                      </div>
                      <div style={pieChartLabelTextStyle}>{calculatePercentage2(m)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Title level={5} style={{ marginBottom: 20 }}>覆盖投资人各岗位人数占比</Title>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <BarChart
                layout="vertical"
                width={540}
                height={50 * verticalBarChartData.length}
                data={verticalBarChartData.sort((a, b) => a.value - b.value)}
                margin={{ left: 20, top: 20, right: 50 }}
              >
                <XAxis type="number" domain={[0, calculateMax]} tickFormatter={(tick) => {
                  return `${tick}%`;
                }} />
                <YAxis type="category" dataKey="label" />
                <Bar isAnimationActive={false} dataKey="value" fill="rgb(34, 93,131)" barSize={28} />
              </BarChart>

              <Table
                columns={columns}
                rowKey={record => record.label}
                dataSource={verticalBarChartData}
                pagination={false}
                size="small"
                summary={(pageData) => {
                  let totalNumber = 0;
                  pageData.forEach(({ number }) => {
                    totalNumber += number;
                  });
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>总计</Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="center">
                        <Text>{totalNumber}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="center">
                        <Text>100%</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </div>
          </div>
        </div>
      )}

    </LeftRightLayout>
  );
}

export default connect()(withRouter(OrgCoverage));
