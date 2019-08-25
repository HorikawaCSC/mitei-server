import { ExecutionResult } from '@apollo/react-common';
import Typography from '@material-ui/core/Typography';
import { useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import {
  CreateChallengeMutation,
  useCreateChallengeMutation,
  useGetChallengeResultLazyQuery,
} from '../../api/generated/graphql';
import { getDeviceType } from '../../utils/device-type';
import { storage } from '../../utils/storage';

type Props = {
  refetch: () => Promise<unknown>;
};

export const RegistrationView = ({ refetch }: Props) => {
  const deviceType = React.useMemo(() => getDeviceType(), []);
  const [createChallenge] = useCreateChallengeMutation({
    variables: {
      type: deviceType,
    },
  });
  const [
    getChallengeResult,
    { data: challengeResult, error: challengeError },
  ] = useGetChallengeResultLazyQuery({
    pollInterval: 1000,
  });
  const [token, setToken] = React.useState('');
  const [code, setCode] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const showError = useErrorSnack();

  const fetchChallenge = React.useCallback(async () => {
    const { data, errors } = (await createChallenge()) as ExecutionResult<
      CreateChallengeMutation
    >;
    if (errors || !data) {
      showError(errors ? errors[0].message : 'チャレンジの作成に失敗');
      return;
    }
    setToken(data.createViewerChallenge.token);
    setCode(data.createViewerChallenge.code);
    getChallengeResult({
      variables: {
        token: data.createViewerChallenge.token,
      },
    });
  }, []);
  React.useEffect(() => {
    fetchChallenge();
  }, []);
  React.useEffect(() => {
    if (challengeResult && challengeResult.viewerChallengeResult) {
      if (challengeResult.viewerChallengeResult.success) {
        storage.set('devToken', challengeResult.viewerChallengeResult.token);
        setSuccess(true);
        refetch();
      }
    }
  }, [challengeResult]);
  React.useEffect(() => {
    if (challengeError) {
      showError(challengeError.message);
    }
  }, [challengeError]);

  return (
    <>
      <Typography variant='h5'>デバイスの登録</Typography>
      {token ? (
        success ? (
          <Typography>登録しました。お待ち下さい</Typography>
        ) : (
          <Typography>
            以下のコードのあるデバイスを承認してください {code}
          </Typography>
        )
      ) : (
        <Typography>読込中</Typography>
      )}
    </>
  );
};
