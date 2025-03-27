'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Unstable_Grid2';

const provinces = [
  { value: 'alberta', label: 'Alberta' },
  { value: 'british-columbia', label: 'British Columbia' },
  { value: 'manitoba', label: 'Manitoba' },
  { value: 'new-brunswick', label: 'New Brunswick' },
  { value: 'newfoundland-and-labrador', label: 'Newfoundland and Labrador' },
  { value: 'nova-scotia', label: 'Nova Scotia' },
  { value: 'ontario', label: 'Ontario' },
  { value: 'prince-edward-island', label: 'Prince Edward Island' },
  { value: 'quebec', label: 'Quebec' },
  { value: 'saskatchewan', label: 'Saskatchewan' }
] as const;


export function AccountDetailsForm(): React.JSX.Element {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  const userId = localStorage.getItem('login-user-id'); // localstorage get login user id

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/users/${userId}`);
        const data = await response.json();

        if (data.user) {
          const nameParts = data.user.name ? data.user.name.split(" ") : ["", ""];
          setUser({
            firstName: nameParts[0] || '',
            lastName: nameParts[1] || '',
            email: data.user.email || '',
            emergencyContact: data.user.emergency_contact_name || '',
            emergencyPhone: data.user.emergency_contact_number || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };
  //update user fun
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/users/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          emergency_contact_name: user.emergencyContact,
          emergency_contact_number: user.emergencyPhone,
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
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>First name</InputLabel>
                <OutlinedInput defaultValue="Sofia"  value={user.firstName} label="First name" name="firstName"  onChange={handleChange}/>
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Last name</InputLabel>
                <OutlinedInput defaultValue="Rivers"  value={user.lastName} label="Last name" name="lastName"  onChange={handleChange} />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput defaultValue="sofia@devias.io" value={user.email} label="Email address" name="email"   onChange={handleChange}/>
              </FormControl>
            </Grid>
            {/*<Grid md={6} xs={12}>*/}
            {/*  <FormControl fullWidth>*/}
            {/*    <InputLabel>Phone number</InputLabel>*/}
            {/*    <OutlinedInput label="Phone number" name="phone" type="tel" />*/}
            {/*  </FormControl>*/}
            {/*</Grid>*/}
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Emergency Contact Name</InputLabel>
                <OutlinedInput /*defaultValue="Maria"*/ label="Emergency Contact Name" value={user.emergencyContact} name="emergencyContact"  onChange={handleChange} />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Emergency Contact Number</InputLabel>
                <OutlinedInput label="Emergency Contact Number" name="emergencyPhone" value={user.emergencyPhone} type="tel"  onChange={handleChange} />
              </FormControl>
            </Grid>
            {/*<Grid md={6} xs={12}>*/}
            {/*  <FormControl fullWidth required>*/}
            {/*    <InputLabel>Age</InputLabel>*/}
            {/*    <OutlinedInput label="Age" name="age" />*/}
            {/*  </FormControl>*/}
            {/*</Grid>*/}
            {/*<Grid md={6} xs={12}>*/}
            {/*  <FormControl fullWidth>*/}
            {/*    <InputLabel>Province</InputLabel>*/}
            {/*    <Select defaultValue="Ontario" label="Province" name="province" variant="outlined">*/}
            {/*      {provinces.map((option) => (*/}
            {/*        <MenuItem key={option.value} value={option.value}>*/}
            {/*          {option.label}*/}
            {/*        </MenuItem>*/}
            {/*      ))}*/}
            {/*    </Select>*/}
            {/*  </FormControl>*/}
            {/*</Grid>*/}
            {/*<Grid md={6} xs={12}>*/}
            {/*  <FormControl fullWidth>*/}
            {/*    <InputLabel>City</InputLabel>*/}
            {/*    <OutlinedInput label="City" />*/}
            {/*  </FormControl>*/}
            {/*</Grid>*/}
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">Save details</Button>
        </CardActions>
      </Card>
    </form>
  );
}
