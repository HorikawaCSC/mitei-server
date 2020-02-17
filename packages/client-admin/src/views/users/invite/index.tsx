import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useConsumeInviteMutation } from '../../../api/generated/graphql';

type Props = RouteComponentProps<{ id: string }>;
export const InviteConsume = ({ match }: Props) => {
  const [consumeInvite] = useConsumeInviteMutation();
  React.useEffect(() => {
    (async () => {
      const { errors } = await consumeInvite({
        variables: { id: match.params.id },
      });
      if (errors) {
        return alert('エラーです');
      }
      location.reload();
    })();
  }, []);

  return null;
};
