/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { PageContainer, useErrorSnack } from '@mitei/client-common';
import * as React from 'react';
import { useCreateAdminInviteMutation } from '../../../api/generated/graphql';

export const InviteIssuer = () => {
  const [createInvite] = useCreateAdminInviteMutation();
  const [invite, setInvite] = React.useState('');
  const inviteLink = React.useMemo(
    () => `${location.origin}/admin/consume/${invite}`,
    [invite],
  );
  const showError = useErrorSnack();

  const handleCreateInvite = React.useCallback(async () => {
    if (invite) return;

    const { data, errors } = await createInvite();
    if (errors || !data) {
      showError(errors ? errors[0].message : '作成できませんでした');
      return;
    }

    setInvite(data.createPromoteInvite);
  }, [createInvite, invite]);
  return (
    <PageContainer title='管理者招待の作成' mini>
      <Button
        variant='contained'
        disabled={!!invite}
        onClick={handleCreateInvite}
      >
        作成
      </Button>
      {invite && <Link href={inviteLink}>{inviteLink}</Link>}
    </PageContainer>
  );
};
