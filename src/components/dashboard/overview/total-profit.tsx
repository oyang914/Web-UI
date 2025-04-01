
// Project: uv-level-monitor

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Sun as SunIcon } from '@phosphor-icons/react/dist/ssr';

export interface UltravioletProps {
  sx?: SxProps;
}

export function Ultraviolet({ sx }: UltravioletProps): React.JSX.Element {
  const [uvValue, setUvValue] = useState<number | null>(null);

  useEffect(() => {
    const fetchUvData = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/latest-uv');
        const data = await res.json();

        console.log('Raw UV data from backend:', data);

        // data.uv_data might already be an array or a JSON string.
        let uvArray: number[] | null = null;

        if (Array.isArray(data.uv_data)) {
          // If uv_data is already parsed as an array
          uvArray = data.uv_data;
        } else if (typeof data.uv_data === 'string') {
          // If uv_data is a JSON string, parse it
          uvArray = JSON.parse(data.uv_data);
        } else {
          console.warn('Invalid uv_data format:', data.uv_data);
        }

        if (uvArray && uvArray.length > 0) {
          setUvValue(uvArray[1]);
        }
      } catch (error) {
        console.error('Failed to fetch UV data:', error);
      }
    };

    fetchUvData();
  }, []);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          spacing={3}
        >
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              UV Level
            </Typography>
            <Typography variant="h4">
              {uvValue !== null ? uvValue.toFixed(2) : 'Loading...'}
            </Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: 'var(--mui-palette-primary-main)',
              height: '56px',
              width: '56px',
            }}
          >
            <SunIcon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
