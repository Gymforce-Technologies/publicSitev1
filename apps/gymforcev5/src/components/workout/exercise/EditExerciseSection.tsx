"use client";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { PlusIcon, MinusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { BiSolidVideos } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";
import {
  Button,
  Input,
  Loader,
  Title,
  Select,
  AdvancedRadio,
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

interface Exercise {
  name: string;
  description: string;
  availability: string;
  type: string;
  reps: number;
  sets: number;
  duration: number;
  restDuration: number;
  targetMuscles: Array<{
    id: number;
    name: string;
    description: string;
    active: boolean;
    is_default: boolean;
  }>;
  equipment: Array<{
    id: number;
    name: string;
    description: string;
    active: boolean;
    is_default: boolean;
    category: string;
    condition: string;
    image_url: string | null;
  }>;
  gyms: any[];
  level: string;
  instructions: string[];
  image: string;
  demonstration_url?: string;
}

export default function EditExerciseSection({
  params,
}: {
  params: { id: string };
}) {
  const [exercise, setExercise] = useState<Exercise>({
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
    gyms: [],
    level: "beginner",
    instructions: [""],
    image: "",
    demonstration_url: "",
  });
  const [prerequisites, setPrerequisites] = useState<Prerequisites>({
    equipment: [],
    targetMuscles: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const [urlPreview, setUrlPreview] = useState<{
    type: "youtube" | "vimeo" | "other" | null;
    embedUrl: string | null;
  }>({
    type: null,
    embedUrl: null,
  });

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `api/exercises/${params.id}/?gym_id=${gymId}`,
          {
            id: newID(`exercises-${params.id}`),
          }
        );
        const data = resp.data;

        setExercise({
          name: data.name,
          description: data.description,
          availability: data.availability?.toLowerCase() || "free",
          type:
            data.default_exercise_type?.toLowerCase() === "rep"
              ? "rep"
              : "time",
          reps: data.default_reps || 0,
          sets: data.default_sets || 0,
          duration: data.default_sets_time || 0,
          restDuration: data.default_rest_duration || 0,
          targetMuscles: data.target_muscles.map((muscle: any) => ({
            label: muscle.name,
            value: muscle.name,
            id: muscle.id,
          })),
          gyms: data.gyms || [],
          equipment: data.required_equipment.map((eq: any) => ({
            label: eq.name,
            value: eq.name,
            id: eq.id,
          })),
          level: data.default_level?.toLowerCase() || "beginner",
          instructions: data.instructions
            ? data.instructions.split("\n")
            : [""],
          image: data.image_url || "https://placehold.co/100x100",
          demonstration_url: data.demonstration_url || "",
        });
      } catch (error) {
        console.error("Error fetching exercise:", error);
        toast.error("Something went wrong while fetching exercise details");
      } finally {
        setIsFetching(false);
      }
    };

    fetchExercise();
  }, [params.id]);

  const handleAddInstruction = () => {
    setExercise((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const handleDemonstrationUrlChange = (url: string) => {
    setExercise((prev) => ({
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

  const handleRemoveInstruction = (index: number) => {
    setExercise((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };
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
  const handleInstructionChange = (index: number, value: string) => {
    setExercise((prev) => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) =>
        i === index ? value : instruction
      ),
    }));
  };

  const handleUpdateExercise = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const updatedData = {
        name: exercise.name,
        description: exercise.description,
        availability:
          exercise.availability[0].toUpperCase() +
          exercise.availability.slice(1),
        default_exercise_type: exercise.type === "rep" ? "Rep" : "Time",
        default_level:
          exercise.level[0].toUpperCase() + exercise.level.slice(1),
        default_reps: exercise.type === "rep" ? exercise.reps : 0,
        default_sets: exercise.type === "rep" ? exercise.sets : 0,
        default_sets_time: exercise.type === "time" ? exercise.duration : 60,
        default_rest_duration: exercise.restDuration,
        image_url: exercise.image,
        gyms_ids: exercise.gyms.map((gym: any) => gym.id),
        instructions: exercise.instructions.join("\n"),
        target_muscles_ids: exercise.targetMuscles.map((tm) => tm.id),
        required_equipment_ids: exercise.equipment.map((eq) => eq.id),
        demonstration_url: exercise.demonstration_url || null,
      };
      const gymId = await retrieveGymId();
      await AxiosPrivate.put(
        `api/exercises/${params.id}/?gym_id=${gymId}`,
        updatedData
      );
      invalidateAll();
      toast.success("Exercise updated successfully");
      router.push("/workout/exercise");
    } catch (error) {
      console.error("Error updating exercise:", error);
      toast.error("Something went wrong while updating exercise");
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (exercise.demonstration_url) {
      handleDemonstrationUrlChange(exercise.demonstration_url);
    }
  }, [exercise.demonstration_url]);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader size="xl" variant="spinner" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 md:px-16 md:gap-y-8 ">
      <div className="flex items-center justify-between mb-4">
        <Title as="h3" className="text-gray-900 ">
          Edit Exercise
        </Title>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Name"
          value={exercise.name}
          onChange={(e) => {
            setExercise((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter exercise name"
          labelClassName=""
        />
        <Input
          label="Image URL"
          value={exercise.image}
          onChange={(e) => {
            setExercise((prev) => ({ ...prev, image: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter image URL"
          labelClassName=""
        />
        <Textarea
          label="Description"
          value={exercise.description}
          onChange={(e) => {
            setExercise((prev) => ({
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
          value={exercise.demonstration_url}
          onChange={(e) => handleDemonstrationUrlChange(e.target.value)}
          className="w-full sm:hidden"
          placeholder="Enter Video Like ..."
          labelClassName=""
        />

        <div className="md:col-span-full grid sm:grid-cols-2 gap-6 ">
          <div className="hidden sm:grid">
            <Textarea
              label="Description"
              value={exercise.description}
              onChange={(e) => {
                setExercise((prev) => ({
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
              value={exercise.demonstration_url}
              onChange={(e) => handleDemonstrationUrlChange(e.target.value)}
              className="w-full"
              placeholder="Enter Video Like ..."
              labelClassName=""
            />
          </div>

          {/* URL Preview */}
          {urlPreview.embedUrl && exercise.demonstration_url ? (
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
            exercise.availability[0].toUpperCase() +
            exercise.availability.slice(1)
          }
          onChange={(option: any) => {
            setExercise((prev) => ({
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
          value={exercise.type[0].toUpperCase() + exercise.type.slice(1)}
          onChange={(option: any) => {
            setExercise((prev) => ({
              ...prev,
              type: option.value,
            }));
          }}
          className="w-full"
          labelClassName=""
        />
        {exercise.type === "rep" ? (
          <>
            <Input
              label="Reps"
              type="number"
              value={exercise.reps}
              onChange={(e) => {
                setExercise((prev) => ({
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
              value={exercise.sets}
              onChange={(e) => {
                setExercise((prev) => ({
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
            value={exercise.duration}
            onChange={(e) => {
              setExercise((prev) => ({
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
          value={exercise.restDuration}
          onChange={(e) => {
            setExercise((prev) => ({
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
          value={exercise.level[0].toUpperCase() + exercise.level.slice(1)}
          onChange={(option: any) => {
            setExercise((prev) => ({
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
            prerequisites.targetMuscles.length
              ? prerequisites.targetMuscles.map((muscle) => ({
                  label: muscle.name,
                  value: muscle.id.toString(), // Use ID as value
                }))
              : [{ label: "No Body Part Found", value: "0" }]
          }
          value={exercise.targetMuscles.map((muscle) => muscle.id.toString())} // Just map to IDs
          onChange={(selectedValues: string[]) => {
            const selectedMuscles = selectedValues.map((value) => {
              const muscle = prerequisites.targetMuscles.find(
                (m) => m.id.toString() === value
              );
              return {
                id: parseInt(value),
                name: muscle?.name || "",
                description: "",
                active: true,
                is_default: false,
                gyms: [{ id: 1, name: "GymForce Gym" }],
              };
            });
            setExercise((prev) => ({
              ...prev,
              targetMuscles: selectedMuscles,
            }));
          }}
          labelClassName=""
          clearable
          onClear={() => {
            setExercise((prev) => ({ ...prev, targetMuscles: [] }));
          }}
          getOptionDisplayValue={(option) =>
            prerequisites.targetMuscles.length ? (
              <Text className="text-sm">{option.label}</Text>
            ) : (
              renderEmptyPart(option)
            )
          }
        />
        <MultiSelect
          label="Required Equipment"
          options={
            prerequisites.equipment.length
              ? prerequisites.equipment.map((eq) => ({
                  label: eq.name,
                  value: eq.id.toString(), // Use ID as value
                }))
              : [{ label: "No Equipment Found", value: "0" }]
          }
          value={exercise.equipment.map((eq) => eq.id.toString())} // Just map to IDs
          onChange={(selectedValues: string[]) => {
            const selectedEquipment = selectedValues.map((value) => {
              const equipment = prerequisites.equipment.find(
                (e) => e.id.toString() === value
              );
              return {
                id: parseInt(value),
                name: equipment?.name || "",
                description: "",
                active: true,
                is_default: true,
                category: "",
                condition: "Fair",
                image_url: null,
                gyms: [{ id: 1, name: "GymForce Gym" }],
              };
            });
            setExercise((prev) => ({
              ...prev,
              equipment: selectedEquipment,
            }));
          }}
          getOptionDisplayValue={(option) =>
            prerequisites.equipment.length ? (
              <Text className="text-sm">{option.label}</Text>
            ) : (
              renderEmptyEquipment(option)
            )
          }
          labelClassName=""
          clearable
          onClear={() => {
            setExercise((prev) => ({ ...prev, equipment: [] }));
          }}
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
        {exercise.instructions.map((instruction, index) => (
          <div key={index} className="flex items-center gap-2 mb-2 px-8">
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
        onClick={handleUpdateExercise}
        className="max-w-xs self-center mt-4"
        disabled={!exercise.name || !exercise.description}
      >
        {isLoading ? <Loader variant="threeDot" /> : "Update Exercise"}
      </Button>
    </div>
  );
}
