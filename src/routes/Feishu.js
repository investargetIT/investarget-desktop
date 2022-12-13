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
  ResponsiveContainer,
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

const barColors = ['rgb(34, 93,131)', 'rgb(135, 172, 193)'];

function Demo(props) {

  function calculateMax(dataMax) {
    const intDigits = dataMax.toString().length;
    let divider = 1;
    for (let index = 0; index < intDigits - 1; index++) {
      divider *= 10;
    }
    return Math.ceil(dataMax / divider) * divider;
  }

  return (
    <LeftRightLayout
      location={props.location}
      title="Demo"
      style={{ paddingLeft: 30, paddingTop: 30, backgroundColor: '#fff' }}
    >
      <div style={{ width: 360 }}>
        <div style={{ textAlign: 'center' }}>所有员工覆盖机构数量（共{data.reduce((prev, curr) => prev + curr.value, 0)}家）</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20 }}
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
        </ResponsiveContainer>
      </div>
    </LeftRightLayout>
  );
}

export default withRouter(Demo);
