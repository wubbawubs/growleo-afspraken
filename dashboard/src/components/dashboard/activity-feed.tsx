import { Activity } from '@/types/activity';
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, UserGroupIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"

interface ActivityFeedProps {
  activities: Activity[]
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'appointment_created':
    case 'appointment_completed':
      return CalendarIcon;
    case 'client_added':
      return UserGroupIcon;
    case 'client_updated':
      return PencilIcon;
    case 'client_deleted':
      return TrashIcon;
    default:
      return CalendarIcon;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'appointment_created':
      return 'text-growleo-orange';
    case 'appointment_completed':
      return 'text-growleo-orange';
    case 'client_added':
      return 'text-growleo-orange';
    case 'client_updated':
      return 'text-growleo-orange';
    case 'client_deleted':
      return 'text-growleo-orange';
    default:
      return 'text-growleo-orange';
  }
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity.type);
        const color = getActivityColor(activity.type);
        
        return (
          <Card key={activity.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${color} mt-0.5`} />
                <div>
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.date).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}