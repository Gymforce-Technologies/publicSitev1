"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@core/components/cards/widget-card";
import MetricCard from "@core/components/cards/metric-card";
import { Button, Drawer, Input, Loader, Select, Text, Title } from "rizzui";
import toast from "react-hot-toast";
import { DatePicker } from "@core/ui/datepicker";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  formateDateValue,
  getDateFormat,
} from "@/app/[locale]/auth/DateFormat";
import cn from "@core/utils/class-names";

// Enhanced Interfaces
interface PreferredUnit {
  preferred_unit: string;
  preferred_id: number;
}

interface Measurement {
  id: number;
  preferred: PreferredUnit;
  name: string;
  description: string;
  base_unit: string;
  is_default: boolean;
}

interface MeasurementData {
  id: number;
  value: number;
  logged_value: number;
  logged_unit: string;
  recorded_at: string;
  member: number;
  measurement_type: number;
  gym: number;
}

interface ProcessedMeasurementData {
  date: string;
  [key: string]: number | string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  measurements: Measurement[];
}

interface MeasurementFormState {
  measurementType: number;
  value: string;
  unit: string;
  date: Date;
}

interface FilterState {
  bodyPart: string;
  duration: number;
  searchQuery: string;
}

const DURATION_OPTIONS = [
  { label: "1 Month", value: 1 },
  { label: "6 Months", value: 6 },
  { label: "12 Months", value: 12 },
];

const UNIT_MAPPINGS = {
  cm: [
    { label: "Centimeters", value: "cm" },
    { label: "Inches", value: "inches" },
    { label: "Millimeters", value: "mm" },
    { label: "Meters", value: "m" },
  ],
  kg: [
    { label: "Kilograms", value: "kg" },
    { label: "Pounds", value: "lbs" },
    { label: "Grams", value: "g" },
  ],
};

const colorGenerator = (index: number) => {
  return `hsl(${(index * 50) % 360}, 70%, 60%)`;
};

const INITIAL_FORM_STATE: MeasurementFormState = {
  measurementType: -1,
  value: "",
  unit: "",
  date: new Date(),
};

const INITIAL_FILTER_STATE: FilterState = {
  bodyPart: "",
  duration: 1,
  searchQuery: "",
};

const convertToDateFnsFormat = (format: string) => {
  return format
    .replace("DD", "dd")
    .replace("MMM", "MMM")
    .replace("MM", "MM")
    .replace("YYYY", "yyyy");
};

const convertToBaseUnit = (
  value: number,
  fromUnit: string,
  baseUnit: string = "cm"
): number => {
  const lengthConversions = {
    inches: 2.54, // inches to cm
    mm: 0.1, // mm to cm
    m: 100, // m to cm
    cm: 1, // cm to cm
  };

  const weightConversions = {
    lbs: 0.453592, // lbs to kg
    g: 0.001, // g to kg
    kg: 1, // kg to kg
  };

  const conversions = baseUnit === "cm" ? lengthConversions : weightConversions;
  return value * (conversions[fromUnit as keyof typeof conversions] || 1);
};

const convertFromBaseUnit = (
  value: number,
  toUnit: string,
  baseUnit: string = "cm"
): number => {
  const lengthConversions = {
    inches: 1 / 2.54, // cm to inches
    mm: 10, // cm to mm
    m: 0.01, // cm to m
    cm: 1, // cm to cm
  };

  const weightConversions = {
    lbs: 2.20462, // kg to lbs
    g: 1000, // kg to g
    kg: 1, // kg to kg
  };

  const conversions = baseUnit === "cm" ? lengthConversions : weightConversions;
  return value * (conversions[toUnit as keyof typeof conversions] || 1);
};

const CustomTooltip = ({
  active,
  payload,
  label,
  measurements,
}: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="font-medium text-sm mb-2">
        <Text>{label ? formateDateValue(new Date(label)) : ""}</Text>
      </div>
      <div className="space-y-2">
        {payload.map((entry, index) => {
          const measurementId = parseInt(entry.dataKey.split("_")[1]);
          const measurement = measurements.find((m) => m.id === measurementId);

          if (!measurement) return null;

          const preferredUnit = measurement.preferred?.preferred_unit;
          const baseUnit = measurement.base_unit;
          const value = preferredUnit
            ? convertFromBaseUnit(entry.value, preferredUnit, baseUnit)
            : entry.value;
          const displayUnit = preferredUnit || baseUnit;

          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex flex-col">
                <Text>{measurement.name}</Text>
                <Text>{`${value.toFixed(2)} ${displayUnit}`}</Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function MeasurementSection({
  params,
}: {
  params: { id: string };
}) {
  const memberId = params.id.toString().split("-")[1];

  // Enhanced State Management
  const [formState, setFormState] =
    useState<MeasurementFormState>(INITIAL_FORM_STATE);
  const [filterState, setFilterState] =
    useState<FilterState>(INITIAL_FILTER_STATE);
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [measurementData, setMeasurementData] = useState<MeasurementData[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statsArray = useMemo(() => {
    let start = "0";
    let current = "0";
    let difference = "0";

    current =
      convertToBaseUnit(
        measurementData[0]?.logged_value,
        measurementData[0]?.logged_unit
      ).toFixed(1) || "N/A";
    start =
      convertToBaseUnit(
        measurementData[measurementData.length - 1]?.logged_value,
        measurementData[measurementData.length - 1]?.logged_unit
      ).toFixed(1) || "N/A";
    difference = (parseFloat(current) - parseFloat(start)).toFixed(1);
    const currentType = measurements.find(
      (m) => m.id === measurementData[0]?.measurement_type
    );
    if (currentType && currentType?.preferred !== null) {
      current = convertFromBaseUnit(
        parseFloat(current),
        currentType?.preferred.preferred_unit
      ).toFixed(1);
      start = convertFromBaseUnit(
        parseFloat(start),
        currentType?.preferred.preferred_unit
      ).toFixed(1);
      difference =
        (parseFloat(current) - parseFloat(start)).toFixed(1) +
        " " +
        currentType?.preferred.preferred_unit;
      current += " " + currentType?.preferred.preferred_unit;
      start += " " + currentType?.preferred.preferred_unit;
    } else {
      current += " " + currentType?.base_unit;
      start += " " + currentType?.base_unit;
      difference += " " + currentType?.base_unit;
    }
    return [
      {
        title: "Start",
        metric: start,
      },
      {
        title: "Current",
        metric: current,
      },
      {
        title: "Change",
        metric: difference,
      },
    ];
  }, [measurementData, measurements]);

  const processedData = useMemo(() => {
    const dataMap = new Map<string, ProcessedMeasurementData>();

    measurementData.forEach((item) => {
      const date = item.recorded_at;
      const measurement = measurements.find(
        (m) => m.id === item.measurement_type
      );

      if (!measurement) return;

      const value = convertToBaseUnit(
        item.logged_value,
        item.logged_unit,
        measurement.base_unit
      );

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }

      const existingData = dataMap.get(date)!;
      existingData[`type_${item.measurement_type}`] = value;
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [measurementData, measurements]);

  // Enhanced Handlers
  const handleFormChange = useCallback(
    (field: keyof MeasurementFormState, value: any) => {
      setFormState((prev) => ({ ...prev, [field]: value }));

      if (field === "measurementType") {
        const selectedMeasurement = measurements.find((m) => m.id === value);
        if (selectedMeasurement) {
          const unitToUse =
            selectedMeasurement?.preferred?.preferred_unit ||
            selectedMeasurement.base_unit;
          setFormState((prev) => ({
            ...prev,
            unit: unitToUse,
          }));
        }
      }
    },
    [measurements]
  );

  const handleFilterChange = useCallback(
    (field: keyof FilterState, value: any) => {
      setFilterState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Enhanced API Calls
  const fetchMeasurements = useCallback(async () => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/create-measurement/?gym_id=${gymId}`,
        {
          id: newID("measurement-settings"),
        }
      );
      setMeasurements(response.data);
      setFilterState((prev) => ({ ...prev, bodyPart: response.data[0]?.name }));
    } catch (error) {
      console.error("Error fetching measurements:", error);
      toast.error("Failed to fetch measurements");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeasurementHistory = useCallback(
    async (bodyPart: string) => {
      try {
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/add-progress/${memberId}/?gym_id=${gymId}${
            bodyPart ? `&bodypart=${bodyPart.toLowerCase()}` : ""
          }&date_range=${filterState.duration}`,
          {
            id: newID(
              `body-measurement-${memberId}-${bodyPart || ""}-${
                filterState.duration
              }`
            ),
          }
        );
        setMeasurementData(response.data);
      } catch (error) {
        console.error("Error fetching measurement history:", error);
        toast.error("Failed to fetch measurement history");
      }
    },
    [memberId, filterState.bodyPart, filterState.duration]
  );

  const handleSubmit = async () => {
    try {
      if (!formState.measurementType || !formState.value) {
        toast.error("Please fill in all required fields");
        return;
      }

      const selectedMeasurement = measurements.find(
        (m) => m.id === formState.measurementType
      );

      if (!selectedMeasurement) {
        toast.error("Invalid measurement type");
        return;
      }

      const value = convertToBaseUnit(
        parseFloat(formState.value),
        formState.unit,
        selectedMeasurement.base_unit
      );

      const gymId = await retrieveGymId();
      const payload = {
        measurement_type: selectedMeasurement.id,
        value: value.toString(),
        logged_value: formState.value,
        logged_unit: formState.unit,
        recorded_at: formState.date.toISOString().split("T")[0],
        gym: gymId,
      };

      await AxiosPrivate.post(
        `/api/add-progress/${memberId}/?gym_id=${gymId}`,
        payload
      );

      toast.success("Measurement recorded successfully");
      invalidateAll();
      await Promise.all([fetchMeasurements()]);
      setDrawerOpen(false);
      setFormState(INITIAL_FORM_STATE);
    } catch (error) {
      console.error("Error recording measurement:", error);
      toast.error("Failed to record measurement");
    }
  };

  // Effects
  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  useEffect(() => {
    if (filterState.bodyPart) {
      fetchMeasurementHistory(filterState.bodyPart);
    }
  }, [fetchMeasurementHistory, filterState.bodyPart, filterState.duration]);

  // Enhanced Graph Component
  const MeasurementGraph = useCallback(
    () => (
      <div className="grid grid-cols-1 lg:grid-cols-[70%,auto] gap-6">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="dark:opacity-10"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => formateDateValue(new Date(date))}
                tick={{ fontSize: 12 }}
                stroke="#888"
                className="dark:opacity-70"
              />
              <YAxis
                label={{
                  value: "Measurement(s)",
                  angle: -90,
                  position: "insideLeft",
                }}
                tick={{ fontSize: 12 }}
                stroke="#888"
                className="dark:opacity-70"
              />
              <Tooltip
                content={<CustomTooltip measurements={measurements} />}
              />
              <Legend
                formatter={(value) => {
                  const measurementId = parseInt(value.split("_")[1]);
                  return (
                    measurements.find((m) => m.id === measurementId)?.name ||
                    value
                  );
                }}
              />
              {measurements.map((measurement, index) => (
                <Line
                  key={`type_${measurement.id}`}
                  type="monotone"
                  dataKey={`type_${measurement.id}`}
                  stroke={colorGenerator(index + measurement.id)}
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#fff",
                    className: "dark:stroke-gray-800",
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    stroke: "#fff",
                    className: "dark:stroke-gray-800",
                  }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={cn("grid grid-cols-1 gap-4 my-4")}>
          {statsArray
            // .filter((stat) => stat.metric !== "N/A")
            .map((stat) => (
              <MetricCard
                key={stat.title}
                title={stat.title}
                metric={stat.metric}
                // icon={stat.icon}
                className="!p-3 hover:scale-105 duration-150 border-none"
                // iconClassName="bg-transparent size-10"
              />
            ))}
        </div>
      </div>
    ),
    [processedData, measurements, statsArray]
  );

  // Return the enhanced UI
  return (
    <WidgetCard
      title="Measurements"
      className="relative pt-4 dark:bg-inherit grid grid-cols-1"
      headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
    >
      {/* Rest of your existing UI components with the enhanced graph */}
      <div className="mb-4 max-md:mt-2 max-sm:grid grid-cols-[55%,40%] sm:flex flex-wrap gap-4 items-center justify-end">
        <Select
          label="Body Part"
          // options={BODY_PARTS.map((bp) => ({ label: bp.name, value: bp.id }))}
          // value={filterState.bodyPart}
          options={measurements.map((m) => ({
            label: m.name,
            value: m.id,
          }))}
          onChange={(option: any) =>
            handleFilterChange("bodyPart", option.label)
          }
          value={filterState.bodyPart}
          className="max-w-[250px]"
          clearable
          onClear={() => handleFilterChange("bodyPart", "")}
        />
        <Select
          label="History Duration"
          options={DURATION_OPTIONS}
          value={filterState.duration + " Month(s)"}
          onChange={(option: any) =>
            handleFilterChange("duration", Number(option.value))
          }
          className="max-w-[200px]"
        />
        <Button
          variant="solid"
          onClick={() => setDrawerOpen(true)}
          className="h-10 mt-auto max-sm:col-span-full place-self-end max-sm:scale-90"
        >
          Add Measurement
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center w-full my-8">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : (
        <MeasurementGraph />
      )}

      {/* Your existing Drawer component */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setFormState(INITIAL_FORM_STATE);
        }}
        containerClassName="p-4 md:p-6"
      >
        {/* Your existing drawer content */}
        <div className="flex flex-col gap-4 md:gap-6">
          <Title as="h4">New Measurement Entry</Title>
          <Select
            label="Select Measurement"
            options={measurements.map((m) => ({
              label: m.name,
              value: m.id,
            }))}
            onChange={(option: any) => {
              handleFormChange("measurementType", option.value);
              const selectedMeasurement = measurements.find(
                (m) => m.id === option.value
              );
              if (selectedMeasurement) {
                const unitToUse =
                  selectedMeasurement?.preferred?.preferred_unit ||
                  selectedMeasurement.base_unit;
                handleFormChange("unit", unitToUse);
              }
            }}
            value={
              measurements.find((item) => item.id === formState.measurementType)
                ?.name
            }
          />
          <div className="flex flex-col gap-1.5">
            <Text className="font-medium">Measurement Date:</Text>
            <DatePicker
              label="Record Date"
              selected={formState.date}
              onChange={(date) => handleFormChange("date", date)}
              maxDate={new Date()}
              dateFormat={convertToDateFnsFormat(getDateFormat())}
            />
          </div>
          <Input
            type="number"
            label="Measurement Value"
            placeholder="Enter value"
            value={formState.value}
            onChange={(e) => handleFormChange("value", e.target.value)}
            className="flex-1"
            suffix={formState.unit ?? ""}
          />
          <Select
            label="Unit"
            options={
              measurements.find((m) => m.id === formState.measurementType)
                ?.base_unit === "cm"
                ? UNIT_MAPPINGS.cm
                : UNIT_MAPPINGS.kg
            }
            value={
              measurements.find((m) => m.id === formState.measurementType)
                ?.base_unit === "cm"
                ? UNIT_MAPPINGS.cm.find((item) => item.value === formState.unit)
                    ?.label
                : UNIT_MAPPINGS.kg.find((item) => item.value === formState.unit)
                    ?.label
            }
            onChange={(option: any) => handleFormChange("unit", option.value)}
          />
          <Button
            variant="solid"
            onClick={handleSubmit}
            className="w-full"
            disabled={loading || !formState.measurementType || !formState.value}
          >
            {loading ? "Recording..." : "Record Measurement"}
          </Button>
        </div>
      </Drawer>
    </WidgetCard>
  );
}
