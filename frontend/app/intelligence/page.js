'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Typography, Card, CardContent, Box } from '@mui/material';
import { useSSE } from '@/lib/useSSE';

export default function IntelligencePage() {
  const [events, setEvents] = useState([]);
  useSSE(true, (ev) => {
    setEvents(prev => [ev, ...prev].slice(0, 10));
  });
  
  return (
    <DashboardLayout title="Intelligence">
      <Card>
        <CardContent>
          <Typography variant="h5" mb={2}>Intelligence Details</Typography>
          <Typography variant="body1" color="text.secondary">
            Live AI orchestration events
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Waiting for telemetry events...
              </Typography>
            ) : (
              events.map((ev, idx) => (
                <Box
                  key={ev.event_id || idx}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 245, 212, 0.05)',
                    border: '1px solid rgba(0, 245, 212, 0.2)',
                    borderLeft: '4px solid #00F5D4'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#00F5D4', fontFamily: 'monospace' }}>
                      {ev.event_type}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                      {new Date(ev.timestamp_ms).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                    {JSON.stringify(ev.payload, null, 2)}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontSize: '0.6rem' }}>
                    ID: {ev.event_id} | Session: {ev.session_id} | Seq: {ev.sequence}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
