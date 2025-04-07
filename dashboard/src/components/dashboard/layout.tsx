'use client';

import { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <Sidebar collapsed={sidebarCollapsed} />
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="fixed bottom-4 left-4 rounded-full bg-white p-2 shadow-lg hover:bg-gray-50"
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="h-6 w-6" />
            ) : (
              <ChevronLeftIcon className="h-6 w-6" />
            )}
          </button>
        </div>
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          } p-6`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}