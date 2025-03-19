const FILTER_TYPE_KEY = 'filterTypeInfo';

export type FilterType = 'daily' | 'yesterday' | 'weekly' | 'monthly' | 'yearly' | 'all'; 

const isBrowser = (): boolean => typeof window !== 'undefined';

export function setFilterInfo(info: string) {
  if (!isBrowser()) {
    console.error('Error: Not in browser environment. Demographic info not set.');
    return;
  }

  try {
    localStorage.setItem(FILTER_TYPE_KEY,info);
    // console.log('Filter info set successfully:', info);
  } catch (error) {
    console.error('Error setting Filter info:', error);
    throw new Error('Failed to set Filter info');
  }
}

export async function getFilterInfo() {
  if (!isBrowser()) {
    console.error('Error: Not in browser environment. Cannot get Filter info.');
    return 'error';
  }

  try {
    const encryptedInfo = localStorage.getItem(FILTER_TYPE_KEY);
    if (!encryptedInfo) {
      setFilterInfo('all');
      return 'all';
    }
    return encryptedInfo;
  } catch (error) {
    console.log('Error getting demographic info:', error);
    return 'error';
  }
}

export const filterOptions = [
  {label:'All', value: 'all'},
  { label: 'Today', value: 'daily' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Week', value: 'weekly' },
  { label: 'Month', value: 'monthly' },
  { label: 'Year', value: 'yearly' }
];
