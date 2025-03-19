"use client";

import { getColumns } from "./columns";
// import { expensesData } from "@/data/Expenses-data";
import WidgetCard from "@/components/cards/widget-card";
import { useCallback, useState, useMemo } from "react";
import { useTable } from "@core/hooks/use-table";
import { useColumn } from "@core/hooks/use-column";
import ControlledTable from ".";
// import { PiMagnifyingGlassBold } from "react-icons/pi";
// import { Input } from "rizzui";
// import { dummyPayments } from "@/data/paymentsmodesdata";

import { useEffect } from "react";
import axios from "axios";
// import Cookies from "js-cookie";
import { getAccessToken } from "@/app/[locale]/auth/Acces";
import { DatePicker } from "@core/ui/datepicker";
import { Title } from "rizzui";

const filterState = {
  date: [null, null],
  status: "",
};

export default function GalleryTable() {
  const [pageSize, setPageSize] = useState(7);
  const [isOpen, setIsOpen] = useState(false);
  const [editConform,setEditConform]=useState<any |null>(null)
  const [expenses, setExpenses] = useState([]);
  const [gymId, setGymId] = useState(null);
  const [dataCount, setDataCount] = useState(0);
  const [Loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [offerDate,setOfferDate]=useState(null)
  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });
  const onDeleteItem = useCallback((id: string) => {
    handleDelete(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const openModal = () => {
    setIsOpen(!isOpen);
  };
  const closeModal = () => {
    setIsOpen(false);
  };
  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    totalItems,
    handlePaginate,
    filters,
    updateFilter,
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    selectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleDelete,
    handleReset,
  } = useTable(expenses, pageSize, filterState);
  const columns = useMemo(
    () =>
      getColumns({
        data: expenses,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem: (id: string) =>{setDeleteConfirm(id)},
        onChecked: handleRowSelect,
        handleSelectAll,
        handleUpdate:(data:string)=>{
          console.log("edit",data)
          setEditConform(data)}
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedRowKeys,
      onHeaderCellClick,
      sortConfig.key,
      sortConfig.direction,
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
    ]
  );

  useEffect(() => {
    const fetchgymId = async () => {
      try {
        const token = await getAccessToken();
        const URL = `${process.env.NEXT_PUBLIC_URL}/api/profile/`;
        const response = await axios.get(URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setGymId(response.data.gym_id);
      } catch (error) {
        console.log(error);
      }
    };
    fetchgymId();
  }, []);
  const fetchExpenses =useCallback( async () => {
    try {
      const token = await getAccessToken();
      const URL = `${process.env.NEXT_PUBLIC_URL}/api/list-expenses/`;
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        params: {
          page: page,
          page_size: pageSize,
        },
      });
      setExpenses(response.data.results);
      setDataCount(response.data.count);
    } catch (error) {
      console.error("Error fetching the transactions:", error);
    } finally {
      setLoading(false);
    }
  },[page,pageSize]);
  const handleDeleteItem = async (id: string) => {
    try {
      const token = await getAccessToken();
      const URL = `${process.env.NEXT_PUBLIC_URL}/api/delete-expense/${id}/`;
      await axios.delete(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      await fetchExpenses(); // Re-fetch transactions after deletion
    } catch (error) {
      console.log(error);
    } finally {
      
      setDeleteConfirm(null); // Close the confirmation popup
    }
  };
  useEffect(() => {
    fetchExpenses();
  }, [pageSize, page, isOpen,fetchExpenses]);
  useEffect(() => {
    console.log("expenses updated:", expenses);
    console.log("id", gymId);
  }, [expenses, gymId]);
  const handleExpenseUpdated = () => {
    fetchExpenses(); // Refresh data after an expense is updated
  };
  const handleFileChange = (event:any) => {
    const file = event.target.files[0];
    if (file) {
      console.log(file);
      // Handle the file upload here
    }
  };
  const { visibleColumns } = useColumn(columns);
  return (
    <div className="flex flex-col gap-3">
      <Title as='h3'>Upload New Offer</Title>
      <div className="flex flex-col gap-3">
      <WidgetCard
      headerClassName="mb-6 items-start flex-col @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="w-full ps-0 items-center"
      action={
          <div className=" flex w-full items-center   gap-5 @[35rem]:flex-row @[57rem]:mt-0">
            <div className="flex flex-col gap-1">
              <p>select image (1mb)</p>
                <input
              className="w-fullss @[35rem]:w-auto @[70rem]:w-80 border pt-1 pb-1"
              type="file"
             onChange={(event) => handleFileChange(event.target.value)}
            
            />
            </div>
            <div className="flex gap-1 flex-col">
            <label htmlFor="start_date" className="block font-semibold">
             Valid Till
            </label>
            <DatePicker
              selected={offerDate}
              // onChange={(date:Date) =>{}}
              dateFormat="yyyy-MM-dd"
              className="w-full rounded "
              placeholderText="start date"
              autoComplete='off'
            />
          </div>
          <button
            className={
              "bg-white  text-black rounded-md hover:bg-opacity-70 p-3 mt-4"
            }
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Upload Offer
          </button>
        
        </div>
      }>
      <div className="">
        <Title as='h5'>Offers List</Title>
      </div>
      <ControlledTable
        variant="minimal"
        data={expenses}
        isLoading={isLoading}
        showLoadingText={true}
        // @ts-ignore
        columns={visibleColumns}
        paginatorOptions={{
          pageSize,
          setPageSize,
          total: dataCount,
          current: currentPage,
          onChange: (page: number) => {
            handlePaginate(page);
            setPage(page);
          },
        }}
        className="-mx-1"
      />
    </WidgetCard>
      </div>
    </div>
    
  );
}
