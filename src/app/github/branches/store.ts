import { Branches, BranchWithLatestAuthor } from '@/app/github/branches/type';
import { Commit } from '@/app/github/commits/type';
import { getOctokit } from '@/app/github/service';
import { toast } from '@/components/ui/use-toast';

import { create } from 'zustand';

interface BranchesStore {
  loading: boolean;
  branches: BranchWithLatestAuthor[];
  loadBranches(fullName: string): Promise<void>;
}

const getLatestCommit = async (
  fullName: string,
  branchSha: string
): Promise<Commit | undefined> => {
  toast({ title: 'Carregando último commit...' });

  const [owner, repo] = fullName.split('/');

  try {
    const octokit = getOctokit();

    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/commits',
      { owner, repo, per_page: 100, page: 1, sha: branchSha }
    );

    return response.data[0];
  } catch (e) {
    toast({
      title: 'Erro ao carregar o último commit!',
      variant: 'destructive',
    });
  }
};

export const useBranchesStore = create<BranchesStore>((set) => ({
  loading: false,
  branches: [],
  loadBranches: async (fullName: string): Promise<void> => {
    toast({ title: 'Carregando branches...' });

    set({ loading: true });

    const [owner, repo] = fullName.split('/');

    try {
      const octokit = getOctokit();

      let branches: Branches = [];

      const request = async (page: number): Promise<void> => {
        const response = await octokit.request(
          'GET /repos/{owner}/{repo}/branches',
          { owner, repo, per_page: 100, page }
        );

        branches = branches.concat(response.data);

        if (response.headers.link && response.headers.link.includes('last'))
          await request(page + 1);
      };

      await request(1);

      const promise = branches.map(
        async (branch): Promise<BranchWithLatestAuthor> => {
          const c = await getLatestCommit(fullName, branch.commit.sha);

          return {
            ...branch,
            author: { avatar: c?.author?.avatar_url, login: c?.author?.login },
            update: c?.commit.author?.date,
          };
        }
      );

      const items = await Promise.all(promise);

      set({ branches: items });
    } catch (e) {
      toast({
        title: 'Erro ao carregar as branches!',
        variant: 'destructive',
      });
    } finally {
      set({ loading: false });
    }
  },
}));
