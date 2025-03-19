import dayjs from 'dayjs';

type DateRangeType = 'normal' | 'upcoming' ;

export const getCurrentDateRange = (range: string, typeVal: DateRangeType = 'normal') => {
    const now = dayjs();
    let startDate: dayjs.Dayjs;
    let endDate: dayjs.Dayjs;
    let infoText = '';

    switch (range.toLowerCase()) {
        case 'daily':
            startDate = now.startOf('day');
            endDate = now.endOf('day');
            infoText = now.format('DD MMM');
            break;
        case 'yesterday':
            startDate = now.subtract(1, 'day').startOf('day');
            endDate = startDate.endOf('day');
            infoText = startDate.format('DD MMM');
            break;
        case 'weekly':
            if (typeVal === 'upcoming') {
                startDate = now;
                endDate = now.endOf('week');
            } else {
                startDate = now.startOf('week');
                endDate = now;
            }
            infoText = `${startDate.format('DD MMM')} - ${endDate.format('DD MMM')}`;
            break;
        case 'monthly':
            if (typeVal === 'upcoming') {
                startDate = now;
                endDate = now.endOf('month');
            } else {
                startDate = now.startOf('month');
                endDate = now;
            }
            infoText = `${startDate.format('DD MMM')} - ${endDate.format('DD MMM')}`;
            break;
        case 'yearly':
            if (typeVal === 'upcoming') {
                startDate = now;
                endDate = now.endOf('year');
            } else {
                startDate = now.startOf('year');
                endDate = now;
            }
            infoText = `${startDate.format('DD MMM')} - ${endDate.format('DD MMM')}`;
            break;
        default:
            return { startDate: '', endDate: '', infoText: '' };
    }

    return {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        infoText
    };
};

export const validateDateRange = (range: string, startDate: string, endDate: string): boolean => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const now = dayjs();
    if (start.isAfter(end)) {
        return false;
    }
    switch (range.toLowerCase()) {
      case 'weekly':
        const weekStart = now.startOf('week');
        const weekEnd = now.endOf('week');
        return (start.isAfter(weekStart) || start.isSame(weekStart)) && (start.isBefore(weekEnd) || start.isSame(weekStart)) 
      case 'monthly':
        const monthStart = now.startOf('month');
        const monthEnd = now.endOf('month');
        return (start.isAfter(monthStart) || start.isSame(monthStart)) && (start.isBefore(monthEnd) || start.isSame(monthEnd)) 

      case 'yearly':
        const yearStart = now.startOf('year');
        const yearEnd = now.endOf('year');
        // return start.isSameOrBefore(yearStart) && end.isSameOrAfter(yearEnd);
        return (start.isAfter(yearStart) || start.isSame(yearStart)) && (start.isBefore(yearEnd) || start.isSame(yearEnd)) 
      default:
        return start.isBefore(end) || start.isSame(end);
    }
  };