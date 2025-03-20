"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Modal } from "rizzui";
import SearchTrigger from "./search-trigger";
import SearchList from "./search-list";
// import { PaymentModal, RenewModal } from "@/components/member-list/Modals";

export default function SearchWidget({
  className,
  placeholderClassName,
  icon,
  t,
}: {
  className?: string;
  icon?: React.ReactNode;
  placeholderClassName?: string;
  t?: (key: string) => string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [func, setFunc] = useState<"Pay" | "Renew" | null>(null);
  const [selectedData, setSelectedData] = useState<any>(null);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const pathname = usePathname();
  useEffect(() => {
    setOpen(() => false);
    return () => setOpen(() => false);
  }, [pathname]);
  const closeModal = () => {
    setFunc(null);
    setSelectedData(null);
  };
  return (
    <>
      <SearchTrigger
        icon={icon}
        className={className}
        onClick={() => setOpen(true)}
        placeholderClassName={placeholderClassName}
        t={t}
      />

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        // overlayClassName="dark:bg-opacity-20 dark:bg-gray-700 dark:backdrop-blur-sm"
        containerClassName=" overflow-hidden "
        className="z-[9999]"
      >
        <SearchList
          onclose={() => setOpen(false)}
          setFunc={setFunc}
          setSelectedData={setSelectedData}
        />
      </Modal>
    </>
  );
}
