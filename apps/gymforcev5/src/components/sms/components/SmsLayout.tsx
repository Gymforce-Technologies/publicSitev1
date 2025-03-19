'use client'
import React, { useState } from 'react'
import SmsHeader from './header'
import SmsTable from './SmsTable'
const SmsLayout = () => {
  const [totalSmsCount,setTotalSmsCount]=useState<number>(0)
  return (
    <div>
        <div className='flex flex-col gap-6'>
            <SmsHeader totalSmsCount={totalSmsCount}/>
            <SmsTable setTotalSmsCount={setTotalSmsCount} />
        </div>
    </div>
  )
}

export default SmsLayout