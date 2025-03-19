import Image from "next/image";
import { Modal, Button, Title, Text } from "rizzui";
import LaptopImg from "@public/welcome-laptop.png"; // Smaller version of image
import MobileImg from "@public/welcome-mobile.png"; // Smaller version of image
import { XIcon } from "lucide-react";

export default function PWAPrompt({
  show,
  onClose,
  handleInstall,
}: {
  show: boolean;
  onClose: () => void;
  handleInstall: () => void;
}) {
  return (
    <Modal isOpen={show} onClose={onClose} containerClassName="p-6">
      <div className="flex items-center justify-end">
        <XIcon
          onClick={onClose}
          className="text-primary cursor-pointer size-[30px] hover:scale-105"
        />
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center">
          <Image src={MobileImg} alt="PWA Mobile" className="max-w-[80px]" />

          <Image
            src={LaptopImg}
            alt="PWA Install"
            className="aspect-square max-w-[180px] mx-auto"
          />
        </div>

        <Title as="h3" className="mb-4 text-xl font-bold">
          Install Our App
        </Title>

        <Text className="mb-6 text-gray-500 max-w-[300px]">
          Get the best experience by installing our Application on your device.
        </Text>

        <div className="flex gap-4">
          <Button
            color="primary"
            // size="lg"
            onClick={handleInstall}
            className="px-4 "
          >
            Install Now
          </Button>
          <Button
            variant="outline"
            // size="lg"
            onClick={onClose}
            className="px-4"
          >
            Not Now
          </Button>
        </div>
      </div>
    </Modal>
  );
}
