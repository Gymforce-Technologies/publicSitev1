import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import DateCell from "@core/ui/date-cell";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { PiArrowRightBold } from "react-icons/pi";
import { Button, Loader, Modal, Text, Title } from "rizzui";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";

export default function LeadPreview({
  addData,
  closePreview,
  imagePreview,
  isPreviewVisible,
  lock,
  otherDetails,
  recommendedFields,
  requiredFields,
  showSubmit,
}: {
  isPreviewVisible: boolean;
  closePreview: () => void;
  imagePreview: string | null;
  requiredFields: {
    Name: string;
    Phone: string;
    Gender: string;
    Source: string;
    Category: string;
    "Expected Joining": string;
  };
  recommendedFields: {
    Email: string;
    "Date of Birth": string;
    Address: string;
    Country: string;
  };
  otherDetails: {
    "ZIP Code": string;
    Remarks: string;
    "Enquiry Mode": string;
  };
  addData(): Promise<void>;
  showSubmit: boolean;
  lock: boolean;
}) {
  return (
    <Modal
      isOpen={isPreviewVisible}
      onClose={closePreview}
      size="lg"
      containerClassName="p-6 md:p-10 space-y-4"
    >
      <div className=" flex items-center justify-between">
        <Title as="h4" className="">
          Preview Enquiry Details
        </Title>
        <XIcon className="cursor-pointer" onClick={closePreview} />
      </div>
      <div className=" max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          <section>
            <Title as="h6" className=" mb-3">
              Basic Details (Required)
            </Title>
            <div className="grid grid-cols-[40%,60%] ">
              <Image
                src={
                  imagePreview ||
                  (requiredFields.Gender[0]?.toLowerCase() === "f"
                    ? WomanIcon
                    : ManIcon)
                }
                alt="Profile Image"
                width={150}
                height={150}
                className="ml-10 max-sm:ml-4 size-20 object-cover rounded-full"
              />
              <div className="space-y-2">
                {Object.entries(requiredFields).map(([field, value]) => (
                  <div key={field} className="grid grid-cols-[140px,1fr]">
                    <Text className="font-semibold text-gray-900">
                      {field} :
                    </Text>
                    {field === "Date of Birth" ||
                    field === "Expected Joining" ? (
                      <DateCell
                        date={new Date(value)}
                        dateFormat={getDateFormat()}
                        timeClassName="hidden"
                      />
                    ) : field === "Phone" ? (
                      <Text>+{value}</Text>
                    ) : (
                      <Text className="capitalize">{value}</Text>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section>
            <Title
              as="h6"
              className=" mb-3 flex flex-1 sm:flex-nowrap items-center gap-4"
            >
              Recommended Fields
              <Text className="text-sm">
                (Will be Required for Membership & Invoice)
              </Text>
            </Title>
            <div className="space-y-2">
              {/* Display Filled Values */}
              {Object.entries(recommendedFields)
                .filter(([_, value]) => value) // Filter filled values
                .map(([field, value]) => (
                  <div key={field} className="grid grid-cols-2">
                    <Text>{field} :</Text>
                    <Text>{value}</Text>
                  </div>
                ))}
              {/* Display Non-Filled Values */}
              <div className="grid grid-cols-2">
                <Text>Non-Filled Fields:</Text>
                <Text className="text-red-500">
                  {Object.entries(recommendedFields)
                    .filter(([_, value]) => !value) // Filter non-filled values
                    .map(([field]) => field)
                    .join(", ")}{" "}
                  {/* Combine non-filled fields into a single row */}
                </Text>
              </div>
            </div>
          </section>

          <section>
            <Title as="h6" className=" mb-3">
              Other Details
            </Title>
            <div className="space-y-2">
              {/* Display Filled Values */}
              {Object.entries(otherDetails)
                .filter(([_, value]) => value) // Filter filled values
                .map(([field, value]) => (
                  <div key={field} className="grid grid-cols-2">
                    <Text>{field} :</Text>
                    {field === "Expected Joining Date" ? (
                      <DateCell
                        date={new Date(value)}
                        dateFormat={getDateFormat()}
                        timeClassName="hidden"
                      />
                    ) : (
                      <Text>{value}</Text>
                    )}
                  </div>
                ))}
              {/* Display Non-Filled Values */}
              <div className="grid grid-cols-2">
                <Text>Non-Filled Fields:</Text>
                <Text className="text-red-500">
                  {Object.entries(otherDetails)
                    .filter(([_, value]) => !value) // Filter non-filled values
                    .map(([field]) => field)
                    .join(", ")}{" "}
                  {/* Combine non-filled fields into a single row */}
                </Text>
              </div>
            </div>
          </section>
        </div>
      </div>
      <div className="flex justify-end gap-6">
        <Button variant="outline" onClick={closePreview} className="">
          Close
        </Button>
        <Button
          onClick={addData}
          variant="solid"
          // size="lg"
          className="w-full sm:w-auto hover:scale-105 transition-all duration-200 group hover:shadow-sm shadow-gray-800 font-medium"
          disabled={!showSubmit}
        >
          {!lock ? (
            <span className="flex flex-nowrap gap-1 items-center justify-center">
              <span>Add Enquiry</span>{" "}
              <PiArrowRightBold className="ml-2 transition-all group-hover:animate-pulse" />
            </span>
          ) : (
            <Loader variant="threeDot" />
          )}
        </Button>
      </div>
    </Modal>
  );
}
