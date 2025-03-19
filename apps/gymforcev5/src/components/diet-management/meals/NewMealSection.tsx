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
  Badge,
} from "rizzui";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
// import { IoIosCheckmarkCircle } from "react-icons/io";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { XIcon } from "lucide-react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { BsArrowRight } from "react-icons/bs";

interface DailyMeal {
  id: number;
  name: string;
  description: string;
  calories: number;
}

interface DailyMealPlan {
  day: number;
  meals: DailyMeal[];
}

interface Meal {
  meal_id: number;
  day_number: number;
  meal_time: string;
  order: number;
  custom_instructions: string;
  calories?: string;
  protein?: string;
  fats?: string;
  carbs?: string;
}

interface MealPlan {
  name: string;
  description: string;
  trainer: number;
  total_calories: string;
  total_protein: string;
  total_fats: string;
  total_carbs: string;
  categories: string;
  plan_type: string;
  gym_ids: number[];
  meals: Meal[];
  member_ids: number[];
  active: boolean;
}

const NewMealPlan: React.FC = () => {
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    name: "",
    description: "",
    trainer: 0,
    total_calories: "0",
    total_protein: "0",
    total_fats: "0",
    total_carbs: "0",
    categories: "",
    plan_type: "Single Plan",
    gym_ids: [1, 2], // Static as requested
    meals: [],
    member_ids: [],
    active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const PLAN_TYPE_OPTIONS = [
    { label: "Single Plan", value: "Single Plan" },
    { label: "Weekly Plan", value: "Weekly Plan" },
  ];
  const [meals, setMeals] = useState<any[]>([]);
  const MealCategories = [
    { label: "Muscle Gain", value: "Muscle Gain" },
    { label: "Fat Loss", value: "Fat Loss" },
    { label: "Bulking", value: "Bulking" },
    { label: "Diabetes Appropriate", value: "Diabetes Appropriate" },
    { label: "Weight Management", value: "Weight Management" },
  ];
  const [trainers, setTrainers] = useState<any[] | null>(null);
  const MEAL_TIME_OPTIONS = [
    { label: "Breakfast", value: "Breakfast" },
    { label: "Morning Snack", value: "Morning Snack" },
    { label: "Lunch", value: "Lunch" },
    { label: "Afternoon Snack", value: "Afternoon Snack" },
    { label: "Dinner", value: "Dinner" },
    { label: "Night Snack", value: "Night Snack" },
  ];

  const handleAddMeal = (dayNumber: number = 1) => {
    setMealPlan((prev) => {
      const existingMealsForDay = prev.meals.filter(
        (m) => m.day_number === dayNumber
      );
      return {
        ...prev,
        meals: [
          ...prev.meals,
          {
            meal_id: 0,
            day_number: dayNumber,
            meal_time: "",
            order: existingMealsForDay.length + 1,
            custom_instructions: "",
          },
        ],
      };
    });
  };

  const handleAddDay = () => {
    const nextDayNumber =
      Math.max(...mealPlan.meals.map((m) => m.day_number), 0) + 1;
    handleAddMeal(nextDayNumber);
  };

  // Helper function to group meals by day
  const getMealsByDay = () => {
    const groupedMeals: { [key: number]: Meal[] } = {};
    mealPlan.meals.forEach((meal) => {
      if (!groupedMeals[meal.day_number]) {
        groupedMeals[meal.day_number] = [];
      }
      groupedMeals[meal.day_number].push(meal);
    });
    return groupedMeals;
  };

  useEffect(() => {
    const totals = mealPlan.meals.reduce(
      (acc, meal) => {
        acc.calories += parseInt(meal.calories || "0");
        acc.protein += parseInt(meal.protein || "0");
        acc.fats += parseInt(meal.fats || "0");
        acc.carbs += parseInt(meal.carbs || "0");
        return acc;
      },
      { calories: 0, protein: 0, fats: 0, carbs: 0 }
    );

    setMealPlan((prev) => ({
      ...prev,
      total_calories: totals.calories.toString(),
      total_protein: totals.protein.toString(),
      total_fats: totals.fats.toString(),
      total_carbs: totals.carbs.toString(),
    }));
  }, [mealPlan.meals]);

  // const handleAddMeal = () => {
  //   setMealPlan((prev) => ({
  //     ...prev,
  //     meals: [
  //       ...prev.meals,
  //       {
  //         meal_id: 0,
  //         day_number:
  //           prev.meals.length > 0
  //             ? prev.meals[prev.meals.length - 1].day_number
  //             : 1,
  //         meal_time: "",
  //         order: prev.meals.length + 1,
  //         custom_instructions: "",
  //       },
  //     ],
  //   }));
  // };

  // const handleMealChange = (index: number, field: keyof Meal, value: any) => {
  //   setMealPlan((prev) => ({
  //     ...prev,
  //     meals: prev.meals.map((meal, i) =>
  //       i === index ? { ...meal, [field]: value } : meal
  //     ),
  //   }));
  // };

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

  const handleMealChange = (index: number, field: keyof Meal, value: any) => {
    setMealPlan((prev) => {
      const updatedMeals = prev.meals.map((meal, i) => {
        if (i === index) {
          const updatedMeal = { ...meal, [field]: value };
          if (field === "meal_id") {
            const selectedMeal = meals.find((m) => m.id === value);
            if (selectedMeal) {
              updatedMeal.calories = selectedMeal.calories;
              updatedMeal.protein = selectedMeal.protein || 0;
              updatedMeal.fats = selectedMeal.fats || 0;
              updatedMeal.carbs = selectedMeal.carbs || 0;
            }
          }
          return updatedMeal;
        }
        return meal;
      });
      return { ...prev, meals: updatedMeals };
    });
  };

  // const handleRemoveMeal = (dayIndex: number, mealIndex: number) => {
  //   setMealPlan((prev) => ({
  //     ...prev,
  //     meals: prev.meals.map((day, index) =>
  //       index === dayIndex
  //         ? {
  //             ...day,
  //             meals: day.filter((_, i) => i !== mealIndex),
  //           }
  //         : day
  //     ),
  //   }));
  // };

  // const handleRemoveDay = (dayIndex: number) => {
  //   setMealPlan((prev) => ({
  //     ...prev,
  //     meals: prev.meals.filter((_, i) => i !== dayIndex),
  //   }));
  // };

  const handleCreateMealPlan = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.post(
        `/api/diet-plans/?gym_id=${gymId}`,
        {
          ...mealPlan,
          gym_ids: [gymId],
        }
      ).then(() => {
        toast.success("Meal plan created successfully");
        router.push("/diet-management/meals/");
        invalidateAll();
      });
    } catch (error) {
      console.error("Error creating meal plan:", error);
      toast.error("Something went wrong while creating meal plan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const preReq = async () => {
      try {
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/dietplan-prerequisites/?gym_id=${gymId}`,
          {
            id: newID("dietplans-pre"),
          }
        );
        const data = await response.data;
        console.log(data);
        setMeals(data.meals);
      } catch (error) {
        console.error("Error fetching trainers:", error);
      }
    };
    const getTrainers = async () => {
      const gymId = await retrieveGymId();
      const URL = `/api/staff/?deleted=false&&gym_id=${gymId}`;
      const res = await AxiosPrivate(URL, {
        id: newID(`trainers-prereq-diet-plans`),
      });
      console.log(res.data);
      setTrainers(res.data);
    };
    preReq();
    getTrainers();
  }, []);
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-8 md:px-16 md:gap-y-8 ">
      <div className="flex items-center justify-between sm:mb-4">
        <Title as="h3" className="text-gray-900 ">
          New Meal Plan
        </Title>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Name"
          value={mealPlan.name}
          onChange={(e) =>
            setMealPlan((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full"
          placeholder="Enter meal plan name"
          labelClassName=""
        />
        <Select
          label="Trainer"
          value={
            trainers?.find((train: any) => train.id === mealPlan.trainer)
              ?.name || ""
          }
          onChange={(option: any) =>
            setMealPlan((prev) => ({ ...prev, trainer: option.value }))
          }
          options={
            trainers?.length
              ? trainers.map((trainer: any) => ({
                  value: trainer?.id || "", // Should be the ID
                  label: trainer?.name || "", // Should be the name
                }))
              : [{ label: "Empty", value: "empty" }]
          }
          labelClassName=""
          getOptionDisplayValue={(option) =>
            trainers?.length ? renderTrainers(option) : renderEmpty()
          }
        />
      </div>
      <Textarea
        label="Description"
        value={mealPlan.description}
        onChange={(e) =>
          setMealPlan((prev) => ({ ...prev, description: e.target.value }))
        }
        className="w-full"
        placeholder="Enter meal plan description"
        labelClassName=""
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          label="Total Calories"
          value={mealPlan.total_calories}
          onChange={(e) =>
            setMealPlan((prev) => ({
              ...prev,
              total_calories: e.target.value, // Match the interface property
            }))
          }
          prefix={"Cal"}
          className="w-full"
          placeholder="Enter total calories"
          labelClassName=""
        />
        <Input
          type="number"
          label="Total Fats"
          value={mealPlan.total_fats}
          onChange={(e) =>
            setMealPlan((prev) => ({
              ...prev,
              total_fats: e.target.value, // Match the interface property
            }))
          }
          prefix={"g"} // Assuming grams for fats
          className="w-full"
          placeholder="Enter total fats"
          labelClassName=""
        />
        <Input
          type="number"
          label="Total Carbs"
          value={mealPlan.total_carbs}
          onChange={(e) =>
            setMealPlan((prev) => ({
              ...prev,
              total_carbs: e.target.value, // Match the interface property
            }))
          }
          prefix={"g"} // Assuming grams for carbs
          className="w-full"
          placeholder="Enter total carbs"
          labelClassName=""
        />
        <Input
          type="number"
          label="Total Protein"
          value={mealPlan.total_protein}
          onChange={(e) =>
            setMealPlan((prev) => ({
              ...prev,
              total_protein: e.target.value, // Match the interface property
            }))
          }
          prefix={"g"} // Assuming grams for protein
          className="w-full"
          placeholder="Enter total protein"
          labelClassName=""
        />

        <Select
          label="Categories"
          options={MealCategories}
          value={mealPlan.categories}
          onChange={(option: any) => {
            setMealPlan((prev) => ({ ...prev, categories: option.value }));
          }}
        />
        <Select
          label="Plan Type"
          value={mealPlan.plan_type}
          onChange={(option: any) =>
            setMealPlan((prev) => ({ ...prev, plan_type: option.value }))
          }
          options={PLAN_TYPE_OPTIONS}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 border p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <Title as="h4">Meals</Title>
          <div className="flex gap-2">
            {mealPlan.plan_type === "Weekly Plan" ? (
              <Button
                // variant="outline"
                onClick={handleAddDay}
                disabled={Object.keys(getMealsByDay()).length >= 7}
              >
                Add Day
              </Button>
            ) : (
              <Button
                onClick={() =>
                  handleAddMeal(
                    mealPlan.plan_type === "Single Plan" ? 1 : undefined
                  )
                }
              >
                Add Meal
              </Button>
            )}
          </div>
        </div>

        {mealPlan.plan_type === "Single Plan" ? (
          // Single Plan View
          <div className="space-y-4">
            {mealPlan.meals.map((meal, index) => (
              <MealCard
                key={index}
                meal={meal}
                meals={meals}
                index={index}
                handleMealChange={handleMealChange}
                handleRemove={() => {
                  setMealPlan((prev) => ({
                    ...prev,
                    meals: prev.meals.filter((_, i) => i !== index),
                  }));
                }}
                mealTimeOptions={MEAL_TIME_OPTIONS}
              />
            ))}
          </div>
        ) : (
          // Weekly Plan View
          <div className="space-y-6">
            {Object.entries(getMealsByDay()).map(([day, dayMeals]) => (
              <div key={day} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Title as="h5">Day {day}</Title>
                  <Button
                    variant="flat"
                    color="danger"
                    size="sm"
                    onClick={() => {
                      setMealPlan((prev) => ({
                        ...prev,
                        meals: prev.meals.filter(
                          (m) => m.day_number !== parseInt(day)
                        ),
                      }));
                    }}
                  >
                    Remove Day
                  </Button>
                </div>
                <div className="space-y-4">
                  {dayMeals.map((meal, index) => (
                    <MealCard
                      key={index}
                      meal={meal}
                      meals={meals}
                      index={mealPlan.meals.findIndex(
                        (m) =>
                          m.day_number === parseInt(day) &&
                          m.order === meal.order
                      )}
                      handleMealChange={handleMealChange}
                      handleRemove={() => {
                        setMealPlan((prev) => ({
                          ...prev,
                          meals: prev.meals.filter((_, i) => i !== index),
                        }));
                      }}
                      mealTimeOptions={MEAL_TIME_OPTIONS}
                    />
                  ))}
                  <Button
                    variant="text"
                    onClick={() => handleAddMeal(parseInt(day))}
                    className="w-full"
                  >
                    Add Meal to Day {day}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Button
        onClick={handleCreateMealPlan}
        className="max-w-xs self-center mt-4"
        disabled={
          !mealPlan.name || !mealPlan.description || mealPlan.meals.length === 0
        }
      >
        {isLoading ? <Loader variant="threeDot" /> : "Create Meal Plan"}
      </Button>
    </div>
  );
};

export default NewMealPlan;

interface MealCardProps {
  meal: Meal;
  meals: any[];
  index: number;
  handleMealChange: (index: number, field: keyof Meal, value: any) => void;
  handleRemove: () => void;
  mealTimeOptions: { label: string; value: string }[];
}

const MealCard: React.FC<MealCardProps> = ({
  meal,
  meals,
  index,
  handleMealChange,
  handleRemove,
  mealTimeOptions,
}) => {
  const router = useRouter();

  function renderEmptyMeal(option: any) {
    return (
      <div
        className=" w-full grid grid-cols-1 mx-2"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-sm text-nowrap">
          No Recepie Found
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Receipe Section");
            router.push("/diet-management/recipe/new");
          }}
          className="text-primary text-[13px] text-nowrap"
        >
          Add Meal
          <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }
  return (
    <div
      className={`bg-gray-50 p-2 sm::p-6 rounded-md relative grid md:grid-cols-2 gap-4`}
    >
      <div className="grid gap-4 md:grid-cols-2 max-w-xl px-4 sm:px-8">
        <Select
          label="Select Meal"
          value={meals.find((mealItem: any) => mealItem.id === meal.meal_id)}
          onChange={(option: any) =>
            handleMealChange(index, "meal_id", option.value)
          }
          options={
            meals.length
              ? meals.map((m: any) => ({
                  value: m.id,
                  label: m.name,
                }))
              : [{ label: "Empty", value: 0 }]
          }
          getOptionDisplayValue={(option) =>
            meals.length ? (
              <div className="grid gap-0.5 shadow">
                <Text fontWeight="semibold">{option.label}</Text>
              </div>
            ) : (
              renderEmptyMeal(option)
            )
          }
        />

        <Select
          label="Meal Time"
          value={meal.meal_time}
          onChange={(option: any) =>
            handleMealChange(index, "meal_time", option.value)
          }
          options={mealTimeOptions}
        />

        <Textarea
          label="Custom Instructions"
          value={meal.custom_instructions}
          onChange={(e) =>
            handleMealChange(index, "custom_instructions", e.target.value)
          }
          size="sm"
          labelClassName="text-sm"
          className="md:col-span-2"
        />
        <div className=" absolute sm:top-2 right-4 sm:right-8">
          <Button
            variant="text"
            size="sm"
            // color="danger"
            className="text-primary hover:text-red-500"
            onClick={handleRemove}
            // className="flex items-center justify-center min-w-full"
          >
            <XIcon />
          </Button>
        </div>
      </div>
      {meal.meal_id ? (
        <div className="flex flex-col gap-4 my-4">
          <div className="flex items-center gap-2">
            <Text>Categories : </Text>
            {meals.find((mealItem: any) => mealItem.id === meal.meal_id)
              ?.categories &&
              meals
                .find((mealItem: any) => mealItem.id === meal.meal_id)
                .categories.map((item: any, index: number) => (
                  <Badge variant="flat" key={index}>
                    {item}
                  </Badge>
                ))}
          </div>
          <div className="flex items-center gap-2">
            <Text>Cal</Text>
            <Text>
              {
                meals.find((mealItem: any) => mealItem.id === meal.meal_id)
                  ?.calories
              }
            </Text>
          </div>
        </div>
      ) : null}
    </div>
  );
};
