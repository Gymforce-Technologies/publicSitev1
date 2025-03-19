import { useRouter } from 'next/navigation';
import { Bold, Button, Text } from 'rizzui';

export default function ExpandedOrderRow({ record,demographiInfo }: {record:any,demographiInfo:any}) {
  const router=useRouter();
  if (!record) {
    return <Text>No member data available</Text>;
  }
  console.log(record);
  return (
    <div className="bg-gray-0 px-3.5 py-1 dark:bg-inherit dark:text-gray-400">
      <div className="grid grid-cols-12 w-full items-center gap-4">
        <Text className=" text-sm font-medium flex justify-end gap-2 col-span-3">
          <Bold className=' dark:text-gray-200'>Price : </Bold> 
          <span className='font-medium'>
            {record.membership_price?demographiInfo.currency_symbol+record.membership_price:"N/A"}
          </span>
        </Text>
        <Text className="text-sm dark:text-gray-400 flex justify-end items-center gap-2 col-span-3">
          <Bold className=' dark:text-gray-200'>Discount: </Bold> 
          <span className='font-medium'>
            {record.membership_discount?record.membership_discount:"N/A"}
          </span>
        </Text>
        <Text className=" text-sm pl-2 dark:text-gray-400 flex justify-end items-center gap-2 col-span-3">
          <Bold className=' dark:text-gray-200'>Start Date : </Bold> 
          <span className='font-medium'>
            {record.start_date?record.start_date:"N/A"}
          </span>
        </Text>
        <Button onClick={()=>{
          router.push(`/member_profile/yk62-${record.member_id}-71he`)
          // yk$6372h$e
        }} className='col-span-2'>
          <span className='font-medium'>
            View Info {` ->`}
          </span>
        </Button>
      </div>
    </div>
  );
}