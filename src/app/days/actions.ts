'use server';

import { translate } from '@vitalets/google-translate-api';

import { DaysStore } from '@/app/days/store';
import {
  DayGroupedCommit,
  GetBranches,
  GetCommits,
  GroupedCommit,
  RepositoryAndBranch,
  RepositoryCommit,
  TimeGroupedCommit,
} from '@/app/days/types';
import { Commit } from '@/app/github/commits/type';
import { getOctokit } from '@/app/github/service';
import { proxyList } from '@/utils/proxy-list';
import { sortBy } from '@/utils/sort-by';

import { HttpProxyAgent } from 'http-proxy-agent';
import { Octokit } from 'octokit';

const dayTimes: {
  // Horário inicial do apontamento (no formato HH:MM).
  start: string;
  // Horário final do apontamento (no formato HH:MM).
  end: string;
}[] = [{ start: '00:00', end: '23:59' }];

const getAuthor = async (token: string): Promise<string | null> => {
  // const token = useConfigurationStore.getState().token;

  const octokit = new Octokit({ auth: token });

  const user = await octokit.rest.users.getAuthenticated();

  return user.data.email;
};

const dateNow = (dateString: string): string => {
  const date = new Date(dateString);

  date.setHours(date.getHours() - 3);

  return date.toISOString();
};

const simplifyCommit = (repo: string, complete: Commit): RepositoryCommit => ({
  repo,
  date: dateNow(complete.commit.committer?.date || ''),
  description: complete.commit.message,
  commit: complete.html_url,
});

const getBranches: GetBranches.Fn = async (props) => {
  const [owner, repo] = props.name.split('/');

  const response = await getOctokit(props.token).request(
    'GET /repos/{owner}/{repo}/branches',
    { owner, repo, per_page: props.per_page || 100 }
  );

  return response.data;
};

const getCommits: GetCommits.Fn = async ({
  author,
  repositories,
  interval,
  token,
}) => {
  if (!author) return [];

  const promise = repositories.map(async (repository) => {
    const name = repository.repository;
    const [owner, repo] = name.split('/');

    const branches = await getBranches({ name, token });

    const sha = branches.find((b) => b.name === repository.branch)?.commit.sha;

    const response = await getOctokit(token).request(
      'GET /repos/{owner}/{repo}/commits',
      {
        owner,
        repo,
        author,
        sha,
        per_page: 100,
        until: interval.until,
        since: interval.since,
      }
    );

    return response.data.map((data) => simplifyCommit(name, data));
  });

  return await Promise.all(promise);
};

const joinLists = (commits: RepositoryCommit[][]): RepositoryCommit[] => {
  const items: RepositoryCommit[] = [];

  commits.forEach((list) => list.forEach((c) => items.push(c)));

  return items;
};

const translateCommitMessage = async (
  commitMessage: string,
  agent: HttpProxyAgent<string>
): Promise<string> => {
  type Category =
    | 'feat'
    | 'fix'
    | 'docs'
    | 'style'
    | 'refactor'
    | 'chore'
    | 'test'
    | 'merge'
    | 'build';

  const categories: Record<Category, string> = {
    feat: 'Adição',
    fix: 'Correção/ajuste',
    docs: 'Documentação',
    style: 'Formatação de estilos',
    refactor: 'Refatoração',
    chore: 'Outras alterações',
    test: 'Testes automatizados',
    merge: 'Review de Pull Request',
    build: 'Ajuste de build',
  };

  const match = commitMessage.match(/^(\w+)\(([^)]+)\):\s(.+)$/);

  if (match) {
    const category = match[1] as Category;
    const scope = match[2];
    const description = await translate(match[3], {
      to: 'pt-br',
      fetchOptions: { agent },
    });

    return `${categories[category]} em "${scope}": ${description.text}`;
  } else if (commitMessage.startsWith('Merge pull')) {
    const regex =
      /^Merge pull request #(\d+) from [^\n]+\n\n(.+) \(([^\n]+)\)$/;

    const resultado = commitMessage.match(regex);

    if (resultado) {
      const pullNumber = resultado[1];
      const description = resultado[2];
      const link = resultado[3];

      return `Mergando Pull Request #${pullNumber} referente a "${description}" (${link})`;
    }

    return commitMessage;
  } else {
    return commitMessage;
  }
};

const translateCommits = async (
  commits: RepositoryCommit[]
): Promise<RepositoryCommit[]> => {
  const size = commits.length;

  console.log({ title: `Traduzindo ${size} commits` });

  const translatedCommits: RepositoryCommit[] = [];

  let proxyPos = 0;

  let agent = new HttpProxyAgent(proxyList[proxyPos]);

  const translateCommit = async (position: number): Promise<void> => {
    const data: RepositoryCommit = commits[position];

    const percent = ((position + 1) / size) * 100;
    const progress = [...new Array(100)]
      .map((_, i) => (i < percent ? 'X' : '_'))
      .join('');

    console.log({
      title: `(${progress}) | ${percent}% | ${position + 1} de ${size}`,
    });

    try {
      const description = await translateCommitMessage(data.description, agent);

      translatedCommits.push({ ...data, description });

      if (position + 1 < size) await translateCommit(position + 1);
    } catch (e) {
      proxyPos += 1;

      if (proxyPos === proxyList.length) {
        return;
      }

      const name = (e as { name: string }).name;

      console.log(
        `Catch "${name}" with proxy "${proxyPos}", try "${proxyList[proxyPos]}"`
      );

      if (
        ['TooManyRequestsError', 'BadGatewayError', 'FetchError'].includes(name)
      ) {
        agent = new HttpProxyAgent(proxyList[proxyPos]);

        await translateCommit(position);
      } else {
        console.log(e);

        translatedCommits.push(commits[position]);

        if (position + 1 < size) await translateCommit(position + 1);
      }
    }
  };

  await translateCommit(0);

  return translatedCommits;
};

const timeNumber = (time: string): number => Number(time.replace(':', ''));

const timeFilter =
  (item: { start: string; end: string }, index: number) =>
  (d: { time: string }): boolean =>
    (timeNumber(item.start) < timeNumber(d.time) &&
      timeNumber(d.time) < timeNumber(item.end)) ||
    (index === 0 && timeNumber(d.time) < timeNumber(item.end)) ||
    (index === dayTimes.length - 1 &&
      timeNumber(d.time) > timeNumber(item.start));

const groupByDate = (commits: RepositoryCommit[]): GroupedCommit[] => {
  const dayGroup: DayGroupedCommit[] = [];

  commits.forEach((item) => {
    const day = item.date.split('T')[0];
    const time = item.date.split('T')[1].split('.')[0].slice(0, 5);

    let index = 0;

    const exists = dayGroup.find(({ date }, _) => {
      index = _;

      return day === date.split('T')[0];
    });

    const toAdd = {
      time,
      description: item.description,
      commit: item.commit,
      repo: item.repo,
    };

    if (exists) {
      dayGroup[index] = {
        date: dayGroup[index].date,
        descriptions: dayGroup[index].descriptions.concat([toAdd]),
      };
    } else {
      dayGroup.push({ date: day, descriptions: [toAdd] });
    }
  });

  const dayGroups: TimeGroupedCommit[] = dayGroup.map((_) => ({
    ..._,
    descriptions: dayTimes.map((item, i) => {
      const filterByTime: DayGroupedCommit['descriptions'] =
        _.descriptions.filter(timeFilter(item, i));

      const descriptions: TimeGroupedCommit['descriptions'][number]['descriptions'] =
        [];

      filterByTime.forEach((d) => {
        let index = 0;
        const exists = descriptions.find(({ repo }, _) => {
          index = _;

          return repo === d.repo;
        });

        const toAdd = { repo: d.repo, text: `${d.description} (${d.commit})` };

        if (exists) {
          descriptions[index] = {
            repo: descriptions[index].repo,
            text: descriptions[index].text.concat([toAdd.text]),
          };
        } else {
          descriptions.push({ repo: d.repo, text: [toAdd.text] });
        }
      });

      return { ...item, descriptions };
    }),
  }));

  return dayGroups.map((_) => ({
    ..._,
    description: _.descriptions
      .map(
        ({ descriptions }) =>
          // `## ${start} - ${end}\n` +
          descriptions
            .map(
              ({ repo, text }) =>
                `Em "${repo}":\n${text.map((t) => ` - ${t}`).join('\n')}`
            )
            .join('\n') + '\n'
      )
      .join('\n'),
  }));
};

export namespace GetDays {
  export interface Params {
    token: string;
    repositories: RepositoryAndBranch[];
    interval: DaysStore['interval'];
    translate: boolean;
  }

  export type Return = Promise<GroupedCommit[]>;

  export type Fn = (params: Params) => Return;
}

export const getDays: GetDays.Fn = async ({
  token,
  repositories,
  interval,
  translate,
}) => {
  'use server';

  try {
    const author = await getAuthor(token);

    try {
      const commitLists = await getCommits({
        author,
        interval,
        repositories,
        token,
      });

      try {
        const joined = joinLists(commitLists);

        try {
          joined.sort(sortBy('date'));

          try {
            let finish: RepositoryCommit[] = [...joined];

            try {
              if (translate) {
                finish = await translateCommits(joined);
              }

              try {
                return groupByDate(finish);
              } catch (e) {
                console.log('Erro no agrupamento', e);

                return [];
              }
            } catch (e) {
              console.log(6, e);

              return [];
            }
          } catch (e) {
            console.log(5, e);

            return [];
          }
        } catch (e) {
          console.log(4, e);

          return [];
        }
      } catch (e) {
        console.log(3, e);

        return [];
      }
    } catch (e) {
      console.log(2, e);

      return [];
    }
  } catch (e) {
    console.log(1, e);

    return [];
  }
};
