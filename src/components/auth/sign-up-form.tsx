'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

// Updated schema to match backend endpoint:
const schema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  name: z.string().min(1, { message: 'Full name is required' }),
  email: z.string().min(1, { message: 'Email is required' }).email(),
  password: z.string().min(6, { message: 'Password should be at least 6 characters' }),
  emergency_contact_name: z.string().min(1, { message: 'Emergency contact name is required' }),
  emergency_contact_number: z.string().min(1, { message: 'Emergency contact number is required' }),
  terms: z.boolean().refine((value) => value, 'You must accept the terms and conditions'),
});

type Values = z.infer<typeof schema>;

const defaultValues: Values = {
  username: '',
  name: '',
  email: '',
  password: '',
  emergency_contact_name: '',
  emergency_contact_number: '',
  terms: false,
};

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const { control, handleSubmit, setError, formState: { errors } } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      // Map form values to payload expected by the backend:
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        name: values.name,
        emergency_contact_name: values.emergency_contact_name,
        emergency_contact_number: values.emergency_contact_number,
      };

      const { error } = await authClient.signUp(payload);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      // Refresh auth state
      await checkSession?.();

      // Redirect or refresh after successful sign-up
      router.refresh();
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign up</Typography>
        <Typography color="text.secondary" variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
            Sign in
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <FormControl error={Boolean(errors.username)}>
                <InputLabel>Username</InputLabel>
                <OutlinedInput {...field} label="Username" />
                {errors.username && <FormHelperText>{errors.username.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormControl error={Boolean(errors.name)}>
                <InputLabel>Full Name</InputLabel>
                <OutlinedInput {...field} label="Full Name" />
                {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput {...field} label="Password" type="password" />
                {errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="emergency_contact_name"
            render={({ field }) => (
              <FormControl error={Boolean(errors.emergency_contact_name)}>
                <InputLabel>Emergency Contact Name</InputLabel>
                <OutlinedInput {...field} label="Emergency Contact Name" />
                {errors.emergency_contact_name && <FormHelperText>{errors.emergency_contact_name.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="emergency_contact_number"
            render={({ field }) => (
              <FormControl error={Boolean(errors.emergency_contact_number)}>
                <InputLabel>Emergency Contact Number</InputLabel>
                <OutlinedInput {...field} label="Emergency Contact Number" />
                {errors.emergency_contact_number && <FormHelperText>{errors.emergency_contact_number.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <div>
                <FormControlLabel
                  control={<Checkbox {...field} />}
                  label={
                    <React.Fragment>
                      I have read the <Link>terms and conditions</Link>
                    </React.Fragment>
                  }
                />
                {errors.terms && <FormHelperText error>{errors.terms.message}</FormHelperText>}
              </div>
            )}
          />
          {errors.root && <Alert color="error">{errors.root.message}</Alert>}
          <Button disabled={isPending} type="submit" variant="contained">
            Sign up
          </Button>
        </Stack>
      </form>
      <Alert color="warning">Created users are not persisted</Alert>
    </Stack>
  );
}

