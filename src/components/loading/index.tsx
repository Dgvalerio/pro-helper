import React, { FC } from 'react';

export interface LoadingProps {}

export const Loading: FC<LoadingProps> = () => (
  <main className="fixed bottom-0 left-0 right-0 top-0 z-[1300] flex min-h-[8rem] min-w-[8rem] flex-col items-center justify-center bg-gray-900/40 backdrop-blur-lg">
    <div
      className="flex h-24 w-24 items-center justify-center rounded-[50%] border-2 border-gray-100"
      aria-label="Loading"
    >
      <div className="absolute box-border h-[3.4rem] w-[0.2rem] animate-[spin_12s_linear_infinite] border-t-[2rem] border-gray-100 bg-transparent" />
      <div className="absolute box-border h-[5.4rem] w-[0.2rem] animate-[spin_2s_linear_infinite] border-t-[3rem] border-gray-100 bg-transparent" />
    </div>
  </main>
);
