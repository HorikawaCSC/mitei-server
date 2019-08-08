import { ObjectId } from 'mongodb';
import { MutationResolvers } from '../../../../generated/graphql';
import { Program, Schedule } from '../../../../models/streaming/Schedule';
import { findIdCondition } from '../../../../utils/db';
import { ensureLoggedInAsAdmin } from '../../../../utils/gql/ensureUser';
import { checkTypeAndSource } from '../../../../utils/schedule/validate';

export const programMutationResolvers: MutationResolvers = {
  addProgramToSchedule: ensureLoggedInAsAdmin(
    async (_parent, { scheduleId, before, duration, type, sourceId }) => {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) throw new Error('schedule not found');

      const { programs } = schedule;
      const prependIndex = before
        ? programs.map(({ _id }) => _id).findIndex(findIdCondition(before))
        : programs.length;

      if (prependIndex < 0) throw new Error('specified program not found');

      const program: Program = {
        _id: new ObjectId(),
        type,
        sourceId: sourceId ? new ObjectId(sourceId) : undefined,
        duration,
      };

      if (!(await checkTypeAndSource(program.type, program.sourceId))) {
        throw new Error('source invalid');
      }

      await schedule.updateOne({
        $push: {
          programs: {
            $each: [program],
            $position: prependIndex,
          },
        },
      });

      const updatedSchedule = await Schedule.findById(scheduleId);
      if (!updatedSchedule) throw new Error('fatal error');

      return updatedSchedule;
    },
  ),
  removeProgramFromSchedule: ensureLoggedInAsAdmin(
    async (_parent, { scheduleId, programId }) => {
      const schedule = await Schedule.findOne({
        _id: scheduleId,
        programs: {
          $elemMatch: {
            _id: programId,
          },
        },
      });
      if (!schedule) throw new Error('schedule or program not found');

      await schedule.updateOne({
        $pull: {
          programs: {
            _id: programId,
          },
        },
      });

      const updatedSchedule = await Schedule.findById(scheduleId);
      if (!updatedSchedule) throw new Error('fatal error');

      return updatedSchedule;
    },
  ),
  updateProgram: ensureLoggedInAsAdmin(
    async (_parent, { scheduleId, programId, sourceId, duration, type }) => {
      const schedule = await Schedule.findOne({
        _id: scheduleId,
        programs: {
          $elemMatch: {
            _id: programId,
          },
        },
      });
      if (!schedule) throw new Error('schedule or program not found');

      const targetIndex = schedule.programs
        .map(({ _id }) => _id)
        .findIndex(findIdCondition(programId));

      if (sourceId)
        schedule.programs[targetIndex].sourceId = new ObjectId(sourceId);
      if (duration) schedule.programs[targetIndex].duration = duration;
      if (type) schedule.programs[targetIndex].type = type;

      if (
        !checkTypeAndSource(
          schedule.programs[targetIndex].type,
          schedule.programs[targetIndex].sourceId,
        )
      ) {
        throw new Error('source invalid');
      }

      return await schedule.save();
    },
  ),
  updateProgramOrder: ensureLoggedInAsAdmin(
    async (_parent, { scheduleId, order }) => {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) throw new Error('schedule not found');

      const orderIds = order
        .filter((id, idx) => order.indexOf(id) === idx)
        .map(id => new ObjectId(id));

      if (schedule.programs.length !== orderIds.length) {
        throw new Error('invalid order');
      }

      const orderedPrograms = orderIds
        .map(id => schedule.programs.find(({ _id }) => _id.equals(id)))
        .filter((program): program is Program => !!program);

      if (orderedPrograms.length !== orderIds.length) {
        throw new Error('invalid order');
      }

      schedule.programs = orderedPrograms;

      return await schedule.save();
    },
  ),
};
