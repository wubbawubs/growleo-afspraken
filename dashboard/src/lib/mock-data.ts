// src/lib/mock-data.ts
import { Client } from '@/types/client';
import { CalendarIcon, UserGroupIcon, ClockIcon } from "@heroicons/react/24/outline";

export const mockStats = [
    {
      title: "Totaal Afspraken",
      value: "28",
      icon: CalendarIcon,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Actieve Klanten",
      value: "4",
      icon: UserGroupIcon,
      trend: { value: 25, isPositive: true }
    },
    {
      title: "Gemiddelde Conversie",
      value: "74%",
      icon: ClockIcon
    }
  ];
  
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Growleo B.V.',
    email: 'info@growleo.nl',
    phone: '020-1234567',
    company: 'Growleo B.V.',
    address: 'Hoofdstraat 1',
    city: 'Amsterdam',
    postalCode: '1012 AA',
    country: 'Nederland',
    calendarIntegration: 'google',
    calendarSettings: {
      type: 'google',
      apiKey: 'mock-api-key-1',
      calendarId: 'primary',
      syncEnabled: true,
    },
    availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    availableDays: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'],
    lastAppointment: '2024-04-01T10:00:00Z',
    nextAppointment: '2024-04-15T14:00:00Z',
    notes: 'Belangrijke klant met maandelijkse afspraken',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-04-01T12:00:00Z',
    status: 'active',
    appointments: [
      { id: '1', date: '2024-03-20', time: '10:00', status: 'accepted' },
      { id: '2', date: '2024-03-21', time: '14:00', status: 'accepted' },
      { id: '3', date: '2024-03-22', time: '11:00', status: 'accepted' },
      { id: '4', date: '2024-03-23', time: '15:00', status: 'cancelled' },
      { id: '5', date: '2024-03-24', time: '09:00', status: 'pending' },
    ],
    conversion: 85
  },
  {
    id: '2',
    name: 'Tech Solutions',
    email: 'info@techsolutions.nl',
    phone: '030-7654321',
    company: 'Tech Solutions B.V.',
    address: 'Techweg 10',
    city: 'Utrecht',
    postalCode: '3511 DT',
    country: 'Nederland',
    calendarIntegration: 'outlook',
    calendarSettings: {
      type: 'outlook',
      clientId: 'mock-client-id-2',
      tenantId: 'mock-tenant-id-2',
      syncEnabled: true,
    },
    availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    availableDays: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'],
    lastAppointment: '2024-03-28T15:30:00Z',
    nextAppointment: '2024-04-28T13:00:00Z',
    notes: 'Kwartaalbespreking voor IT-ondersteuning',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-03-28T16:00:00Z',
    status: 'active',
    appointments: [
      { id: '6', date: '2024-03-25', time: '10:00', status: 'accepted' },
      { id: '7', date: '2024-03-26', time: '14:00', status: 'pending' },
      { id: '8', date: '2024-03-27', time: '11:00', status: 'cancelled' },
    ],
    conversion: 70
  },
  {
    id: '3',
    name: 'Marketing Masters',
    email: 'contact@marketingmasters.nl',
    phone: '010-9876543',
    company: 'Marketing Masters B.V.',
    address: 'Marketingplein 5',
    city: 'Rotterdam',
    postalCode: '3011 BR',
    country: 'Nederland',
    calendarIntegration: 'google',
    calendarSettings: {
      type: 'google',
      apiKey: 'mock-api-key-3',
      calendarId: 'marketing@company.com',
      syncEnabled: true,
    },
    availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    availableDays: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'],
    lastAppointment: '2024-04-02T09:00:00Z',
    nextAppointment: '2024-05-02T09:00:00Z',
    notes: 'Maandelijkse marketing strategie bespreking',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-04-02T10:00:00Z',
    status: 'active',
    appointments: [
      { id: '9', date: '2024-03-28', time: '10:00', status: 'accepted' },
      { id: '10', date: '2024-03-29', time: '14:00', status: 'accepted' },
      { id: '11', date: '2024-03-30', time: '11:00', status: 'accepted' },
      { id: '12', date: '2024-03-31', time: '15:00', status: 'accepted' },
      { id: '13', date: '2024-04-01', time: '09:00', status: 'accepted' },
      { id: '14', date: '2024-04-02', time: '10:00', status: 'accepted' },
    ],
    conversion: 90
  },
  {
    id: '4',
    name: 'Design Studio XYZ',
    email: 'hello@designxyz.nl',
    phone: '040-1122334',
    company: 'Design Studio XYZ B.V.',
    address: 'Designlaan 20',
    city: 'Eindhoven',
    postalCode: '5611 AZ',
    country: 'Nederland',
    calendarIntegration: 'apple',
    calendarSettings: {
      type: 'apple',
      syncEnabled: true,
    },
    availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    availableDays: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'],
    lastAppointment: '2024-03-15T13:00:00Z',
    notes: 'Nieuwe klant, eerste project in bespreking',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-15T14:00:00Z',
    status: 'active',
    appointments: 2,
    conversion: 50
  },
  {
    id: '5',
    name: 'Finance Experts',
    email: 'info@financeexperts.nl',
    phone: '070-5544332',
    company: 'Finance Experts B.V.',
    address: 'Financiestraat 15',
    city: 'Den Haag',
    postalCode: '2511 CK',
    country: 'Nederland',
    calendarIntegration: null,
    availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    availableDays: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'],
    notes: 'Nog geen kalenderintegratie opgezet',
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z',
    status: 'inactive',
    appointments: 0,
    conversion: 0
  },
  {
    id: '6',
    name: 'WebDev Studio',
    email: 'contact@webdev.nl',
    phone: '020-9998877',
    company: 'WebDev Studio B.V.',
    address: 'Developerstraat 42',
    city: 'Amsterdam',
    postalCode: '1013 BC',
    country: 'Nederland',
    calendarIntegration: 'google',
    calendarSettings: {
      type: 'google',
      apiKey: 'mock-api-key-6',
      calendarId: 'primary',
      syncEnabled: true,
    },
    availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    availableDays: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag'],
    status: 'active',
    appointments: [
      { id: '20', date: '2024-03-20', time: '10:00', status: 'accepted' },
      { id: '21', date: '2024-03-21', time: '14:00', status: 'accepted' },
      { id: '22', date: '2024-03-22', time: '11:00', status: 'pending' },
      { id: '23', date: '2024-03-23', time: '15:00', status: 'cancelled' },
    ],
    conversion: 75
  },
  {
    id: '7',
    name: 'Digital Agency XYZ',
    email: 'hello@digitalxyz.nl',
    phone: '020-5556644',
    company: 'Digital Agency XYZ',
    address: 'Digitalaan 15',
    city: 'Rotterdam',
    postalCode: '3014 DA',
    country: 'Nederland',
    calendarIntegration: 'outlook',
    calendarSettings: {
      type: 'outlook',
      syncEnabled: true,
    },
    availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    availableDays: ['Maandag', 'Woensdag', 'Vrijdag'],
    status: 'active',
    appointments: [
      { id: '24', date: '2024-03-24', time: '10:00', status: 'accepted' },
      { id: '25', date: '2024-03-25', time: '14:00', status: 'pending' },
      { id: '26', date: '2024-03-26', time: '11:00', status: 'pending' },
      { id: '27', date: '2024-03-27', time: '15:00', status: 'cancelled' },
      { id: '28', date: '2024-03-28', time: '09:00', status: 'cancelled' },
    ],
    conversion: 60
  },
  {
    id: '8',
    name: 'E-commerce Pro',
    email: 'info@ecompro.nl',
    phone: '020-7778899',
    company: 'E-commerce Pro B.V.',
    address: 'Shopstraat 88',
    city: 'Utrecht',
    postalCode: '3512 EP',
    country: 'Nederland',
    calendarIntegration: 'google',
    calendarSettings: {
      type: 'google',
      syncEnabled: true,
    },
    availableTimes: ['10:00', '11:00', '14:00', '15:00', '16:00'],
    availableDays: ['Dinsdag', 'Woensdag', 'Donderdag'],
    status: 'active',
    appointments: [
      { id: '29', date: '2024-03-29', time: '10:00', status: 'accepted' },
      { id: '30', date: '2024-03-30', time: '14:00', status: 'accepted' },
      { id: '31', date: '2024-03-31', time: '11:00', status: 'accepted' },
      { id: '32', date: '2024-04-01', time: '15:00', status: 'pending' },
    ],
    conversion: 90
  },
  {
    id: '9',
    name: 'Social Media Experts',
    email: 'contact@socialmedia.nl',
    phone: '020-3334455',
    company: 'Social Media Experts B.V.',
    address: 'Socialplein 1',
    city: 'Den Haag',
    postalCode: '2511 SM',
    country: 'Nederland',
    calendarIntegration: 'apple',
    calendarSettings: {
      type: 'apple',
      syncEnabled: true,
    },
    availableTimes: ['09:00', '10:00', '11:00', '14:00'],
    availableDays: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'],
    status: 'active',
    appointments: [
      { id: '33', date: '2024-04-02', time: '10:00', status: 'pending' },
      { id: '34', date: '2024-04-03', time: '14:00', status: 'pending' },
      { id: '35', date: '2024-04-04', time: '11:00', status: 'cancelled' },
    ],
    conversion: 40
  }
];
  
export const mockActivities = [
    {
      id: "1",
      type: "appointment_created",
      description: "Nieuwe afspraak ingepland met Growleo B.V.",
      date: "2024-04-01T10:00:00Z",
      client: "Growleo B.V."
    },
    {
      id: "2",
      type: "appointment_completed",
      description: "Afspraak succesvol afgerond met Tech Solutions",
      date: "2024-03-28T15:30:00Z",
      client: "Tech Solutions"
    },
    {
      id: "3",
      type: "client_added",
      description: "Nieuwe klant toegevoegd: Finance Experts",
      date: "2024-04-01T00:00:00Z",
      client: "Finance Experts"
    }
  ];