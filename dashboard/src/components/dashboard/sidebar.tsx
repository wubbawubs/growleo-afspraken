import { HomeIcon, CalendarIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon, PlusCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'Nieuwe Afspraak', 
    href: '/dashboard/afspraken/nieuw', 
    icon: PlusCircleIcon,
    highlight: true 
  },
  { name: 'Klanten', href: '/dashboard/klanten', icon: UsersIcon },
  { name: 'Statistieken', href: '/dashboard/statistieken', icon: ChartBarIcon },
  { name: 'Email Instellingen', href: '/dashboard/email', icon: EnvelopeIcon },
];

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <div className="fixed h-full bg-white shadow-lg">
      <div className="flex h-full flex-col px-4 py-4">
        <nav className="flex-1 pt-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg px-3 py-2 transition-colors ${
                      isActive
                        ? 'bg-growleo-blue text-white'
                        : 'text-gray-600 hover:bg-orange-50 hover:text-growleo-orange'
                    }`}
                  >
                    <item.icon className={`h-6 w-6 ${!collapsed && 'mr-3'}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}