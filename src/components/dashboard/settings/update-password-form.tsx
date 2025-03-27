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

  const [user, setUser] = useState({
    password: '',
    cPassword: '',
  });

  const userId = localStorage.getItem('login-user-id'); // localstorage get login user id
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if(!user.password){
        alert('Please enter a password');
        return;
      }
      if (user.password !== user.cPassword) {
        alert('Passwords do not match');
        return;
      }
      const res = await fetch(`http://localhost:3001/api/users/updatePwd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: user.password,
          user_id: userId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update user data');
      }

      alert('User details updated successfully!');
    } catch (error) {
      console.error('Error updating user data:', error);
      alert('Failed to update user details');
    }
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };


  return (
    <form
      onSubmit={handleSubmit}
    >
      <Card>
        <CardHeader subheader="Update password" title="Password" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <FormControl fullWidth>
              <InputLabel>Password</InputLabel>
              <OutlinedInput label="Password" value={user.password} name="password" type="password"   onChange={handleChange}/>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Confirm password</InputLabel>
              <OutlinedInput label="Confirm password" value={user.cPassword} name="cPassword" type="password" onChange={handleChange} />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">Update</Button>
        </CardActions>
      </Card>
    </form>
  );
}
