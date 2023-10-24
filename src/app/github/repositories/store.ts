import { Repositories } from '@/app/github/repositories/type';
import { getOctokit } from '@/app/github/service';
import { toast } from '@/components/ui/use-toast';

import { create } from 'zustand';

interface RepositoriesStore {
  loading: boolean;
  repositories: Repositories;
  loadRepositories(): Promise<void>;
}

export const useRepositoriesStore = create<RepositoriesStore>((set) => ({
  loading: false,
  repositories: [],
  loadRepositories: async (): Promise<void> => {
    toast({ title: 'Carregando repositórios...' });

    set({ loading: true });

    try {
      const octokit = getOctokit();

      let repositories: Repositories = [];

      const request = async (page: number): Promise<void> => {
        const response = await octokit.request('GET /user/repos', {
          per_page: 100,
          sort: 'pushed',
          page,
        });

        repositories = repositories.concat(response.data);

        if (response.headers.link && response.headers.link.includes('last'))
          await request(page + 1);
      };

      await request(1);

      set({ repositories });
    } catch (e) {
      toast({
        title: 'Erro ao carregar os repositórios!',
        variant: 'destructive',
      });
    } finally {
      set({ loading: false });
    }
  },
}));
