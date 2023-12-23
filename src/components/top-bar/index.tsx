'use client';

import { ComponentPropsWithoutRef, ElementRef, FC, forwardRef } from 'react';

import Link from 'next/link';

import { ModeToggle } from '@/components/theme/toggle';
import { pages } from '@/components/top-bar/pages';
import { NavigationMenu } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const ListItem = forwardRef<ElementRef<'a'>, ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => (
    <li>
      <NavigationMenu.Link asChild>
        <a
          className={cn(
            'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors',
            className
          )}
          ref={ref}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenu.Link>
    </li>
  )
);

ListItem.displayName = 'ListItem';

export const TopBar: FC = () => (
  <div className="flex items-center justify-center border-b border-zinc-100 bg-white dark:border-zinc-900 dark:bg-zinc-950">
    <nav className="flex w-full max-w-4xl justify-between p-4">
      <NavigationMenu.Root>
        <NavigationMenu.List>
          {pages.map(({ page, route, subItems }) => (
            <NavigationMenu.Item key={page}>
              {subItems ? (
                <>
                  <NavigationMenu.Trigger>{page}</NavigationMenu.Trigger>
                  <NavigationMenu.Content>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      {subItems.map((sub) => (
                        <ListItem
                          href={sub.route}
                          key={sub.page}
                          title={sub.page}
                        >
                          {sub.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenu.Content>
                </>
              ) : (
                <Link href={route} legacyBehavior passHref>
                  <NavigationMenu.Link
                    className={NavigationMenu.triggerStyle()}
                  >
                    {page}
                  </NavigationMenu.Link>
                </Link>
              )}
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.List>
      </NavigationMenu.Root>
      <ModeToggle />
    </nav>
  </div>
);
