export const parameterString = (params: string[]) => {
  return params
    .map(param => (param.includes(' ') ? `"${param}"` : param))
    .join(' ');
};
