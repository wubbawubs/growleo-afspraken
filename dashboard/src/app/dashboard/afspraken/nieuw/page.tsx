'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { DayPicker } from 'react-day-picker';
import type { SelectSingleEventHandler } from 'react-day-picker';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

// Stap interface voor de wizard
type Step = 'client' | 'prospect' | 'datetime' | 'confirm';

// Add mock clients data
const clients = [
  {
    name: 'Tech Solutions BV',
    status: 'active',
    appointments: 5,
    conversion: 80
  },
  {
    name: 'Digital Agency XYZ',
    status: 'active',
    appointments: 3,
    conversion: 65
  },
  {
    name: 'WebDev Studio',
    status: 'active',
    appointments: 1,
    conversion: 40
  }
];

export default function NieuweAfspraakPage() {
  const [currentStep, setCurrentStep] = useState<Step>('client');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    client: '',
    prospect: {
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    },
    datetime: null
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Single update function
  const updateProspectInfo = (field: keyof typeof formData.prospect, value: string) => {
    setFormData(prev => ({
      ...prev,
      prospect: {
        ...prev.prospect,
        [field]: value
      }
    }));
  };

  // Stap 1: Klant Selectie Component
  const ClientSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Selecteer een klant</h2>
      <div className="grid gap-4">
        {clients.map((client) => (
          <div
            key={client.name}
            onClick={() => setFormData(prev => ({ ...prev, client: client.name }))}
            className={`rounded-lg border p-4 cursor-pointer transition-all ${
              formData.client === client.name
                ? 'ring-2 ring-growleo-orange bg-orange-50'
                : 'hover:border-growleo-orange'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{client.name}</h3>
                <p className="text-sm text-gray-500">Actieve klant</p>
              </div>
              {formData.client === client.name && (
                <CheckCircleIcon className="h-6 w-6 text-growleo-orange" />
              )}
            </div>
          </div>
        ))}
      </div>
      <Button
        onClick={() => setCurrentStep('prospect')}
        disabled={!formData.client}
        variant="default"
      >
        Volgende
      </Button>
    </div>
  );

  // Stap 2: Prospect Informatie Component
  const ProspectInfo = () => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(formRef.current!);
      const data = Object.fromEntries(formData.entries());
      
      setFormData(prev => ({
        ...prev,
        prospect: {
          name: data.name as string,
          email: data.email as string,
          phone: data.phone as string,
          company: data.company as string,
          notes: data.notes as string
        }
      }));
      
      setCurrentStep('datetime');
    };

    return (
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-semibold">Prospect Informatie</h2>
        <div className="space-y-4">
          {[
            { label: 'Naam', name: 'name', type: 'text' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Telefoon', name: 'phone', type: 'tel' },
            { label: 'Bedrijf', name: 'company', type: 'text' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                defaultValue={formData.prospect[field.name as keyof typeof formData.prospect]}
                className="w-full px-3 py-2 rounded-md border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-growleo-blue
                  hover:border-growleo-orange transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notities
            </label>
            <textarea
              name="notes"
              defaultValue={formData.prospect.notes}
              className="w-full px-3 py-2 rounded-md border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-growleo-blue
                hover:border-growleo-orange transition-colors"
              rows={4}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setCurrentStep('client')}
          >
            Terug
          </Button>
          <Button 
            type="submit"
            variant="default"
            className="flex-1"
          >
            Volgende
          </Button>
        </div>
      </form>
    );
  };

  // Stap 3: Datum & Tijd Selectie Component
  const DateTimeSelection = () => {
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);

    useEffect(() => {
      setAvailableTimes(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
    }, []);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Kies datum en tijd</h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                selected: selectedDate ? [selectedDate] : [],
              }}
              modifiersStyles={{
                selected: {
                  backgroundColor: '#007AFF',
                  color: 'white',
                  borderRadius: '0.375rem',
                }
              }}
            />
          </div>
          
          {selectedDate && (
            <div className="space-y-4">
              <h3 className="font-medium">Beschikbare tijden</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    onClick={() => setSelectedTime(time)}
                    className="w-full justify-center"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setCurrentStep('prospect')}>
            Terug
          </Button>
          <Button 
            variant="default"
            className="flex-1"
            onClick={() => setCurrentStep('confirm')}
            disabled={!selectedDate || !selectedTime}
          >
            Volgende
          </Button>
        </div>
      </div>
    );
  };

  // Stap 4: Bevestiging Component
  const Confirmation = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Bevestig afspraak</h2>
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-medium">Klant</h3>
          <p className="text-gray-600">{formData.client}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium">Prospect</h3>
          <div className="space-y-2 text-gray-600">
            <p>{formData.prospect.name}</p>
            <p>{formData.prospect.email}</p>
            <p>{formData.prospect.phone}</p>
            <p>{formData.prospect.company}</p>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium">Datum & Tijd</h3>
          <p className="text-gray-600">
            {selectedDate?.toLocaleString('nl-NL', {
              dateStyle: 'full',
              timeStyle: 'short'
            })}
          </p>
        </Card>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setCurrentStep('datetime')}>
          Terug
        </Button>
        <Button 
          variant="default"
          className="flex-1"
          onClick={handleSubmit}
        >
          Afspraak inplannen
        </Button>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    // Hier komt de logica voor het opslaan van de afspraak
    try {
      // API call naar backend
      router.push('/dashboard/afspraken');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Render de juiste stap
  const renderStep = () => {
    switch (currentStep) {
      case 'client':
        return <ClientSelection />;
      case 'prospect':
        return <ProspectInfo />;
      case 'datetime':
        return <DateTimeSelection />;
      case 'confirm':
        return <Confirmation />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Nieuwe Afspraak</h1>
          <div className="flex items-center gap-2">
            {['client', 'prospect', 'datetime', 'confirm'].map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={`h-2 w-2 rounded-full ${
                    currentStep === step
                      ? 'bg-growleo-blue'
                      : index < ['client', 'prospect', 'datetime', 'confirm'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
                {index < 3 && (
                  <div
                    className={`h-0.5 w-4 ${
                      index < ['client', 'prospect', 'datetime'].indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}