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
import { MdRestaurant, MdAccessTime, MdLocalDining } from "react-icons/md";
import AvatarCard from "@core/ui/avatar-card";
import Image from "next/image";
import jsPDF from "jspdf";
import { FaArrowRight } from "react-icons/fa6";
import toast from "react-hot-toast";
import { usePDF } from "react-to-pdf";
import { RiMailSendFill } from "react-icons/ri";

interface DietMealPlanDetails {
  name: string;
  description: string;
  plan_type: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  trainer_details: {
    name: string;
    staffType: string;
  };
  meals: Array<{
    day_number: number;
    meal_time: string;
    custom_instructions?: string;
    meal: {
      name: string;
      description: string;
      image_url?: string;
      preparation_time: number;
      categories: string[];
      calories: string;
      protein: string;
      carbs: string;
      fats: string;
      ingredients:
        | string
        | Array<{ name: string; unit: string; quantity: number }>;
      preparation_steps: string;
    };
    order: number;
  }>;
}

export default function DietMealPlanViewPage({
  params,
}: {
  params: { plan_id: string; id: string };
}) {
  const [dietMealPlanDetails, setDietMealPlanDetails] =
    useState<DietMealPlanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const newId = params.id.toString().split("-")[1];
  const { toPDF, targetRef } = usePDF({ filename: `Diet_Plan_${newId}.pdf` });
  // const [memberInfo, setMemberInfo] = useState<any | null>(null);

  useEffect(() => {
    const fetchDietMealPlanDetails = async () => {
      try {
        setIsLoading(true);
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `/api/member/diet-plan/${params.plan_id}/?gym_id=${gymId}`,
          {
            id: newID(`diet-plan-${params.plan_id}-member`),
          }
        );
        setDietMealPlanDetails(resp.data);
      } catch (error) {
        console.error("Failed to fetch diet meal plan details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDietMealPlanDetails();
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
          formData.append("email_type", "diet");
          // formData.append("pdf_file", pdfBlob, `Diet_Plan_${newId}.pdf`);

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

  if (!dietMealPlanDetails) {
    return (
      <Box className="text-center text-red-500">
        Unable to load diet meal plan. Please try again later.
      </Box>
    );
  }

  const {
    name,
    description,
    plan_type,
    total_calories,
    total_protein,
    total_carbs,
    total_fats,
    trainer_details,
    meals,
  } = dietMealPlanDetails;
  const groupedMeals = meals
    ? meals.reduce(
        (acc, meal) => {
          const dayNumber = meal.day_number || 1;
          if (!acc[dayNumber]) {
            acc[dayNumber] = [];
          }
          acc[dayNumber].push(meal);
          return acc;
        },
        {} as Record<number, typeof meals>
      )
    : {};
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="grid min-w-full grid-cols-[60%,auto]">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-2">{name}</h2>
            <p className="text-gray-500">Description: {description}</p>

            <div className="flex flex-col space-y-2 items-start mb-4">
              <div className="flex items-center gap-4">
                <Text className="min-w-20  ">Plan Type: </Text>
                <Badge variant="flat" className="flex items-center gap-1 ">
                  <MdRestaurant size={18} />
                  {plan_type}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Text className="min-w-20">Nutritional Breakdown: </Text>
                <div className="flex gap-2">
                  <Badge variant="outline" className="scale-90  ">
                    Calories: {total_calories}
                  </Badge>
                  <Badge variant="outline" className="scale-90  ">
                    Protein: {total_protein}g
                  </Badge>
                  <Badge variant="outline" className="scale-90  ">
                    Carbs: {total_carbs}g
                  </Badge>
                  <Badge variant="outline" className="scale-90  ">
                    Fats: {total_fats}g
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {trainer_details && (
            <div className="flex flex-col gap-4 ">
              <div className="flex flex-row items-center gap-4 sm:gap-8 text-primary">
                <Tooltip content="Send Diet Plan" placement="bottom">
                  <ActionIcon
                    as="span"
                    size="sm"
                    variant={"text"}
                    aria-label={"Mail Diet"}
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
                name={trainer_details.name}
                src=""
                description={trainer_details.staffType}
              />
            </div>
          )}
        </div>
        <h3 className="text-xl font-semibold mb-4">Meal Plans</h3>

        {meals && meals.length > 0 && (
          <div className="min-h-[45vh]">
            {Object.entries(groupedMeals).map(([day, dayMeals]) => (
              <div key={day} className="ml-4 p-4 py-8 rounded-xl shadow">
                <h4 className="text-lg font-semibold mb-4">
                  {plan_type === "Weekly Plan" ? `Day ${day}` : null}
                </h4>

                <div className="flex flex-col gap-4 ">
                  {dayMeals
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((mealPlan, index) => (
                      <Box
                        key={index}
                        className="hover:shadow-md transition-shadow bg-gray-50 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-[5%,40%,1fr] gap-4">
                          <div className="font-bold my-2">
                            {mealPlan.order} .
                          </div>
                          <div>
                            <h5 className="font-bold">{mealPlan.meal.name}</h5>
                            <p className="text-sm text-gray-600 mb-2 max-w-xl truncate">
                              {mealPlan.meal.description}
                            </p>

                            <div className="flex gap-2 mt-2">
                              {mealPlan.meal.categories.map((category, idx) => (
                                <Badge
                                  key={idx}
                                  variant="flat"
                                  className="  shadow"
                                >
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col my-1 gap-4">
                            <div className="flex items-center gap-2">
                              <Text className="font-semibold">Nutrition:</Text>
                              <div className="flex gap-2">
                                <Badge
                                  variant="outline"
                                  size="sm"
                                  className="scale-105  "
                                >
                                  Cal: {mealPlan.meal.calories}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  size="sm"
                                  className="scale-105  "
                                >
                                  Protein: {mealPlan.meal.protein}g
                                </Badge>
                                <Badge
                                  variant="outline"
                                  size="sm"
                                  className="scale-105  "
                                >
                                  Carbs: {mealPlan.meal.carbs}g
                                </Badge>
                                <Badge
                                  variant="outline"
                                  size="sm"
                                  className="scale-105  "
                                >
                                  Fats: {mealPlan.meal.fats}g
                                </Badge>
                              </div>
                            </div>

                            {/* Preparation Steps Tooltip */}
                            <div className="flex items-center gap-1">
                              <Text className="font-semibold">
                                Preparation:
                              </Text>
                              <div className="flex space-x-2">
                                <Badge
                                  variant="outline"
                                  size="sm"
                                  className=" "
                                >
                                  Time: {mealPlan.meal_time}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  size="sm"
                                  className=" "
                                >
                                  Prep Time: {mealPlan.meal.preparation_time}{" "}
                                  min
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Text className="font-semibold">Prep Steps:</Text>

                              <Tooltip
                                content={
                                  <div className="flex flex-col items-start">
                                    {typeof mealPlan.meal.preparation_steps ===
                                      "string" &&
                                    mealPlan.meal.preparation_steps.length >
                                      0 ? (
                                      mealPlan.meal.preparation_steps
                                        .split("\n")
                                        .map((step, idx) => (
                                          <div key={idx}>{step}</div>
                                        ))
                                    ) : (
                                      <Text>
                                        No preparation steps available
                                      </Text>
                                    )}
                                  </div>
                                }
                                size="md"
                                placement="bottom"
                                animation="slideIn"
                              >
                                <Button
                                  size="sm"
                                  variant="text"
                                  className="flex items-center gap-1 text-xs"
                                >
                                  <Text className="text-xs">View Steps</Text>
                                  <FaArrowRight />
                                </Button>
                              </Tooltip>
                            </div>
                          </div>

                          <div className="col-start-2 col-span-2">
                            {mealPlan.custom_instructions && (
                              <div>
                                <Text className="font-semibold">
                                  Custom Instructions:
                                </Text>
                                <Text>{mealPlan.custom_instructions}</Text>
                              </div>
                            )}
                          </div>
                        </div>
                      </Box>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute left-[-9999px] top-0 p-10">
        <div className="p-6 space-y-6" ref={targetRef}>
          <div className="grid min-w-full grid-cols-[60%,auto]">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold mb-2">{name}</h2>
              <p className="text-gray-500">Description: {description}</p>

              <div className="flex flex-col space-y-2 items-start mb-4">
                <div className="flex items-center gap-4">
                  <Text className="min-w-20 pb-5">Plan Type: </Text>
                  <Badge
                    variant="flat"
                    className="flex items-center scale-y-75"
                  >
                    <MdRestaurant size={18} />
                    <Text className="pb-4 text-nowrap pl-2">{plan_type}</Text>
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Text className="min-w-20 pb-5 text-nowrap">Nutritional Breakdown: </Text>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="scale-90 text-nowrap pb-5 scale-y-75"
                    >
                      Calories: {total_calories}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="scale-90 text-nowrap pb-5 scale-y-75"
                    >
                      Protein: {total_protein}g
                    </Badge>
                    <Badge
                      variant="outline"
                      className="scale-90 text-nowrap pb-5 scale-y-75"
                    >
                      Carbs: {total_carbs}g
                    </Badge>
                    <Badge
                      variant="outline"
                      className="scale-90 text-nowrap pb-5 scale-y-75 "
                    >
                      Fats: {total_fats}g
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {trainer_details && (
              <div className="flex flex-col gap-4 ">
                {/* <div className="flex flex-row items-center gap-4 sm:gap-8 text-primary">
                  <Tooltip content="Send Diet Plan" placement="bottom">
                    <ActionIcon
                      as="span"
                      size="sm"
                      variant={"text"}
                      aria-label={"Mail Diet"}
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
                </div> */}
                <Title as="h6">Trainer Details</Title>
                <AvatarCard
                  name={trainer_details.name}
                  src=""
                  description={trainer_details.staffType}
                />
              </div>
            )}
          </div>
          <h3 className="text-xl font-semibold mb-4">Meal Plans</h3>

          {meals && meals.length > 0 && (
            <div className="min-h-[45vh]">
              {Object.entries(groupedMeals).map(([day, dayMeals]) => (
                <div key={day} className="ml-4 p-4 py-8 rounded-xl shadow">
                  <h4 className="text-lg font-semibold mb-4">
                    {plan_type === "Weekly Plan" ? `Day ${day}` : null}
                  </h4>

                  <div className="flex flex-col gap-4 ">
                    {dayMeals
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((mealPlan, index) => (
                        <Box
                          key={index}
                          className="hover:shadow-md transition-shadow bg-gray-50 rounded-lg p-4"
                        >
                          <div className="grid grid-cols-[5%,40%,1fr] gap-4">
                            <div className="font-bold my-2">
                              {mealPlan.order} .
                            </div>
                            <div>
                              <h5 className="font-bold">
                                {mealPlan.meal.name}
                              </h5>
                              <p className="text-sm text-gray-600 max-w-xl truncate pb-4">
                                {mealPlan.meal.description}
                              </p>

                              <div className="flex gap-2 ">
                                {mealPlan.meal.categories.map(
                                  (category, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="flat"
                                      className="shadow  pb-5 scale-y-75"
                                    >
                                      {category}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col my-1 gap-4">
                              <div className="flex items-center gap-2">
                                <Text className="font-semibold pb-5">
                                  Nutrition:
                                </Text>
                                <div className="flex gap-2">
                                  <Badge
                                    variant="outline"
                                    size="sm"
                                    className="scale-105  pb-5 text-nowrap scale-y-75"
                                  >
                                    Cal: {mealPlan.meal.calories}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    size="sm"
                                    className="scale-105 pb-5 text-nowrap scale-y-75"
                                  >
                                    Protein: {mealPlan.meal.protein}g
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    size="sm"
                                    className="scale-105 pb-5 text-nowrap scale-y-75"
                                  >
                                    Carbs: {mealPlan.meal.carbs}g
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    size="sm"
                                    className="scale-105 pb-5 text-nowrap scale-y-75"
                                  >
                                    Fats: {mealPlan.meal.fats}g
                                  </Badge>
                                </div>
                              </div>

                              {/* Preparation Steps Tooltip */}
                              <div className="flex items-center gap-1">
                                <Text className="font-semibold pb-4">
                                  Preparation:
                                </Text>
                                <div className="flex space-x-2">
                                  <Badge
                                    variant="outline"
                                    size="sm"
                                    className="pb-5 text-nowrap scale-y-75 "
                                  >
                                    Time: {mealPlan.meal_time}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    size="sm"
                                    className=" pb-5 text-nowrap scale-y-75"
                                  >
                                    Prep Time: {mealPlan.meal.preparation_time}{" "}
                                    min
                                  </Badge>
                                </div>
                              </div>
                              {/* <div className="flex items-center gap-2">
                                <Text className="font-semibold">
                                  Prep Steps:
                                </Text>

                                <Tooltip
                                  content={
                                    <div className="flex flex-col items-start">
                                      {typeof mealPlan.meal
                                        .preparation_steps === "string" &&
                                      mealPlan.meal.preparation_steps.length >
                                        0 ? (
                                        mealPlan.meal.preparation_steps
                                          .split("\n")
                                          .map((step, idx) => (
                                            <div key={idx}>{step}</div>
                                          ))
                                      ) : (
                                        <Text>
                                          No preparation steps available
                                        </Text>
                                      )}
                                    </div>
                                  }
                                  size="md"
                                  placement="bottom"
                                  animation="slideIn"
                                >
                                  <Button
                                    size="sm"
                                    variant="text"
                                    className="flex items-center gap-1 text-xs"
                                  >
                                    <Text className="text-xs">View Steps</Text>
                                    <FaArrowRight />
                                  </Button>
                                </Tooltip>
                              </div> */}
                            </div>

                            <div className="col-start-2 col-span-2">
                              {mealPlan.custom_instructions && (
                                <div>
                                  <Text className="font-semibold">
                                    Custom Instructions:
                                  </Text>
                                  <Text>{mealPlan.custom_instructions}</Text>
                                </div>
                              )}
                            </div>
                          </div>
                        </Box>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
