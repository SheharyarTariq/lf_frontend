"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { routes } from '@/utils/routes'
import { usePathname } from 'next/navigation'
import Button from '@/components/common/Button'
import { useRouter } from 'next/navigation'
import FormDialog from '@/components/common/form-dailog'

function Header() {
    const currentPage = usePathname()
    const router = useRouter()
    const [confirmLogout, setConfirmLogout] = useState(false)
    const handelLogout = async () => {
        document.cookie = `authtoken=; path=/`;
        router.push(routes.ui.signIn)
        return true
    }
    return (
        <>
            <header className={`${currentPage == routes.ui.signIn ? "hidden" : "bg-black"}`}>
                <div>
                    <h1 className='md:px-[22px] md:py-[16px] lg:px-[30px] lg:py-[23px] text-[24px] text-white leading-[24px]'>LAUNDRY-FREE</h1>
                    <hr className='text-white'/>
                </div>
                <div className="flex items-center justify-between px-[30px] py-[19px]">
                    <div>
                        <div className="flex items-center gap-4 font-[500]">
                            <Button onClick={() => router.push(routes.ui.areas)} variant={`${currentPage.startsWith(routes.ui.areas) ? "secondary" : "outline"}`} className={`text-[20px] ${currentPage.startsWith(routes.ui.areas) ? "" : "text-white"}`}>Area</Button>
                            <Button onClick={() => router.push(routes.ui.category)} variant={`${currentPage.startsWith(routes.ui.category) ? "secondary" : "outline"}`} className={`text-[20px] ${currentPage.startsWith(routes.ui.category) ? "" : "text-white"}`}>Category</Button>
                            <Button onClick={() => router.push(routes.ui.orders)} variant={`${currentPage.startsWith(routes.ui.orders) ? "secondary" : "outline"}`} className={`text-[20px] ${currentPage.startsWith(routes.ui.orders) ? "" : "text-white"}`}>Orders</Button>
                            <Button onClick={() => router.push(routes.ui.users)} variant={`${currentPage.startsWith(routes.ui.users) ? "secondary" : "outline"}`} className={`text-[20px] ${currentPage.startsWith(routes.ui.users) ? "" : "text-white"}`}>User</Button>
                        </div>
                    </div>
                    <div>
                        <FormDialog
                            title="Logout"
                            buttonText="Logout"
                            saveButtonText="Yes"
                            onSubmit={() => handelLogout()}
                            loading={confirmLogout}
                            triggerVariant="logout"
                            submitVariant="delete"
                        >
                            <p className='mt-3'>Are you sure you want to logout?</p>
                        </FormDialog>
                    </div>
                </div>
            </header>
        </>
    )
}

export default Header