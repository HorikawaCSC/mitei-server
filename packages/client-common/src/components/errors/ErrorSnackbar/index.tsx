import { useMessageSnack } from '../../message/MessageSnack';

export const useErrorSnack = () => {
  const open = useMessageSnack();
  return (error: string) => open(`エラー: ${error}`);
};
