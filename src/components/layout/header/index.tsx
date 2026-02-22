"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { routes } from '@/components/common/utils/routes'
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
                        <FormDialog
                            title="Logout"
                            buttonText="Logout"
                            saveButtonText="Confirm"
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