import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const ReturnsOfFundLineChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);

    const fetchMockData = async () => {
      // Simulate an API call to fetch mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            xAxisData: ['2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05'],
            seriesData: [
              { name: '基准收益', data: [0, 0.2, 3.3, -1.2, 0.337] },
              { name: '投资组合收益', data: [0+1, 0.2+1, 3.3+1, -1.2-1, 0.337+1] },
              // { name: '系列3', data: [150, 232, 201, 154, 190] },
            ],
          });
        }, 200); // Simulate network delay
      });
    };

    fetchMockData().then((mockData) => {
      const option = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: mockData.seriesData.map((series) => series.name),
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
          data: mockData.xAxisData,
        },
        yAxis: {
          type: 'value',
        },
        series: mockData.seriesData.map((series) => ({
          name: series.name,
          type: 'line',
          data: series.data,
        })),
      };

      chartInstance.setOption(option);
    });
    // const option = {
    //   tooltip: {
    //     trigger: 'axis',
    //   },
    //   legend: {
    //     data: ['系列1', '系列2', '系列3'],
    //   },
    //   grid: {
    //     left: '5%',
    //     right: '5%',
    //     top: '10%',
    //     bottom: '10%',
    //     containLabel: true,
    //   },
    //   xAxis: {
    //     type: 'category',
    //     data: ['2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05'],
    //   },
    //   yAxis: {
    //     type: 'value',
    //   },
    //   series: [
    //     {
    //       name: '系列1',
    //       type: 'line',
    //       data: [120, 132, 101, 134, 90],
    //     },
    //     {
    //       name: '系列2',
    //       type: 'line',
    //       data: [220, 182, 191, 234, 290],
    //     },
    //     {
    //       name: '系列3',
    //       type: 'line',
    //       data: [150, 232, 201, 154, 190],
    //     },
    //   ],
    // };
    //
    // chartInstance.setOption(option);

    return () => {
      chartInstance.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default ReturnsOfFundLineChart;