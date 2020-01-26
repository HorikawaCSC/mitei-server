import * as React from 'react';
import { metricsReporter } from '.';

export const PingMetricsReporter = () => {
  React.useEffect(() => {
    metricsReporter.ping();
    const timer = setInterval(() => metricsReporter.ping(), 1000 * 20);
    return () => clearInterval(timer);
  });

  return <></>;
};
