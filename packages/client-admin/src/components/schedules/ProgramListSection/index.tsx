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
import Typography from '@material-ui/core/Typography';
import { Add } from '@material-ui/icons';
import { PageContainer, useErrorDialog } from '@mitei/client-common';
import * as React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import {
  GetScheduleQuery,
  useAddEmptyProgramMutation,
  useReorderProgramMutation,
} from '../../../api/generated/graphql';
import { toDate } from '../../../utils/datetime';
import { ProgramItem } from './item';

type Props = {
  schedule: NonNullable<GetScheduleQuery['schedule']>;
};

export const ProgramListSection = ({ schedule }: Props) => {
  const [
    addEmptyProgram,
    { error: addEmptyProgramError },
  ] = useAddEmptyProgramMutation({
    variables: {
      scheduleId: schedule.id,
    },
  });
  const [reorderProgram] = useReorderProgramMutation();
  const showError = useErrorDialog();
  const [disabled, setDisabled] = React.useState(false);
  const [reorder, setReorder] = React.useState<string[]>([]);

  const scheduleDuration = React.useMemo(() => {
    return toDate(schedule.endAt)
      .diff(toDate(schedule.startAt))
      .as('seconds');
  }, [schedule]);

  const programsDuration = React.useMemo(() => {
    return schedule.programs.reduce(
      (total, program) => total + program.duration,
      0,
    );
  }, [schedule]);

  const handleAddButton = React.useCallback(async () => {
    await addEmptyProgram();
    if (addEmptyProgramError) {
      showError(addEmptyProgramError.message);
    }
  }, []);

  const handleDropEnd = React.useCallback(
    async (result: DropResult) => {
      if (!result.destination) return;

      const idList = schedule.programs.map(({ id }) => id);
      const [removed] = idList.splice(result.source.index, 1);
      idList.splice(result.destination.index, 0, removed);

      setDisabled(true);
      setReorder(idList);
      await reorderProgram({
        variables: {
          scheduleId: schedule.id,
          order: idList,
        },
      });
      setReorder([]);
      setDisabled(false);
    },
    [schedule],
  );

  const orderedProgramIndexes = React.useMemo(() => {
    const ids = schedule.programs.map(({ id }) => id);
    if (reorder.length > 0) {
      return reorder.map(id => ids.indexOf(id));
    } else {
      return ids.map((_id, index) => index);
    }
  }, [schedule, reorder]);

  return (
    <PageContainer title='プログラム一覧' mini>
      <DragDropContext onDragEnd={handleDropEnd}>
        <Droppable droppableId='programs'>
          {(provided, _snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {orderedProgramIndexes.map(index => (
                <ProgramItem
                  index={index}
                  schedule={schedule}
                  scheduleDuration={scheduleDuration}
                  key={`${index}-${schedule.programs[index].id}`}
                  disabled={disabled}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {scheduleDuration > programsDuration ? (
        <PageContainer title='自動フィラー' mini>
          <Typography>
            自動フィラー {scheduleDuration - programsDuration}秒
          </Typography>
        </PageContainer>
      ) : null}
      <Button
        onClick={handleAddButton}
        variant='contained'
        color='primary'
        disabled={disabled}
      >
        <Add />
        追加
      </Button>
    </PageContainer>
  );
};
