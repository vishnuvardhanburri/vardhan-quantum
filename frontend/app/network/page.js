'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Typography, Card, CardContent } from '@mui/material';
import { useMetrics } from '@/lib/useApi';

export default function NetworkPage() {
  const data = useMetrics();
  
  return (
    <DashboardLayout title="Network">
      <Card>
        <CardContent>
          <Typography variant="h5" mb={2}>Network Details</Typography>
          <Typography variant="body1" color="text.secondary">
            Loading data from backend...
          </Typography>
          <pre style={{ marginTop: 20, background: 'rgba(0,0,0,0.5)', padding: 15, borderRadius: 8, overflowX: 'auto' }}>
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
