"use client";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { PlusIcon, MinusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidVideos } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";
// import { FaCheckCircle } from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";
import {
  Button,
  Input,
  Loader,
  Title,
  Select,
  Textarea,
  Text,
  MultiSelect,
} from "rizzui";

interface Equipment {
  id: number;
  name: string;
  description?: string;
}

interface TargetMuscle {
  id: number;
  name: string;
  description?: string;
}

interface Prerequisites {
  equipment: Equipment[];
  targetMuscles: TargetMuscle[];
}

export interface NewExercise {
  name: string;
  description: string;
  availability: "free" | "premium";
  type: "rep" | "time";
  reps?: number;
  sets?: number;
  duration?: number;
  restDuration: number;
  targetMuscles: string[];
  equipment: string[];
  level: "beginner" | "intermediate" | "advanced";
  instructions: string[];
  image: string;
  demonstration_url?: string;
}

export default function AddExerciseSection() {
  const [prerequisites, setPrerequisites] = useState<Prerequisites>({
    equipment: [],
    targetMuscles: [],
  });

  const [newExercise, setNewExercise] = useState<NewExercise>({
    name: "",
    description: "",
    availability: "free",
    type: "rep",
    reps: 0,
    sets: 0,
    duration: 0,
    restDuration: 0,
    targetMuscles: [],
    equipment: [],
    level: "beginner",
    instructions: [""],
    image: "",
    demonstration_url: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [urlPreview, setUrlPreview] = useState<{
    type: "youtube" | "vimeo" | "other" | null;
    embedUrl: string | null;
  }>({
    type: null,
    embedUrl: null,
  });
  // Format prerequisites for MultiSelect options
  const equipmentOptions = prerequisites.equipment.map((eq) => ({
    label: eq.name,
    value: eq.name,
    id: eq.id,
  }));

  const muscleOptions = prerequisites.targetMuscles.map((muscle) => ({
    label: muscle.name,
    value: muscle.name,
    id: muscle.id,
  }));

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/exercises-prerequisites/?gym_id=${gymId}`,
          {
            id: newID("exercises-prerequisites"),
          }
        );

        setPrerequisites({
          equipment: response.data.equipments_data || [],
          targetMuscles: response.data.bodyparts_data || [],
        });
      } catch (error) {
        console.error("Error fetching prerequisites:", error);
        toast.error(
          "Something went wrong while loading exercise prerequisites"
        );
      }
    };

    fetchPrerequisites();
  }, []);

  function renderEmptyEquipment(option: any) {
    return (
      <div
        className=" w-full flex flex-row gap-4 md:gap-8 items-center mx-4"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold max-md:text-sm text-nowrap">
          No Equipment Found
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Equipment Sections");
            router.push("/workout/equipments");
          }}
          className="text-primary text-sm max-md:text-xs text-nowrap"
        >
          Add Equipment
          <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  function renderEmptyPart(option: any) {
    return (
      <div
        className=" w-full flex flex-row items-center gap-4 md:gap-8 mx-1"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold max-md:text-sm text-nowrap">
          No Body Part Found
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Body Parts");
            router.push("/workout/body-parts");
          }}
          className="text-primary text-sm  max-md:text-xs text-nowrap"
        >
          Add Body Part
          <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  const handleDemonstrationUrlChange = (url: string) => {
    setNewExercise((prev) => ({
      ...prev,
      demonstration_url: url,
    }));

    // Reset preview
    setUrlPreview({ type: null, embedUrl: null });

    // Check if URL is valid
    if (url) {
      try {
        const parsedUrl = new URL(url);

        // YouTube URL handling
        if (
          parsedUrl.hostname.includes("youtube.com") ||
          parsedUrl.hostname.includes("youtu.be")
        ) {
          let videoId = parsedUrl.searchParams.get("v");

          // Handle youtu.be short links
          if (!videoId && parsedUrl.pathname.length > 1) {
            videoId = parsedUrl.pathname.substring(1);
          }

          if (videoId) {
            setUrlPreview({
              type: "youtube",
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
            });
          }
        }
        // Vimeo URL handling
        else if (parsedUrl.hostname.includes("vimeo.com")) {
          const videoId = parsedUrl.pathname.split("/").pop();
          if (videoId) {
            setUrlPreview({
              type: "vimeo",
              embedUrl: `https://player.vimeo.com/video/${videoId}`,
            });
          }
        }
        // Other URLs
        else {
          setUrlPreview({
            type: "other",
            embedUrl: url,
          });
        }
      } catch (error) {
        console.error("Invalid URL", error);
      }
    }
  };

  const formatRequestBody = () => {
    const equipmentIds = newExercise.equipment
      .map(
        (eqName) => prerequisites.equipment.find((eq) => eq.name === eqName)?.id
      )
      .filter((id) => id !== undefined);

    const muscleIds = newExercise.targetMuscles
      .map(
        (muscleName) =>
          prerequisites.targetMuscles.find(
            (muscle) => muscle.name === muscleName
          )?.id
      )
      .filter((id) => id !== undefined);

    const formattedInstructions = newExercise.instructions
      .filter((instruction) => instruction.trim() !== "")
      .join("\n");

    return {
      name: newExercise.name,
      description: newExercise.description,
      availabilty:
        newExercise.availability[0].toUpperCase() +
        newExercise.availability.slice(1),
      default_sets_time:
        newExercise.type === "time" ? newExercise.duration : 60,
      default_level:
        newExercise.level[0].toUpperCase() + newExercise.level.slice(1),
      required_equipment_ids: equipmentIds,
      target_muscles_ids: muscleIds,
      gyms_ids: [1], // You might want to get this dynamically
      default_reps: newExercise.type === "rep" ? newExercise.reps : 0,
      default_sets: newExercise.type === "rep" ? newExercise.sets : 0,
      default_rest_duration: newExercise.restDuration,
      instructions: formattedInstructions,
      demonstration_url: newExercise.demonstration_url || null,
    };
  };

  const handleCreateExercise = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const gymId = await retrieveGymId();
      const requestBody = formatRequestBody();

      const response = await AxiosPrivate.post(
        `/api/exercises/?gym_id=${gymId}`,
        requestBody
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Exercise created successfully");
        router.push("/workout/exercise");
        invalidateAll();
      }
    } catch (error) {
      console.error("Error creating exercise:", error);
      toast.error("Something went wrong while creating exercise");
    } finally {
      setIsLoading(false);
    }
  };

  // Your existing helper functions for instructions
  const handleAddInstruction = () => {
    setNewExercise((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const handleRemoveInstruction = (index: number) => {
    setNewExercise((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    setNewExercise((prev) => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) =>
        i === index ? value : instruction
      ),
    }));
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 md:px-16 md:gap-y-8 ">
      <div className="flex items-center justify-between mb-4">
        <Title as="h3" className="text-gray-900 ">
          Add Exercise
        </Title>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          label="Name"
          value={newExercise.name}
          onChange={(e) => {
            setNewExercise((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter exercise name"
          labelClassName=""
        />

        <Input
          label="Image URL"
          value={newExercise.image}
          onChange={(e) => {
            setNewExercise((prev) => ({ ...prev, image: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter image URL"
          labelClassName=""
        />
        <Textarea
          label="Description"
          value={newExercise.description}
          onChange={(e) => {
            setNewExercise((prev) => ({
              ...prev,
              description: e.target.value,
            }));
          }}
          className="w-full sm:hidden "
          placeholder="Enter exercise description"
          labelClassName=""
        />
        <Input
          label="Demonstration Video Link"
          value={newExercise.demonstration_url}
          onChange={(e) => handleDemonstrationUrlChange(e.target.value)}
          className="w-full sm:hidden"
          placeholder="Enter Video Like ..."
          labelClassName=""
        />

        <div className="md:col-span-full grid sm:grid-cols-2 gap-6 ">
          <div className="hidden sm:grid">
            <Textarea
              label="Description"
              value={newExercise.description}
              onChange={(e) => {
                setNewExercise((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
              }}
              className="w-full "
              placeholder="Enter exercise description"
              labelClassName=""
            />
            <Input
              label="Demonstration Video Link"
              value={newExercise.demonstration_url}
              onChange={(e) => handleDemonstrationUrlChange(e.target.value)}
              className="w-full"
              placeholder="Enter Video Like ..."
              labelClassName=""
            />
          </div>

          {/* URL Preview */}
          {urlPreview.embedUrl && newExercise.demonstration_url ? (
            <div className="flex flex-col items-center justify-center min-w-full">
              <Title as="h6" className="mb-2">
                Demo Preview
              </Title>
              <div className="w-full max-w-md">
                {urlPreview.type === "youtube" ||
                urlPreview.type === "vimeo" ? (
                  <iframe
                    width="100%"
                    height="256"
                    src={urlPreview.embedUrl}
                    title="Video Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded"
                  />
                ) : (
                  <a
                    href={urlPreview.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Open Link
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="min-w-full flex items-center gap-4 justify-center bg-gray-100 h-[256px] rounded">
              <Text>Video Preview</Text>
              <BiSolidVideos size={48} className="max-sm:size-10" />
            </div>
          )}
        </div>

        <Select
          label="Availability"
          options={[
            { label: "Free", value: "free" },
            { label: "Premium", value: "premium" },
          ]}
          value={
            newExercise.availability[0].toUpperCase() +
            newExercise.availability.slice(1)
          }
          onChange={(option: any) => {
            setNewExercise((prev) => ({
              ...prev,
              availability: option.value,
            }));
          }}
          className="w-full"
          labelClassName=""
        />

        <Select
          label="Type"
          options={[
            { label: "Rep Based", value: "rep" },
            { label: "Time Based", value: "time" },
          ]}
          value={newExercise.type[0].toUpperCase() + newExercise.type.slice(1)}
          onChange={(option: any) => {
            setNewExercise((prev) => ({
              ...prev,
              type: option.value,
            }));
          }}
          className="w-full"
          labelClassName=""
        />

        {newExercise.type === "rep" ? (
          <>
            <Input
              label="Reps"
              type="number"
              value={newExercise.reps}
              onChange={(e) => {
                setNewExercise((prev) => ({
                  ...prev,
                  reps: parseInt(e.target.value),
                }));
              }}
              className="w-full"
              labelClassName=""
            />
            <Input
              label="Sets"
              type="number"
              value={newExercise.sets}
              onChange={(e) => {
                setNewExercise((prev) => ({
                  ...prev,
                  sets: parseInt(e.target.value),
                }));
              }}
              className="w-full"
              labelClassName=""
            />
          </>
        ) : (
          <Input
            type="number"
            label="Duration (seconds)"
            value={newExercise.duration}
            onChange={(e) => {
              setNewExercise((prev) => ({
                ...prev,
                duration: parseInt(e.target.value),
              }));
            }}
            className="w-full"
            labelClassName=""
          />
        )}

        <Input
          type="number"
          label="Rest Duration (seconds)"
          value={newExercise.restDuration}
          onChange={(e) => {
            setNewExercise((prev) => ({
              ...prev,
              restDuration: parseInt(e.target.value),
            }));
          }}
          className="w-full"
          labelClassName=""
        />

        <Select
          label="Level"
          options={[
            { label: "Beginner", value: "beginner" },
            { label: "Intermediate", value: "intermediate" },
            { label: "Advanced", value: "advanced" },
          ]}
          value={
            newExercise.level[0].toUpperCase() + newExercise.level.slice(1)
          }
          onChange={(option: any) => {
            setNewExercise((prev) => ({
              ...prev,
              level: option.value,
            }));
          }}
          className="w-full"
          labelClassName=""
        />
        <MultiSelect
          label="Target Muscles"
          options={
            muscleOptions.length
              ? muscleOptions
              : [{ label: "", value: "", id: 0 }]
          }
          value={newExercise.targetMuscles}
          onChange={(value: any[]) => {
            setNewExercise((prev) => ({
              ...prev,
              targetMuscles: value,
            }));
          }}
          labelClassName=""
          clearable
          onClear={() => {
            setNewExercise((prev) => ({ ...prev, targetMuscles: [] }));
          }}
          getOptionDisplayValue={(option) =>
            muscleOptions.length ? (
              <Text className="text-sm">{option.label}</Text>
            ) : (
              renderEmptyPart(option)
            )
          }
        />

        <MultiSelect
          label="Required Equipment"
          options={
            equipmentOptions.length
              ? equipmentOptions
              : [{ label: "", value: "", id: 0 }]
          }
          value={newExercise.equipment}
          onChange={(value: any[]) => {
            setNewExercise((prev) => ({
              ...prev,
              equipment: value,
            }));
          }}
          labelClassName=""
          clearable
          onClear={() => {
            setNewExercise((prev) => ({ ...prev, equipment: [] }));
          }}
          getOptionDisplayValue={(option) =>
            equipmentOptions.length ? (
              <Text className="text-sm">{option.label}</Text>
            ) : (
              renderEmptyEquipment(option)
            )
          }
        />
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <Title as="h4" className="text-gray-900 ">
            Instructions
          </Title>
          <Button
            variant="text"
            onClick={handleAddInstruction}
            className="flex items-center gap-2"
          >
            Add Step <PlusIcon size={16} />
          </Button>
        </div>
        {newExercise.instructions.map((instruction, index) => (
          <div key={index} className="flex items-center gap-2 mb-2 px-8 ">
            <Input
              value={instruction}
              onChange={(e) => handleInstructionChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              className="w-full"
              prefix={<Text>{`${index + 1}.`}</Text>}
            />
            {index > 0 && (
              <Button
                variant="text"
                onClick={() => handleRemoveInstruction(index)}
              >
                <MinusIcon size={16} />
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button
        onClick={handleCreateExercise}
        className="max-w-xs self-center mt-4"
        disabled={!newExercise.name || !newExercise.description}
      >
        {isLoading ? <Loader variant="threeDot" /> : "Create Exercise"}
      </Button>
    </div>
  );
}
