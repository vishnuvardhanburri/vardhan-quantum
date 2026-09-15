'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { useClusterPeers } from '@/lib/useApi';

export default function InfrastructurePage() {
  const { data: peers } = useClusterPeers();
  
  return (
    <DashboardLayout title="Infrastructure">
      <Card>
        <CardContent>
          <Typography variant="h5" mb={3} fontWeight="bold">Cluster Peers</Typography>
          <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary' }}>ID</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Address</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {peers?.nodes ? peers.nodes.map((peer) => (
                  <TableRow key={peer.node_id}>
                    <TableCell>{peer.node_id}</TableCell>
                    <TableCell>{peer.addr}</TableCell>
                    <TableCell>
                      <Chip
                        label={peer.state}
                        color={peer.state === 'healthy' ? 'success' : peer.state === 'draining' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">Loading peers...</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
