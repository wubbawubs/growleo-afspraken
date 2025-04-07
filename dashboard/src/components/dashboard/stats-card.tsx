import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline"
import { ElementType } from "react"

interface StatsCardProps {
  title: string;
  value: string;
  icon: ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold mt-1 text-growleo-blue">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                {trend.isPositive ? (
                  <ArrowUpIcon className="w-4 h-4 text-growleo-orange" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ml-1 ${trend.isPositive ? 'text-growleo-orange' : 'text-red-500'}`}>
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          <div className="bg-growleo-blue bg-opacity-10 p-3 rounded-full">
            <Icon className="w-6 h-6 text-growleo-blue" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}