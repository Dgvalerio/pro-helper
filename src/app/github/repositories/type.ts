import { Endpoints } from '@octokit/types';

export type Repositories = Endpoints['GET /user/repos']['response']['data'];
export type Repository = Repositories[number];
