import { PullRequests } from '@/app/github/pull-requests/type';
import { getOctokit } from '@/app/github/service';
import { toast } from '@/components/ui/use-toast';

import { create } from 'zustand';

interface PullRequestsStore {
  loading: boolean;
  repository: string;
  pulls: PullRequests;
  loadPulls(fullName: string): Promise<void>;
}

export const usePullRequestsStore = create<PullRequestsStore>((set) => ({
  loading: false,
  repository: '',
  pulls: [],
  loadPulls: async (fullName: string): Promise<void> => {
    toast({ title: 'Carregando pull requests...' });

    set({ loading: true, repository: fullName });

    const [owner, repo] = fullName.split('/');

    try {
      const octokit = getOctokit();

      let items: PullRequests = [];

      const request = async (page: number): Promise<void> => {
        const response = await octokit.request(
          'GET /repos/{owner}/{repo}/pulls',
          { owner, repo, per_page: 100, page, state: 'all' }
        );

        items = items.concat(response.data);

        if (response.headers.link && response.headers.link.includes('last'))
          await request(page + 1);
      };

      await request(1);

      set({ pulls: items });
    } catch (e) {
      toast({
        title: 'Erro ao carregar os Pull Requests!',
        variant: 'destructive',
      });
    } finally {
      set({ loading: false });
    }
  },
}));
