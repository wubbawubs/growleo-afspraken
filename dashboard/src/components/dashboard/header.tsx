'use client';

import { useAuth } from '@/lib/auth-context';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Image
            src="/images/growleo-logo.png"
            alt="Growleo"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <BellIcon className="h-6 w-6" />
          </button>
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-700">{user?.email}</span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                    >
                      Uitloggen
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}