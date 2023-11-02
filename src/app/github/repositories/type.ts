import { Endpoints } from '@octokit/types';

export type Repositories = Endpoints['GET /user/repos']['response']['data'];
export type Repository = Repositories[number];

export interface SimpleRepository {
  fullName: Repository['full_name'];
  name: Repository['name'];
  private: Repository['private'];
  language: Repository['language'];
  owner: Repository['owner']['login'];
  avatar: Repository['owner']['avatar_url'];
  avatarFallback: string;
}
