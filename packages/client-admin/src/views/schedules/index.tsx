import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ScheduleListSelector } from './list';

export const ScheduleRoot = () => {
  return (
    <Switch>
      <Route
        path='/schedules/:channelId'
        component={ScheduleListSelector}
        exact
      />
      <Route path='/schedules' component={ScheduleListSelector} />
    </Switch>
  );
};
