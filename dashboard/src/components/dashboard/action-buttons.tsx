import { Button } from "@/components/ui/button"
import { PlusIcon, CalendarIcon } from '@heroicons/react/24/outline'

export function ActionButtons() {
  return (
    <div className="flex space-x-3">
      <Button className="flex items-center">
        <PlusIcon className="h-5 w-5 mr-2" />
        Nieuwe Afspraak
      </Button>
      <Button variant="secondary" className="flex items-center">
        <CalendarIcon className="h-5 w-5 mr-2" />
        Agenda
      </Button>
    </div>
  )
}