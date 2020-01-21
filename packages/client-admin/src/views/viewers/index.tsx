import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ViewerDetails } from './details';
import { ViewersListView } from './list';

export const ViewersRoot = () => {
  return (
    <Switch>
      <Route path='/viewers/-/:id' component={ViewerDetails} />
      <Route path='/viewers' component={ViewersListView} />
    </Switch>
  );
};
