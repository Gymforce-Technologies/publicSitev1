import React, { useState } from 'react';
// import { IoMdClose } from 'react-icons/io';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, Drawer, Select, Title } from 'rizzui';
 const filterOptions = [
  { label: 'Today', value: 'daily' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Week', value: 'weekly' },
  { label: 'Month', value: 'monthly' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Date Range', value: 'dateRange' }
];
type FilterSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filter: string) => void;
  onShowResults: () => void;
  selectedFilter: string | null;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
};
interface Filters {
  dateRange: string;
  memberName: string;
  startDate: string;
  endDate: string;
}
const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  onFilterChange,
  onShowResults,
  selectedFilter,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  const [filters, setFilters] = useState<Filters>({
    dateRange: "",
    memberName: "",
    startDate: "",
    endDate: "",
  });
  const handleFilterChange = (filter: string) => {
    onFilterChange(filter);
  };

  const handleShowResults = () => {
    onShowResults();
    onClose(); // Close the sidebar after showing results
  };

  return (
    <Drawer
    isOpen={isOpen}
    onClose={onClose}
    size='sm'
    >
      <div className='h-full'
      >
        <div className="p-4 relative h-full bg-inherit dark:bg-gray-800">
        <Title as="h3" className="text-gray-900 dark:text-gray-200">Filters</Title>
          <div className="flex flex-col h-full justify-around mb-5">
           <div className=' flex-col h-full mt-4'>
           <Select
                label="Range"
                options={filterOptions}
                onChange={(option: any) => handleFilterChange(option.value)}
                value={filterOptions.find((item) => item.value === selectedFilter)}
                labelClassName="dark:text-gray-200"
                dropdownClassName="dark:bg-gray-800 dark:border-gray-700" 
                optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                />
            {selectedFilter === 'dateRange' && (
              <div className="flex gap-2 mt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Start Date:</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    className="border p-1 rounded mt-1 w-full bg-inherit"
                    selectsStart
                    startDate={startDate?startDate:undefined}
                    endDate={endDate?endDate:undefined}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="YYYY-MM-DD"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">End Date:</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    className="border p-1 rounded mt-1 w-full bg-inherit  "
                    selectsEnd
                    startDate={startDate?startDate:undefined}
                    endDate={endDate?endDate:undefined}
                    minDate={startDate?startDate:undefined}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="YYYY-MM-DD"
                    popperPlacement="bottom-end"
                    calendarClassName="dark:bg-gray-800"
                  />
                </div>
              </div>
            )}
           </div>
           <div className='mb-6 '>
         <Button
           className=' w-full'
            onClick={handleShowResults}
          >
            Show Results
          </Button>
         </div>
          </div>
        
        </div>
      </div>
    </Drawer>
  );
};

export default FilterSidebar;
