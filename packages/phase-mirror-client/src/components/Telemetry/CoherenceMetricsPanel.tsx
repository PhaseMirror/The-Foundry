import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CoherenceMetricsProps {
  historicalResonance: number[];
  currentSovereignty: number;
}

export const CoherenceMetricsPanel: React.FC<CoherenceMetricsProps> = ({ 
  historicalResonance, 
  currentSovereignty 
}) => {
  // Chart.js data configuration for the historical resonance curve
  const resonanceData = {
    labels: historicalResonance.map((_, i) => `t=${i * 10}s`),
    datasets: [
      {
        label: 'Resonance Coherence R(t)',
        data: historicalResonance,
        borderColor: '#4ade80', // Tailwind green-400
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        borderWidth: 2,
        tension: 0.4, // Smooth curve
        pointRadius: 4,
        pointBackgroundColor: '#22c55e',
      },
    ],
  };

  const resonanceOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 1,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: { color: '#9ca3af' }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: { color: '#9ca3af' }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#d1d5db' }
      }
    }
  };

  // Doughnut chart for Sovereignty
  const sovereigntyData = {
    labels: ['Sovereignty', 'Deficit'],
    datasets: [
      {
        data: [currentSovereignty, 1 - currentSovereignty],
        backgroundColor: ['#60a5fa', '#1e3a8a'], // Tailwind blue-400 and blue-900
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-lg">
        <h3 className="text-sm font-mono text-gray-400 mb-4">RESONANCE EVOLUTION</h3>
        <Line data={resonanceData} options={resonanceOptions} />
      </div>

      <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-lg flex items-center justify-between">
        <div>
          <h3 className="text-sm font-mono text-gray-400 mb-2">SOVEREIGNTY INDEX</h3>
          <p className="text-3xl font-bold text-blue-400">{(currentSovereignty * 100).toFixed(1)}%</p>
        </div>
        <div className="w-24 h-24">
          <Doughnut 
            data={sovereigntyData} 
            options={{ cutout: '75%', plugins: { legend: { display: false } } }} 
          />
        </div>
      </div>
    </div>
  );
};
