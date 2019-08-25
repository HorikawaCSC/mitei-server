import { FullscreenProgress } from '@mitei/client-common';
import * as React from 'react';
import { useGetViewerInfoQuery } from '../../api/generated/graphql';
import { RegistrationView } from '../registration';

export const Root = () => {
  const { error, data, loading, refetch } = useGetViewerInfoQuery();
  if (loading) return <FullscreenProgress />;
  if (error) return <p>an error occured while getting device information</p>;

  if (data && data.viewerInfo) {
    return null;
  } else {
    return <RegistrationView refetch={refetch} />;
  }
};
