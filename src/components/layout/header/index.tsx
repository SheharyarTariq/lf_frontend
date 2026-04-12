"use client";
import React, { useState } from "react";
import Link from "next/link";
import { routes } from "@/utils/routes";
import { usePathname } from "next/navigation";
import Button from "@/components/common/Button";
import { useRouter } from "next/navigation";
import FormDialog from "@/components/common/form-dailog";
import { Menu, X } from "lucide-react";

function Header() {
  const currentPage = usePathname();
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handelLogout = async () => {
    document.cookie = `authtoken=; path=/`;
    router.push(routes.ui.signIn);
    return true;
  };

  const navLinks = [
    { name: "Area", path: routes.ui.areas },
    { name: "Category", path: routes.ui.category },
    { name: "Orders", path: routes.ui.orders },
    { name: "User", path: routes.ui.users },
  ];

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    router.push(path);
  };

  return (
    <>
      <header
        className={`${currentPage == routes.ui.signIn ? "hidden" : "bg-black"} relative px-4 md:px-[30px] py-[16px]`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <h1 className="text-[20px] md:text-[24px] text-nowrap text-white font-[500] uppercase ">
              LAUNDRY - FREE
            </h1>
          </div>

          <nav className="hidden lg:flex items-center justify-center gap-[16px] ">
            {navLinks.map((link) => (
              <Button
                key={link.name}
                onClick={() => router.push(link.path)}
                variant={`${currentPage.startsWith(link.path) ? "secondary" : "outline"}`}
                className={`text-[18px] ${currentPage.startsWith(link.path) ? "" : "text-white"}`}
              >
                {link.name}
              </Button>
            ))}
          </nav>

          <div className="hidden lg:flex flex-1 justify-end">
            <FormDialog
              title="Logout"
              buttonText="Logout"
              saveButtonText="Yes"
              onSubmit={() => handelLogout()}
              loading={confirmLogout}
              triggerVariant="logout"
              submitVariant="delete"
              triggerClassName="text-[18px] py-[10px] md:py-[12px]"
            >
              <p className="mt-3 text-[18px]">
                Are you sure you want to logout?
              </p>
            </FormDialog>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center justify-end flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-1"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-black border-t border-gray-800 flex flex-col items-center gap-4 py-6 z-50 shadow-xl">
            {navLinks.map((link) => (
              <Button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                variant={`${currentPage.startsWith(link.path) ? "secondary" : "outline"}`}
                className={`text-[18px] w-3/4 ${currentPage.startsWith(link.path) ? "" : "text-white"}`}
              >
                {link.name}
              </Button>
            ))}
            <div className="w-3/4 mt-4">
              <FormDialog
                title="Logout"
                buttonText={<div className="w-full text-center">Logout</div>}
                saveButtonText="Yes"
                onSubmit={async () => {
                  const res = await handelLogout();
                  if (res) setIsMobileMenuOpen(false);
                  return res;
                }}
                loading={confirmLogout}
                triggerVariant="logout"
                submitVariant="delete"
                triggerClassName="w-full text-[18px] py-[10px] md:py-[12px]"
              >
                <p className="mt-3 text-[18px]">
                  Are you sure you want to logout?
                </p>
              </FormDialog>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;
