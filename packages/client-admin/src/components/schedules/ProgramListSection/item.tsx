import { ExecutionResult } from '@apollo/react-common';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Delete, Save, SettingsBackupRestore } from '@material-ui/icons';
import { PageContainer, useErrorDialog } from '@mitei/client-common';
import * as React from 'react';
import {
  GetScheduleQuery,
  ProgramType,
  useGetSourceDurationLazyQuery,
  useRemoveProgramMutation,
  useUpdateProgramMutation,
} from '../../../api/generated/graphql';
import { useCommonStyles } from '../../../styles/common';
import { RtmpInputSelect } from '../../shared/RtmpInputSelect';
import { SourceSelect } from '../../shared/SourceSelect';
import { SourceTypeSelect } from '../../shared/SourceTypeSelect';

const useStyles = makeStyles(theme =>
  createStyles({
    buttonGroup: {
      margin: theme.spacing(1, 0, 0, 0),
    },
  }),
);

type Props = {
  index: number;
  schedule: NonNullable<GetScheduleQuery['schedule']>;
  scheduleDuration: number;
};
export const ProgramItem = ({ index, schedule, scheduleDuration }: Props) => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const showError = useErrorDialog();
  const [
    getSourceDuration,
    { data: durationData },
  ] = useGetSourceDurationLazyQuery();
  const [updateProgram] = useUpdateProgramMutation();
  const [removeProgram] = useRemoveProgramMutation();

  const program = schedule.programs[index];
  const [programType, setProgramType] = React.useState(program.type);
  const [sourceId, setSourceId] = React.useState(
    program.source ? program.source.id : '',
  );
  const [duration, setDuration] = React.useState(program.duration);

  React.useEffect(() => {
    if (programType === ProgramType.Transcoded) {
      getSourceDuration({ variables: { id: sourceId } });
    }
  }, [programType, sourceId]);

  const handleApplyTimeFromSource = React.useCallback(() => {
    if (durationData && durationData.source && durationData.source.duration)
      setDuration(Math.ceil(durationData.source.duration));
  }, [durationData]);

  const maxDuration = React.useMemo(() => {
    return Math.max(
      scheduleDuration -
        schedule.programs.reduce(
          (total, program, i) =>
            i === index ? total : total + program.duration,
          0,
        ),
      0,
    );
  }, [schedule]);

  const handleApplyTimeFromMax = React.useCallback(() => {
    setDuration(maxDuration);
  }, [maxDuration]);

  const handleChangeProgramType = React.useCallback((type: ProgramType) => {
    setProgramType(type);
    setSourceId('');
  }, []);

  const handleDurationChange = React.useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      setDuration(Number(e.target.value));
    },
    [],
  );

  const handleReset = React.useCallback(() => {
    setProgramType(program.type);
    setSourceId(program.source ? program.source.id : '');
    setDuration(program.duration);
  }, [program]);

  const handleSave = React.useCallback(async () => {
    const { errors } = (await updateProgram({
      variables: {
        scheduleId: schedule.id,
        programId: program.id,
        duration,
        type: programType,
        sourceId,
      },
    })) as ExecutionResult<{}>;
    if (errors) {
      showError(errors[0].message);
      handleReset();
    }
  }, [schedule, program, duration, programType, sourceId]);

  const handleRemove = React.useCallback(async () => {
    await removeProgram({
      variables: {
        scheduleId: schedule.id,
        programId: program.id,
      },
    });
  }, [schedule, program]);

  const sourceSelector = React.useMemo(
    () =>
      programType === ProgramType.Transcoded ? (
        <SourceSelect value={sourceId} handleChange={setSourceId} />
      ) : programType === ProgramType.Rtmp ? (
        <RtmpInputSelect value={sourceId} handleChange={setSourceId} />
      ) : null,
    [programType, sourceId],
  );

  const timeAppliable = React.useMemo(
    () =>
      !!durationData &&
      !!durationData.source &&
      durationData.source.id === sourceId &&
      !!durationData.source.duration,
    [durationData, sourceId],
  );

  const saveEnable = React.useMemo(() => {
    if (
      programType === ProgramType.Rtmp ||
      programType === ProgramType.Transcoded
    )
      return !!sourceId;
    return true;
  }, [programType, sourceId]);
  return (
    <PageContainer title={`プログラム #${index}`} mini>
      <Box className={commonStyles.centerBox}>
        <SourceTypeSelect
          value={programType}
          onChange={handleChangeProgramType}
        />
        {sourceSelector}
      </Box>
      <Box className={commonStyles.centerBox}>
        <TextField
          label={`長さ(秒 / 最大: ${maxDuration})`}
          type='number'
          value={duration}
          error={duration > maxDuration}
          onChange={handleDurationChange}
        />
        <Button
          disabled={!timeAppliable}
          onClick={handleApplyTimeFromSource}
          color='secondary'
        >
          長さをソースから適用
        </Button>
        <Button onClick={handleApplyTimeFromMax} color='secondary'>
          長さを最大に
        </Button>
      </Box>
      <ButtonGroup
        color='primary'
        variant='contained'
        className={styles.buttonGroup}
      >
        <Button onClick={handleSave} disabled={!saveEnable}>
          <Save />
          保存
        </Button>
        <Button onClick={handleReset}>
          <SettingsBackupRestore />
          リセット
        </Button>
        <Button onClick={handleRemove}>
          <Delete />
          削除
        </Button>
      </ButtonGroup>
    </PageContainer>
  );
};
