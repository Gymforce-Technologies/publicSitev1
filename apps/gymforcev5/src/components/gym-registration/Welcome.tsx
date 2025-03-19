import Image from "next/image";
import Link from "next/link";
import { Button } from "rizzui";
import logoImg from "@public/svg/icon/gymforce-icon-black.svg";
import logoImgText from "@public/svg/gymforce-text/gymforce-text-black.svg";

export default function Welcome({ nextStep }: { nextStep: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-w-screen min-h-screen flex-shrink-0">
      <div className="flex flex-row flex-nowrap items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 flex flex-1 flex-nowrap">
          <span className="relative w-[max-content] before:absolute before:inset-0 before:animate-typewriter before:bg-white text-gray-900 dark:before:!bg-inherit">
            Welcome to
          </span>
        </h1>
        <Link
          href={"/"}
          className="mb-2 flex max-w-[150px] lg:max-w-[180px] items-center flex-nowrap"
        >
          <Image
            src={logoImg}
            alt="Gymforce"
            className="size-8 lg:size-10 dark:invert"
          />
          <Image
            src={logoImgText}
            alt="Gymforce"
            className="ps-2.5 dark:invert"
          />
        </Link>
      </div>
      <p className="text-lg sm:text-xl mb-8 max-w-4xl text-center">{`We're glad you're here. Flex your management muscles and watch your fitness empire grow. Let's get started!`}</p>
      <Button
        onClick={() => nextStep()}
        className="bg-primary hover:bg-primary-dark"
      >
        Continue
      </Button>
    </div>
  );
}
