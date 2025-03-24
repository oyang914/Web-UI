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
  value?: number;
}

export function BloodOxygen({ value = 0, sx }: BloodOxygenProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Blood Oxygen
              </Typography>
              <Typography variant="h4">{value}%</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-warning-main)', height: '56px', width: '56px' }}>
              <DropIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <div>
            <LinearProgress value={value} variant="determinate" />
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function BloodOxygenDisplay() {
  const [bloodOxygen, setBloodOxygen] = useState<number>(0);

  useEffect(() => {
    const fetchBloodOxygen = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/latest-blood-oxygen');
        const data = await response.json();
        setBloodOxygen(data.bloodOxygen);
      } catch (error) {
        console.error('Failed to fetch blood oxygen:', error);
      }
    };

    fetchBloodOxygen();
  }, []);

  return <BloodOxygen value={bloodOxygen} />;
}