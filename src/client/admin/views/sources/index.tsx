import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { FileSourceDetails } from './details/file';
import { SourcesListView } from './list';
import { SourcesUpload } from './upload';

export const SourcesRoot = () => {
  return (
    <Switch>
      <Route path='/sources/file/upload' component={SourcesUpload} exact />
      <Route path='/sources/file/:id' component={FileSourceDetails} exact />
      <Route path='/sources' component={SourcesListView} />
    </Switch>
  );
};
