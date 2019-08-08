import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ChannelsListView } from './list';

export const ChannelsRoot = () => {
  return (
    <Switch>
      <Route path='/channels' component={ChannelsListView} />
    </Switch>
  );
};
