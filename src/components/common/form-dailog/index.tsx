"use client"
import React, { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

type TriggerVariant = "primary" | "delete" | "logout";
type SubmitVariant = "primary" | "delete";

interface FormDialogProps {
  title: string;
  buttonText: React.ReactNode;
  saveButtonText: string;
  children?: React.ReactNode;
  onSubmit: (formData: Record<string, string>) => Promise<boolean>;
  loading?: boolean;
  triggerVariant?: TriggerVariant;
  submitVariant?: SubmitVariant;
}

const triggerStyles: Record<TriggerVariant, string> = {
  primary: "bg-black text-white hover:bg-neutral-700",
  delete: "bg-delete text-white hover:bg-red-700",
  logout: "bg-white text-black hover:bg-muted",
};

const submitStyles: Record<SubmitVariant, string> = {
  primary: "bg-black text-white hover:bg-neutral-700",
  delete: "bg-delete text-white hover:bg-red-700",
};

export default function FormDialog({
  title,
  buttonText,
  saveButtonText,
  onSubmit,
  loading = false,
  children,
  triggerVariant = "primary",
  submitVariant = "primary",
}: Readonly<FormDialogProps>) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit({});
      if (success) {
        handleClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDeleteVariant = submitVariant === "delete";

  return (
    <>
      <button
        className={`px-4 py-[5px] rounded-[8px] font-[500] text-[20px] cursor-pointer transition-colors duration-200 ${triggerStyles[triggerVariant]}`}
        onClick={handleClickOpen}
      >
        {buttonText}
      </button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '14px',
              fontFamily: 'var(--font-poppins)',
            },
          },
        }}
      >
        {isDeleteVariant ? (
          <>
            <div className="flex flex-col items-center pt-8 pb-4 px-[30px]">
              <Image
                src="/assets/Dialog_Cross.svg"
                alt="Delete"
                width={90}
                height={90}
              />
              <div className="text-center mt-5 text-[18px] font-[400] leading-[100%] tracking-[0%]">
                {children}
              </div>
            </div>
            <DialogActions sx={{ justifyContent: 'center', gap: '12px', pb: '30px', px: '30px' }}>
              <button
                className="px-8 py-2.5 rounded-[8px] font-[500] cursor-pointer transition-colors duration-200 border border-muted text-black hover:bg-gray-50 min-w-[120px]"
                onClick={handleClose}
              >
                No
              </button>
              <button
                className={`px-8 py-2.5 rounded-[8px] font-[500] cursor-pointer transition-colors duration-200 ${submitStyles[submitVariant]} disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]`}
                onClick={handleSubmit}
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? "Deleting..." : saveButtonText}
              </button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '30px', borderBottom: '1px solid #EAEAEA' }}>
              <span className="text-[20px] font-[600] text-black">{title}</span>
              <button
                onClick={handleClose}
                className="text-neutral hover:text-black transition-colors cursor-pointer"
              >
                <X size={22} />
              </button>
            </DialogTitle>

            {children && (
              <DialogContent sx={{ p: '30px' }}>
                {children}
              </DialogContent>
            )}

            <DialogActions sx={{ p: '30px', borderTop: children ? '1px solid #EAEAEA' : 'none' }}>
              <button
                className={`px-6 py-2 rounded-[8px] font-[500] cursor-pointer transition-colors duration-200 ${submitStyles[submitVariant]} disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={handleSubmit}
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? "Saving..." : saveButtonText}
              </button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
