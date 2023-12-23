'use client';
import React, { useEffect } from 'react';

import { NextPage } from 'next';
import { useRouter } from 'next/navigation';

import { useUserStore } from '@/app/github/users/store';
import { Loading } from '@/components/loading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { routes } from '@/utils/routes';

const HomePage: NextPage = () => {
  const router = useRouter();
  const { loading, user, loadUser } = useUserStore();

  useEffect(() => void loadUser(), [loadUser]);

  if (!loading && !user) router.replace(routes.configuration);

  if (loading || !user) return <Loading />;

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-24">
      <div className="flex h-[32rem] w-[32rem] cursor-pointer items-center justify-center rounded-2xl bg-zinc-950 shadow active:bg-zinc-800">
        <Avatar className="h-32 w-32">
          <AvatarImage alt={user.login} src={user.avatar_url} />
          <AvatarFallback>{user.login}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default HomePage;
