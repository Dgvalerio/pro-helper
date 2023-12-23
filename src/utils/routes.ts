interface Routes {
  home: string;
  openedPulls: string;
  github: {
    repositories: string;
    branches: string;
    commits: string;
    pullRequests: string;
  };
  configuration: string;
}

export const routes: Routes = {
  home: '/',
  openedPulls: '/opened-pull-requests',
  github: {
    repositories: '/github/repositories',
    branches: '/github/branches',
    commits: '/github/commits',
    pullRequests: '/github/pull-requests',
  },
  configuration: '/configuration',
};
