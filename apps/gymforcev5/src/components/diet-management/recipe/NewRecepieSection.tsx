"use client";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { PlusIcon, MinusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

interface GymDetail {
  id: number;
  name: string;
}

export interface Recipe {
  id?: number;
  name: string;
  image_url: string;
  description: string;
  preparation_time: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  categories: string[];
  gym_details: GymDetail[];
  ingredients: string;
  preparation_steps: string;
  active: boolean;
  is_default: boolean;
}

export default function AddRecipe() {
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    name: "",
    image_url: "",
    description: "",
    preparation_time: "0",
    calories: "0",
    protein: "0",
    carbs: "0",
    fats: "0",
    categories: [],
    gym_details: [],
    ingredients: "",
    preparation_steps: "",
    active: true,
    is_default: false,
  });

  const [ingredientsList, setIngredientsList] = useState<string[]>([""]);
  const [stepsList, setStepsList] = useState<string[]>([""]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Handle Ingredients List
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

    setNewRecipe((prev) => ({
      ...prev,
      ingredients: ingredientsString,
    }));
  };

  // Handle Steps List
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

    setNewRecipe((prev) => ({
      ...prev,
      preparation_steps: stepsString,
    }));
  };

  const handleCreateRecipe = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validate required fields
    if (!newRecipe.name || !newRecipe.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.post(`/api/meals/?gym_id=${gymId}`, {
        ...newRecipe,
        gyms_ids: [gymId],
        categories: selectedCategories,
      }).then(() => {
        invalidateAll();
      });
      toast.success("Recipe created successfully");
      router.push("/diet-management/recipe");
    } catch (error) {
      console.error("Error creating recipe:", error);
      toast.error("Something went wrong while creating recipe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 md:px-16 md:gap-y-8">
      <div className="flex items-center justify-between lg:mb-4">
        <Title as="h3" className="text-gray-900">
          Add Recipe
        </Title>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Recipe Name"
          value={newRecipe.name}
          onChange={(e) => {
            setNewRecipe((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter recipe name"
        />

        <Input
          label="Image URL"
          value={newRecipe.image_url}
          onChange={(e) => {
            setNewRecipe((prev) => ({ ...prev, image_url: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter image URL"
        />

        <Textarea
          label="Description"
          value={newRecipe.description}
          onChange={(e) => {
            setNewRecipe((prev) => ({
              ...prev,
              description: e.target.value,
            }));
          }}
          className="w-full md:col-span-2"
          placeholder="Enter recipe description"
        />

        <Input
          label="Preparation Time (minutes)"
          type="text"
          value={newRecipe.preparation_time}
          onChange={(e) => {
            setNewRecipe((prev) => ({
              ...prev,
              preparation_time: e.target.value,
            }));
          }}
          className="w-full"
          placeholder="e.g., 30"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-2">
          <Input
            type="text"
            label="Calories"
            value={newRecipe.calories}
            onChange={(e) => {
              setNewRecipe((prev) => ({
                ...prev,
                calories: e.target.value,
              }));
            }}
            className="w-full"
          />

          <Input
            type="text"
            label="Protein (g)"
            value={newRecipe.protein}
            onChange={(e) => {
              setNewRecipe((prev) => ({
                ...prev,
                protein: e.target.value,
              }));
            }}
            className="w-full"
          />

          <Input
            type="text"
            label="Carbs (g)"
            value={newRecipe.carbs}
            onChange={(e) => {
              setNewRecipe((prev) => ({
                ...prev,
                carbs: e.target.value,
              }));
            }}
            className="w-full"
          />

          <Input
            type="text"
            label="Fats (g)"
            value={newRecipe.fats}
            onChange={(e) => {
              setNewRecipe((prev) => ({
                ...prev,
                fats: e.target.value,
              }));
            }}
            className="w-full"
          />
        </div>

        <div className="w-full md:col-span-2">
          <Title as="h4" className="text-gray-900 mb-2">
            Categories
          </Title>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {RECIPE_CATEGORIES.map((category) => (
              <div key={category.value} className="relative">
                <AdvancedRadio
                  name={category.label}
                  value={category.value}
                  checked={selectedCategories.includes(category.value)}
                  onClick={() => {
                    setSelectedCategories((prev) =>
                      prev.includes(category.value)
                        ? prev.filter((cat) => cat !== category.value)
                        : [...prev, category.value]
                    );
                  }}
                >
                  <Text className="max-sm:w-32 truncate">{category.label}</Text>
                </AdvancedRadio>
                <IoIosCheckmarkCircle
                  className={
                    selectedCategories.includes(category.value)
                      ? "absolute top-2 right-2 size-4 text-primary"
                      : "hidden"
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <Title as="h4" className="text-gray-900">
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
              <Input
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder="Enter ingredient with quantity"
                className="w-full"
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

        <div className="w-full md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <Title as="h4" className="text-gray-900">
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
          {stepsList.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-2 mb-2 px-4 md:px-8"
            >
              <Input
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                className="w-full"
                prefix={`${index + 1}.`}
              />
              {index > 0 && (
                <Button variant="text" onClick={() => handleRemoveStep(index)}>
                  <MinusIcon size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleCreateRecipe}
        className="max-w-xs self-center mt-4"
        disabled={!newRecipe.name || !newRecipe.description}
      >
        {isLoading ? <Loader variant="threeDot" /> : "Create Recipe"}
      </Button>
    </div>
  );
}
