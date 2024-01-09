import { DaysStore } from '@/app/days/store';
import { Branches } from '@/app/github/branches/type';

export interface RepositoryAndBranch {
  repository: string;
  branch: string;
}

export interface RepositoryCommit {
  repo: string;
  date: string;
  description: string;
  commit: string;
}

export namespace GetCommits {
  export interface Params {
    author: string | null;
    repositories: RepositoryAndBranch[];
    interval: DaysStore['interval'];
    token: string;
  }

  export type Return = Promise<RepositoryCommit[][]>;

  export type Fn = (params: Params) => Return;
}

export namespace GetBranches {
  export interface Params {
    name: string;
    per_page?: number;
    token: string;
  }

  export type Return = Promise<Branches>;

  export type Fn = (params: Params) => Return;
}

export interface TimeGroupedCommit {
  date: string;
  descriptions: {
    start: string;
    end: string;
    descriptions: { repo: string; text: string[] }[];
  }[];
}

export interface GroupedCommit {
  date: string;
  description: string;
  descriptions: TimeGroupedCommit['descriptions'];
}

export interface DayGroupedCommit {
  date: string;
  descriptions: {
    repo: string;
    time: string;
    description: string;
    commit: string;
  }[];
}
