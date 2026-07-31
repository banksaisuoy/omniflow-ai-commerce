import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const RecommendationMetrics = () => {
  const ctrChartRef = useRef(null);
  const convChartRef = useRef(null);
  const revChartRef = useRef(null);
  
  const charts = useRef({});

  useEffect(() => {
    // Mock Data
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const ctrData = [4.2, 4.5, 4.8, 5.1, 5.5, 6.2, 6.0]; // %
    const convData = [1.2, 1.3, 1.4, 1.5, 1.8, 2.1, 2.0]; // %
    const revData = [1200, 1350, 1400, 1600, 1900, 2400, 2300]; // $ impact

    const createChart = (ctx, label, data, color, type = 'line') => {
      if (!ctx) return null;
      return new Chart(ctx, {
        type,
        data: {
          labels,
          datasets: [{
            label,
            data,
            borderColor: color,
            backgroundColor: color + '33', // Add alpha
            fill: type === 'line',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' }
          }
        }
      });
    };

    if (ctrChartRef.current) charts.current.ctr = createChart(ctrChartRef.current, 'Click-Through Rate (%)', ctrData, '#3b82f6');
    if (convChartRef.current) charts.current.conv = createChart(convChartRef.current, 'Conversion Rate (%)', convData, '#10b981');
    if (revChartRef.current) charts.current.rev = createChart(revChartRef.current, 'Revenue Impact ($)', revData, '#8b5cf6', 'bar');

    return () => {
      Object.values(charts.current).forEach(chart => chart?.destroy());
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Recommendation Engine Metrics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', height: '300px' }}>
          <h3>CTR Improvement</h3>
          <canvas ref={ctrChartRef}></canvas>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', height: '300px' }}>
          <h3>Conversion Lift</h3>
          <canvas ref={convChartRef}></canvas>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', height: '300px' }}>
          <h3>Revenue Impact</h3>
          <canvas ref={revChartRef}></canvas>
        </div>

      </div>
    </div>
  );
};

export default RecommendationMetrics;