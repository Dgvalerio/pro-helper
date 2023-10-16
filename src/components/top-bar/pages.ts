import { UrlObject } from 'url';

type Url = string | UrlObject;

export const pages: {
  route: Url;
  page: string;
  subItems?: { page: string; route: string; description: string }[];
}[] = [
  { route: '/', page: 'Home' },
  { route: '/configuration', page: 'Configurações' },
];
