import { Commits } from '@/app/github/commits/type';
import { getOctokit } from '@/app/github/service';
import { toast } from '@/components/ui/use-toast';

import { create } from 'zustand';

interface CommitsStore {
  loading: boolean;
  repository?: string;
  branch?: string;
  user?: string;
  commits: Commits;
  loadCommits({
    fullName,
    branchSha,
    user,
  }: {
    fullName?: string;
    branchSha?: string;
    user?: string;
  }): Promise<void>;
}

export const useCommitsStore = create<CommitsStore>((set, get) => ({
  loading: false,
  commits: [],
  loadCommits: async (options): Promise<void> => {
    toast({ title: 'Carregando commits...' });

    if (options.fullName) set({ repository: options.fullName });
    if (options.branchSha) set({ branch: options.branchSha });
    if (options.user) set({ user: options.user });

    const repository = options.fullName || get().repository;
    const branch = options.branchSha || get().branch;
    const user = options.user || get().user;

    if (!repository) throw new Error('Sem repositório');

    set({ loading: true });

    const [owner, repo] = repository.split('/');

    try {
      const octokit = getOctokit();

      let commits: Commits = [];

      const request = async (page: number): Promise<void> => {
        const response = await octokit.request(
          'GET /repos/{owner}/{repo}/commits',
          { owner, repo, per_page: 100, page, sha: branch, committer: user }
        );

        commits = commits.concat(response.data);

        if (response.headers.link && response.headers.link.includes('last'))
          await request(page + 1);
      };

      await request(1);

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
