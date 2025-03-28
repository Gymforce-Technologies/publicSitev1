// import { ArrowRight, CheckCircle, Phone } from "lucide-react";
import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";
import { FaArrowRight, FaCircleCheck, FaPhone } from "react-icons/fa6";
import { Button, Modal, Text, Title } from "rizzui";

const SuccessModal = ({
  setShowSuccessModal,
  code,
  initialData,
  showSuccessModal,
}: {
  showSuccessModal: boolean;
  setShowSuccessModal: Dispatch<SetStateAction<boolean>>;
  initialData: any;
  code: string;
}) => {
  return (
    <Modal
      isOpen={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      className="z-[99999]"
      size="lg"
    >
      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <FaCircleCheck className="w-8 h-8 text-green-500" />
          </div>
          <Title className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Welcome to {initialData?.name}!
          </Title>
          <Text className="text-gray-600 text-center">
            {`Your registration has been successfully completed. We're
                    excited to be part of your fitness journey!`}
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-primary/5 p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <FaArrowRight className="w-5 h-5 text-primary" />
              <Title as="h6" className="font-semibold text-gray-900">
                Next Steps
              </Title>
            </div>
            <Text className="text-gray-600">
              Our team will reach out soon to confirm your details and schedule
              your first session.
            </Text>
          </div>

          <div className="bg-primary/5 p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <FaPhone className="w-5 h-5 text-primary" />
              <Title as="h6" className="font-semibold text-gray-900">
                Contact Details
              </Title>
            </div>
            <Text className="text-gray-600">
              Phone:{" "}
              {initialData?.contact_no ? (
                <Link href={`tel:${initialData.contact_no}`}>
                  <Text className="text-sm text-primary">
                    +{initialData.contact_no}
                  </Text>
                </Link>
              ) : (
                "Contact front desk"
              )}
              {initialData?.email && (
                <Link href={`mailto:${initialData.email}`}>
                  <Text className="text-sm text-primary">
                    {initialData.email}
                  </Text>
                </Link>
              )}
            </Text>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="solid"
            className="bg-primary hover:bg-primary-dark"
            onClick={() => (window.location.href = `/gym/${code}`)}
          >
            Go to Homepage
          </Button>
          {/* <Button
                    variant="outline"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    Close
                  </Button> */}
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
