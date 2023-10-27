import { Endpoints } from '@octokit/types';

export type Commits =
  Endpoints['GET /repos/{owner}/{repo}/commits']['response']['data'];
export type Commit = Commits[number];
