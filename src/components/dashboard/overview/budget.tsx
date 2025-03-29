
'use client';
import React, { useState, useEffect } from 'react';
import {
  SxProps,
  Card,
  CardContent,
  Stack,
  Typography,
  Avatar,
} from '@mui/material';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import HeartIcon from '@mui/icons-material/Favorite';

export interface HeartRateProps {
  trend?: 'up' | 'down';
  sx?: SxProps;
}

export function HeartRate({ trend = 'up', sx }: HeartRateProps): React.JSX.Element {
  const [heartRate, setHeartRate] = useState<number | null>(null);

  // Fetch max3010_data from the backend and extract heart rate
  useEffect(() => {
    const fetchHeartRate = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/latest-max3010');
        const data = await res.json();
        console.log('backend return:', data);

        if (data.max3010_data && Array.isArray(data.max3010_data)) {
          setHeartRate(data.max3010_data[0]); // get heart rate from first element
        } else {
          console.warn('invalid max3010_data:', data.max3010_data);
        }
      } catch (error) {
        console.error('Failed to fetch heart rate:', error);
      }
    };

    fetchHeartRate();
  }, []);

  // Choose icon and color based on trend
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={3}
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Avg Heart Rate
              </Typography>
              <Typography variant="h4">
                {heartRate !== null ? `${heartRate} bpm` : 'N/A'}
              </Typography>
            </Stack>
            <Avatar
              sx={{
                backgroundColor: 'var(--mui-palette-primary-main)',
                height: '56px',
                width: '56px',
              }}
            >
              <HeartIcon fontSize="large" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
