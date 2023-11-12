import { routes } from '@/utils/routes';

import { UrlObject } from 'url';

export type Url = string | UrlObject;

export const pages: {
  route: Url;
  page: string;
  subItems?: { page: string; route: Url; description: string }[];
}[] = [
  { route: routes.home, page: 'Home' },
  {
    route: '/github',
    page: 'Github',
    subItems: [
      {
        route: routes.github.repositories,
        page: 'Repositórios',
        description: 'Listagem de todos os repositórios que você tem acesso.',
      },
      {
        route: routes.github.branches,
        page: 'Branches',
        description: 'Listagem de todas as branches de um repositório.',
      },
      {
        route: routes.github.commits,
        page: 'Commits',
        description: 'Listagem de todos os commits de uma branch.',
      },
      {
        route: routes.github.pullRequests,
        page: 'Pull Requests',
        description: 'Listagem de todas os Pull Requests de um repositório.',
      },
    ],
  },
  { route: routes.configuration, page: 'Configurações' },
];
