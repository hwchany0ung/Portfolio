/* ========================
   Skills Radar Chart (Chart.js)
   - Renders a radar chart showing skill distribution
   - Uses existing design tokens for colors
   - Responsive and accessible
   ======================== */

(function () {
  'use strict';

  // ── Chart Data ─────────────────────────────────────────────────
  const SKILL_DATA = {
    labels: ['Cloud/AWS', 'Container', 'Networking', 'Linux', 'IaC', 'Programming'],
    datasets: [
      {
        label: 'Current Proficiency',
        data: [80, 65, 70, 72, 45, 55],
        backgroundColor: 'rgba(0, 212, 255, 0.12)',
        borderColor: 'rgba(0, 212, 255, 0.8)',
        pointBackgroundColor: '#00d4ff',
        pointBorderColor: '#0a0a0a',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00d4ff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'Target (6 months)',
        data: [90, 80, 75, 80, 70, 65],
        backgroundColor: 'rgba(123, 47, 247, 0.08)',
        borderColor: 'rgba(123, 47, 247, 0.5)',
        pointBackgroundColor: '#7b2ff7',
        pointBorderColor: '#0a0a0a',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#7b2ff7',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 1.5,
        borderDash: [5, 5],
      },
    ],
  };

  // ── Chart Configuration ────────────────────────────────────────
  const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(22, 22, 22, 0.95)',
        titleColor: '#f0f0f0',
        bodyColor: '#a0a0a0',
        borderColor: '#2a2a2a',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: "'JetBrains Mono', monospace",
          size: 12,
        },
        bodyFont: {
          family: "'Noto Sans KR', sans-serif",
          size: 11,
        },
        callbacks: {
          label: function (context) {
            return `  ${context.dataset.label}: ${context.parsed.r}%`;
          },
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#606060',
          backdropColor: 'transparent',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 9,
          },
          callback: function (value) {
            return value + '%';
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
          lineWidth: 1,
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.06)',
          lineWidth: 1,
        },
        pointLabels: {
          color: '#a0a0a0',
          font: {
            family: "'JetBrains Mono', monospace",
            size: 11,
            weight: '600',
          },
          padding: 12,
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart',
    },
  };

  // ── Initialize Chart ───────────────────────────────────────────
  let chartInstance = null;

  function initChart() {
    const canvas = document.getElementById('skills-radar-chart');
    if (!canvas) return;

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    // Wait for canvas to be visible (IntersectionObserver)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !chartInstance) {
            createChart(canvas);
            observer.unobserve(canvas);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(canvas);
  }

  function createChart(canvas) {
    const ctx = canvas.getContext('2d');

    chartInstance = new Chart(ctx, {
      type: 'radar',
      data: SKILL_DATA,
      options: CHART_OPTIONS,
    });
  }

  // ── Initialize on DOM ready ────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChart);
  } else {
    initChart();
  }
})();
