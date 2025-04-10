import { FaFireAlt, FaDumbbell } from "react-icons/fa";
import { Badge, Button, Text, Title } from "rizzui";
import DateCell from "@core/ui/date-cell";
import Image, { StaticImageData } from "next/image";
interface Offer {
  id: number;
  title: string;
  description: string;
  image: string | StaticImageData;
  offer_startDate: string;
  offer_endDate: string;
  is_active: boolean;
  discounts: string;
  gym: number;
}

const OfferCard: React.FC<{
  offer: Offer;
  onClaimClick: () => void;
}> = ({ offer, onClaimClick }) => {
  // Generate compelling offer text
  const generateOfferText = () => {
    const offerPhrases = [
      `Transform Your Body Quickly!`,
      "Unlock Your Ultimate Fitness Potential",
      "Your Dream Physique Starts Now",
      "Fitness Revolution Awaits You",
    ];

    const selectedPhrase =
      offerPhrases[offer.id % offerPhrases.length] || offerPhrases[0];

    return (
      <div className="space-y-2">
        <Title as="h4" className="max-sm:text-sm flex items-center gap-2">
          <FaFireAlt className="text-orange-500 size-6" />
          {selectedPhrase}
        </Title>
        <Text className="capitalize max-sm:text-xs">{offer.description}</Text>
      </div>
    );
  };

  return (
    <div className="mx-auto transform transition-all shadow-xl rounded-xl p-3 sm:p-6">
      {/* Offer Image with Overlay */}
      <div className="relative">
        <Image
          src={offer.image}
          alt={offer.title}
          width="300"
          height={256}
          priority={true}
          className="w-full object-cover rounded-xl aspect-video"
        />
        <div className="absolute top-4 right-4">
          <Badge
            color={offer.is_active ? "success" : "danger"}
            className="px-3 py-1 text-sm font-semibold"
            variant="flat"
          >
            {offer.is_active ? "Active Offer" : "Inactive"}
          </Badge>
        </div>
      </div>
      {/* Card Content */}
      <div className="space-y-4 p-6">
        {/* Dynamic Offer Text */}
        {generateOfferText()}

        {/* Offer Details */}
        <div className="space-y-3">
          <div className="flex max-sm:flex-col items-start max-sm:gap-2  sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <FaDumbbell size={18} className="scale-x-105" />
              <Text className="font-semibold text-sm text-nowrap max-sm:max-w-[80vw] text-clip capitalize sm:text-base">
                {offer.title}
              </Text>
            </div>
            {offer.discounts ? (
              <Badge
                color="primary"
                variant="flat"
                className="animate-pulse text-nowrap max-sm:self-end"
              >
                {offer.discounts + " Off"}
              </Badge>
            ) : null}
          </div>

          {/* Offer Duration */}
          <div className="flex items-center gap-2">
            <Text className="font-semibold text-red-500">
              Offers Ends on :{" "}
            </Text>
            <DateCell
              date={new Date(offer.offer_endDate)}
              dateFormat="MMM DD, YYYY"
              timeClassName="hidden"
            />
          </div>
        </div>

        <div className="flex items-center justify-center md:hidden">
          <Button
            color="primary"
            className="w-full max-sm:scale-90 sm:text-base py-3 font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors"
            onClick={onClaimClick}
          >
            <FaFireAlt /> Claim Now!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
