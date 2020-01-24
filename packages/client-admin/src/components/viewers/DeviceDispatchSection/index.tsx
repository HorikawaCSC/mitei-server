import { PageContainer, useErrorDialog } from '@mitei/client-common';
import * as React from 'react';
import {
  useUpdateViewerStateMutation,
  ViewerDevice,
  ViewerRequestParam,
} from '../../../api/generated/graphql';
import { Controller } from '../Controller';

type Props = { device: ViewerDevice };
export const DeviceDispatchSection = ({ device }: Props) => {
  const [updateViewer] = useUpdateViewerStateMutation({
    errorPolicy: 'all',
  });
  const showErrorDialog = useErrorDialog();
  const handleDispatch = React.useCallback(
    async (request: Omit<ViewerRequestParam, 'device'>) => {
      const { data, errors } = await updateViewer({
        variables: {
          request: {
            ...request,
            device: device.id,
          },
        },
      });

      if (errors || !data || !data.updateViewerState) {
        if (errors) {
          showErrorDialog(...errors.map(({ message }) => message));
        } else {
          showErrorDialog('エラー');
        }
      }
    },
    [device],
  );

  return (
    <PageContainer title='コントロール'>
      <Controller onDispatch={handleDispatch} device={device} />
    </PageContainer>
  );
};
