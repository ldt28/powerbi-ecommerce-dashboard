import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void;
  defaultRange?: 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

export function DateRangeFilter({
  onDateRangeChange,
  defaultRange = 'month',
}: DateRangeFilterProps) {
  const today = new Date();
  
  const getDefaultRange = () => {
    switch (defaultRange) {
      case 'week':
        return { from: subDays(today, 7), to: today };
      case 'quarter':
        return { from: subDays(today, 90), to: today };
      case 'year':
        return { from: subDays(today, 365), to: today };
      case 'month':
      default:
        return { from: startOfMonth(today), to: endOfMonth(today) };
    }
  };

  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange());
  const [selectedPeriod, setSelectedPeriod] = useState<string>(defaultRange);

  const handlePeriodChange = (period: 'week' | 'month' | 'quarter' | 'year') => {
    let newRange: DateRange;
    
    switch (period) {
      case 'week':
        newRange = { from: subDays(today, 7), to: today };
        break;
      case 'quarter':
        newRange = { from: subDays(today, 90), to: today };
        break;
      case 'year':
        newRange = { from: subDays(today, 365), to: today };
        break;
      case 'month':
      default:
        newRange = { from: startOfMonth(today), to: endOfMonth(today) };
    }
    
    setSelectedPeriod(period);
    setDateRange(newRange);
    onDateRangeChange(newRange);
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRange = { ...dateRange, from: new Date(e.target.value) };
    setDateRange(newRange);
    setSelectedPeriod('custom');
    onDateRangeChange(newRange);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRange = { ...dateRange, to: new Date(e.target.value) };
    setDateRange(newRange);
    setSelectedPeriod('custom');
    onDateRangeChange(newRange);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">
            {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
          </span>
          <span className="sm:hidden">
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange(period)}
                className="text-xs"
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div>
              <label className="text-sm font-medium">From Date</label>
              <input
                type="date"
                value={format(dateRange.from, 'yyyy-MM-dd')}
                onChange={handleFromDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">To Date</label>
              <input
                type="date"
                value={format(dateRange.to, 'yyyy-MM-dd')}
                onChange={handleToDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
