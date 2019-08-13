import { useMessageDialog } from '../../message/MessageDialog';

export const useErrorDialog = () => {
  const open = useMessageDialog();
  return (...errors: string[]) => open('エラー', ...errors);
};
