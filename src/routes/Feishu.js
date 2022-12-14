import React from 'react';
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
} from "recharts";

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

const verticalBarChartData = [
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

function Demo(props) {

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

  return (
    <LeftRightLayout
      location={props.location}
      title="Demo"
      style={{ paddingLeft: 30, paddingTop: 30, backgroundColor: '#fff' }}
    >
      <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div>所有员工覆盖机构数量（共{data.reduce((prev, curr) => prev + curr.value, 0)}家）</div>
        <BarChart
          width={360}
          height={330}
          data={data}
          margin={{ top: 50 }}
        >
          <XAxis dataKey="label" />
          <YAxis domain={[0, calculateMax]} />
          <Bar dataKey="value" fill="#8884d8" barSize={40}>
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
        <div>不同投资者覆盖率机构数量占比</div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <PieChart width={400} height={400}>
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

      <div style={{ marginBottom: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div>覆盖投资人各岗位人数占比</div>
        <BarChart
          layout="vertical"
          width={540}
          height={48 * verticalBarChartData.length}
          data={verticalBarChartData.sort((a, b) => a.value - b.value)}
          margin={{ left: 20, top: 20, right: 50 }}
        >
          <XAxis type="number" domain={[0, calculateMax]}  />
          <YAxis type="category" dataKey="label" />
          <Bar dataKey="value" fill="rgb(34, 93,131)" barSize={24} />
        </BarChart>
      </div>

    </LeftRightLayout>
  );
}

export default withRouter(Demo);
