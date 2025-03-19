// CalendlyButton.tsx
import React, { useEffect } from 'react';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import { Modal } from 'rizzui';
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';

type CalendlyButtonProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  buttonLink: string;
};

const CalendlyButton: React.FC<CalendlyButtonProps> = ({ show, setShow, buttonLink }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useCalendlyEventListener({
    // onProfilePageViewed: () => console.log("onProfilePageViewed"),
    // onDateAndTimeSelected: () => console.log("onDateAndTimeSelected"),
    // onEventTypeViewed: () => console.log("onEventTypeViewed"),
    onEventScheduled: (e) => {
      console.log(e.data.payload);
      toast.success("Event successfully scheduled with our Expert!");
      setShow(false);
    },
    // onPageHeightResize: (e) => console.log(e.data.payload.height),
  });

  return (
    <Modal isOpen={show} onClose={() => setShow(false)} size="full" containerClassName="!p-4 bg-blur">
      <XIcon className="fixed z-[999999999] text-primary-lighter right-8 top-8 cursor-pointer" onClick={() => setShow(false)} />
      <InlineWidget
        url={buttonLink}
        styles={{ height: '720px', width: 'w-auto'}}
        pageSettings={{
          backgroundColor: 'ffffff',
        }}
      />
    </Modal>
  );
};

export default CalendlyButton;