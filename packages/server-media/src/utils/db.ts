import { ObjectID } from 'mongodb';

// tslint:disable-next-line: no-any
export const omitUndefined = <T extends Record<string, any>>(query: T): T => {
  return Object.keys(query)
    .filter(key => !!query[key])
    .reduce((obj, key) => ({ ...obj, [key]: query[key] }), {}) as T;
};

export const findIdCondition = (id: ObjectID | string) => {
  const actualId = typeof id === 'string' ? new ObjectID(id) : id;

  return (targetId: ObjectID) => actualId.equals(targetId);
};
