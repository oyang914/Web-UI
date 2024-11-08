'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { useState } from 'react';


export function UpdatePasswordForm(): React.JSX.Element {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfrimPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!password || !confirmPassword) {
          setMessage('User ID and new password are required.');
          return;
      }

      try {
          // Make a POST request to the backend to reset the password
          const response = await axios.post('/resetpassword', {
              password,
              confirmPassword,
          });

          // Check the response and set an appropriate message
          if (response.status === 200) {
              setMessage('Password reset successfully.');
          } else {
              setMessage('Failed to reset password.');
          }
      } catch (error) {
          setMessage('An error occurred while resetting the password.');
          console.error('Error:', error);
      }
  };



  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Card>
        <CardHeader subheader="Update password" title="Password" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <FormControl fullWidth>
              <InputLabel>Password</InputLabel>
              <OutlinedInput label="Password" name="password" type="password" />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Confirm password</InputLabel>
              <OutlinedInput label="Confirm password" name="confirmPassword" type="password" />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained">Update</Button>
        </CardActions>
      </Card>
    </form>
  );
}
