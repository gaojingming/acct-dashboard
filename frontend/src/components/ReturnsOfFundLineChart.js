import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const ReturnsOfFundLineChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['系列1', '系列2', '系列3'],
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '10%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: ['2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '系列1',
          type: 'line',
          data: [120, 132, 101, 134, 90],
        },
        {
          name: '系列2',
          type: 'line',
          data: [220, 182, 191, 234, 290],
        },
        {
          name: '系列3',
          type: 'line',
          data: [150, 232, 201, 154, 190],
        },
      ],
    };

    chartInstance.setOption(option);

    return () => {
      chartInstance.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default ReturnsOfFundLineChart;