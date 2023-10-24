import { Endpoints } from '@octokit/types';

export type Branches =
  Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'];
export type Branch = Branches[number];
