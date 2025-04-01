// Description: This component fetches and displays user account information.

'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Define the shape of data you expect from the server
interface AccountData {
  name: string;
  email?: string;
  avatar_url?: string; // If you store a custom avatar link in DB
  city?: string;
  country?: string;
  age?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  timezone?: string; // If stored
}

// Main component
export function AccountInfo(): React.JSX.Element {
  const [user, setUser] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from /api/account once on mount
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/account');
        if (!res.ok) {
          throw new Error('Failed to fetch account info');
        }
        const data: AccountData = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading account info...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  // If user data is null or undefined
  if (!user) {
    return (
      <Card>
        <CardContent>
          <Typography>No account info found.</Typography>
        </CardContent>
      </Card>
    );
  }

  // Render the fetched account info
  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          {/* Use user.avatar_url if your DB provides a custom avatar link; fallback to a default */}
          <Avatar
            src={user.avatar_url || '/assets/avatar.png'}
            sx={{ height: '80px', width: '80px' }}
          />
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user.name}</Typography>
            {(user.city || user.country) && (
              <Typography color="text.secondary" variant="body2">
                {user.city} {user.country}
              </Typography>
            )}
            {user.age && (
              <Typography color="text.secondary" variant="body2">
                {user.age} years old
              </Typography>
            )}
            {(user.emergency_contact_name || user.emergency_contact_number) && (
              <Typography color="text.secondary" variant="body2">
                Emergency Contact: {user.emergency_contact_name} {user.emergency_contact_number}
              </Typography>
            )}
            {user.timezone && (
              <Typography color="text.secondary" variant="body2">
                Timezone: {user.timezone}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          Upload picture
        </Button>
      </CardActions>
    </Card>
  );
}
