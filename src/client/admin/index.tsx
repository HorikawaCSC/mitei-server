import * as React from 'react';
import { render } from 'react-dom';
import { Root } from './views/root';

const target = document.querySelector('main');

if (target) {
  render(<Root />, target);
}
