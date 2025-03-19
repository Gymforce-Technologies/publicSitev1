import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button, Drawer, Input, Loader, Title } from "rizzui";

// Add.tsx
export default function Add({
    setIsCreateModalOpen,
    fetchSources,
  }: {
    setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    fetchSources: () => Promise<void>;
  }) {
    const [newSource, setNewSource] = useState({
      leadSourceName: "",
      is_default: false,
    });
    const [isLoading, setIsLoading] = useState(false);
  
    const handleCreateSource = async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      try {
        setIsLoading(true);
        const gymId = await retrieveGymId();
        await AxiosPrivate.post(`/api/visitor-sources/?gym_id=${gymId}`, newSource);
        setIsCreateModalOpen(false);
        invalidateAll();
        fetchSources();
        toast.success("New Source Added Successfully");
      } catch (error) {
        console.error("Error creating source:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <Drawer isOpen={true} onClose={() => setIsCreateModalOpen(false)} size="sm">
        <div className="flex flex-col gap-3 p-4 md:p-6 h-full">
          <div className="flex justify-between mb-2">
            <Title as="h3" className="text-gray-900">Add Source</Title>
            <XIcon onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer" />
          </div>
          <div className="flex flex-col justify-between h-full">
            <Input
              label="Name"
              value={newSource.leadSourceName}
              onChange={(e) => setNewSource(prev => ({ ...prev, leadSourceName: e.target.value }))}
              className="w-full"
              placeholder="Enter the Source Name"
            />
            <div className="flex justify-center items-center mt-4">
              <Button onClick={handleCreateSource} className="w-full">
                {isLoading ? <Loader variant="threeDot"/> : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    );
  }
  