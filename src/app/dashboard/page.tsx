import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { HeartRate } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Sales } from '@/components/dashboard/overview/sales';
import { BloodOxygen } from '@/components/dashboard/overview/tasks-progress';
import { Steps } from '@/components/dashboard/overview/total-customers';
import { Ultraviolet } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';
import DeviceConnectionStatusPage from '@/components/dashboard/overview/DeviceStatus';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <HeartRate diff={12} trend="up" sx={{ height: '100%' }} value="80" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <Steps diff={16} trend="down" sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <BloodOxygen sx={{ height: '100%' }} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <Ultraviolet sx={{ height: '100%' }} value="6" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <DeviceConnectionStatusPage />
      </Grid>
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: 'Last year', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>

    </Grid>
  );
}