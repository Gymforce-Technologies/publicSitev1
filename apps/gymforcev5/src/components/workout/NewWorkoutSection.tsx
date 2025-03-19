"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Loader,
  Title,
  Select,
  Textarea,
  Text,
  AdvancedRadio,
  MultiSelect,
} from "rizzui";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { PlusIcon, MinusIcon, XIcon } from "lucide-react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { BsArrowRight } from "react-icons/bs";

interface Exercise {
  exercise: number; // ID of the exercise
  day_number: number;
  order: number;
  sets: number | null;
  reps: number | null;
  duration: number | null;
  rest_duration: number;
}
interface AvailableExercise {
  id: number;
  name: string;
  image_url: string;
  description: string;
  bodypart_details: Array<{ id: number; name: string }>;
  equipment_details: Array<{ id: number; name: string }>;
  default_exercise_type: string;
  default_sets: number;
  default_reps: number;
  default_rest_duration: number;
  default_sets_time?: number | null;
}

interface ExerciseCardProps {
  exercise: Exercise;
  exercises: AvailableExercise[];
  index: number;
  handleExerciseChange: (
    index: number,
    field: keyof Exercise,
    value: any
  ) => void;
  handleRemove: () => void;
}

interface WorkoutPlan {
  name: string;
  category: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  plan_type: "Single Plan" | "Weekly Plan";
  target_body_parts: string;
  trainer: string;
  gyms: number[];
  members: number[];
  is_default: boolean;
  active: boolean;
  exercises: Exercise[];
}

const NewWorkoutSection: React.FC = () => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan>({
    name: "",
    description: "",
    category: "",
    target_body_parts: "",
    level: "Beginner",
    trainer: "",
    plan_type: "Single Plan",
    exercises: [],
    gyms: [],
    members: [],
    is_default: false,
    active: true,
  });
  const trainingOptions = [
    { label: "Weight Loss", value: "Weight Loss" },
    { label: "Muscle Building", value: "Muscle Building" },
    { label: "Strength Training", value: "Strength Training" },
    { label: "Endurance Training", value: "Endurance Training" },
    { label: "Flexibility and Mobility", value: "Flexibility and Mobility" },
  ];

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [availableExercises, setAvailableExercises] = useState<
    AvailableExercise[]
  >([]);
  const [availableTrainers, setAvailableTrainers] = useState<any[]>([]);

  const BODY_PARTS = [
    { label: "Chest", value: "chest" },
    { label: "Back", value: "back" },
    { label: "Shoulders", value: "shoulders" },
    { label: "Biceps", value: "biceps" },
    { label: "Triceps", value: "triceps" },
    { label: "Legs", value: "legs" },
    { label: "Core", value: "core" },
    { label: "Glutes", value: "glutes" },
  ];

  const renderTrainers = (option: any) => {
    return (
      <div className="grid gap-0.5 shadow">
        <Text fontWeight="semibold">{option.label}</Text>
      </div>
    );
  };

  function renderEmpty() {
    return (
      <div
        className=" w-full flex gap-4 flex-row items-center justify-between mx-4"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-[13px] text-nowrap">
          {`No Staff's Found`}
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Staff Creation");
            router.push("/staff-section/addstaff");
          }}
          className="text-primary text-xs text-nowrap"
        >
          Add Staff <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  const handleAddExercise = (dayNumber: number = 1) => {
    setWorkoutPlan((prev) => {
      const existingExercisesForDay = prev.exercises.filter(
        (e) => e.day_number === dayNumber
      );

      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            exercise: -1,
            day_number: dayNumber,
            order: existingExercisesForDay.length + 1,
            sets: null,
            reps: null,
            duration: null,
            rest_duration: 60,
          },
        ],
      };
    });
  };

  const handleExerciseChange = (
    exerciseIndex: number,
    field: keyof Exercise,
    value: any
  ) => {
    setWorkoutPlan((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === exerciseIndex ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  // Helper function to group exercises by day
  const getExercisesByDay = () => {
    const groupedExercises: { [key: number]: Exercise[] } = {};
    workoutPlan.exercises.forEach((exercise) => {
      if (!groupedExercises[exercise.day_number]) {
        groupedExercises[exercise.day_number] = [];
      }
      groupedExercises[exercise.day_number].push(exercise);
    });
    return groupedExercises;
  };

  // Function to remove an entire day and its exercises
  const handleRemoveDay = (dayNumber: number) => {
    setWorkoutPlan((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.day_number !== dayNumber),
    }));
  };

  // Function to remove a specific exercise
  const handleRemoveExercise = (exerciseIndex: number, dayNumber: number) => {
    setWorkoutPlan((prev) => {
      // Filter out the exercise to be removed
      const updatedExercises = prev.exercises.filter(
        (ex, idx) => idx !== exerciseIndex
      );

      // Reorder exercises for the specific day
      return {
        ...prev,
        exercises: updatedExercises.map((ex) => {
          if (ex.day_number === dayNumber) {
            const sameDay = updatedExercises.filter(
              (e) => e.day_number === dayNumber
            );
            const newOrder = sameDay.indexOf(ex) + 1;
            return { ...ex, order: newOrder };
          }
          return ex;
        }),
      };
    });
  };

  const handleCreateWorkoutPlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !workoutPlan.name ||
      !workoutPlan.description ||
      !workoutPlan.trainer ||
      !workoutPlan.exercises.length
    ) {
      toast.error(
        "Please fill in all required fields and add at least one exercise"
      );
      return;
    }

    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();

      const workoutPlanData = {
        ...workoutPlan,
        gyms: [gymId],
      };

      await AxiosPrivate.post(
        `api/workoutplans/?gym_id=${gymId}`,
        workoutPlanData
      );
      invalidateAll();
      toast.success("Workout plan created successfully");
      router.push("/workout");
    } catch (error) {
      console.error("Error creating workout plan:", error);
      toast.error("Something went wrong while creating workout plan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const preReq = async () => {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `api/workoutplans-prerequisites/?gym_id=${gymId}`,
        {
          id: newID("workout-plans-prereq"),
        }
      );
      setAvailableExercises(resp.data.workout_exercises);
      console.log(resp.data);
    };
    const getTrainers = async () => {
      const gymId = await retrieveGymId();
      const URL = `/api/staff/?deleted=false&gym_id=${gymId}`;
      const res = await AxiosPrivate(URL, {
        id: newID(`trainers-prereq-diet-plans`),
      });
      console.log(res.data);
      setAvailableTrainers(res.data);
    };
    preReq();
    getTrainers();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 lg:px-16 ">
      <Title as="h3" className="text-gray-900 ">
        Create Workout Plan
      </Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Name"
          value={workoutPlan.name}
          onChange={(e) =>
            setWorkoutPlan((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full"
          labelClassName=""
        />

        <Select
          label="Category"
          value={workoutPlan.category}
          onChange={(option: any) =>
            setWorkoutPlan((prev) => ({ ...prev, category: option.value }))
          }
          options={trainingOptions}
          className="w-full"
          labelClassName=""
        />

        <Textarea
          label="Description"
          value={workoutPlan.description}
          onChange={(e) =>
            setWorkoutPlan((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full md:col-span-2"
          labelClassName=""
        />

        <Select
          label="Trainer"
          value={
            availableTrainers?.find(
              (train: any) => train.id === workoutPlan.trainer
            )?.name || ""
          }
          onChange={(option: any) =>
            setWorkoutPlan((prev) => ({ ...prev, trainer: option.value }))
          }
          options={
            availableTrainers?.length
              ? availableTrainers.map((trainer: any) => ({
                  value: trainer?.id || "", // Should be the ID
                  label: trainer?.name || "", // Should be the name
                }))
              : [{ label: "Empty", value: "empty" }]
          }
          className="w-full"
          labelClassName=""
          getOptionDisplayValue={(option) =>
            availableTrainers?.length ? renderTrainers(option) : renderEmpty()
          }
        />

        <Select
          label="Level"
          value={
            workoutPlan.level[0].toUpperCase() + workoutPlan.level.slice(1)
          }
          onChange={(option: any) =>
            setWorkoutPlan((prev) => ({ ...prev, level: option.value }))
          }
          options={[
            { label: "Beginner", value: "Beginner" },
            { label: "Intermediate", value: "Intermediate" },
            { label: "Advanced", value: "Advanced" },
          ]}
          className="w-full"
          labelClassName=""
        />
        {/* <MultiSelect
          label="Target Body"
          options={BODY_PARTS}
          value={workoutPlan.target_body_parts}
          onChange={(value: any[]) => {
            setWorkoutPlan((prev) => ({
              ...prev,
              target_body_parts: value,
            }));
          }}
          labelClassName=""
          clearable
          onClear={() => {
            setWorkoutPlan((prev) => ({ ...prev, target_body_parts: [] }));
          }}
        /> */}
        <Select
          label="Target Body"
          value={workoutPlan.target_body_parts}
          onChange={(option: any) => {
            setWorkoutPlan((prev) => ({
              ...prev,
              target_body_parts: option.label,
            }));
          }}
          options={BODY_PARTS}
          className="w-full"
          labelClassName=""
        />
        <div className="w-full">
          <Title as="h6" className="text-gray-900  mb-2">
            Plan Type
          </Title>
          <div className="grid grid-cols-2 gap-4">
            <AdvancedRadio
              name="plan_type"
              value="single"
              checked={workoutPlan.plan_type === "Single Plan"}
              onClick={() =>
                setWorkoutPlan((prev) => ({
                  ...prev,
                  plan_type: "Single Plan",
                }))
              }
              className="relative"
            >
              Single Plan
              <IoIosCheckmarkCircle
                className={
                  workoutPlan.plan_type === "Single Plan"
                    ? "absolute top-2 right-2 size-4 text-primary"
                    : "hidden"
                }
              />
            </AdvancedRadio>
            <AdvancedRadio
              name="plan_type"
              value="weekly"
              checked={workoutPlan.plan_type === "Weekly Plan"}
              onClick={() =>
                setWorkoutPlan((prev) => ({
                  ...prev,
                  plan_type: "Weekly Plan",
                }))
              }
              className="relative"
            >
              Weekly Plan{" "}
              <IoIosCheckmarkCircle
                className={
                  workoutPlan.plan_type === "Weekly Plan"
                    ? "absolute top-2 right-2 size-4 text-primary"
                    : "hidden"
                }
              />
            </AdvancedRadio>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 border p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <Title as="h4">Workout Plans</Title>
          <div className="flex gap-2 max-sm:scale-90">
            {workoutPlan.plan_type === "Weekly Plan" ? (
              <Button
                // variant="outline"
                onClick={() => {
                  const nextDay =
                    Math.max(
                      ...Object.keys(getExercisesByDay()).map(Number),
                      0
                    ) + 1;
                  handleAddExercise(nextDay);
                }}
                disabled={Object.keys(getExercisesByDay()).length >= 7}
              >
                Add Day
              </Button>
            ) : (
              <Button
                onClick={() =>
                  handleAddExercise(
                    workoutPlan.plan_type === "Single Plan" ? 1 : undefined
                  )
                }
              >
                Add Exercise
              </Button>
            )}
          </div>
        </div>
        {workoutPlan.plan_type === "Single Plan" ? (
          // Single Plan View
          <div className="grid gap-4">
            {workoutPlan.exercises.map((exercise, index) => (
              <ExerciseCard
                key={index}
                exercise={exercise}
                exercises={availableExercises}
                index={index}
                handleExerciseChange={handleExerciseChange}
                handleRemove={() =>
                  handleRemoveExercise(index, exercise.day_number)
                }
              />
            ))}
            <div className="flex justify-center items-center min-w-full">
              <AddCard type="exercise" onClick={() => handleAddExercise(1)} />
            </div>
          </div>
        ) : (
          // Weekly Plan View
          <div className="space-y-6">
            {Object.entries(getExercisesByDay()).map(([day, dayExercises]) => (
              <div key={day} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Title as="h5">Day {day}</Title>
                  <Button
                    variant="flat"
                    color="danger"
                    size="sm"
                    onClick={() => handleRemoveDay(parseInt(day))}
                  >
                    <MinusIcon className="w-4 h-4 mr-2" />
                    Remove Day
                  </Button>
                </div>
                <div className="space-y-4">
                  {dayExercises.map((exercise, index) => (
                    <ExerciseCard
                      key={index}
                      exercise={exercise}
                      exercises={availableExercises}
                      index={workoutPlan.exercises.findIndex(
                        (e) =>
                          e.day_number === parseInt(day) &&
                          e.order === exercise.order
                      )}
                      handleExerciseChange={handleExerciseChange}
                      handleRemove={() =>
                        handleRemoveExercise(
                          workoutPlan.exercises.findIndex(
                            (e) =>
                              e.day_number === parseInt(day) &&
                              e.order === exercise.order
                          ),
                          parseInt(day)
                        )
                      }
                    />
                  ))}
                  <div className="min-w-full flex items-center justify-center">
                    <AddCard
                      type="exercise"
                      onClick={() => handleAddExercise(parseInt(day))}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-center">
              <AddCard
                type="day"
                onClick={() => {
                  const nextDay =
                    Math.max(
                      ...Object.keys(getExercisesByDay()).map(Number),
                      0
                    ) + 1;
                  handleAddExercise(nextDay);
                }}
              />
            </div>
          </div>
        )}
      </div>
      <Button
        onClick={handleCreateWorkoutPlan}
        className="max-w-xs self-center mt-4"
        disabled={!workoutPlan.name || !workoutPlan.description}
      >
        {isLoading ? <Loader variant="threeDot" /> : "Create Workout Plan"}
      </Button>
    </div>
  );
};

export default NewWorkoutSection;

interface ExerciseCardProps {
  exercise: Exercise;
  exercises: AvailableExercise[]; // List of available exercises
  index: number;
  handleExerciseChange: (
    index: number,
    field: keyof Exercise,
    value: any
  ) => void;
  handleRemove: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exercises,
  index,
  handleExerciseChange,
  handleRemove,
}) => {
  const selectedExercise = exercises.find((e) => e.id === exercise.exercise);
  const router = useRouter();

  function renderEmptyExercise(option: any) {
    return (
      <div
        className=" w-full flex flex-row items-center gap-2 sm:gap-4 md:gap-6"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold max-md:text-[13px] text-nowrap">
          No Exercise Found
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Body Parts");
            router.push("/workout/exercise");
          }}
          className="text-primary text-sm  max-md:text-xs text-nowrap"
        >
          Add Exercise
          <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }
  return (
    <div className="bg-gray-50 p-3 md:p-6 rounded-md relative">
      <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
        <Select
          label="Select Exercise"
          value={selectedExercise?.name || ""}
          onChange={(option: any) => {
            const selected = exercises.find((e) => e.id === option.value);
            if (selected) {
              handleExerciseChange(index, "exercise", option.value);
              handleExerciseChange(index, "sets", selected.default_sets);
              handleExerciseChange(
                index,
                "rest_duration",
                selected.default_rest_duration
              );
              if (selected.default_exercise_type.toLowerCase() === "time") {
                handleExerciseChange(
                  index,
                  "duration",
                  selected.default_sets_time || 0
                );
                handleExerciseChange(index, "reps", null);
              } else {
                handleExerciseChange(index, "reps", selected.default_reps);
                handleExerciseChange(index, "duration", null);
              }
            }
          }}
          options={
            exercises.length
              ? exercises.map((e) => ({
                  value: e.id,
                  label: e.name,
                }))
              : [{ label: "Empty", value: 0 }]
          }
          getOptionDisplayValue={(option) =>
            exercises.length ? (
              <div className="grid gap-0.5 shadow">
                <Text fontWeight="semibold">{option.label}</Text>
              </div>
            ) : (
              renderEmptyExercise(option)
            )
          }
        />

        <Input
          type="number"
          label="Sets"
          value={exercise.sets ?? ""}
          onChange={(e) =>
            handleExerciseChange(index, "sets", parseInt(e.target.value))
          }
        />

        {selectedExercise?.default_exercise_type.toLowerCase() === "time" ? (
          <Input
            type="number"
            label="Duration (seconds)"
            value={exercise.duration ?? ""}
            onChange={(e) =>
              handleExerciseChange(
                index,
                "rest_duration",
                parseInt(e.target.value)
              )
            }
          />
        ) : (
          <Input
            type="number"
            label="Reps"
            value={exercise.reps ?? ""}
            onChange={(e) =>
              handleExerciseChange(index, "reps", parseInt(e.target.value))
            }
          />
        )}

        <Input
          type="number"
          label="Rest Duration (seconds)"
          value={exercise.rest_duration}
          onChange={(e) =>
            handleExerciseChange(
              index,
              "rest_duration",
              parseInt(e.target.value)
            )
          }
        />
      </div>
      <Button
        variant="text"
        onClick={handleRemove}
        size="sm"
        className="absolute top-2 right-4"
      >
        <XIcon />
      </Button>
    </div>
  );
};

const AddCard: React.FC<{
  type: "day" | "exercise";
  onClick: () => void;
}> = ({ type, onClick }) => {
  return (
    <Button
      onClick={onClick}
      size={type === "day" ? "md" : "sm"}
      variant={type === "day" ? "solid" : "flat"}
      className="flex items-center justify-center gap-1.5"
    >
      <PlusIcon className="size-5 font-semibold" />
      <Text>{type === "day" ? "Day" : "Exercise"}</Text>
    </Button>
  );
};
