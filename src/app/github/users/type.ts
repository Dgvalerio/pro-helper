import { Endpoints } from '@octokit/types';

export type User = Endpoints['GET /user']['response']['data'];

export type RepositoryCollaborators =
  Endpoints['GET /repos/{owner}/{repo}/collaborators']['response']['data'];
export type RepositoryCollaborator = RepositoryCollaborators[number];
