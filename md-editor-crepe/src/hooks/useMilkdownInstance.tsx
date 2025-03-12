import { useInstance } from '@milkdown/react';

export const useMilkdownInstance = () => {
  const [loading, getEditor] = useInstance();

  const editor = getEditor();

  return {
    editor,
    loading,
  };
};
