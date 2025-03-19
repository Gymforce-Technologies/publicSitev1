import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  Button,
  Empty,
  Input,
  Loader,
  Modal,
  Text,
  Title,
} from "rizzui";
import {
  Upload,
  FileText,
  ExternalLink,
  UploadCloud,
  X,
  Eye,
} from "lucide-react";
import WidgetCard from "@core/components/cards/widget-card";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { formatDate } from "@core/utils/format-date";
import { IoIosDocument } from "react-icons/io";
import { useRouter } from "next/navigation";
import Pagination from "@core/ui/pagination";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

interface Attachment {
  id: string;
  description: string;
  file: string;
  file_path: string;
  member: string;
  staff: string | null;
  upload_date: string;
}

interface AddAttachmentProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  onUpdate: () => void;
}

export default function Attachments({
  id,
  isValid,
}: {
  id: string;
  isValid: boolean;
}) {
  const [attachments, setAttachments] = useState<Attachment[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const router = useRouter();
  const [auth, setAuth] = useState<boolean>(true);

  const getAttachments = async (): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/member/${id}/attachments/?gym_id=${gymId}&${currentPage ? `page=${currentPage}` : ""}`,
        {
          id: newID(`attachments-${id}-${currentPage ? currentPage : 1}`),
        }
      );
      setTotalPages(resp.data.total_pages);
      setAttachments(resp.data.results);
    } catch (error) {
      console.error("Error fetching attachments:", error);
    }
  };

  const getStatus = async () => {
    const resp = await isStaff();
    setAuth(!resp);
  };
  useEffect(() => {
    getStatus();
    getAttachments();
  }, [id, currentPage]);

  const handleViewAttachment = (url: string): void => {
    window.open(url, "_blank");
  };

  return (
    <WidgetCard
      title="Attachments"
      titleClassName="leading-none "
      headerClassName="mb-3 lg:mb-4"
      className=" grid gap-4 "
      action={
        <div className="flex justify-end mt-4 ">
          <Pagination
            total={totalPages}
            current={currentPage}
            onChange={() => {
              setCurrentPage(currentPage + 1);
            }}
            outline={false}
            rounded="md"
            variant="solid"
            color="primary"
          />
        </div>
      }
    >
      {attachments ? (
        attachments.length > 0 ? (
          <div className="space-y-4 max-w-4xl">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-start justify-between shadow-sm rounded-lg p-4 gap-3 min-w-full "
              >
                <div className="flex items-start gap-3 w-full">
                  <IoIosDocument size={24} />
                  <div className="grid gap-2 w-full">
                    <Text className="font-bold ">
                      {attachment.description.split("--")[0].trim()}
                    </Text>
                    <div className="font-semibold flex flex-col gap-2 md:flex-row md:items-end justify-between">
                      <Text className="text-sm">
                        Uploaded on:{" "}
                        {formatDate(new Date(attachment.upload_date))}
                      </Text>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewAttachment(attachment.file)}
                  className={`flex items-center space-x-1  ${attachment.file_path === "processing" ? "hidden" : ""}`}
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            text="No attachments found"
            className="flex items-center justify-center self-end"
          />
        )
      ) : (
        <Loader variant="spinner" size="xl" className="mx-auto" />
      )}
      <Button
        className="max-sm:scale-90 flex flex-row  gap-2 justify-center items-center transition-transform hover:scale-105 duration-200 font-medium mx-auto"
        onClick={() => {
          if (!isValid) {
            toast.error("Please Subscribe to Proceed Further");
            if (auth) {
              router.push("/subscription/plans");
            }
            // router.push('/centersettings/billing');
            return;
          }
          setIsModalOpen(true);
        }}
      >
        <UploadCloud />
        <span className="">Add Attachment</span>
      </Button>
      <AddAttachment
        open={isModalOpen}
        setOpen={setIsModalOpen}
        id={id}
        onUpdate={() => {
          setCurrentPage(1);
          getAttachments();
        }}
      />
    </WidgetCard>
  );
}

const AddAttachment: React.FC<AddAttachmentProps> = ({
  open,
  setOpen,
  id,
  onUpdate,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [desc, setDesc] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type.startsWith("image/") ||
        selectedFile.type === "application/pdf"
      ) {
        setFile(selectedFile);
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setFile(null);
        setPreview(null);
        setError("Not Supported: Only PDF / Image files are supported");
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const openPDFInNewTab = () => {
    if (preview) {
      window.open(preview, "_blank");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    if (!desc.trim()) {
      setError("Please provide a description");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", desc);

    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/member/${id}/attachments/?gym_id=${gymId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then(() => {
        onUpdate();
        toast.success("Attachment uploaded successfully");
        invalidateAll();
        resetForm();
        setOpen(false);
      });
    } catch (err) {
      setError("Failed to upload attachment. Please try again.");
      toast.error(
        "Something went wrong while uploading attachment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setDesc("");
    setError(null);
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        setOpen(false);
        resetForm();
      }}
      // containerClassName='dark:bg-gray-800 dark:border-gray-700'
    >
      <div className="p-5 md:p-8 mx-auto grid gap-4 ">
        <div className="flex flex-row justify-between items-center mr-2">
          <Title as="h3" className="">
            Add Attachments
          </Title>
          <X
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            className="hover:scale-105 duration-200 cursor-pointer"
          />
        </div>
        <Input
          label="Description *"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Enter description"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf"
          className="hidden"
        />
        <Text className="font-semibold">File * </Text>
        <Button
          onClick={handleUploadClick}
          className=" max-sm:scale-90 flex flex-row gap-2 justify-center items-center transition-transform hover:scale-105 duration-200 font-medium"
        >
          <Upload className="mr-2" size={20} />
          {file && !error ? "Change " : "Upload "} File
        </Button>
        {error && (
          <Alert color="danger" className="mb-4">
            {error}
          </Alert>
        )}
        {file && !error && (
          <div className="mb-4 grid gap-2 font-medium">
            <p className="text-sm">Selected file: {file.name}</p>
            {file.type.startsWith("image/") && preview && (
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-64 max-sm:mx-auto sm:h-auto rounded"
              />
            )}
            {file.type === "application/pdf" && (
              <div className="flex items-center justify-center bg-gray-100 p-4 rounded">
                <FileText className="mr-2" size={24} />
                <span className="mr-2">PDF file selected</span>
                <Button
                  onClick={openPDFInNewTab}
                  className="flex flex-row max-sm:scale-90 gap-2 justify-center items-center transition-transform hover:scale-105 duration-200 font-medium"
                >
                  <ExternalLink className="mr-1" size={20} />
                  Open PDF
                </Button>
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="max-sm:scale-90 flex flex-row justify-center items-center transition-transform hover:scale-105 duration-200 font-medium"
            >
              {isSubmitting ? <Loader variant="threeDot" /> : "Attach"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
