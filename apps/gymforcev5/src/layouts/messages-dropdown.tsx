// MessageDropdown.tsx
"use client";
import React, {
  useState,
  ReactElement,
  ForwardedRef,
} from "react";
import { Popover, Text, Title, Button } from "rizzui";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BiSupport } from "react-icons/bi";
import { FaArrowRight } from "react-icons/fa6";
import Link from "next/link";
import CalendlyButton from "./CalendlyDynamic";

dayjs.extend(relativeTime);

const MessagesList: React.FC<{
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCalendly: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setIsOpen, setShowCalendly }) => {
  const handleBookSlot = () => {
    setIsOpen(false);
    setShowCalendly(true);
  };

  return (
    <>
      <div className="w-[280px] text-left sm:w-[320px] 2xl:w-[360px] p-4 space-y-2.5">
        {/* Header */}
        <div className="bg-primary p-3 flex justify-between items-center rounded-md ">
          <div className="flex items-center gap-4 ">
            <BiSupport className="w-5 h-5 font-semibold text-white" />
            <Title as="h6" className=" font-semibold text-white">
              Customer Support
            </Title>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Contact Information */}
          <div className="space-y-1 px-2.5 py-1">
            <Text className=" font-medium leading-relaxed">
              Live customer support is available from Monday to Friday, 9:00 AM
              to 9:00 PM.
            </Text>
            <Text className=" font-medium mt-2">
              Call us at{" "}
              <Link
                href="tel:+919723462754"
                className="text-primary hover:animate-none hover:scale-110 animate-pulse transition-all duration-500"
              >
                +91 972 346 2754
              </Link>
            </Text>
            <Text className="font-medium mt-2">
              Email us at{" "}
              <Link
                href="mailto:support@gymforce.in"
                className="text-primary hover:scale-110 transition-all duration-500"
              >
                support@gymforce.in
              </Link>
            </Text>
          </div>

          {/* Live Demo Button */}
          <div className="rounded-md p-2.5 space-y-2 group">
            <Text className="font-semibold">
              Schedule a Live Demo with our experts
            </Text>
            <Button
              rounded="pill"
              variant="flat"
              size="sm"
              className="text-primary flex flex-row gap-8 justify-center items-center bg-primary-lighter group-hover:bg-primary group-hover:text-white w-full"
              onClick={handleBookSlot}
            >
              {/* <FaCheckToSlot size={24} className="place-self-center" /> */}
              <span className=" text-nowrap">Book Your Slot</span>
              <FaArrowRight size={20} className="group-hover:animate-pulse" />
            </Button>
          </div>

          {/* Support Ticket Button */}
          <div className="rounded-md p-2.5 flex flex-col justify-center gap-4 group">
            <Text className=" font-semibold">Raise a Support Ticket</Text>
            <Link href="/support/create-ticket">
              <Button
                rounded="pill"
                variant="flat"
                size="sm"
                className="text-primary flex flex-row gap-8 justify-center items-center bg-primary-lighter group-hover:bg-primary group-hover:text-white w-full"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-nowrap">Raising a Support Ticket</span>
                <FaArrowRight className="group-hover:animate-pulse size-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Main component
interface MessageDropdownProps {
  children: ReactElement & { ref?: ForwardedRef<any> };
}

export default function MessageDropdown({ children }: MessageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);

  return (
    <>
      <Popover
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        shadow="sm"
        placement="bottom-end"
        arrowClassName="text-gray-400 "
      >
        <Popover.Trigger>
          {/* {cloneElement(children as any, {
            onClick: () => setIsOpen(!isOpen),
          })} */}
          <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
        </Popover.Trigger>
        <Popover.Content className="z-[9999] p-0 [&>svg]:hidden sm:[&>svg]:inline-flex ">
          <MessagesList
            setIsOpen={setIsOpen}
            setShowCalendly={setShowCalendly}
          />
        </Popover.Content>
      </Popover>

      <CalendlyButton
        show={showCalendly}
        setShow={setShowCalendly}
        buttonLink="https://calendly.com/gymforceofficial/gymforce-demo"
      />
    </>
  );
}
