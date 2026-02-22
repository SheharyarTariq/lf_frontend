"use client"
import React from 'react'
import Link from 'next/link'
import { routes } from '@/components/common/utils/routes'
import { usePathname } from 'next/navigation'
import Button from '@/components/common/Button'

function Header() {
    const currentPage = usePathname()
    return (
        <>
            <header className='bg-black'>
                <div>
                    <h1 className='md:px-[22px] md:py-[16px] lg:px-[30px] lg:py-[23px] text-[24px] leading-[24px]'>LAUNDRY-FREE</h1>
                    <hr />
                </div>

                <div className="flex items-center justify-between px-[30px] py-[19px]">
                    <div>
                        <div className="flex items-center gap-4 font-[500]">
                            <Button variant={`${currentPage == routes.ui.areas ? "secondary" : "outline"}`} className={`text-[20px] ${currentPage == routes.ui.areas ? "" : "text-white"}`}><Link href={routes.ui.areas}>Area</Link></Button>
                            <Button variant={`${currentPage == routes.ui.category ? "secondary" : "outline"}`} className={`text-[20px] ${currentPage == routes.ui.category ? "" : "text-white"}`}><Link href={routes.ui.category}>Category</Link></Button>
                            <Button variant={`outline`} className='text-[20px] text-white ${currentPage == routes.ui.orders ? "" : "text-white"}'>Orders</Button>
                            <Button variant={`outline`} className='text-[20px] text-white ${currentPage == routes.ui.user ? "" : "text-white"}'>User</Button>
                        </div>
                    </div>
                    <div>
                        <button className='bg-white text-black font-[500] py-[5px] text-[20px] rounded-[8px] px-4 cursor-pointer hover:bg-muted'>Logout</button>
                    </div>
                </div>
            </header>
        </>
    )
}

export default Header