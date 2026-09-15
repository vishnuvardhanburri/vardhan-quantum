const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'infrastructure', title: 'Infrastructure', hooks: ['useClusterPeers'] },
  { name: 'reliability', title: 'Reliability', hooks: ['useMetrics'] },
  { name: 'security', title: 'Security', hooks: ['useMetrics'] },
  { name: 'consensus', title: 'Consensus', hooks: ['useRaftStatus'] },
  { name: 'network', title: 'Network', hooks: ['useMetrics'] },
  { name: 'evidence', title: 'Evidence', hooks: ['useLedgerStatus'] },
  { name: 'intelligence', title: 'Intelligence', hooks: ['useSSE'] },
  { name: 'admin', title: 'Admin', hooks: ['useClusterStatus'] },
];

pages.forEach(p => {
  const dir = path.join(__dirname, 'app', p.name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const content = `'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Typography, Card, CardContent } from '@mui/material';
import { ${p.hooks.join(', ')} } from '@/lib/useApi';

export default function ${p.title}Page() {
  const data = ${p.hooks[0]}();
  
  return (
    <DashboardLayout title="${p.title}">
      <Card>
        <CardContent>
          <Typography variant="h5" mb={2}>${p.title} Details</Typography>
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
`;
  fs.writeFileSync(path.join(dir, 'page.js'), content);
});

// Delete old unused directories
['ai-decisions', 'cluster', 'quantum', 'sessions'].forEach(dir => {
  const dPath = path.join(__dirname, 'app', dir);
  if (fs.existsSync(dPath)) {
    fs.rmSync(dPath, { recursive: true, force: true });
  }
});
