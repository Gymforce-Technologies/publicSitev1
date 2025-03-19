"use client";
import { PlusIcon, MinusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { IoIosCheckmarkCircle } from "react-icons/io";
import {
  Button,
  Input,
  Loader,
  Title,
  AdvancedRadio,
  Textarea,
  Text,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

interface Recipe {
  id?: number;
  name: string;
  image_url: string;
  description: string;
  preparation_time: number;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  categories: string[];
  gyms_ids: [];
  ingredients: string;
  preparation_steps: string;
  active: boolean;
  is_default: boolean;
}

export default function EditRecipe({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<Recipe>({
    name: "",
    image_url: "https://placehold.co/100x100",
    description: "",
    preparation_time: 0,
    calories: "0",
    protein: "0",
    carbs: "0",
    fats: "0",
    categories: [],
    gyms_ids: [],
    ingredients: "",
    preparation_steps: "",
    active: true,
    is_default: false,
  });
  const [ingredientsList, setIngredientsList] = useState<string[]>([""]);
  const [stepsList, setStepsList] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();

  const RECIPE_CATEGORIES = [
    { label: "Low Cholesterol", value: "Low Cholesterol" },
    { label: "Diabetes Appropriate", value: "Diabetes Appropriate" },
    { label: "Salads", value: "Salads" },
    { label: "Snacks", value: "Snacks" },
    { label: "Gluten Free", value: "Gluten Free" },
    { label: "Sugar Free", value: "Sugar Free" },
    { label: "Protein Shakes", value: "Protein Shakes" },
    { label: "Vegetarian", value: "Vegetarian" },
    { label: "Muscle Gain", value: "Muscle Gain" },
    { label: "Fat Loss", value: "Fat Loss" },
    { label: "Heart Healthy", value: "Heart Healthy" },
  ];

  const convertStringToList = (str: string): string[] => {
    if (!str) return [""];
    return str
      .split("\n")
      .map((item) => item.trim().replace(/^\d+\.\s*/, ""))
      .filter((item) => item !== "");
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setIsFetching(true);
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/meals/${params.id}/?gym_id=${gymId}`,
          {
            id: newID(`meals-${params.id}`),
          }
        );
        const recipeData = response.data;

        setIngredientsList(convertStringToList(recipeData.ingredients));
        setStepsList(convertStringToList(recipeData.preparation_steps));
        setRecipe({
          ...recipeData,
          gyms_ids: recipeData.gym_details.map((gym: any) => {
            return gym.id;
          }),
        });
      } catch (error) {
        console.error("Error fetching recipe:", error);
        toast.error("Something went wrong while fetching recipe details");
      } finally {
        setIsFetching(false);
      }
    };

    fetchRecipe();
  }, [params.id]);

  // Ingredients handlers
  const handleAddIngredient = () => {
    setIngredientsList([...ingredientsList, ""]);
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = ingredientsList.filter((_, i) => i !== index);
    setIngredientsList(updatedIngredients);
    updateIngredientsString(updatedIngredients);
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredientsList];
    newIngredients[index] = value;
    setIngredientsList(newIngredients);
    updateIngredientsString(newIngredients);
  };

  const updateIngredientsString = (ingredients: string[]) => {
    const filteredIngredients = ingredients.filter(
      (ingredient) => ingredient.trim() !== ""
    );
    const ingredientsString = filteredIngredients
      .map((ingredient, index) => `${index + 1}. ${ingredient}`)
      .join("\n");

    setRecipe((prev) => ({
      ...prev,
      ingredients: ingredientsString,
    }));
  };

  // Steps handlers
  const handleAddStep = () => {
    setStepsList([...stepsList, ""]);
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = stepsList.filter((_, i) => i !== index);
    setStepsList(updatedSteps);
    updateStepsString(updatedSteps);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...stepsList];
    newSteps[index] = value;
    setStepsList(newSteps);
    updateStepsString(newSteps);
  };

  const updateStepsString = (steps: string[]) => {
    const filteredSteps = steps.filter((step) => step.trim() !== "");
    const stepsString = filteredSteps
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n");

    setRecipe((prev) => ({
      ...prev,
      preparation_steps: stepsString,
    }));
  };

  const isFormValid = () => {
    return (
      recipe.name.trim() !== "" &&
      recipe.description.trim() !== "" &&
      recipe.ingredients.trim() !== "" &&
      recipe.preparation_steps.trim() !== "" &&
      recipe.preparation_time > 0 &&
      recipe.categories.length > 0
    );
  };

  const handleUpdateRecipe = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.put(
        `/api/meals/${params.id}/?gym_id=${gymId}`,
        recipe
      ).then(() => {
        toast.success("Recipe updated successfully");
        router.push("/diet-management/recipe");
        invalidateAll();
      });
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error("Something went wrong while updating recipe");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader size="xl" variant="spinner" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 md:px-16 md:gap-y-8 ">
      <div className="flex items-center justify-between lg:mb-4">
        <Title as="h3" className="text-gray-900 ">
          Edit Recipe
        </Title>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Name"
          value={recipe.name}
          onChange={(e) => {
            setRecipe((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter recipe name"
          labelClassName=""
        />

        <Input
          label="Image URL"
          value={recipe.image_url}
          onChange={(e) => {
            setRecipe((prev) => ({ ...prev, image_url: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter image URL"
          labelClassName=""
        />

        <Textarea
          label="Description"
          value={recipe.description}
          onChange={(e) => {
            setRecipe((prev) => ({
              ...prev,
              description: e.target.value,
            }));
          }}
          className="w-full md:col-span-2"
          placeholder="Enter recipe description"
          labelClassName=""
        />

        <Input
          label="Prep Time (minutes)"
          type="number"
          value={recipe.preparation_time}
          onChange={(e) => {
            setRecipe((prev) => ({
              ...prev,
              preparation_time: parseInt(e.target.value),
            }));
          }}
          className="w-full"
          labelClassName=""
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-2">
          <Input
            label="Calories"
            type="number"
            value={recipe.calories}
            onChange={(e) => {
              setRecipe((prev) => ({
                ...prev,
                calories: e.target.value,
              }));
            }}
            className="w-full"
            labelClassName=""
          />

          <Input
            label="Protein (g)"
            type="number"
            value={recipe.protein}
            onChange={(e) => {
              setRecipe((prev) => ({
                ...prev,
                protein: e.target.value,
              }));
            }}
            className="w-full"
            labelClassName=""
          />

          <Input
            label="Carbs (g)"
            type="number"
            value={recipe.carbs}
            onChange={(e) => {
              setRecipe((prev) => ({
                ...prev,
                carbs: e.target.value,
              }));
            }}
            className="w-full"
            labelClassName=""
          />

          <Input
            label="Fats (g)"
            type="number"
            value={recipe.fats}
            onChange={(e) => {
              setRecipe((prev) => ({
                ...prev,
                fats: e.target.value,
              }));
            }}
            className="w-full"
            labelClassName=""
          />
        </div>
      </div>

      <div className="w-full md:col-span-2">
        <Title as="h4" className="text-gray-900  mb-2">
          Diet Categories
        </Title>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {RECIPE_CATEGORIES.map((category) => (
            <div key={category.value} className="relative">
              <AdvancedRadio
                multiple
                name={category.label}
                value={category.value}
                checked={recipe.categories.includes(category.value)}
                onClick={() => {
                  setRecipe((prev) => ({
                    ...prev,
                    categories: !prev.categories.includes(category.value)
                      ? [...prev.categories, category.value]
                      : prev.categories.filter(
                          (item) => item !== category.value
                        ),
                  }));
                }}
              >
                <Text className="max-sm:w-32 truncate">{category.label}</Text>
              </AdvancedRadio>
              <IoIosCheckmarkCircle
                className={
                  recipe.categories.includes(category.value)
                    ? "absolute top-2 right-2 size-4 text-primary"
                    : "hidden"
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <Title as="h4" className="text-gray-900 ">
            Ingredients
          </Title>
          <Button
            variant="text"
            onClick={handleAddIngredient}
            className="flex items-center gap-2"
          >
            Add Ingredient <PlusIcon size={16} />
          </Button>
        </div>
        {ingredientsList.map((ingredient, index) => (
          <div
            key={index}
            className="flex items-center gap-2 mb-2 px-4 md:px-8"
          >
            {" "}
            <Input
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              placeholder={`Ingredient ${index + 1}`}
              className="w-full"
              prefix={<Text>{`${index + 1}.`}</Text>}
            />
            {index > 0 && (
              <Button
                variant="text"
                onClick={() => handleRemoveIngredient(index)}
              >
                <MinusIcon size={16} />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <Title as="h4" className="text-gray-900 ">
            Preparation Steps
          </Title>
          <Button
            variant="text"
            onClick={handleAddStep}
            className="flex items-center gap-2"
          >
            Add Step <PlusIcon size={16} />
          </Button>
        </div>
        {stepsList.map((instruction, index) => (
          <div
            key={index}
            className="flex items-center gap-2 mb-2 px-4 md:px-8"
          >
            <Input
              value={instruction}
              onChange={(e) => handleStepChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              className="w-full"
              prefix={<Text>{`${index + 1}.`}</Text>}
            />
            {index > 0 && (
              <Button variant="text" onClick={() => handleRemoveStep(index)}>
                <MinusIcon size={16} />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={handleUpdateRecipe}
        className="max-w-xs self-center mt-4"
        disabled={!isFormValid()}
      >
        {isLoading ? <Loader variant="threeDot" /> : "Update Recipe"}
      </Button>
    </div>
  );
}
