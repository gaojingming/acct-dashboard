import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const API_URL = 'http://localhost:5001/get-fund-net-value-records';

// Helper: compute returns series relative to base value: (v / base - 1) * 100
const computeReturnsPercent = (values, baseIndex = 0) => {
  if (!values || values.length === 0) return [];
  const base = values[baseIndex];
  if (base === 0 || base == null) return values.map(() => 0);
  return values.map((v) => ((v - base) / base) * 100);
};

const ReturnsOfFundLineChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [rawData, setRawData] = useState([]); // array of records from API

  // Fetch data on mount
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const resp = await fetch(API_URL);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const data = Array.isArray(json.data) ? json.data : [];
        if (!cancelled) {
          // sort by date ascending to ensure order
          data.sort((a, b) => new Date(a.date) - new Date(b.date));
          setRawData(data);
        }
      } catch (err) {
        // fallback: empty
        console.error('Failed to fetch fund net value records', err);
        if (!cancelled) setRawData([]);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize chart instance
  useEffect(() => {
    if (!chartRef.current) return;
    chartInstanceRef.current = echarts.init(chartRef.current);
    const instance = chartInstanceRef.current;

    const resizeHandler = () => instance.resize();
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      instance.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  // Recompute series and set option whenever rawData changes
  useEffect(() => {
    const instance = chartInstanceRef.current;
    if (!instance) return;

    // build arrays
    const dates = rawData.map((r) => r.date);
    const benchmarkValues = rawData.map((r) => r.benchmark_index);
    const returns = rawData.map((r) => r.returns);

    // default base index is 0 (will be updated when dataZoom changes)
    const baseIdx = 0;

    const benchmarkReturns = computeReturnsPercent(benchmarkValues, baseIdx);
    const totalReturns = computeReturnsPercent(returns, baseIdx);
    const excessReturns = totalReturns.map((t, i) => t - (benchmarkReturns[i] ?? 0));

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const axisLabel = params[0]?.axisValue;
          let s = axisLabel + '\n';
          params.forEach((p) => {
            s += `${p.marker} ${p.seriesName}: ${p.data == null ? '-': p.data.toFixed(2)}%\n`;
          });
          return s;
        },
      },
      legend: {
        data: ['基准收益率(%)', '投资组合收益率(%)', '超额收益率(%)'],
        top: 10,
      },
      grid: {
        left: '6%',
        right: '6%',
        top: '12%',
        bottom: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} %',
        },
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          realtime: true,
          bottom: 6,
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: '基准收益率(%)',
          type: 'line',
          data: benchmarkReturns,
          smooth: true,
          showSymbol: false,
        },
        {
          name: '投资组合收益率(%)',
          type: 'line',
          data: totalReturns,
          smooth: true,
          showSymbol: false,
        },
        {
          name: '超额收益率(%)',
          type: 'line',
          data: excessReturns,
          smooth: true,
          showSymbol: false,
        },
      ],
    };

    instance.setOption(option);

    // Listen for zoom change events to recompute series based on first visible point
    const onDataZoom = (params) => {
      try {
        const z = params.batch?.[0] ?? params;
        // z has start and end in percent (0-100)
        const startPct = z.start ?? 0;
        const len = rawData.length;
        if (len === 0) return;
        const startIdx = Math.max(0, Math.min(len - 1, Math.floor((startPct / 100) * len)));

        // recompute with base = startIdx
        const bReturns = computeReturnsPercent(benchmarkValues, startIdx);
        const tReturns = computeReturnsPercent(totalReturns, startIdx);
        const eReturns = tReturns.map((t, i) => t - (bReturns[i] ?? 0));

        instance.setOption({
          series: [
            { data: bReturns },
            { data: tReturns },
            { data: eReturns },
          ],
        });
      } catch (err) {
        // ignore
        console.error('dataZoom handler error', err);
      }
    };

    instance.off('datazoom', onDataZoom);
    instance.on('datazoom', onDataZoom);

    return () => {
      try {
        instance.off('datazoom', onDataZoom);
      } catch (e) {}
    };
  }, [rawData]);

  return (
    <div>
      {/* dataZoom slider is shown under the chart; drag it to change the visible window and base point */}
      <div ref={chartRef} style={{ width: '100%', height: '420px' }} />
    </div>
  );
};

export default ReturnsOfFundLineChart;