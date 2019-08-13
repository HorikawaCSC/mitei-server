import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { PageContainer } from '../PageContainer';

export const NotFoundView = ({ error }: { error?: string }) => {
  return (
    <PageContainer title='404 Not Found'>
      <Typography variant='h5'>ページが見つかりませんでした。</Typography>
      {error && <Typography component='p'>{error}</Typography>}
    </PageContainer>
  );
};
