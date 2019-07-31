import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { PageContainer } from '../../components/shared/PageContainer';

export const LoginView = () => {
  return (
    <PageContainer title='認証'>
      <Typography>ログインしてください</Typography>
      <Button component='a' href='/auth/login/twitter' color='secondary'>
        Twitter ログイン
      </Button>
    </PageContainer>
  );
};
