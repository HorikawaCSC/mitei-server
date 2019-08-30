import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ChannelDetailView } from './details';
import { ChannelsListView } from './list';

export const ChannelsRoot = () => {
  return (
    <Switch>
      <Route path='/channels' component={ChannelsListView} exact />
      <Route path='/channels/:id' component={ChannelDetailView} exact />
    </Switch>
  );
};
