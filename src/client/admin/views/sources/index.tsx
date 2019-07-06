import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { FileSourceUploadView } from './add/file';
import { FileSourceDetails } from './details/file';
import { SourcesListView } from './list';

export const SourcesRoot = () => {
  return (
    <Switch>
      <Route
        path='/sources/file/upload'
        component={FileSourceUploadView}
        exact
      />
      <Route path='/sources/file/:id' component={FileSourceDetails} exact />
      <Route path='/sources' component={SourcesListView} />
    </Switch>
  );
};
