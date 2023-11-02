import { toast } from '@/components/ui/use-toast';

export const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
  toast({ title: `"${text}" copiado para área de transferência` });
};
