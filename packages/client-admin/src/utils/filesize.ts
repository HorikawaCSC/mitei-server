const units = ['', 'K', 'M', 'G', 'T'];
export const convertFileSize = (size: number, unit = 0): string => {
  const divided = size / 1024;
  if (divided >= 1024) {
    return convertFileSize(divided, unit + 1);
  } else if (divided < 1) {
    return size.toFixed(2) + units[unit];
  }
  return divided.toFixed(2) + units[unit + 1];
};
