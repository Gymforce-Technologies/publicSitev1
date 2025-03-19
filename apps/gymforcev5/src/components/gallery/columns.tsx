'use client';
// import { IoMdCloudDownload } from "react-icons/io";

import { HeaderCell } from '@/components/table';
import { Text, Checkbox, ActionIcon, Tooltip } from 'rizzui';
// const statusColorClassName = {
//   Complete: 'text-green-dark before:bg-green-dark',
//   Pending: 'before:bg-orange text-orange-dark',
//   Canceled: 'text-red-dark before:bg-red-dark',
// };

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  handleUpdate: (data: any) => void;
};

export const getColumns = ({
  handleSelectAll,
  sortConfig,
  onDeleteItem,
  onHeaderCellClick,
  data,
  checkedItems,
  onChecked,
  handleUpdate
}: Columns) => [
  {
    title: <HeaderCell title="Sr No" />,
    onHeaderCell: () => onHeaderCellClick('date'),
    dataIndex: 'expense_date',
    key: 'expense_date',
    width: 100,
    render: (date: string) => <Text>{date}</Text>,
  },
  {
    title: <HeaderCell title="Image" />,
    dataIndex: 'category',
    key: 'category',
    width: 100,
    render: (image:string) => <img src={image} alt="image"/>,
  },
  {
    // Need to avoid this issue -> <td> elements in a large <table> do not have table headers.
    title: <HeaderCell title="Action" className="" />,
    dataIndex: 'action',
    key: 'action',
    width: 100,
    render: (_: string, row: any) => (
      <div className="flex items-center justify-end gap-4 pe-3">
        <Tooltip
          size="sm"
          content={'Delete Expense'}
          placement="top"
          color="invert"
        >
           <button className="py-3 px-2 bg-white rounded-md text-black" onClick={async()=>{
            onDeleteItem(row.id);
           }}>DELETE</button>
        </Tooltip>
        
      </div>
    ),
  },
];
