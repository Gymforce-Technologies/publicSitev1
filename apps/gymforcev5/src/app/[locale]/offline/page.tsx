import Image from "next/image";
import { Title, Text } from "rizzui";
// import SubscriptionForm from "@/app/shared/subscription-form";
import MaintananceImg from "@public/maintanance.png";

export default function NoNetworkPage() {
  return (
    <div className="flex grow items-center px-6 xl:px-10">
      <div className="mx-auto flex w-full max-w-[1520px] flex-col-reverse items-center justify-between gap-5 text-center lg:flex-row lg:text-start">
        <div>
          <Title
            as="h1"
            className="mb-3 text-[22px] font-bold leading-snug text-gray-1000 sm:text-2xl md:mb-5 md:text-3xl md:leading-snug xl:mb-7 xl:text-4xl xl:leading-normal 2xl:text-[40px] 3xl:text-5xl 3xl:leading-snug"
          >
            Something Went Wrong <br className="hidden sm:inline-block" />{" "}
            Please Check Your <br className="hidden sm:inline-block" /> Internet
            Connection
          </Title>
          <Text className="mb-6 text-sm leading-loose text-gray-500 md:mb-8 xl:mb-10 xl:text-base xl:leading-loose">
            {`We're unable to load the page. Please verify your network connection
            and try again. If the issue persists, check your router or contact
            your internet service provider.`}
          </Text>
          <Text className="mb-4 mt-8 text-sm font-semibold leading-normal text-gray-800 md:mt-10 xl:mb-6 xl:mt-12 xl:text-base">
            Having trouble connecting? Here are some quick tips:
          </Text>
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p>• Refresh the page</p>
            <p>• Check your Wi-Fi or mobile data</p>
            <p>• Restart your router</p>
          </div>
        </div>
        <div className="pt-5 lg:pt-0">
          <Image
            src={MaintananceImg}
            alt="No Network Connection"
            className="aspect-[768/558] max-w-[320px] dark:invert sm:max-w-sm xl:max-w-[580px] 2xl:max-w-[768px]"
          />
        </div>
      </div>
    </div>
  );
}
