import { useConfigurationStore } from '@/app/configuration/store';

import { Octokit } from 'octokit';

export const getOctokit = (token?: string): Octokit =>
  new Octokit({ auth: token || useConfigurationStore.getState().token });
