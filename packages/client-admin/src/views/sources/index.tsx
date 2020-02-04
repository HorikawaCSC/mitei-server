/*
 * This file is part of Mitei Server.
 * Copyright (c) 2019 f0reachARR <f0reach@f0reach.me>
 *
 * Mitei Server is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * Mitei Server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Mitei Server.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { FileSourceUploadView } from './add/file';
import { FileSourceDetails } from './details/file';
import { RecordSourceDetails } from './details/record';
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
      <Route path='/sources/record/:id' component={RecordSourceDetails} exact />
      <Route path='/sources' component={SourcesListView} />
    </Switch>
  );
};
