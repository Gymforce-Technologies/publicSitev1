"use client";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  Box,
  Avatar,
  Badge,
  Tooltip,
  Text,
  Title,
  Loader,
  Button,
  ActionIcon,
} from "rizzui";
import { useEffect, useState } from "react";
import {
  MdFitnessCenter,
  MdAccessTime,
  MdStar,
  MdArrowOutward,
} from "react-icons/md";
import AvatarCard from "@core/ui/avatar-card";
import { usePDF } from "react-to-pdf";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { RiMailSendFill } from "react-icons/ri";
import Link from "next/link";

interface WorkoutPlanDetails {
  name: string;
  description: string;
  level: string;
  category: string;
  created_at: string;
  trainer_details: {
    name: string;
    stafftype_name: string;
    profile_image?: string;
  };
  exercises: Array<{
    exercise_details: {
      name: string;
      description: string;
      image_url?: string;
      default_exercise_type?: string;
      bodypart_details?: any[];
      equipment_details?: any[];
      demonstration_url: string | null;
    };
    day_number: number;
    order: number;
    sets: number;
    reps: number;
    rest_duration: number;
    duration?: number;
  }>;
  target_body_parts: string;
  plan_type: string;
}

export default function WorkoutViewPage({
  params,
}: {
  params: { plan_id: string; id: string };
}) {
  const [workoutDetails, setWorkoutDetails] =
    useState<WorkoutPlanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const newId = params.id.toString().split("-")[1];
  // const [memberInfo, setMemberInfo] = useState<any | null>(null);
  const { toPDF, targetRef } = usePDF({
    filename: `Workout_Plan_${newId}.pdf`,
  });

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        setIsLoading(true);
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `/api/member/workout-plan/${params.plan_id}/?gym_id=${gymId}`,
          {
            id: newID(`workout-plan-${params.plan_id}`),
          }
        );
        setWorkoutDetails(resp.data);
      } catch (error) {
        console.error("Failed to fetch workout details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [params.plan_id]);

  // useEffect(() => {
  //   const getData = async () => {
  //     const gymId = await retrieveGymId();
  //     const resp = await AxiosPrivate.get(
  //       `/api/member/${newId}/basic/?gym_id=${gymId}`,
  //       {
  //         id: newID(`member-profile-${newId}`),
  //       }
  //     );
  //     console.log(resp.data);
  //     setMemberInfo(resp.data);
  //   };
  //   getData();
  // }, []);

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-96">
        <Loader variant="spinner" />
      </Box>
    );
  }

  if (!workoutDetails) {
    return (
      <Box className="text-center text-red-500">
        Unable to load workout plan. Please try again later.
      </Box>
    );
  }

  const sendMail = async () => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      // Get the target element
      const input = targetRef.current;
      if (!input) {
        toast.error("Could not find PDF content");
        return;
      }

      // Use html2pdf.js method to add HTML content to PDF
      doc.html(input, {
        callback: async function (doc) {
          // Convert PDF to Blob
          const pdfBlob = new Blob([doc.output("arraybuffer")], {
            type: "application/pdf",
          });

          // Create FormData
          const formData = new FormData();
          formData.append("member_id", newId);
          formData.append("email_type", "workout");
          // formData.append("pdf_file", pdfBlob, `Workout_Plan_${newId}.pdf`);

          try {
            const resp = await AxiosPrivate.post("/send-email/", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            console.log(resp);
            toast.success("Diet Plan sent Successfully");
          } catch (error) {
            console.error("Error sending Diet Plan:", error);
            toast.error("Something went wrong while sending Diet Plan");
          }
        },
        x: 10,
        y: 10,
        width: 590, // Adjust based on your PDF page size
        windowWidth: 794, // Adjust based on your content width
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const {
    name,
    description,
    level,
    category,
    trainer_details,
    exercises,
    plan_type,
  } = workoutDetails;

  // Group exercises by day_number
  const groupedExercises = exercises.reduce(
    (acc, exercise) => {
      const day = exercise.day_number;
      if (!acc[day]) acc[day] = [];
      acc[day].push(exercise);
      return acc;
    },
    {} as Record<number, typeof exercises>
  );

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="grid min-w-full grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-2">{name}</h2>
            <p className="text-gray-500">Description : {description}</p>

            <div className="flex flex-col space-y-2 items-start mb-4">
              <div className="flex items-center gap-4">
                <Text className="min-w-20">Level : </Text>
                <Badge
                  variant="flat"
                  className="flex items-center gap-1 scale-90"
                >
                  <MdStar size={18} />
                  {level}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <Text className="min-w-20">Category : </Text>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 scale-90"
                >
                  <MdFitnessCenter size={18} />
                  {category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Trainer Details */}
          {trainer_details && (
            <div className=" flex flex-col gap-4 justify-end">
              <div className="flex flex-row items-center gap-4 sm:gap-8 text-primary">
                <Tooltip content="Send Workout Plan" placement="bottom">
                  <ActionIcon
                    as="span"
                    size="sm"
                    variant={"text"}
                    aria-label={"Mail Workout Plan"}
                  >
                    <RiMailSendFill
                      className={` cursor-pointer hover:scale-105 size-6 text-primary animate-pulse`}
                      onClick={sendMail}
                    />
                  </ActionIcon>
                </Tooltip>
                <Button
                  size="sm"
                  variant="solid"
                  color="primary"
                  onClick={() => toPDF()}
                >
                  Download PDF
                </Button>
              </div>
              <Title as="h6">Trainer Details</Title>
              <AvatarCard
                src={trainer_details.profile_image || ""}
                name={trainer_details.name}
                description={trainer_details.stafftype_name}
              />
            </div>
          )}
        </div>
        <h3 className="text-xl font-semibold mb-4">Workouts</h3>
        <div className="min-h-[45vh]">
          {Object.entries(groupedExercises).map(([day, exercises]) => (
            <div key={day} className="ml-4 p-4 py-8 rounded-xl shadow">
              {plan_type === "Single Plan" ? null : (
                <h3 className="text-xl font-semibold mb-4">Day {day}</h3>
              )}

              <div className="flex flex-col gap-4  mx-4">
                {exercises
                  .sort((a, b) => a.order - b.order)
                  .map((exercise, index) => (
                    <Box
                      key={index}
                      className="hover:shadow-md transition-shadow bg-gray-50 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-[2%,40%,1fr]  gap-4">
                        <div className="font-bold my-2">{exercise.order} .</div>
                        {/* <Avatar
                        name={exercise.exercise_details?.name}
                        size="lg"
                        className="mt-2"
                      /> */}
                        <div>
                          <h5 className="font-bold">
                            {exercise.exercise_details?.name}
                          </h5>
                          <p className="text-sm text-gray-600 mb-2 max-w-xl truncate">
                            {exercise.exercise_details?.description}
                          </p>
                          <div className="flex space-x-2">
                            {exercise.exercise_details.default_exercise_type ===
                            "Rep" ? (
                              <>
                                <Badge variant="outline">
                                  Sets: {exercise.sets}
                                </Badge>
                                <Badge variant="outline">
                                  Reps: {exercise.reps}
                                </Badge>
                              </>
                            ) : (
                              <Badge variant="outline">
                                Duration : {exercise.duration}
                              </Badge>
                            )}

                            <Badge variant="outline">
                              Rest: {exercise.rest_duration}s
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ">
                          <div className="flex flex-col my-1 gap-4">
                            {exercise.exercise_details.bodypart_details && (
                              <div className="flex items-center gap-2 place-items-end">
                                <Text className="font-semibold">
                                  Focuses On :
                                </Text>
                                <div className="flex gap-2">
                                  {exercise.exercise_details.bodypart_details.map(
                                    (part, index) => (
                                      <Badge key={index} variant="flat">
                                        {part.name}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {exercise.exercise_details.equipment_details &&
                            exercise.exercise_details.equipment_details
                              ?.length > 0 ? (
                              <div className="flex items-center gap-2 place-items-end">
                                <Text className="font-semibold">
                                  Equipments :
                                </Text>
                                <div className="flex gap-2">
                                  {exercise.exercise_details.equipment_details.map(
                                    (part, index) => (
                                      <Badge key={index} variant="flat">
                                        {part.name}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          {exercise.exercise_details?.demonstration_url ? (
                            <Tooltip
                              content={`View the Demonstration of ${exercise.exercise_details?.name}`}
                            >
                              <Link
                                href={
                                  exercise.exercise_details?.demonstration_url
                                }
                                target="_blank"
                              >
                                <Button size="sm" className="flex items-center gap-2">
                                  View Demo <MdArrowOutward size={16} className="animate-pulse"/>
                                </Button>
                              </Link>
                            </Tooltip>
                          ) : null}
                        </div>
                      </div>
                    </Box>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute left-[-9999px] top-0 p-10">
        <div className="p-6 space-y-6" ref={targetRef}>
          <div className="grid min-w-full grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold mb-2">{name}</h2>
              <p className="text-gray-500">Description : {description}</p>

              <div className="flex flex-col space-y-2 items-start mb-4">
                <div className="flex items-center gap-4">
                  <Text className="min-w-20 pb-4">Level : </Text>
                  <Badge
                    variant="flat"
                    className="flex items-center gap-1 scale-y-75"
                  >
                    <MdStar size={18} />
                    <Text className="pb-4 ">{level}</Text>
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <Text className="min-w-20 pb-4">Category : </Text>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 scale-y-75"
                  >
                    <MdFitnessCenter size={18} />
                    <Text className="pb-4">{category}</Text>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Trainer Details */}
            {trainer_details && (
              <div className=" flex flex-col gap-4 justify-end">
                <Title as="h6">Trainer Details</Title>
                <AvatarCard
                  src={trainer_details.profile_image || ""}
                  name={trainer_details.name}
                  description={trainer_details.stafftype_name}
                  nameClassName="mt-[-4]"
                  // className="pb"
                />
              </div>
            )}
          </div>
          <h3 className="text-xl font-semibold mb-4">Workouts</h3>
          <div className="min-h-[45vh]">
            {Object.entries(groupedExercises).map(([day, exercises]) => (
              <div key={day} className="ml-4 p-4 py-8 rounded-xl shadow">
                {plan_type === "Single Plan" ? null : (
                  <h3 className="text-xl font-semibold mb-4">Day {day}</h3>
                )}

                <div className="flex flex-col gap-4  mx-4">
                  {exercises
                    .sort((a, b) => a.order - b.order)
                    .map((exercise, index) => (
                      <Box
                        key={index}
                        className="hover:shadow-md transition-shadow bg-gray-50 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-[2%,40%,1fr]  gap-4">
                          <div className="font-bold my-2">{exercise.order}</div>
                          {/* <Avatar
                        name={exercise.exercise_details?.name}
                        size="lg"
                        className="mt-2"
                      /> */}
                          <div>
                            <h5 className="font-bold">
                              {exercise.exercise_details?.name}
                            </h5>
                            <p className="text-sm text-gray-600 pb-4 max-w-xl truncate">
                              {exercise.exercise_details?.description}
                            </p>
                            <div className="flex space-x-2">
                              {exercise.exercise_details
                                .default_exercise_type === "Rep" ? (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="text-nowrap pb-5 scale-y-75"
                                  >
                                    Sets: {exercise.sets}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-nowrap pb-5 scale-y-75"
                                  >
                                    Reps: {exercise.reps}
                                  </Badge>
                                </>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-nowrap pb-5 scale-y-75"
                                >
                                  Duration : {exercise.duration}
                                </Badge>
                              )}

                              <Badge
                                variant="outline"
                                className="text-nowrap pb-5 scale-y-75"
                              >
                                Rest: {exercise.rest_duration}s
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col my-1 gap-4">
                            {exercise.exercise_details.bodypart_details && (
                              <div className="flex items-center gap-2 place-items-end">
                                <Text className="font-semibold pb-4">
                                  Focuses On :
                                </Text>
                                <div className="flex gap-2">
                                  {exercise.exercise_details.bodypart_details.map(
                                    (part, index) => (
                                      <Badge
                                        key={index}
                                        variant="flat"
                                        className="text-nowrap pb-5 scale-y-75"
                                      >
                                        {part.name}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {exercise.exercise_details.equipment_details &&
                            exercise.exercise_details.equipment_details
                              ?.length > 0 ? (
                              <div className="flex items-center gap-2 place-items-end">
                                <Text className="font-semibold pb-4">
                                  Equipments :
                                </Text>
                                <div className="flex gap-2">
                                  {exercise.exercise_details.equipment_details.map(
                                    (part, index) => (
                                      <Badge
                                        key={index}
                                        variant="flat"
                                        className="text-nowrap pb-5 scale-y-75"
                                      >
                                        {part.name}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </Box>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
