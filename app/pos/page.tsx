"use client"

import React from 'react'
import ShoppingCart from './_components/ShoppingCart'

const page = () => {
  return (
    <div>
      <ShoppingCart onCheckout={function (): void {
        throw new Error('Function not implemented.')
      } }/>
    </div>
  )
}

export default page