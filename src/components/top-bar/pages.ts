import { UrlObject } from 'url';

type Url = string | UrlObject;

export const pages: {
  route: Url;
  page: string;
  subItems?: { page: string; route: string; description: string }[];
}[] = [
  { route: '/', page: 'Home' },
  {
    route: '/github',
    page: 'Github',
    subItems: [
      {
        route: '/github/repositories',
        page: 'Repositórios',
        description: 'Listagem de todos os repositórios que você tem acesso.',
      },
      {
        route: '/github/branches',
        page: 'Branches',
        description: 'Listagem de todas as branches de um repositório.',
      },
    ],
  },
  { route: '/configuration', page: 'Configurações' },
];
