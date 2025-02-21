import SubscriptionManager from '@/components/SubscriptionManager'
import { getUserSubscription } from '@/server/db/queries'
import React from 'react'

export default async function Settings() {
  const subscription = await getUserSubscription()
  
  return (
    <div className='w-full'>
      <div className='max-w-screen-2xl items-center justify-center max-h-screen p-4 mx-auto sm:p-6 md:p-8 lg:p-12 mt-2 space-y-6 sm:space-y-8 lg:space-y-10'>
        <SubscriptionManager subscription={subscription} />
      </div>      
    </div>
  )
}
