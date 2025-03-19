import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";
import { useEffect, useState } from "react";
import {
  ActionIcon,
  Modal,
  Select,
  Textarea,
  Button,
  Title,
  Loader,
  Text,
} from "rizzui";
import { PiWhatsappLogoBold } from "react-icons/pi";
import { getGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { BsArrowRight } from "react-icons/bs";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function WaModal({
  id,
  number,
}: {
  id: string;
  number: string;
}) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getTemplates = async () => {
      try {
        const gymId = await getGymId();
        const resp = await AxiosPrivate.get(
          `/api/wa-templates/list_favorite/?gym_id=${gymId}`
        );
        // console.log(resp);
        setTemplates(resp.data);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      }
    };

    getTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      const getLink = async () => {
        try {
          setLoading(true);
          const gymId = await getGymId();
          const resp = await AxiosPrivate.get(
            `/api/wa-send-whatsapp/${id}/${selectedTemplate}/?gym_id=${gymId}`
          );
          setWhatsappUrl(resp.data.whatsapp_url);
          setMessage(resp.data.whatsapp_url.split("=")[1]);
        } catch (error) {
          console.error("Failed to fetch template content:", error);
        } finally {
          setLoading(false);
        }
      };
      getLink();
    } else {
      setMessage("");
      setWhatsappUrl("");
    }
  }, [id, selectedTemplate]);

  const handleOpenModal = () => setIsOpen(true);

  const handleContinueToWhatsApp = () => {
    let finalUrl;
    if (selectedTemplate) {
      const encodedMessage = encodeURIComponent(message);
      finalUrl = whatsappUrl.split("?")[0] + `?text=${encodedMessage}`;
    } else {
      finalUrl = `https://wa.me/${number}`;
    }
    window.open(finalUrl, "_blank");
    handleCloseModal();
  };

  function renderEmptyMessages() {
    return (
      <div
        className=" w-full flex flex-row items-center justify-between"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-sm text-nowrap">No Templates Found</Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to WA Templates Section");
            router.push("/wa-templates");
          }}
          className="text-primary text-xs text-nowrap"
        >
          Add New Template
          <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  const handleCloseModal = () => {
    setIsOpen(false);
    setSelectedTemplate(null);
    setMessage("");
  };

  return (
    <>
      <ActionIcon
        className="hover:text-primary hover:scale-110 duration-150"
        onClick={handleOpenModal}
        variant="text"
      >
        <PiWhatsappLogoBold size={20} />
      </ActionIcon>
      <Modal
        size="sm"
        isOpen={isOpen}
        onClose={handleCloseModal}
        containerClassName=""
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <Title as="h4" className=" ">
              WhatsApp Conversation
            </Title>
            <XIcon onClick={handleCloseModal} className="cursor-pointer" />
          </div>
          <div className="flex flex-col gap-4">
            <Select
              value={templates.find(
                (template: any) => template.id === selectedTemplate || ""
              )}
              onChange={(option: any) =>
                setSelectedTemplate(option?.value || null)
              }
              options={
                templates.length
                  ? templates.map((template: any) => ({
                      value: template.id,
                      label: template.name,
                    }))
                  : [{ value: "", label: "No Templates Found" }]
              }
              label="Select the Message"
              getOptionDisplayValue={(option: any) =>
                templates.length ? (
                  <Text>{option.label}</Text>
                ) : (
                  renderEmptyMessages()
                )
              }
              // labelClassName=""
              // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
              // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            />
            {selectedTemplate &&
              (loading ? (
                <div className="w-full grid grid-cols-1 ">
                  <Text className="place-self-center animate-pulse ">
                    Loading the Template
                  </Text>
                  <Loader
                    className="place-self-center"
                    variant="threeDot"
                    size="xl"
                  />
                </div>
              ) : (
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  label="Message"
                  labelClassName=""
                />
              ))}
            <Button
              onClick={handleContinueToWhatsApp}
              className="flex items-center gap-2"
            >
              <PiWhatsappLogoBold size={24} />
              {selectedTemplate ? " Continue to WhatsApp" : " Chat Directly"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
