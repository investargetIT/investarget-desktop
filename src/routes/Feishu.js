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
    value: 200,
  },
  {
    label: "有覆盖",
    value: 398,
  },
];

const barColors = ['rgb(34, 93,131)', 'rgb(135, 172, 193)'];

function Demo(props) {
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
          >
            <XAxis dataKey="label" />
            <YAxis domain={[0, 'dataMax + 1000']} />
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
