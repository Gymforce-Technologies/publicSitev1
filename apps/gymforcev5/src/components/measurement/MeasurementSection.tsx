"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Loader, Text, Select, Badge } from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
// import { MdEdit } from "react-icons/md";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";

interface Measurement {
  id: number;
  name: string;
  description: string;
  base_unit: string;
  is_default: boolean;
  preferred?: {
    preferred_unit: string;
    preferred_id: number;
  };
}

const MeasurementConfig: React.FC = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const unitOptions = [
    { label: "Centimeters", value: "cm" },
    { label: "Inches", value: "inches" },
    { label: "Millimeters", value: "mm" },
    { label: "Meters", value: "m" },
    { label: "Kilograms", value: "kg" },
    { label: "Pounds", value: "lbs" },
    { label: "Grams", value: "g" },
    // { label: "Percentage", value: "%" },
  ];

  const fetchMeasurements = async (): Promise<void> => {
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
    } catch (error) {
      console.error("Error fetching measurements:", error);
      toast.error("Failed to fetch measurements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleUnitChange = async (measurementId: number, unit: string) => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.patch(
        `/api/create-measurement/?gym_id=${gymId}${measurementId ? `&measurement_id=${measurementId}` : ""}`,
        {
          measurement_type: measurementId,
          preferred_unit: unit,
        }
      );
      toast.success("Preferred unit updated successfully");
      invalidateAll();
      fetchMeasurements();
    } catch (error) {
      console.error("Error updating preferred unit:", error);
      toast.error("Failed to update preferred unit");
    }
  };

  const columns = useMemo(
    () => [
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (name: string) => (
          <Text className="text-base font-semibold">{name}</Text>
        ),
      },
      {
        title: (
          <HeaderCell title="Description" className="text-sm font-semibold" />
        ),
        dataIndex: "description",
        key: "description",
        width: 300,
        render: (description: string) => (
          <Text className="capitalize">{description}</Text>
        ),
      },
      {
        title: (
          <HeaderCell title="Base Unit" className="text-sm font-semibold" />
        ),
        dataIndex: "base_unit",
        key: "base_unit",
        width: 150,
        render: (base_unit: string) => (
          <Badge variant="outline" className="p-1.5">
            {base_unit}
          </Badge>
        ),
      },
      {
        title: (
          <HeaderCell
            title="Preferred Unit"
            className="text-sm font-semibold"
          />
        ),
        dataIndex: "id",
        key: "preferred_unit",
        width: 200,
        render: (id: number, record: Measurement) => (
          <Select
            options={
              record.base_unit === "cm" || record.base_unit === "inches"
                ? unitOptions.slice(0, 4)
                : unitOptions.slice(4)
            }
            value={record.preferred?.preferred_unit || ""}
            onChange={(option: any) => handleUnitChange(id, option.value)}
            placeholder="Select unit"
            selectClassName="capitalize"
            className="max-w-xs"
          />
        ),
      },
    ],
    []
  );

  return (
    <>
      {loading ? (
        <div className="grid h-32 place-content-center">
          <Loader size="xl" variant="spinner" />
        </div>
      ) : (
        <Table
          variant="minimal"
          data={measurements}
          //@ts-ignore
          columns={columns}
          scroll={{ y: 500 }}
          className="text-sm text-nowrap mt-4 md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-50"
        />
      )}
    </>
  );
};

export default MeasurementConfig;
