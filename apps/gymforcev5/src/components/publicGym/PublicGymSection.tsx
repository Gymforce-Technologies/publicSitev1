"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, FormEvent, useRef } from "react";
import {
  Avatar,
  Badge,
  Button,
  Text,
  Title,
  Input,
  Textarea,
  ActionIcon,
  Tooltip,
  Select,
} from "rizzui";
import Link from "next/link";
import {
  FaFacebook,
  FaInstagram,
  FaUserCheck,
  // FaWhatsapp,
} from "react-icons/fa6";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoLogoWhatsapp,
} from "react-icons/io";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import toast from "react-hot-toast";
import { MdFeedback, MdGroupAdd } from "react-icons/md";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import GallerySection, {
  GalleryItemProps,
} from "@/components/public-page/Gallery";
import Loader from "../../app/[locale]/loading";

import dynamic from "next/dynamic";
// import { AxiosPublic } from "../../app/[locale]/auth/AxiosPrivate";
import { GlassNavigationButtons } from "@/components/public-page/SwiperNavGlass";
import PublicHeader from "./PublicHeader";
import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";

const TrainersList = dynamic(
  () => import("@/components/public-page/TrainersList")
);
const PublicBooking = dynamic(
  () => import("@/components/booking/BookingPublic")
);
const Turnstile = dynamic(() => import("react-turnstile"));
const FeedbackModal = dynamic(
  () => import("@/components/public-page/FeedBack")
);
const OfferCard = dynamic(() => import("./OfferCard"));

interface Offer {
  id: number;
  title: string;
  description: string;
  image: string;
  offer_startDate: string;
  offer_endDate: string;
  is_active: boolean;
  discounts: string;
  gym: number;
}

export default function PublicGymSection() {
  const { code } = useParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const router = useRouter();
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    enquiry_message: "",
    package_id: null as number | null,
    offer_id: null as number | null,
    source_id: 6,
    gender: "",
    address_country: "",
    address_zip_code: "",
    address_street: "",
  });
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gymId, setGymId] = useState<any>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const contactSectionRef = useRef<HTMLFormElement>(null);
  const [offerList, setOfferList] = useState<Offer[]>([]);
  const params = useSearchParams();
  const [galleryData, setGalleryData] = useState<GalleryItemProps[]>([]);
  const [trainers, setTrainers] = useState<any>([]);

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const resp = await AxiosPublic.get(`/center/initial/${code}/`, {
          id: `Gym-${code}`,
        });
        setInitialData(resp.data);
        setGymId(resp.data.id);
        await getGallery(resp.data.id);
        getTrainerDetails(resp.data.id);
        getOffers(resp.data.id);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching gym data:", error);
        setLoading(false);
        toast.error("Failed to load gym data");
      }
    };

    getInitialData();
  }, []);

  const getGallery = async (gymId: string) => {
    const resp = await AxiosPublic.get(`/center/list-gallery/${gymId}/`, {
      id: `Gym-${gymId}-Gallery`,
    });
    console.log(resp.data);
    setGalleryData(resp.data);
  };

  const getTrainerDetails = async (gymId: string) => {
    const resp = await AxiosPublic.get(`/center/list-trainer/${gymId}/`, {
      id: `Gym-${gymId}-Trainers`,
    });
    setTrainers(resp.data);
    // console.log(resp.data)
  };

  const handlePackageEnquiry = (
    packageName: string,
    packageId: number,
    maxPrice: number
  ) => {
    setEnquiryForm((prev) => ({
      ...prev,
      enquiry_message: `I'm interested in the ${packageName} package. Please provide more details.`,
      package_id: packageId,
      offer_id: null,
      package_offer_price: maxPrice,
    }));

    contactSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOfferClaim = (offer: Offer) => {
    setActiveOffer(offer);
    // Calculate offer price if discounts is a percentage
    const offerPrice = offer.discounts
      ? parseFloat(offer.discounts.replace("%", ""))
      : 0;

    setEnquiryForm((prev) => ({
      ...prev,
      enquiry_message: `I want to claim the ${offer.title} offer. Can you help me with the details about this special ${offer.discounts} off promotion?`,
      offer_id: offer.id,
      package_id: null,
      // package_offer_price: offerPrice,
    }));

    contactSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOffers = async (gymId: string) => {
    try {
      const resp = await AxiosPublic.get(`/center/list-offers/${gymId}/`, {
        id: `Gym-${gymId}-Offers`,
      });
      setOfferList(resp.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEnquiryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEnquirySubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      if (!turnstileToken) {
        toast.error("Please complete the security verification");
        return;
      } // Add basic form fields
      formData.append("name", enquiryForm.name);
      formData.append("email", enquiryForm.email);
      formData.append("phone", enquiryForm.phone);
      formData.append("enquiry_message", enquiryForm.enquiry_message);

      // Add package_id or offer_id if present
      if (enquiryForm.package_id) {
        formData.append("package_id", enquiryForm.package_id.toString());
      }
      if (enquiryForm.offer_id) {
        formData.append("offer_id", enquiryForm.offer_id.toString());
      }
      if (enquiryForm.source_id) {
        formData.append("source_id", enquiryForm.source_id.toString());
      }

      const response = await AxiosPublic.post(
        `/center/new-enquiry/${gymId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Enquiry submitted successfully!", {
        position: "top-right",
      });

      // Reset form
      setEnquiryForm({
        name: "",
        email: "",
        phone: "",
        enquiry_message: "",
        package_id: null,
        offer_id: null,
        source_id: 6,
        gender: "",
        address_country: "",
        address_zip_code: "",
        address_street: "",
      });
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error("Failed to submit enquiry. Please try again.", {
        position: "top-right",
      });
    }
  };

  const PackagesGrid = () => (
    <>
      {initialData?.listPackages.map((pkg: any, index: number) => (
        <div
          key={index}
          className="bg-gray-50 rounded-lg shadow-md p-4 sm:p-6 transform transition hover:scale-105 relative min-w-[292px] sm:min-w-[320px]"
        >
          <Title as="h6" className="py-2 capitalize">
            {pkg.name}
          </Title>
          <Badge
            variant="flat"
            color="secondary"
            className="absolute top-2 right-2 capitalize"
          >
            {pkg.package_type}
          </Badge>
          <div className=" space-y-2 sm:space-y-4">
            <Text className="flex items-center text-base font-semibold gap-1">
              Starts @{" "}
              <Text as="span" className="font-bold text-gray-900">
                {initialData.currency_symbol}
                {pkg.max_price}
              </Text>
            </Text>
          </div>
          <div className="min-w-full flex items-center justify-between scale-90 my-2">
            <div className="flex items-center gap-1">
              <Badge renderAsDot />
              <Text className="font-semibold text-base">
                {pkg.num_of_days % 30 === 0
                  ? `${pkg.num_of_days / 30} Month(s)`
                  : `${pkg.num_of_days} Days`}
              </Text>
            </div>
            <Button
              size="sm"
              className="flex items-center gap-1"
              onClick={() =>
                handlePackageEnquiry(pkg.name, pkg.id, pkg.max_price)
              }
            >
              Enquire Now <IoIosArrowForward />
            </Button>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {loading || !initialData ? (
        <Loader />
      ) : (
        <>
          {/* Header Section */}
          <div className="bg-primary text-gray-100 py-3 md:py-6 sticky top-0 z-[99999]">
            <PublicHeader
              initialData={initialData}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
          {galleryData.length ? <GallerySection items={galleryData} /> : null}
          <div className="p-6 md:p-10 min-w-full">
            <Title className="text-2xl sm:text-3xl md:text-4xl mb-8">
              Quick <span className="text-blue-500">Actions</span>
            </Title>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-4 md:mx-6 lg:mx-8">
                <div className="p-6 bg-blue-100 rounded-lg flex flex-col gap-2">
                  <Title as="h6">Register</Title>

                  <div className="flex items-center min-w-full justify-between">
                    <Text className="text-[13px]">
                      Provide the Details to Join the Gym
                    </Text>{" "}
                    <Button
                      className="flex gap-2 items-center self-end"
                      onClick={() => {
                        router.push(`/${code}/registration`);
                      }}
                    >
                      Continue
                      <MdGroupAdd size={18} />
                    </Button>
                  </div>
                </div>
                <div className="p-6 bg-blue-100 rounded-lg flex flex-col gap-2">
                  <Title as="h6">Book a Session</Title>

                  <div className="flex items-center min-w-full justify-between">
                    <Text className="text-[13px]">
                      Join yourself from the Available Sessions
                    </Text>{" "}
                    <PublicBooking
                      gymId={gymId}
                      paramId={params.get("booking")}
                      paramDate={params.get("booking_date")}
                    />
                  </div>
                </div>

                <div className="p-6 bg-blue-100 rounded-lg flex flex-col gap-2 relative">
                  <Title as="h6">User Login</Title>
                  {/* <Badge
                    variant="flat"
                    size="sm"
                    color="warning"
                    className="absolute top-2 right-2 scale-105"
                  >
                    Comming Soon
                  </Badge> */}
                  <div className="flex items-center min-w-full justify-between">
                    <Text className="text-[13px]">Login to your account</Text>
                    <Button
                      className="flex gap-2 items-center"
                      onClick={() => {
                        router.push(`/${code}/login`);
                      }}
                    >
                      Continue
                      <FaUserCheck size={18} />
                    </Button>
                  </div>
                </div>
                <div className="p-6 bg-blue-100 rounded-lg flex flex-col gap-2">
                  <Title as="h6">Feedback</Title>
                  <div className="flex items-center min-w-full justify-between">
                    <Text className="text-[13px]">Provide Your Experience</Text>
                    <Button
                      className="flex gap-2 items-center"
                      onClick={() => {
                        setIsModalOpen(true);
                      }}
                    >
                      Continue
                      <MdFeedback size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Packages Section */}
          <div className="container mx-auto p-6 sm:p-10 space-y-8">
            <Title as="h2" className="text-2xl sm:text-3xl md:text-4xl ">
              Our <span className="text-blue-500">Packages</span>
            </Title>
            <div className="relative flex w-auto items-center overflow-hidden pl-4 sm:pl-8 rounded">
              <Button
                title="Prev"
                variant="text"
                ref={sliderPrevBtn}
                onClick={() => scrollToTheLeft()}
                className="!absolute -left-1 top-0 z-10 !h-full w-16 sm:w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 3xl:hidden"
              >
                <IoIosArrowBack className="h-5 w-5" />
              </Button>

              <div className="w-full overflow-hidden">
                <div
                  ref={sliderEl}
                  className="custom-scrollbar-x grid grid-flow-col gap-5 custom-scrollbar-x overflow-x-auto scroll-smooth 2xl:gap-6 3xl:gap-8"
                >
                  <PackagesGrid />
                </div>
              </div>

              <Button
                title="Next"
                variant="text"
                ref={sliderNextBtn}
                onClick={() => scrollToTheRight()}
                className="!absolute right-0 top-0 z-10 !h-full w-16 sm:w-20 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 3xl:hidden"
              >
                <IoIosArrowForward className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {offerList.length ? (
            <div className="flex flex-col lg:flex-row items-center p-6 md:p-10">
              <div className="flex flex-col items-center gap-4 max-md:p-4">
                <Title
                  as="h2"
                  className="capitalize text-2xl sm:text-3xl md:text-4xl "
                >
                  Exclusive{" "}
                  <Title
                    as="h2"
                    className="text-blue-500 inline text-2xl sm:text-3xl md:text-4xl "
                  >
                    Offers
                  </Title>{" "}
                  - Grab Yours Now!
                </Title>
                <div className="-mt-2">
                  <span className="inline-block w-40 h-1 bg-blue-500 rounded-full"></span>
                  <span className="inline-block w-3 h-1 mx-1 bg-blue-500 rounded-full"></span>
                  <span className="inline-block w-1 h-1 bg-blue-500 rounded-full"></span>
                </div>

                <Text className="my-2">
                  Don’t wait! Take advantage of our limited-time offer and start
                  your fitness journey today.
                </Text>

                <Button
                  className="animate-bounce hover:animate-none"
                  onClick={() => {
                    // Use the current active offer when button is clicked
                    if (activeOffer) {
                      handleOfferClaim(activeOffer);
                    } else if (offerList.length > 0) {
                      handleOfferClaim(offerList[0]);
                    }
                  }}
                >
                  Grab the Offer Now !!!
                </Button>
              </div>

              <div className="md:mx-auto p-4 pb-6">
                <Swiper
                  spaceBetween={30}
                  slidesPerView={1}
                  modules={[Navigation, Autoplay, Pagination]}
                  navigation={false}
                  loop={true}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                    stopOnLastSlide: false,
                  }}
                  pagination={{ clickable: true }}
                  onSlideChange={(swiper) => {
                    const currentSlideIndex = swiper.activeIndex;
                    if (offerList[currentSlideIndex]) {
                      setActiveOffer(offerList[currentSlideIndex]);
                    }
                  }}
                  onInit={(swiper) => {
                    // Set initial active offer when swiper initializes
                    if (offerList.length > 0) {
                      setActiveOffer(offerList[0]);
                    }
                  }}
                  className="relative  max-w-[100vw] sm:max-w-[90vw] lg:max-w-[50vw]"
                >
                  <GlassNavigationButtons />
                  {offerList.map((offer) => (
                    <SwiperSlide
                      key={offer.id}
                      className="px-4 md:px-6 lg:px-12"
                    >
                      <OfferCard
                        offer={offer}
                        onClaimClick={() => handleOfferClaim(offer)}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          ) : null}
          {/* Trainers */}
          {trainers.length ? <TrainersList trainers={trainers} /> : null}
          {/* Contact */}
          <div className="container p-6 md:p-12 mx-auto">
            <div>
              <Title as="h3">Contact us</Title>

              <Title className="mt-2 px-4 " as="h4">
                Get in touch with {initialData.name}
              </Title>

              <p className="mt-3 px-4 text-gray-500 dark:text-gray-400">
                {`We're excited to help you achieve your fitness goals. Feel free
                to reach out to us with any questions.`}
              </p>
            </div>

            <div className="grid grid-cols-1 mt-10 lg:grid-cols-2 px-4 md:px-16">
              <div className="grid grid-cols-1 max-md:gap-4">
                <div className="min-w-full flex items-start gap-8">
                  <ActionIcon variant="flat" rounded="lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </ActionIcon>

                  <div className="flex flex-col gap-1">
                    <Text className="sm:text-base font-medium">Email</Text>
                    <Text>Contact our team for inquiries</Text>
                    <Link href={`mailto:${initialData.email}`}>
                      <Text className="text-sm text-primary">
                        {initialData.email}
                      </Text>
                    </Link>
                  </div>
                </div>

                <div className="min-w-full flex items-start gap-8">
                  <ActionIcon variant="flat" rounded="lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  </ActionIcon>
                  <div className="flex flex-col gap-1">
                    <Text className="sm:text-base font-medium">Location</Text>
                    <Text>Visit our fitness center</Text>
                    <Text className="text-sm text-primary capitalize">
                      {initialData.street}, {initialData.city}{" "}
                      {initialData.zip_code}, {initialData.state},{" "}
                      {initialData.country}
                    </Text>
                  </div>
                </div>

                <div className="min-w-full flex items-start gap-8">
                  <ActionIcon variant="flat" rounded="lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                  </ActionIcon>
                  <div className="flex flex-col gap-1">
                    <Text className="sm:text-base font-medium">Phone</Text>
                    <Text>{`We're ready to assist you`}</Text>
                    <Link href={`tel:${initialData.contact_no}`}>
                      <Text className="text-sm text-primary">
                        +{initialData.contact_no}
                      </Text>
                    </Link>
                  </div>
                </div>
              </div>
              <form
                method="post"
                onSubmit={(e) => {
                  e.preventDefault(); // Add this
                  handleEnquirySubmit(e);
                }}
                className="grid sm:grid-cols-2 gap-6"
                ref={contactSectionRef}
              >
                <Input
                  type="text"
                  name="name"
                  label="Full Name"
                  value={enquiryForm.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
                {/* {enquiryFields.length ? (
                  enquiryFields.filter(
                    (item: { field: string; required: boolean }) =>
                      item.field === "email"
                  )[0]?.required ? ( */}
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  value={enquiryForm.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
                {/* //   ) : null
                // ) : null}
                // {enquiryFields.length ? ( */}

                {/* //   enquiryFields.filter((item) => item.field === "phone")[0]
                //     ?.required ? ( */}
                <Input
                  type="tel"
                  name="phone"
                  label="Phone Number"
                  value={enquiryForm.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                />
                <Select
                  label="Gender"
                  options={[
                    {
                      label: "Male",
                      value: "Male",
                    },
                    {
                      label: "Female",
                      value: "Female",
                    },
                    {
                      label: "Others",
                      value: "Others",
                    },
                  ]}
                  value={enquiryForm.gender}
                  onChange={(option: any) => {
                    setEnquiryForm((prev) => ({
                      ...prev,
                      gender: option.value,
                    }));
                  }}
                />
                <Textarea
                  name="enquiry_message"
                  label="Your Message"
                  value={enquiryForm.enquiry_message}
                  onChange={handleInputChange}
                  required
                  placeholder="Type your message here"
                  className="col-span-full"
                />
                <div className="flex min-w-full items-center justify-center col-span-full">
                  <Turnstile
                    sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || ""}
                    onVerify={(token) => {
                      console.log("Turnstile verified:", token);
                      setTurnstileToken(token);
                    }}
                    onError={(error) => {
                      console.error("Turnstile error:", error);
                      // Optional: Handle error state
                    }}
                    theme="light"
                    refreshExpired="auto"
                  />
                </div>
                <div className="col-span-full flex justify-center items-center">
                  <Button
                    type="submit"
                    color="primary"
                    className=""
                    onClick={handleEnquirySubmit}
                  >
                    Submit Enquiry
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* WhatsApp Float Button */}
          <div className="fixed bottom-[10vh] z-[99999] right-8">
            <Link
              href={`https://api.whatsapp.com/send?phone=${initialData.whatsapp_number ?? initialData.contact_no}&text=Hi ${initialData.name}, I'm Interested in your Fitness Center. `}
              target="_blank"
            >
              <IoLogoWhatsapp className="text-green-500 size-8 animate-pulse" />
            </Link>
          </div>
        </>
      )}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gymId={gymId}
      />
    </div>
  );
}
