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

import { ExecutionResult } from '@apollo/react-common';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Add } from '@material-ui/icons';
import { PageContainer, useErrorDialog } from '@mitei/client-common';
import { DateTime, Duration } from 'luxon';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import useRouter from 'use-react-router';
import {
  AddScheduleMutation,
  useAddScheduleMutation,
} from '../../../api/generated/graphql';
import { ScheduleEdit } from '../../../components/schedules/ScheduleEdit';

const useStyles = makeStyles(theme =>
  createStyles({
    button: {
      margin: theme.spacing(1, 0, 0, 0),
    },
  }),
);

export const ScheduleCreateView = ({
  match,
}: RouteComponentProps<{ channelId: string }>) => {
  const { channelId } = match.params;
  const [addSchedule] = useAddScheduleMutation();
  const [title, setTitle] = React.useState('');
  const [startAt, setStartAt] = React.useState(() =>
    DateTime.local().set({ second: 0, millisecond: 0 }),
  );
  const [endAt, setEndAt] = React.useState(() =>
    DateTime.local()
      .plus({ minute: 30 })
      .set({ second: 0, millisecond: 0 }),
  );
  const [duration, setDuration] = React.useState(() => Duration.fromMillis(0));
  const styles = useStyles();
  const showError = useErrorDialog();
  const { history } = useRouter();

  React.useEffect(() => {
    if (endAt.diff(startAt).as('second') < 0) {
      setEndAt(startAt.plus({ minute: 1 }));
    }
  }, [startAt]);

  const handleAddSchedule = React.useCallback(async () => {
    const { errors, data } = (await addSchedule({
      variables: {
        startAt: startAt.set({ millisecond: 0 }).toISO(),
        endAt: endAt.set({ millisecond: 0 }).toISO(),
        title,
        channelId,
      },
    })) as ExecutionResult<AddScheduleMutation>;

    if (errors || !data || !data.createSchedule) {
      showError(errors ? errors[0].message : 'エラーです');
      return;
    }

    history.push(`/schedules/-/${data.createSchedule.id}`);
  }, [startAt, endAt, title]);

  const addable = React.useMemo<boolean>(
    () => !!title && duration.as('second') > 60,
    [title, duration],
  );

  return (
    <PageContainer title='スケジュール追加'>
      <ScheduleEdit
        title={title}
        onChangeTitle={setTitle}
        startAt={startAt}
        onChangeStartAt={setStartAt}
        endAt={endAt}
        onChangeEndAt={setEndAt}
        onChangeDuration={setDuration}
      />
      <Button
        variant='contained'
        color='primary'
        className={styles.button}
        disabled={!addable}
        onClick={handleAddSchedule}
      >
        <Add />
        <Typography>追加</Typography>
      </Button>
    </PageContainer>
  );
};
