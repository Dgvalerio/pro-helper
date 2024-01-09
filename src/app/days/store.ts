import { useConfigurationStore } from '@/app/configuration/store';
import { getDays } from '@/app/days/actions';
import { GroupedCommit } from '@/app/days/types';
import { toast } from '@/components/ui/use-toast';

import { format, lastDayOfMonth } from 'date-fns';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DaysStore {
  translate: boolean;
  setTranslate(translate: boolean): void;
  loading: boolean;
  interval: { since: string; until: string };
  setInterval(interval: DaysStore['interval']): DaysStore['interval'];
  repositories: { repository: string; branch: string }[];
  addRepository(repository: string, branch: string): DaysStore['repositories'];
  removeRepository(repository: string): DaysStore['repositories'];
  loadCommits(): Promise<GroupedCommit[]>;
}

const date = new Date();

export const useDaysStore = create<DaysStore>()(
  persist(
    (set, get) => ({
      translate: false,
      loading: false,
      repositories: [],
      interval: {
        since: format(date, 'yyyy-MM-01'),
        until: format(lastDayOfMonth(date), `yyyy-MM-dd`),
      },
      addRepository(
        repository: string,
        branch: string
      ): DaysStore['repositories'] {
        const currentRepositories = get().repositories;

        if (currentRepositories.find((r) => r.repository === repository))
          return currentRepositories;

        const repositories = currentRepositories.concat({ repository, branch });

        set({ repositories });

        return repositories;
      },
      removeRepository(repository: string): DaysStore['repositories'] {
        const repositories = get().repositories.filter(
          (r) => r.repository !== repository
        );

        set({ repositories });

        return repositories;
      },
      setInterval(interval: DaysStore['interval']): DaysStore['interval'] {
        set({ interval });

        return interval;
      },
      setTranslate(translate: boolean): void {
        set({ translate });
      },
      loadCommits: async (): Promise<GroupedCommit[]> => {
        toast({ title: 'Carregando commits...' });

        set({ loading: true });

        try {
          return await getDays({
            interval: get().interval,
            repositories: get().repositories,
            translate: get().translate,
            token: useConfigurationStore.getState().token,
          });
        } catch (e) {
          console.log(e);

          toast({
            title: 'Erro ao carregar os Pull Requests!',
            variant: 'destructive',
          });

          return [];
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: 'pro-helper:days' }
  )
);
