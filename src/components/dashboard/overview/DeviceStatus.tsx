'use client';

import React, { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';

export default function DeviceConnectionStatusPage(): React.JSX.Element {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/device-status');
        const data = await res.json();
        setConnected(data.connected);
        setLastSeen(data.lastSeen);
      } catch (err) {
        console.error('Failed to fetch device status:', err);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus(); // Initial check
    const interval = setInterval(checkStatus, 60000); // Check every 1 minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Device Connection Status
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : connected ? (
        <Alert severity="success">
          Your smartwatch is connected. Last seen: {lastSeen && new Date(lastSeen).toLocaleString()}
        </Alert>
      ) : (
        <Alert severity="warning">
          Your smartwatch has been disconnected for over 10 minutes.
          {lastSeen && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Last connected at: {new Date(lastSeen).toLocaleString()}
            </Typography>
          )}
        </Alert>
      )}
    </Container>
  );
}
