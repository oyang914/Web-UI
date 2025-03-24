/*import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { Heart as HeartIcon } from '@phosphor-icons/react/dist/ssr/Heart';*/

/*export interface HeartRateProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
  value: string;
}*/

/*export function HeartRate({ diff, trend, sx, value }: HeartRateProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Avg Heart Rate
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
              <HeartIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {diff ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Since last month
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}*/
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
