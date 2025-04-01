// Project: blood oxygen
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Drop as DropIcon } from '@phosphor-icons/react/dist/ssr/Drop';

export interface BloodOxygenProps {
  sx?: SxProps;
}

export function BloodOxygen({ sx }: BloodOxygenProps): React.JSX.Element {
  const [spo2, setSpo2] = useState<number | null>(null);

  const fetchBloodOxygen = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/latest-max3010');
      const data = await res.json();
      console.log('SpO2 backend return:', data);

      if (data.max3010_data && Array.isArray(data.max3010_data)) {
        setSpo2(Number(data.max3010_data[1])); // 血氧在第2位
      } else {
        console.warn('invalid max3010_data:', data.max3010_data);
      }
    } catch (error) {
      console.error('Failed to fetch blood oxygen:', error);
    }
  };

  // Refresh the heart rate every 3 seconds
  useEffect(() => {
    fetchBloodOxygen(); // Initial fetch on mount

    const intervalId = setInterval(() => {
      fetchBloodOxygen();
    }, 5000);

    // Cleanup to avoid memory leaks
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Blood Oxygen
              </Typography>
              <Typography variant="h4">{spo2 !== null ? `${spo2}%` : 'Loading...'}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-warning-main)', height: '56px', width: '56px' }}>
              <DropIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <div>
            <LinearProgress value={spo2 ?? 0} variant="determinate" />
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
