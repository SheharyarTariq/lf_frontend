import React from 'react'
import Button from '@/components/common/Button'
import Link from 'next/link'
function Header() {
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
                            <Link href="/" className='text-[20px]'>Area</Link>
                            <Link href="/category" className='text-[20px]'>Category</Link>
                            <p className='text-[20px]'>Orders</p>
                            <p className='text-[20px]'>User</p>
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