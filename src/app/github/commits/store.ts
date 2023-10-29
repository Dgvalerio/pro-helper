import { Commits } from '@/app/github/commits/type';
import { getOctokit } from '@/app/github/service';
import { toast } from '@/components/ui/use-toast';

import { create } from 'zustand';

interface CommitsStore {
  loading: boolean;
  commits: Commits;
  loadCommits(fullName: string, branchSha: string): Promise<void>;
}

export const useCommitsStore = create<CommitsStore>((set) => ({
  loading: false,
  commits: [],
  loadCommits: async (fullName, branchSha): Promise<void> => {
    toast({ title: 'Carregando commits...' });

    set({ loading: true });

    const [owner, repo] = fullName.split('/');

    try {
      const octokit = getOctokit();

      let commits: Commits = [];

      const request = async (page: number): Promise<void> => {
        const response = await octokit.request(
          'GET /repos/{owner}/{repo}/commits',
          { owner, repo, per_page: 100, page, sha: branchSha }
        );

        commits = commits.concat(response.data);

        if (response.headers.link && response.headers.link.includes('last'))
          await request(page + 1);
      };

      await request(1);

      console.log(commits[0]);

      set({ commits });
    } catch (e) {
      toast({
        title: 'Erro ao carregar os commits!',
        variant: 'destructive',
      });
    } finally {
      set({ loading: false });
    }
  },
}));
