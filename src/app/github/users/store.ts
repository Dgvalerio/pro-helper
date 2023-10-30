import { getOctokit } from '@/app/github/service';
import { RepositoryCollaborators } from '@/app/github/users/type';
import { toast } from '@/components/ui/use-toast';

import { create } from 'zustand';

interface RepositoryCollaboratorsStore {
  loading: boolean;
  repository: string;
  collaborators: RepositoryCollaborators;
  loadCollaborators(fullName: string): Promise<void>;
}

export const useRepositoryCollaboratorsStore =
  create<RepositoryCollaboratorsStore>((set) => ({
    loading: false,
    repository: '',
    collaborators: [],
    loadCollaborators: async (fullName: string): Promise<void> => {
      toast({ title: 'Carregando colaboradores...' });

      set({ loading: true, repository: fullName });

      const [owner, repo] = fullName.split('/');

      try {
        const octokit = getOctokit();

        let collaborators: RepositoryCollaborators = [];

        const request = async (page: number): Promise<void> => {
          const response = await octokit.request(
            'GET /repos/{owner}/{repo}/collaborators',
            { owner, repo, per_page: 100, page }
          );

          collaborators = collaborators.concat(response.data);

          if (response.headers.link && response.headers.link.includes('last'))
            await request(page + 1);
        };

        await request(1);

        set({ collaborators });
      } catch (e) {
        toast({
          title: 'Erro ao carregar os colaboradores!',
          variant: 'destructive',
        });
      } finally {
        set({ loading: false });
      }
    },
  }));
