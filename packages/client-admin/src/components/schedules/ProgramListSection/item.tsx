import { ExecutionResult } from '@apollo/react-common';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import {
  Create,
  Delete,
  DragIndicator,
  Save,
  SettingsBackupRestore,
} from '@material-ui/icons';
import {
  useConfirmDialog,
  useErrorDialog,
  useMessageSnack,
} from '@mitei/client-common';
import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
  GetScheduleQuery,
  ProgramType,
  useGetSourceDurationLazyQuery,
  useRemoveProgramMutation,
  useUpdateProgramMutation,
} from '../../../api/generated/graphql';
import { useCommonStyles } from '../../../styles/common';
import { programText } from '../../../utils/schedule';
import { RtmpInputSelect } from '../../shared/RtmpInputSelect';
import { SourceSelect } from '../../shared/SourceSelect';
import { SourceTypeSelect } from '../../shared/SourceTypeSelect';

const useStyles = makeStyles(theme =>
  createStyles({
    buttonGroup: {
      margin: theme.spacing(1, 0, 0, 0),
    },
    paper: {
      padding: theme.spacing(1, 2, 2, 2),
      margin: theme.spacing(1, 0),
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleBox: {
      display: 'flex',
      alignItems: 'center',
    },
    titleText: {
      display: 'flex',
      alignItems: 'center',
      paddingRight: '10px',
    },
  }),
);

type Props = {
  index: number;
  schedule: NonNullable<GetScheduleQuery['schedule']>;
  scheduleDuration: number;
  disabled?: boolean;
};
export const ProgramItem = ({
  index,
  schedule,
  scheduleDuration,
  disabled,
}: Props) => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const showError = useErrorDialog();
  const showMessage = useMessageSnack();
  const [
    getSourceDuration,
    { data: durationData },
  ] = useGetSourceDurationLazyQuery();
  const [updateProgram] = useUpdateProgramMutation();
  const [removeProgram] = useRemoveProgramMutation();
  const confirm = useConfirmDialog();

  const program = schedule.programs[index];
  const [programType, setProgramType] = React.useState(program.type);
  const [sourceId, setSourceId] = React.useState(
    program.source ? program.source.id : '',
  );
  const [duration, setDuration] = React.useState(program.duration);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (programType === ProgramType.Transcoded) {
      getSourceDuration({ variables: { id: sourceId } });
    }
  }, [programType, sourceId, getSourceDuration]);

  const handleApplyTimeFromSource = React.useCallback(() => {
    if (
      durationData &&
      durationData.source &&
      'duration' in durationData.source
    )
      setDuration(Math.ceil(durationData.source.duration || 0));
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
    } else {
      showMessage('保存しました');
    }
  }, [
    schedule,
    program,
    duration,
    programType,
    sourceId,
    handleReset,
    showError,
    showMessage,
    updateProgram,
  ]);

  const handleRemove = React.useCallback(async () => {
    if (!(await confirm('確認', '削除しますか'))) return;
    const { errors } = (await removeProgram({
      variables: {
        scheduleId: schedule.id,
        programId: program.id,
      },
    })) as ExecutionResult<{}>;
    if (errors) {
      showError(errors[0].message);
    } else {
      showMessage('削除しました');
    }
  }, [schedule, program, showError, showMessage, removeProgram, confirm]);

  const handleOpen = React.useCallback(() => {
    if (open) {
      handleSave();
    }
    setOpen(!open);
  }, [open, handleSave]);

  const handleResetButton = React.useCallback(() => {
    handleReset();
    setOpen(false);
  }, [handleReset]);

  const sourceSelector = React.useMemo(
    () =>
      programType === ProgramType.Transcoded ? (
        <SourceSelect
          value={sourceId}
          handleChange={setSourceId}
          disabled={disabled}
          defaultValue={
            program.source &&
            (program.source.__typename === 'FileSource' ||
              program.source.__typename === 'RecordSource')
              ? program.source
              : null
          }
        />
      ) : programType === ProgramType.Rtmp ? (
        <RtmpInputSelect
          value={sourceId}
          handleChange={setSourceId}
          disabled={disabled}
          defaultValue={
            program.source && program.source.__typename === 'RtmpInput'
              ? program.source
              : null
          }
        />
      ) : null,
    [programType, sourceId, disabled],
  );

  const timeAppliable = React.useMemo(
    () =>
      !!durationData &&
      !!durationData.source &&
      durationData.source.id === sourceId &&
      'duration' in durationData.source,
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
    <Draggable key={program.id} draggableId={program.id} index={index}>
      {(provided, _snapshot) => (
        <div {...provided.draggableProps} ref={provided.innerRef}>
          <Paper className={styles.paper}>
            <Box className={styles.title}>
              <Box {...provided.dragHandleProps} className={styles.titleBox}>
                <Typography className={styles.titleText} variant='h6'>
                  <DragIndicator />
                  プログラム #{index}
                </Typography>
                <Typography variant='subtitle2'>
                  {programText(program)}
                </Typography>
              </Box>
              <Box>
                <IconButton disabled={disabled} onClick={handleOpen} edge='end'>
                  {open ? <Save /> : <Create />}
                </IconButton>
                {open && (
                  <IconButton
                    disabled={disabled}
                    onClick={handleResetButton}
                    edge='end'
                  >
                    <SettingsBackupRestore />
                  </IconButton>
                )}
                <IconButton
                  onClick={handleRemove}
                  disabled={!saveEnable || disabled}
                  edge='end'
                >
                  <Delete />
                </IconButton>
              </Box>
            </Box>
            <Collapse in={open} timeout='auto'>
              <Box className={commonStyles.centerBox}>
                <SourceTypeSelect
                  value={programType}
                  onChange={handleChangeProgramType}
                  disabled={disabled}
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
                  disabled={disabled}
                />
                <Button
                  disabled={!timeAppliable || disabled}
                  onClick={handleApplyTimeFromSource}
                  color='secondary'
                >
                  長さをソースから適用
                </Button>
                <Button
                  onClick={handleApplyTimeFromMax}
                  color='secondary'
                  disabled={disabled}
                >
                  長さを最大に
                </Button>
              </Box>
            </Collapse>
          </Paper>
        </div>
      )}
    </Draggable>
  );
};
