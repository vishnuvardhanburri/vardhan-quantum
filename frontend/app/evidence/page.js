'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Typography, Card, CardContent } from '@mui/material';
import { useLedgerStatus } from '@/lib/useApi';

export default function EvidencePage() {
  const data = useLedgerStatus();
  
  return (
    <DashboardLayout title="Evidence">
      <Card>
        <CardContent>
          <Typography variant="h5" mb={2}>Evidence Details</Typography>
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
