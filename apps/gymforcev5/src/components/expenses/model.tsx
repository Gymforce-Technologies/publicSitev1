// components/PopupForm.js
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { FaPlus } from "react-icons/fa6";
import {
  // FaTools,
  FaWrench,
  FaBolt,
  FaUserTie,
  FaHome,
  FaBoxes,
  FaBullhorn,
  FaShieldAlt,
  FaEllipsisH,
} from "react-icons/fa";
// import { useTheme } from "next-themes";
import {
  Button,
  Drawer,
  Input,
  Loader,
  // Modal,
  Select,
  // SelectOption,
  Text,
  Textarea,
  Title,
} from "rizzui";
import toast from "react-hot-toast";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { useRouter } from "next/navigation";
import {
  checkUserAccess,
  // isUserOnTrial,
  // isUserSubscribed,
  // retrieveUserSubscriptionInfo,
} from "@/app/[locale]/auth/Trail";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { DatePicker } from "@core/ui/datepicker";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { XIcon } from "lucide-react";

interface FormData {
  remark: string;
  expense_date: any;
  amount: string;
  category: any;
  notes: string;
  payment_mode_id: any;
}

// interface PaymentMode {
//   id: string;
//   name: string;
// }
interface CategoryOption {
  value: string;
  label: string;
  icon: JSX.Element;
}

export const categoryOptions: CategoryOption[] = [
  {
    value: "equipment",
    label: "Equipment",
    icon: (
      <svg
        fill="currentColor" // Default fill color
        height="512"
        viewBox="0 0 512 512"
        width="512"
        xmlns="http://www.w3.org/2000/svg"
        className="text-inherit size-4" // Apply your CSS classes here
      >
        <g>
          <path
            d="M86.0149 330.308L38.5989 282.892L94.5171 226.974L279.276 411.733L223.358 467.651L178.558 422.851M86.0149 330.308L35.0018 381.321L80.7828 427.102M86.0149 330.308L178.558 422.851M178.558 422.851L127.545 473.864L80.7828 427.102M46.4471 461.438L80.7828 427.102"
            fill="currentColor" // Use current color for filling
            stroke="currentColor" // Use current color for stroke
            strokeWidth="40"
          />
          <path
            d="M329.308 87.015L281.892 39.599L225.974 95.5171L318.353 187.897M329.308 87.015L380.321 36.0019L426.102 81.7829M329.308 87.015L421.851 179.558M421.851 179.558L466.651 224.358L410.733 280.276L318.353 187.897M421.851 179.558L472.864 128.545L426.102 81.7829M460.438 47.4471L426.102 81.7829M318.353 187.897L186.896 319.353"
            fill="currentColor" // Use current color for filling
            stroke="currentColor" // Use current color for stroke
            strokeWidth="40"
          />
        </g>
      </svg>
    ),
  },
  {
    value: "maintenance",
    label: "Maintenance",
    icon: <FaWrench className="text-inherit size-4" />,
  },
  {
    value: "utilities",
    label: "Utilities",
    icon: <FaBolt className="text-inherit size-4" />,
  },
  {
    value: "staff_salaries",
    label: "Staff Salaries",
    icon: <FaUserTie className="text-inherit size-4" />,
  },
  {
    value: "rent",
    label: "Rent",
    icon: <FaHome className="text-inherit size-4" />,
  },
  {
    value: "supplies",
    label: "Supplies",
    icon: <FaBoxes className="text-inherit size-4" />,
  },
  {
    value: "marketing",
    label: "Marketing",
    icon: <FaBullhorn className="text-inherit size-4" />,
  },
  {
    value: "insurance",
    label: "Insurance",
    icon: <FaShieldAlt className="text-inherit size-4" />,
  },
  {
    value: "other",
    label: "Other",
    icon: <FaEllipsisH className="text-inherit size-4" />,
  },
];
const PopupForm = ({
  isOpen,
  onClose,
  onAdd,
  gymId,
  paymentModes,
  handleUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (data: FormData) => void;
  gymId: string | null;
  paymentModes: any[];
  handleUpdate: () => void;
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [lock, setLock] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  const [auth, setAuth] = useState<boolean>(true);
  const [isFormValid, setIsFormValid] = useState(false);

  const { handleSubmit, control, reset, watch } = useForm<FormData>({
    defaultValues: {
      remark: "",
      expense_date: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
      amount: "",
      category: "",
      notes: "",
      payment_mode_id: "",
    },
  });
  const [categoryValue, setCategoryValue] = useState<CategoryOption | null>(
    null
  );
  const [paymentModeValue, setPaymentModeValue] = useState<string | null>(null);

  const renderDisplayValue = (value: CategoryOption) => {
    if (!value) return null;
    return (
      <span className="flex items-center gap-2">
        {value.icon}
        <Text>{value.label}</Text>
      </span>
    );
  };

  const checkFormValidity = (data: FormData, submit: boolean) => {
    const isValid = validateForm(data, submit);
    setIsFormValid(isValid);
  };

  useEffect(() => {
    const expense = watch((data) => checkFormValidity(data as FormData, false));
    return () => expense.unsubscribe();
  }, [watch]);

  const validateField = (fieldName: keyof FormData, value: any) => {
    let error = "";
    switch (fieldName) {
      case "amount":
        if (!value || Number(value) <= 0)
          error = "Amount must be greater than 0";
        break;
      case "expense_date":
        if (!value || new Date(value) > new Date())
          error = "Expense date cannot be in the future";
        break;
      case "category":
        if (!value) error = "Category is required";
        break;
      case "payment_mode_id":
        if (!value) error = "Payment mode is required";
        break;
      case "remark":
        if (value.length > 500) error = "Remark cannot exceed 500 characters";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const validateForm = (data: FormData, submit: boolean) => {
    const validationErrors: { [key: string]: string } = {};
    Object.keys(data).forEach((key) => {
      const field = key as keyof FormData;
      const error = validateField(field, data[field]);
      if (submit) {
        if (error) validationErrors[field] = error;
      }
    });
    return Object.keys(validationErrors).length === 0;
  };

  const handleFieldChange = (fieldName: keyof FormData, value: any) => {
    validateField(fieldName, value);
  };
  const renderOptionDisplayValue = (option: CategoryOption) => {
    return (
      <div className="flex items-center gap-3">
        {option.icon}
        <Text fontWeight="medium">{option.label}</Text>
      </div>
    );
  };
  useEffect(() => {
    if (isOpen) {
      reset({
        remark: "",
        expense_date: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
        amount: "",
        category: "",
        notes: "",
        payment_mode_id: "",
      });
      setCategoryValue(null);
      setPaymentModeValue(null);
      setErrors({});
    }
  }, [isOpen, reset]);

  useEffect(() => {
    const getStatus = async () => {
      const resp = await isStaff();
      setAuth(!resp);
      checkUserAccess().then((status) => {
        console.log(status);
        if (status !== "Restricted") {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      });
    };
    getStatus();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!validateForm(data, true)) {
      toast.error("Please Fill the Required Fields ");
      return;
    }
    if (!isValid) {
      toast.error("Please Subscribe to Proceed Further");
      if (auth) {
        router.push("/subscription/plans");
        return;
      }
    }
    console.log(data);
    setLock(true);
    const formattedData = {
      ...data,
      gym_id: parseInt(gymId as string),
      description: data.remark,
      expense_date: new Date(data.expense_date).toISOString().split("T")[0], // Format the date to yyyy-MM-dd
    };
    console.log(formattedData);
    try {
      const gymId = await retrieveGymId();
      const URL = `/api/create-expense/?gym_id=${gymId}`;
      const response = await AxiosPrivate.post(URL, formattedData).then(
        (resp) => {
          console.log(resp.data);
          invalidateAll();
          reset();
        }
      );
      toast.success("Expense Added Successfully");
      handleUpdate();
    } catch (error) {
      console.log(error);
    }
    onClose();
    reset();
    setLock(false);
  };

  if (!isOpen) return null;

  const paymentModeOptions =
    paymentModes?.map((paymentMode) => ({
      value: paymentMode.id,
      label: paymentMode.name,
    })) || [];
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      // containerClassName="dark:bg-gray-800"
    >
      <div className="p-5 md:p-8 bg-inherit h-full ">
        <div className="flex items-center mb-4 justify-between ">
          <Title as="h4" className="text-gray-900 ">
            Add Expenses
          </Title>
          <XIcon onClick={onClose} />
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-grow"
        >
          <div className="grid grid-cols-1 gap-2">
            <div className="mb-2">
              <label
                htmlFor="amount"
                className="block mb-1 font-semibold text-gray-900 "
              >
                Amount *
              </label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="amount"
                    type="number"
                    placeholder="Amount"
                    error={errors.amount}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("amount", e.target.value);
                    }}
                  />
                )}
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor="expense_date"
                className="block mb-1 font-semibold text-gray-900 "
              >
                Expense Date *
              </label>
              <Controller
                name="expense_date"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    selected={value}
                    onChange={(date: any) => {
                      onChange(
                        formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
                      );
                      validateField(
                        "expense_date",
                        formateDateValue(new Date(date.getTime()), "YYYY-MM-DD")
                      );
                    }}
                    value={formateDateValue(new Date(value))}
                    placeholderText="Select Date"
                    showMonthDropdown={true}
                    showYearDropdown={true}
                    scrollableYearDropdown={true}
                    // isClearable={true}
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="col-span-full max-w-xl bg-inherit "
                  />
                )}
              />
              {errors.expense_date && (
                <span className="text-red-500">{errors.expense_date}</span>
              )}
            </div>

            <div className="mb-2">
              <label
                htmlFor="category"
                className="block mb-1 font-semibold text-gray-900 "
              >
                Category *
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    options={categoryOptions}
                    value={categoryValue}
                    onChange={(value: any) => {
                      setCategoryValue(value as CategoryOption);
                      field.onChange(value ? value.value : "");
                      validateField("category", value);
                    }}
                    displayValue={(value) =>
                      renderDisplayValue(value as CategoryOption)
                    }
                    getOptionDisplayValue={(option) =>
                      renderOptionDisplayValue(option as CategoryOption)
                    }
                    error={errors.category}
                    id="category"
                    placeholder="Select Category"
                    // labelClassName=""
                    // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  />
                )}
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor="payment_mode_id"
                className="block mb-1 font-semibold text-gray-900 "
              >
                Payment Mode *
              </label>
              <Controller
                name="payment_mode_id"
                control={control}
                render={({ field }) => (
                  <Select
                    options={paymentModeOptions}
                    value={
                      paymentModeOptions.find(
                        (payment) => payment.value === paymentModeValue
                      )?.label
                    }
                    onChange={(value: any) => {
                      setPaymentModeValue(value ? value.value : null);
                      field.onChange(value ? value.value : "");
                      validateField("payment_mode_id", value);
                    }}
                    error={errors.payment_mode_id}
                    id="payment_mode_id"
                    placeholder="Select Payment Mode"
                    // labelClassName=""
                    // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  />
                )}
              />
            </div>
            <div className="mb-2 col-span-full">
              <label
                htmlFor="remark"
                className="block mb-1 font-semibold text-gray-900 "
              >
                Remark
              </label>
              <Controller
                name="remark"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} id="remark" placeholder="Remarks" />
                  // <Input {...field} id="remark" placeholder="Remarks" required />
                )}
              />
            </div>
          </div>

          <div className="mt-auto pt-4 flex justify-between w-full space-x-1">
            <Button
              type="button"
              onClick={() => {
                onClose();
                reset();
              }}
              variant="outline"
              className="text-gray-900  hover:text-primary w-40"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={lock || !isFormValid}
              className="w-40"
            >
              {lock ? <Loader variant="threeDot" /> : "Add Expense"}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default PopupForm;
