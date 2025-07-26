import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const ChartView = ({ config }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && config) {
      // 销毁之前的图表实例
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // 创建新的图表实例
      chartInstance.current = echarts.init(chartRef.current);

      // 设置图表配置
      chartInstance.current.setOption(config.option);
    }

    // 清理函数
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [config]);

  // 响应式调整
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">{config.summary}</h2>
      <div ref={chartRef} className="w-full h-64 bg-white rounded-lg shadow-md p-4 border border-gray-200" />
    </div>
  );
};

export default ChartView;
