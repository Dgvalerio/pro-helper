import { PullRequests } from '@/app/github/pull-requests/type';
import { getOctokit } from '@/app/github/service';
import { toast } from '@/components/ui/use-toast';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OpenedPullRequestsStore {
  loading: boolean;
  repositories: string[];
  addRepository(repository: string): string[];
  removeRepository(repository: string): string[];
  loadPulls(): Promise<PullRequests>;
}

export const useOpenedPullRequestsStore = create<OpenedPullRequestsStore>()(
  persist(
    (set, get) => ({
      loading: false,
      repositories: [],
      addRepository(repository: string): string[] {
        const currentRepositories = get().repositories;

        if (currentRepositories.find((r) => r === repository))
          return currentRepositories;

        const repositories = currentRepositories.concat(repository);

        set({ repositories });

        return repositories;
      },
      removeRepository(repository: string): string[] {
        const repositories = get().repositories.filter((r) => r !== repository);

        set({ repositories });

        return repositories;
      },
      loadPulls: async (): Promise<PullRequests> => {
        toast({ title: 'Carregando pull requests...' });

        set({ loading: true });

        const repositores = get().repositories.map((fullName) => {
          const [owner, repository] = fullName.split('/');

          return { owner, repository };
        });

        try {
          const octokit = getOctokit();

          let items: PullRequests = [];

          const processRepositories = repositores.map(
            async ({ owner, repository: repo }) => {
              const request = async (page: number): Promise<void> => {
                const response = await octokit.request(
                  'GET /repos/{owner}/{repo}/pulls',
                  { owner, repo, per_page: 100, page, state: 'open' }
                );

                items = items.concat(response.data);

                if (
                  response.headers.link &&
                  response.headers.link.includes('last')
                )
                  await request(page + 1);
              };

              await request(1);
            }
          );

          await Promise.any(processRepositories);

          return items;
        } catch (e) {
          toast({
            title: 'Erro ao carregar os Pull Requests!',
            variant: 'destructive',
          });

          return [];
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: 'pro-helper:opened-pulls-store' }
  )
);
