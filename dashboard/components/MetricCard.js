import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

export function MetricCard({ title, badge, value, unit, subtitle, glowColor }) {
  const isWarnOrError = glowColor === 'red' || badge === 'IDLE' || badge === 'DISCONNECTED';
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase">
            {title}
          </Typography>
          {badge && (
            <Chip 
              label={badge} 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: '0.65rem', 
                fontWeight: 'bold',
                backgroundColor: isWarnOrError ? 'rgba(245, 101, 101, 0.2)' : 'rgba(0, 245, 212, 0.1)',
                color: isWarnOrError ? '#F56565' : '#00F5D4',
              }} 
            />
          )}
        </Box>
        <Box display="flex" alignItems="baseline" mb={1}>
          <Typography variant="h4" fontWeight={700} sx={{ mr: 1 }}>
            {value}
          </Typography>
          {unit && (
            <Typography variant="body2" color="text.secondary">
              {unit}
            </Typography>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}
