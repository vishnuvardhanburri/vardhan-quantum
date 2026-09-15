'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Typography, Card, CardContent, Grid, Chip } from '@mui/material';
import { useRaftStatus } from '@/lib/useApi';

export default function ConsensusPage() {
  const { data: raftStatus } = useRaftStatus();
  
  return (
    <DashboardLayout title="Consensus (Raft)">
      <Card>
        <CardContent>
          <Typography variant="h5" mb={3} fontWeight="bold">Raft Status</Typography>
          {raftStatus ? (
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary" variant="subtitle2">Node ID</Typography>
                <Typography variant="h6">{raftStatus.node_id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary" variant="subtitle2">Role</Typography>
                <Chip label={raftStatus.role} color={raftStatus.role === 'Leader' ? 'primary' : 'default'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary" variant="subtitle2">Current Term</Typography>
                <Typography variant="h6">{raftStatus.current_term}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary" variant="subtitle2">Leader ID</Typography>
                <Typography variant="h6">{raftStatus.leader_id || 'Unknown'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary" variant="subtitle2">Commit Index</Typography>
                <Typography variant="h6">{raftStatus.commit_index}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary" variant="subtitle2">Last Log Index</Typography>
                <Typography variant="h6">{raftStatus.last_log_index}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
