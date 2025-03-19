// Budget.tsx
import { useState, useEffect } from "react";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@core/components/cards/widget-card";
import { XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Drawer, Empty, Input, Select, Title } from "rizzui";
import BudgetDistribution from "./BudgetStats";

// Types definition
type Budget = {
  budget_amount: string;
  budget_type: string;
  budget_id?: number;
};

type BudgetData = {
  monthly_budget?: {
    budget_amount: number | null;
    budget_id: number | null;
  } | null;
  yearly_budget?: {
    budget_amount: number | null;
    budget_id: number | null;
  } | null;
  monthly_expenses: number;
  yearly_expenses: number;
  top_expense_categories?: Array<{
    category: string;
    total_amount: number;
  }>;
  total_expenses: number;
};

export default function Budget({
  data,
  auth,
  access,
  refresh,
}: {
  data: BudgetData | null;
  refresh: () => void;
  auth: boolean;
  access: boolean;
}) {
  // State management
  const [showBudget, setShowBudget] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);

  // Budget form state
  const [budget, setBudget] = useState<Budget>({
    budget_amount: "",
    budget_type: "",
  });

  // Budget type options
  const budgetList = [
    { label: "Yearly", value: "Yearly" },
    { label: "Monthly", value: "Monthly" },
  ];

  const addBudget = async () => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/expense-budget-create/?gym_id=${gymId}`,
        budget
      );
      invalidateAll();
      toast.success("Budget added successfully");
      refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add budget");
    } finally {
      setShowBudget(false);
    }
  };

  const updateBudget = async () => {
    try {
      const gymId = await retrieveGymId();
      if (!budget.budget_id) {
        throw new Error("Budget ID is required for update");
      }
      await AxiosPrivate.patch(
        `/api/expense-budget-update/${budget.budget_id}/?gym_id=${gymId}`,
        { budget_amount: budget.budget_amount }
      );
      invalidateAll();
      toast.success("Budget updated successfully");
      refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update budget");
    } finally {
      setShowBudget(false);
    }
  };

  const handleBudgetAction = () => {
    if (!budget.budget_type || !budget.budget_amount) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isUpdating) {
      updateBudget();
    } else {
      addBudget();
    }
  };

  const openBudgetDrawer = (type?: string) => {
    setShowBudget(true);

    if ((type === "Monthly" || type === "Yearly") && budgetData) {
      setIsUpdating(true);
      setBudget({
        budget_amount:
          type === "Monthly"
            ? budgetData.monthly_budget?.budget_amount?.toString() || ""
            : budgetData.yearly_budget?.budget_amount?.toString() || "",
        budget_type: type,
        budget_id:
          type === "Monthly"
            ? budgetData.monthly_budget?.budget_id || undefined
            : budgetData.yearly_budget?.budget_id || undefined,
      });
    } else {
      setIsUpdating(false);
      setBudget({ budget_amount: "", budget_type: "" });
    }
  };

  const prepareBudgetData = () => {
    const budgetList: Array<{
      label: string;
      budget: number;
      expenses: number;
      budget_id: number;
    }> = [];

    if (budgetData?.monthly_budget) {
      const monthlyBudget = budgetData.monthly_budget;
      if (
        monthlyBudget.budget_amount !== null &&
        monthlyBudget.budget_id !== null
      ) {
        budgetList.push({
          label: "Monthly",
          budget: monthlyBudget.budget_amount,
          expenses: budgetData.monthly_expenses,
          budget_id: monthlyBudget.budget_id,
        });
      }
    }

    if (budgetData?.yearly_budget) {
      const yearlyBudget = budgetData.yearly_budget;
      if (
        yearlyBudget.budget_amount !== null &&
        yearlyBudget.budget_id !== null
      ) {
        budgetList.push({
          label: "Yearly",
          budget: yearlyBudget.budget_amount,
          expenses: budgetData.yearly_expenses,
          budget_id: yearlyBudget.budget_id,
        });
      }
    }

    return budgetList;
  };

  useEffect(() => {
    setBudgetData(data);
  }, [data]);

  const hasBudget =
    budgetData?.monthly_budget?.budget_amount !== null ||
    budgetData?.yearly_budget?.budget_amount !== null;

  return (
    <WidgetCard
      title="Budget"
      action={
        data?.monthly_budget?.budget_amount === null ||
        data?.yearly_budget?.budget_amount === null ? (
          <Button
            className="flex gap-1.5 items-center max-sm:scale-90"
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              openBudgetDrawer();
            }}
          >
            Add Budget
          </Button>
        ) : null
      }
      className={`!p-4 md:!px-6 border-none ${hasBudget ? "!py-2" : ""}`}
    >
      {hasBudget ? (
        <BudgetDistribution
          data={prepareBudgetData()}
          onEdit={openBudgetDrawer}
          auth={auth}
          access={access}
        />
      ) : (
        <div className="flex items-center min-w-full justify-center">
          <Empty text="No Budget" className="" />
        </div>
      )}

      <Drawer
        isOpen={showBudget}
        onClose={() => setShowBudget(false)}
        containerClassName="p-6 md:p-8 space-y-4"
      >
        <div className="flex items-center justify-between">
          <Title as="h4">
            {isUpdating ? `Update ${budget.budget_type} Budget` : "Add Budget"}
          </Title>
          <XIcon onClick={() => setShowBudget(false)} />
        </div>

        <Select
          label="Budget Type"
          options={budgetList}
          value={budget.budget_type}
          onChange={(option: any) =>
            setBudget((prev) => ({
              ...prev,
              budget_type: option.value as string,
            }))
          }
        />

        <Input
          type="number"
          label="Amount"
          value={budget.budget_amount}
          onChange={(e) =>
            setBudget((prev) => ({
              ...prev,
              budget_amount: e.target.value,
            }))
          }
        />

        <Button onClick={handleBudgetAction} className="w-full">
          {isUpdating ? "Update" : "Add"}
        </Button>
      </Drawer>
    </WidgetCard>
  );
}
