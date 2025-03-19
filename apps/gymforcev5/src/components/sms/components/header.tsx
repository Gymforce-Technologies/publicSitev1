import React from 'react'

const SmsHeader = ({totalSmsCount}:{totalSmsCount:number}) => {
  return (
    <div>
        <div className='w-[100%] flex justify-between bg-green-600 text-white items-center rounded-md'>
            <p className='text-xl font-semibold p-3'>SMS History</p>
            <div className='flex gap-3 mr-3'>
            <p >Total :</p>
            <p >{totalSmsCount}</p>
            </div>
        </div>
    </div>
  )
}

export default SmsHeader