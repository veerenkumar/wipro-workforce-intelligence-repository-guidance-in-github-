import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';
import { StatusBadge } from '../components/StatusBadge';
import { KPICard } from '../components/KPICard';
import { Zap } from 'lucide-react';

describe('Frontend Component Tests', () => {
  it('renders StatusBadge with appropriate text and styles', () => {
    render(<StatusBadge status="Overloaded" />);
    expect(screen.getByText('Overloaded')).toBeInTheDocument();

    render(<StatusBadge status="Critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders KPICard with metric, title, and trend', () => {
    render(
      <KPICard
        title="Productivity Score"
        value="84.2"
        subtitle="Benchmark SLA"
        icon={Zap}
        trend={{ value: '+4.5% vs baseline', isPositive: true }}
        accentColor="blue"
      />
    );

    expect(screen.getByText('Productivity Score')).toBeInTheDocument();
    expect(screen.getByText('84.2')).toBeInTheDocument();
    expect(screen.getByText('Benchmark SLA')).toBeInTheDocument();
    expect(screen.getByText('+4.5% vs baseline')).toBeInTheDocument();
  });

  it('renders Sidebar navigation links in App', () => {
    render(<App />);
    expect(screen.getByText('Wipro Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Workforce Analytics')).toBeInTheDocument();
    expect(screen.getByText('Bottleneck Detection')).toBeInTheDocument();
    expect(screen.getByText('Workload Optimizer')).toBeInTheDocument();
    expect(screen.getByText('Productivity Forecast')).toBeInTheDocument();
    expect(screen.getByText('Anomaly Detection')).toBeInTheDocument();
    expect(screen.getByText('Dataset Management')).toBeInTheDocument();
    expect(screen.getByText('Reports & Exports')).toBeInTheDocument();
    expect(screen.getByText('System Settings')).toBeInTheDocument();
  });
});
