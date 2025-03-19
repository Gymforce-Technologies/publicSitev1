"use client";
import AnalysisStats from "@/components/AnalysisStats";
// import RealTimeStatistics from "@/components/RealtimeStats";
import WidgetCard from "@core/components/cards/widget-card";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Empty,
  Loader,
  Modal,
  Switch,
  Text,
  Title,
  Tooltip,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "../../app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import GalleryCard from "./GalleryCard";
import toast from "react-hot-toast";
import Table, { HeaderCell } from "@/components/table";
import { MdDelete, MdEdit, MdRemoveRedEye } from "react-icons/md";
import { formateDateValue } from "../../app/[locale]/auth/DateFormat";

import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";
import Link from "next/link";
import { XIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";

import dynamic from "next/dynamic";
const EditGallery = dynamic(() => import("./GalleryEdit"));
const NewGallery = dynamic(() => import("./GalleryNew"));
const EditOffer = dynamic(() => import("./EditOffer"));
const AddOffer = dynamic(() => import("./NewOffer"));

interface GalleryItem {
  id: number;
  title: string;
  image_type: string;
  description: string;
  is_active: boolean;
  image: string;
  caption: string | null;
  uploaded_at: string;
  gym: number;
  is_featured: boolean;
}

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
  package: any;
  offer_price: any;
}

export default function WebAnalysisSection() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState<"week" | "month" | "year">(
    "year"
  );
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<GalleryItem | null>(null);
  const [offerList, setOfferList] = useState<Offer[]>([]);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isEditOfferOpen, setIsEditOfferOpen] = useState(false);
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const params = useSearchParams();
  const pathname = usePathname();
  useEffect(() => {
    const getProfile = async () => {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      // setQrCode(resp.data.qr_code);
      const qrCode =
        resp.data.associated_gyms.filter(
          (item: any) => item.gym_id === parseInt(gymId ?? "0")
        )[0]?.qr_code ?? "";
      setQrCode(qrCode);
      const urlVal =
        resp.data.associated_gyms.filter(
          (item: any) => item.gym_id === parseInt(gymId ?? "0")
        )[0]?.forceId ?? "";
      setUrl(urlVal);
    };
    getProfile();
  }, []);
  const refresh = async () => {
    console.log("refreshing...");
    invalidateAll();
    await getAnalysis();
  };

  useEffect(() => {
    // Add a small delay to ensure the element exists
    setTimeout(() => {
      const element = document.getElementById("offerList");
      if (element && params.get("section") === "offerList") {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, [pathname]);

  const getAnalysis = async () => {
    const gymId = await retrieveGymId();
    let startDate = "";
    let endDate = "";
    if (dateFilter === "week") {
      startDate = dayjs().startOf("week").format("YYYY-MM-DD");
      endDate = dayjs().endOf("week").format("YYYY-MM-DD");
    } else if (dateFilter === "month") {
      startDate = dayjs().startOf("month").format("YYYY-MM-DD");
      endDate = dayjs().endOf("month").format("YYYY-MM-DD");
    } else {
      startDate = dayjs().startOf("year").format("YYYY-MM-DD");
      endDate = dayjs().endOf("year").format("YYYY-MM-DD");
    }
    const resp = await AxiosPrivate.get(
      `/api/gymwebanalytics/?gym_id=${gymId}&start_date=${startDate}&end_date=${endDate}`,
      {
        id: newID(`analytics-${dateFilter}`),
      }
    );
    console.log(resp.data);
    setAnalysis(resp.data);
  };
  useEffect(() => {
    getAnalysis();
  }, [dateFilter]);

  const getGalleryData = async () => {
    const gymId = await retrieveGymId();
    const resp = await AxiosPrivate.get(
      `/api/list-create-gallery/?gym_id=${gymId}`,
      {
        id: newID(`gallery`),
      }
    );
    setGalleryData(resp.data);
  };
  const getOffers = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/list-create-offers/?gym_id=${gymId}`,
        {
          id: newID(`list-offers`),
        }
      );
      setOfferList(resp.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const deleteOfferFunc = async (id: number) => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(`/api/delete-offer/${id}/?gym_id=${gymId}`);
      toast.success("Offer deleted successfully");
      invalidateAll();
      getOffers();
      // setDeleteOffer(false);
    } catch (error) {
      // toast.error("Failed to delete offer");
      console.error("Error deleting offer:", error);
    }
  };

  useEffect(() => {
    getGalleryData();
    getOffers();
  }, []);

  const handleActiveChnage = async (id: number, status: boolean) => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.patch(`/api/update-offer/${id}/?gym_id=${gymId}`, {
        is_active: !status,
      });
      toast.success("Status updated successfully");
      invalidateAll();
      getOffers();
    } catch (error) {
      toast.error("Failed to update offer status");
      console.error("Error updating offer status:", error);
    }
  };

  const downloadQR = async (format = "svg") => {
    const element = document.querySelector("#qrcode-canvas");
    if (!element) return;

    try {
      let dataUrl;

      if (format === "jpg") {
        dataUrl = await htmlToImage.toJpeg(
          //@ts-ignore
          element,
          {
            quality: 1.0,
            backgroundColor: "white",
            width: 500,
            height: 500,
            style: {
              padding: 24,
              border: 1,
              borderRadius: 20,
              borderStyle: "solid",
            },
          }
        );
      } else {
        // For SVG
        dataUrl = await htmlToImage.toPng(
          //@ts-ignore
          element,
          {
            quality: 1.0,
            backgroundColor: "white",
            width: 500,
            height: 500,
            style: {
              padding: 24,
              border: 1,
              borderRadius: 20,
              borderStyle: "solid",
            },
          }
        );
      }

      const link = document.createElement("a");
      link.download = `gym-qr.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };
  const getColumns = useCallback(
    () => [
      {
        title: (
          <HeaderCell title="S.No" className="text-sm font-semibold mx-auto" />
        ),
        dataIndex: "index",
        key: "index",
        width: 80,
        render: (_: any, __: any, index: number) => (
          <Text className="pl-2">{index + 1}</Text>
        ),
      },
      {
        title: <HeaderCell title="Title" className="text-sm font-semibold" />,
        dataIndex: "title",
        key: "title",
        width: 200,
        render: (title: string) => (
          <Text className="font-semibold capitalize">{title}</Text>
        ),
      },
      {
        title: (
          <HeaderCell title="Duration" className="text-sm font-semibold" />
        ),
        dataIndex: "offer_startDate",
        key: "offer_startDate",
        width: 200,
        render: (date: string, row: Offer) => (
          <Text className="text-nowrap">
            {formateDateValue(new Date(date))} -{" "}
            {formateDateValue(new Date(row.offer_endDate))}
          </Text>
        ),
      },
      {
        title: (
          <HeaderCell title="Description" className="text-sm font-semibold" />
        ),
        dataIndex: "description",
        key: "description",
        width: 250,
        render: (description: string) => (
          <Tooltip content={description} animation="zoomIn">
            <Text className="max-w-xs truncate capitalize">{description}</Text>
          </Tooltip>
        ),
      },
      // {
      //   title: <HeaderCell title="Status" className="text-sm font-semibold" />,
      //   dataIndex: "is_active",
      //   key: "is_active",
      //   width: 100,
      //   render: (isActive: boolean) => (
      //     <Badge color={isActive ? "success" : "secondary"} variant="flat">
      //       {isActive ? "Active" : "Inactive"}
      //     </Badge>
      //   ),
      // },
      {
        title: <HeaderCell title="Status" className="text-sm font-semibold" />,
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number, row: Offer) => (
          <Tooltip content="Status" placement="right-start">
            <div>
              <Switch
                checked={row.is_active === true}
                onChange={async () =>
                  await handleActiveChnage(row.id, row.is_active)
                }
                size="sm"
                className={`ps-2`}
              />
            </div>
          </Tooltip>
        ),
      },
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (id: number, row: Offer) => (
          <div className="flex items-center gap-2 justify-start">
            <ActionIcon
              onClick={() => {
                setEditOffer(row);
                setIsEditOfferOpen(true);
              }}
              variant="text"
            >
              <MdEdit size={20} />
            </ActionIcon>
            <ActionIcon
              onClick={() => {
                setSelectedOffer(row);
                setIsImageModalOpen(true);
              }}
              variant="text"
            >
              <MdRemoveRedEye size={18} />
            </ActionIcon>
            <ActionIcon onClick={() => deleteOfferFunc(row.id)} variant="text">
              <MdDelete size={20} />
            </ActionIcon>
          </div>
        ),
      },
    ],
    []
  );

  const columns = useMemo(() => getColumns(), [getColumns]);

  const ImagePreviewModal = ({
    isOpen,
    setIsOpen,
    offer,
  }: {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    offer: Offer | null;
  }) => {
    if (!offer) return null;

    return (
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-8">
          <div className="min-w-full flex  flex-row justify-between items-center mb-4">
            <Title as="h4">Offer Image</Title>
            <XIcon
              onClick={() => {
                setIsOpen(false);
              }}
              className="cursor-pointer"
            />
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={offer.image}
              alt={offer.title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Modal>
    );
  };
  return (
    <div>
      {analysis !== null && (
        <WidgetCard
          headerClassName="items-center flex-col sm:flex-row gap-4"
          className="w-full"
        >
          {/* Main Content */}
          <div className="flex flex-col md:flex-row items-center lg:justify-between gap-6 border-none p-4">
            {/* Left Section */}
            {/* Right Section - QR Code */}
            <div className="flex max-sm:max-w-[60vw] relative">
              {url ? (
                <div className="grid gap-4">
                  <div className="border-2 rounded-lg p-4 shadow qr-container mx-auto">
                    <QRCodeSVG
                      id="qrcode-canvas"
                      value={`https://app.gymforce.in/gym/${url}`}
                      className="w-32 h-32 md:w-40 md:h-40 lg:size-[200px]"
                      level={"H"}
                    />
                  </div>
                  <div className="flex items-center min-w-full justify-between">
                    <Link href={`/gym/${url}`} target="_blank">
                      <Button className="flex items-center gap-1 text-sm scale-90">
                        View
                        <FiArrowUpRight size={16} />
                      </Button>
                    </Link>
                    <Button
                      onClick={() => downloadQR("jpg")}
                      className="text-sm scale-90"
                    >
                      Download QR
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mx-auto h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 rounded shadow bg-primary-lighter flex items-center justify-center p-4 text-center">
                  <Title as="h6" className="text-sm text-primary/95">
                    Your Personalized Gym QR will be available soon
                  </Title>
                </div>
              )}
            </div>
            <div className="w-full md:w-2/3 space-y-6 max-sm:px-4">
              <div className="flex flex-col gap-6 justify-between ">
                <AnalysisStats data={analysis} />
                <div className="flex items-center gap-6 justify-end mr-4 lg:mr-8">
                  <Tooltip
                    content="Click to See the Stats in Real Time"
                    placement="bottom"
                  >
                    <Button
                      className="text-sm scale-90"
                      onClick={async () => await refresh()}
                    >
                      Refresh
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="mt-8 space-y-4">
            <div className="flex sm:flex-row sm:items-center justify-between gap-4">
              <Title as="h4" className="text-xl md:text-2xl">
                Gallery
              </Title>
              <Button
                onClick={() => setIsDrawerOpen(true)}
                className="max-sm:scale-90"
              >
                Add Gallery Image
              </Button>
            </div>

            {galleryData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-xl max-h-[600px] overflow-y-auto custom-scrollbar">
                {galleryData.map((item) => (
                  <div key={item.id} className="w-full">
                    <GalleryCard
                      item={item}
                      setEditData={setEditData}
                      setIsEditDrawerOpen={setIsEditDrawerOpen}
                      onSuccess={() => {
                        getGalleryData();
                        setIsEditDrawerOpen(false);
                        setEditData(null);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Empty text="No Images" />
              </div>
            )}
          </div>

          {/* Offers Section */}
          <div className="mt-8 space-y-4" id="offerList">
            <div className="flex sm:flex-row sm:items-center justify-between gap-4">
              <Title as="h4" className="text-xl md:text-2xl">
                Offers List
              </Title>
              <Button
                onClick={() => setIsOfferOpen(true)}
                className="max-sm:scale-90"
              >
                Add Offer
              </Button>
            </div>

            <div className="overflow-x-auto">
              {offerList.length > 0 ? (
                <Table
                  variant="minimal"
                  data={offerList}
                  //@ts-ignore
                  columns={columns}
                  scroll={{ y: 500 }}
                  striped
                  className="text-sm mt-4 text-nowrap rounded-sm [&_.rc-table-row:hover]:bg-gray-50 min-w-full"
                />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Empty text="No Offers" />
                </div>
              )}
            </div>
          </div>

          {/* Modals/Drawers */}
          <NewGallery
            isOpen={isDrawerOpen}
            setIsOpen={setIsDrawerOpen}
            onSuccess={() => {
              getGalleryData();
              setIsDrawerOpen(false);
            }}
          />
          <EditGallery
            isOpen={isEditDrawerOpen}
            setIsOpen={setIsEditDrawerOpen}
            onSuccess={() => {
              getGalleryData();
              setIsEditDrawerOpen(false);
              setEditData(null);
            }}
            data={editData || galleryData[0]}
          />
          <AddOffer
            isOpen={isOfferOpen}
            onSuccess={() => {
              getOffers();
              setIsOfferOpen(false);
            }}
            setIsOpen={setIsOfferOpen}
          />
          <ImagePreviewModal
            isOpen={isImageModalOpen}
            setIsOpen={setIsImageModalOpen}
            offer={selectedOffer}
          />
          <EditOffer
            data={editOffer || offerList[0]}
            isOpen={isEditOfferOpen}
            onSuccess={() => {
              getOffers();
              setIsEditOfferOpen(false);
              setEditOffer(null);
            }}
            setIsOpen={setIsEditOfferOpen}
          />
        </WidgetCard>
      )}
    </div>
  );
}
