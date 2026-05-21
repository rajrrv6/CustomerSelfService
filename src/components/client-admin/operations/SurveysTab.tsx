'use client';

import React from 'react';
import { SVGDonutChart, SVGLineChart } from '@/components/dashboard/Charts';
import { SectionHeader } from '@/components/shared/SectionHeader';

export function SurveysTab() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Voice of Customer & CSAT"
        description="Aggregate satisfaction indexes, net promoter logs, and customer feedback trends."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SVGDonutChart
          data={[72, 18, 10]}
          labels={['Positive', 'Neutral', 'Negative']}
          colors={['#10b981', '#6b7280', '#f43f5e']}
          title="Customer Satisfaction (CSAT) Breakdown"
        />
        <SVGLineChart
          data={[84, 86, 89, 91, 92]}
          labels={['Jan', 'Feb', 'Mar', 'Apr', 'May']}
          title="Net Promoter Score (NPS) Trend"
          gradientColor="#a855f7"
        />
      </div>
    </div>
  );
}
