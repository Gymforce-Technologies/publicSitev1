import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button, Drawer, Input, Loader, Title } from "rizzui"; 
// Edit.tsx
interface Source {
  id: number;
  leadSourceName: string;
  is_default: boolean;
  is_favorite: boolean;
}

export default function Edit({
  setIsEditOpen,
  fetchSources,
  source,
  setSource,
}: {
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchSources: () => Promise<void>;
  source: Source | null;
  setSource: React.Dispatch<React.SetStateAction<Source | null>>;
}) {
  const [editedSource, setEditedSource] = useState<Source>({
    id: 0,
    leadSourceName: "",
    is_default: false,
    is_favorite: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (source) setEditedSource(source);
  }, [source]);

  const handleEditSource = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.patch(
        `/api/visitor-sources/${editedSource.id}/?gym_id=${gymId}`,
        { leadSourceName: editedSource.leadSourceName }
      );
      setIsEditOpen(false);
      invalidateAll();
      fetchSources();
      setSource(null);
      toast.success("Updated Successfully");
    } catch (error) {
      console.error("Error editing source:", error);
      toast.error("Something went wrong while updating source");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer isOpen={true} onClose={() => setIsEditOpen(false)} size="sm">
      <div className="flex flex-col gap-3 p-4 md:p-6 h-full">
        <div className="flex items-center justify-between mb-2">
          <Title as="h3" className="text-gray-900">
            Edit Source
          </Title>
          <XIcon
            onClick={() => setIsEditOpen(false)}
            className="cursor-pointer"
          />
        </div>
        <div className="flex flex-col justify-between h-full">
          <Input
            label="Name"
            value={editedSource.leadSourceName}
            onChange={(e) =>
              setEditedSource((prev) => ({
                ...prev,
                leadSourceName: e.target.value,
              }))
            }
            className="w-full"
            placeholder="Enter source name"
          />
          <div className="flex justify-center items-center mt-4">
            <Button
              onClick={handleEditSource}
              className="max-w-xs self-center w-full"
            >
              {isLoading ? <Loader variant="threeDot" /> : "Update"}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
