'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';

interface UserData {
  id: number;
  name: string;
  email: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  device_id: string;
}

export default function DeviceViewerPage(): React.JSX.Element {
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all available device IDs from the devices endpoint
  useEffect(() => {
    const fetchDeviceIds = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/devices');
        const data: { device_id: string }[] = await res.json();
        setDeviceIds(data.map((d) => d.device_id));
      } catch (error) {
        console.error('Failed to fetch device IDs:', error);
      }
    };

    fetchDeviceIds();
  }, []);

  // Fetch user data based on the selected device ID using the correct endpoint
  useEffect(() => {
    if (!selectedDeviceId) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Use the /api/users/device endpoint to get user data for the given device id
        const res = await fetch(`http://localhost:3001/api/devices/${selectedDeviceId}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data: UserData = await res.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [selectedDeviceId]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Device User Viewer
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Device ID</InputLabel>
        <Select
          value={selectedDeviceId}
          label="Select Device ID"
          onChange={(e) => setSelectedDeviceId(e.target.value)}
        >
          {deviceIds.map((id) => (
            <MenuItem key={id} value={id}>
              {id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading && <CircularProgress />}

      {!loading && user && (
        <Card>
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h5">{user.name}</Typography>
              <Divider sx={{ width: '100%' }} />
              <Typography variant="body1">Email: {user.email}</Typography>
              {user.emergency_contact_name && (
                <Typography variant="body1">
                  Emergency Contact: {user.emergency_contact_name}
                  {user.emergency_contact_number && ` (${user.emergency_contact_number})`}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Device ID: {user.device_id}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!loading && !user && selectedDeviceId && (
        <Typography variant="body1">No user found for this device.</Typography>
      )}
    </Box>
  );
}
