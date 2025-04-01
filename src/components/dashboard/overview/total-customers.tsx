
// Project: steps counts

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { Sneaker as SneakerIcon } from '@phosphor-icons/react/dist/ssr/Sneaker';

export interface StepsProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
}

export function Steps({ diff, trend, sx }: StepsProps): React.JSX.Element {
  const [stepCount, setStepCount] = useState<string>('N/A');

  // Fetch the step count from the backend
  const fetchSteps = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/steps');
      const data = await res.json();
      // Assuming the API returns an object like { stepCount: number }
      if (data.stepCount !== undefined && data.stepCount !== null) {
        setStepCount(String(data.stepCount));
      } else {
        setStepCount('N/A');
      }
    } catch (error) {
      console.error('Failed to fetch step count:', error);
      setStepCount('N/A');
    }
  };

  // Refresh step count every 3 seconds
  useEffect(() => {
    fetchSteps(); // initial fetch
    const intervalId = setInterval(fetchSteps, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Steps Taken
              </Typography>
              <Typography variant="h4">{stepCount}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
              <SneakerIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {diff !== undefined && (
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
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

