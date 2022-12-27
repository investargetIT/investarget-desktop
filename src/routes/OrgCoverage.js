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
import { Table, Typography } from 'antd';
import * as api from '../api';

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
    label: "未覆盖",
    ibd: 120,
    ecm: 150,
  },
  {
    label: "有覆盖",
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

let verticalBarChartData = [
  {
    label: '高级总监',
    value: 1,
  },
  {
    label: '高级副总裁',
    value: 2,
  },
  {
    label: '助理',
    value: 3,
  },
  {
    label: '总裁助理',
    value: 4,
  },
  {
    label: '董事长助理',
    value: 5,
  },
  {
    label: '其它',
    value: 10,
  },
  {
    label: '董事长',
    value: 2,
  },
  {
    label: '助理经理',
    value: 3,
  },
];
const totalVerticalValue = verticalBarChartData.reduce((prev, curr) => prev + curr.value, 0);
verticalBarChartData = verticalBarChartData.map(m => {
  const value = (m.value / totalVerticalValue) * 100;
  const number = m.value;
  return { ...m, value: parseInt(value.toFixed()), number };
})

const barColors = ['rgb(34, 93,131)', 'rgb(135, 172, 193)'];
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
    dataIndex: 'value',
    align: 'center',
  },
];

function OrgCoverage(props) {

  const [coverageData, setCoverageData] = useState([]);

  useEffect(() => {
    async function getOrgCoverage() {
      const params = {
        key: 'aaaaaaaa.xlsx',
        type: 'json',
      };
      const req = await api.getOrgCoverage(params);
      window.echo('req', req);
      setCoverageData(req.data);
    }
    getOrgCoverage();
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
    let num = entry.value / totalValue * 100;
    num = num.toFixed(2);
    return `${num}%`;
  }

  function calculateDataForBarChart1() {
    const hasCoverage = coverageData.filter(f => parseInt(f['覆盖投资人 数量']) > 0);
    const result = [{ label: '未覆盖', value: coverageData.length - hasCoverage.length }];
    result.push({ label: '有覆盖', value: hasCoverage.length });
    return result;
  }

  return (
    <LeftRightLayout
      location={props.location}
      title="机构覆盖率"
      style={{ paddingLeft: 30, paddingTop: 30, backgroundColor: '#fff' }}
    >
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
              data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={barColors[index % 2]} />
              ))
            }
            <LabelList dataKey="value" position="top" fill="black" />
          </Bar>
        </BarChart>
      </div>

      <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Title level={5}>IBD与ECM部门对投资人不同覆盖率的机构数量</Title>
        <BarChart
          width={360}
          height={330}
          data={barData2}
          margin={{ top: 30 }}
        >
          <XAxis dataKey="label" />
          <YAxis domain={[0, calculateMax]} />
          <Legend verticalAlign="top" height={50} />
          <Bar dataKey="ibd" fill={barColors[1]} barSize={40} name="IBD部门">
            <LabelList dataKey="ibd" position="top" fill="black" />
          </Bar>
          <Bar dataKey="ecm" fill={barColors[0]} barSize={40} name="ECM部门">
            <LabelList dataKey="ecm" position="top" fill="black" />
          </Bar>
        </BarChart>
      </div>

      <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Title level={5}>不同投资者覆盖率机构数量占比</Title>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <PieChart width={400} height={360}>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              isAnimationActive={false}
              label={calculatePercentage}
            >
              {pieChartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % 4]} />
              ))}
            </Pie>
          </PieChart>
          <div style={{ width: 250 }}>
            <div style={{ ...pieChartLabelTextStyle, textAlign: 'center', marginBottom: 20 }}></div>
            {pieChartData.map((m, i) => (
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
              let totalPercentage = 0;
              pageData.forEach(({ value, number }) => {
                totalNumber += number;
                totalPercentage += value;
              });
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>总计</Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center">
                    <Text>{totalNumber}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center">
                    <Text>{totalPercentage}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      </div>

    </LeftRightLayout>
  );
}

export default withRouter(OrgCoverage);
