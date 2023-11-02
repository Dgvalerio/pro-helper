import { Endpoints } from '@octokit/types';

export type Commits =
  Endpoints['GET /repos/{owner}/{repo}/commits']['response']['data'];
export type Commit = Commits[number];

export interface SimpleCommit {
  sha: Commit['sha'];
  url: Commit['url'];
  date: NonNullable<Commit['commit']['author']>['date'];
  message: Commit['commit']['message'];
  author?: NonNullable<Commit['author']>['login'];
  avatar?: NonNullable<Commit['author']>['avatar_url'];
  avatarFallback?: string;
}
