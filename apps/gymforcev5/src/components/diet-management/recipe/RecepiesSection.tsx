"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Loader, Text, ActionIcon, Select, Button, Badge } from "rizzui";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { MdDelete, MdEdit } from "react-icons/md";
import { PlusIcon } from "lucide-react";
import toast from "react-hot-toast";
import AvatarCard from "@core/ui/avatar-card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { isStaff } from "@/app/[locale]/auth/Staff";

interface GymDetail {
  id: number;
  name: string;
}

interface Ingredient {
  name: string;
  unit: string;
  quantity: number;
}

interface PreparationStep {
  step: number;
  description: string;
}

interface Recipe {
  id: number;
  name: string;
  image_url: string;
  description: string;
  preparation_time: number;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  categories: string[];
  gym_details: GymDetail[];
  ingredients: Ingredient[];
  preparation_steps: PreparationStep[];
  active: boolean;
  is_default: boolean;
}

const GymMealRecipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const fetchRecipes = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(`/api/meals/?gym_id=${gymId}`, {
        id: newID("recepie-list"),
      });
      const data = await response.data;

      if (filterCategory !== "All") {
        setRecipes(
          data.filter((item: Recipe) =>
            item.categories.includes(filterCategory)
          )
        );
      } else {
        setRecipes(data);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Something went wrong while fetching recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: number): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.delete(
        `api/meals/${recipeId}/?gym_id=${gymId}`
      ).then(() => {
        invalidateAll();
      });
      setRecipes((prevRecipes) =>
        prevRecipes.filter((item) => item.id !== recipeId)
      );
      toast.success("Recipe deleted successfully");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Something went wrong while deleting recipe");
    }
  };

  useEffect(() => {
    const getStatus = async () => {
      try {
        const resp = await isStaff();
        if (resp) {
          setAuth(!resp);
          await fetchPermissions();
        }
      } catch (error) {
        console.error("Error getting staff status:", error);
      }
    };
    getStatus();
  }, []);

  const fetchPermissions = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const userId = resp.data?.user_id;
      const response = await AxiosPrivate.get(
        `api/staff-permission/${userId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${userId}`),
        }
      );
      const isEnquiry =
        response.data.permissions["mainDietManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

  const getColumns = useCallback(
    () => [
      {
        title: <HeaderCell title="Recipe" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 250,
        render: (name: string, row: Recipe) => (
          <AvatarCard
            name={name}
            src={row.image_url}
            description={row.description}
            nameClassName="font-semibold"
            className="max-w-xs truncate"
          />
        ),
      },
      {
        title: (
          <HeaderCell title="Categories" className="text-sm font-semibold" />
        ),
        dataIndex: "categories",
        key: "categories",
        width: 200,
        render: (categories: string[]) => (
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge
                key={index}
                color="primary"
                size="sm"
                variant="flat"
                className="whitespace-nowrap shadow"
              >
                {category}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        title: (
          <HeaderCell title="Nutrition" className="text-sm font-semibold" />
        ),
        dataIndex: "calories",
        key: "nutrition",
        width: 150,
        render: (_: string, row: Recipe) => (
          <Text>
            {parseFloat(row.calories).toFixed(1)} cal,
            <Text className="text-xs mt-1">
              P: {parseFloat(row.protein).toFixed(1)}g, C:{" \n"}
              {parseFloat(row.carbs).toFixed(1)}g, F:{" "}
              {parseFloat(row.fats).toFixed(1)}g
            </Text>
          </Text>
        ),
      },
      {
        title: (
          <HeaderCell title="Prep Time" className="text-sm font-semibold" />
        ),
        dataIndex: "preparation_time",
        key: "preparation_time",
        width: 80,
        render: (time: number) => <Text>{time} mins</Text>,
      },
      {
        title: <></>,
        dataIndex: "id",
        key: "actions",
        width: 80,
        render: (id: number, row: Recipe) => (
          <div className="flex items-center gap-2 justify-start ps-2">
            {/* <Link href={`/diet-management/recipe/edit/${id}`}> */}
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                router.push(`/diet-management/recipe/edit/${id}`);
              }}
              variant="text"
            >
              <MdEdit size={20} />
            </ActionIcon>
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                handleDeleteRecipe(id);
              }}
              variant="text"
            >
              <MdDelete size={20} />
            </ActionIcon>
          </div>
        ),
      },
    ],
    [auth, access, recipes]
  );

  const columns = useMemo(() => getColumns(), [getColumns]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    recipes.forEach((recipe) => {
      recipe.categories.forEach((category) => categories.add(category));
    });
    return Array.from(categories);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [filterCategory]);

  return (
    <WidgetCard
      className="relative dark:bg-inherit"
      title="Gym Meal Recipes"
      action={
        <div className="hidden md:flex flex-row items-end gap-4 mt-2">
          <Select
            label="Category"
            options={[
              { label: "All", value: "All" },
              ...uniqueCategories.map((category) => ({
                label: category,
                value: category,
              })),
            ]}
            value={filterCategory}
            className={"min-w-40"}
            onChange={(option: any) => setFilterCategory(option.value)}
            clearable
            onClear={() => setFilterCategory("All")}
          />
          <Button
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              router.push("/diet-management/recipe/new");
            }}
            className="flex items-center gap-2"
          >
            Add <PlusIcon size={20} />
          </Button>
        </div>
      }
    >
      <div className="flex md:hidden flex-row items-end gap-4 scale-90">
        <Select
          label="Category"
          options={[
            { label: "All", value: "All" },
            ...uniqueCategories.map((category) => ({
              label: category,
              value: category,
            })),
          ]}
          value={filterCategory}
          className={"min-w-40"}
          onChange={(option: any) => setFilterCategory(option.value)}
          clearable
          onClear={() => setFilterCategory("All")}
        />
        <Button
          onClick={() => {
            if (!auth && !access) {
              toast.error("You aren't allowed to make changes");
              return;
            }
            router.push("/diet-management/recipe/new");
          }}
          className="flex items-center gap-2"
        >
          Add <PlusIcon size={20} />
        </Button>
      </div>
      {loading ? (
        <div className="grid h-32 place-content-center">
          <Loader size="xl" variant="spinner" />
        </div>
      ) : (
        <Table
          data={recipes}
          variant="minimal"
          //@ts-ignore
          columns={columns}
          scroll={{ y: 500, x: "max-content" }}
          className="text-sm mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 text-nowrap"
        />
      )}
    </WidgetCard>
  );
};

export default GymMealRecipes;
