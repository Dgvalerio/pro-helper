import { Endpoints } from '@octokit/types';

import { Commit } from '@/app/github/commits/type';

export type Branches =
  Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'];
export type Branch = Branches[number];

export type BranchWithLatestAuthor = Branch & {
  author: {
    avatar?: NonNullable<Commit['author']>['avatar_url'];
    login?: NonNullable<Commit['author']>['login'];
  };
  update: NonNullable<NonNullable<Commit['commit']>['author']>['date'];
};

export interface SimpleBranch {
  name: BranchWithLatestAuthor['name'];
  sha: BranchWithLatestAuthor['commit']['sha'];
  user: BranchWithLatestAuthor['author']['login'];
  avatar: BranchWithLatestAuthor['author']['avatar'];
  update: BranchWithLatestAuthor['update'];
}
