import { FormControlLabel } from '@material-ui/core';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { FormControlLabelProps } from '@material-ui/core/FormControlLabel';
import * as React from 'react';

export const LabeledCheckbox = (
  props: Omit<CheckboxProps & FormControlLabelProps, 'control'>,
) => {
  const checkbox = <Checkbox {...props} />;
  return <FormControlLabel {...props} control={checkbox} />;
};
