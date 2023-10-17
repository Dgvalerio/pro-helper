import { useConfigurationStore } from '@/app/configuration/store';

import { Octokit } from 'octokit';

export const getOctokit = (): Octokit =>
  new Octokit({ auth: useConfigurationStore.getState().token });
