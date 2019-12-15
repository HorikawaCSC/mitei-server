import * as React from 'react';
import { metricsReporter } from '.';

const metricsProvider = React.createContext<typeof metricsReporter>(
  metricsReporter,
);

export const MericsProvider: React.SFC = ({ children }) => {
  React.useEffect(() => {
    const timer = setInterval(() => metricsReporter.ping(), 1000 * 20);
    return () => clearInterval(timer);
  });

  return (
    <metricsProvider.Provider value={metricsReporter}>
      {children}
    </metricsProvider.Provider>
  );
};
