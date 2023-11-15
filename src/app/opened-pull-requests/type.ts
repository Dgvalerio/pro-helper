import { Endpoints } from '@octokit/types';

export type PullRequests =
  Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'];
export type PullRequest = PullRequests[number];

export interface SimplePullRequest {
  user: NonNullable<PullRequest['user']>['login'];
  avatar: NonNullable<PullRequest['user']>['avatar_url'];
  created: PullRequest['created_at'];
  updated: PullRequest['updated_at'];
  state: PullRequest['state'];
  title: PullRequest['title'];
  body: PullRequest['body'];
  url: PullRequest['html_url'];
}
