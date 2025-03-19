"use client";

import { useEffect, useState } from "react";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "../../app/[locale]/auth/AxiosPrivate";
import {
  Switch,
  Input,
  Button,
  Text,
  ActionIcon,
  Loader,
  Tooltip,
} from "rizzui";
import WidgetCard from "@core/components/cards/widget-card";
// import PencilIcon from "@core/components/icons/pencil";
import toast from "react-hot-toast";
import { isStaff } from "@/app/[locale]/auth/Staff";

interface LoyaltySettings {
  on_membership_renewal: boolean;
  points_membership_renewal: string | number;
  on_new_membership: boolean;
  points_new_membership: string | number;
  on_personal_training: boolean;
  points_personal_training: string | number;
  on_purchasing_products: boolean;
  points_purchasing_products: string | number;
  on_attendance: boolean;
  points_attendance: string | number;
  on_deduction_absence_1week: boolean;
  points_deduction_absence_1week: string | number;
  on_deduction_late_payment: boolean;
  points_deduction_late_payment: string | number;
  point_to_currency_ratio: string | number;
  max_redemption_per_transaction: string | number;
}

interface SettingRowProps {
  title: string;
  toggleKey: keyof LoyaltySettings;
  pointsKey: keyof LoyaltySettings;
  currentSettings: LoyaltySettings;
  //   onUpdate: (key: keyof LoyaltySettings, value: any) => void;
}

interface ConversionSettings {
  ratio: string | number;
  maxLimit: string | number;
}

export default function LoyaltySettingsComponent(): JSX.Element {
  const [settings, setSettings] = useState<LoyaltySettings>({
    on_membership_renewal: false,
    points_membership_renewal: 0,
    on_new_membership: false,
    points_new_membership: 0,
    on_personal_training: false,
    points_personal_training: 0,
    on_purchasing_products: false,
    points_purchasing_products: 0,
    on_attendance: false,
    points_attendance: 0,
    on_deduction_absence_1week: false,
    points_deduction_absence_1week: 0,
    on_deduction_late_payment: false,
    points_deduction_late_payment: 0,
    point_to_currency_ratio: 1.0,
    max_redemption_per_transaction: 500,
  });
  const [loading, setLoading] = useState(true);
  const [conversionEditing, setConversionEditing] = useState(false);
  const [localConversion, setLocalConversion] = useState<ConversionSettings>({
    ratio: settings.point_to_currency_ratio,
    maxLimit: settings.max_redemption_per_transaction,
  });
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const getData = async (): Promise<void> => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get<LoyaltySettings>(
        `/api/get-points-settings/?gym_id=${gymId}`,
        {
          id: newID(`loyalty-points`),
        }
      );
      setSettings(resp.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
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
        response.data.permissions["mainConfigManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

  const handleConversionSave = async () => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.patch(
        `/api/configure-points-settings/?gym_id=${gymId}`,
        {
          settings: {
            point_to_currency_ratio: Number(localConversion.ratio),
            max_redemption_per_transaction: Number(localConversion.maxLimit),
          },
        }
      );
      invalidateAll();
      getData();
      setConversionEditing(false);
      toast.success("Conversion settings updated successfully");
    } catch (error) {
      console.error("Error updating conversion settings:", error);
    }
  };

  const handleConversionCancel = () => {
    setLocalConversion({
      ratio: settings.point_to_currency_ratio,
      maxLimit: settings.max_redemption_per_transaction,
    });
    setConversionEditing(false);
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setLocalConversion({
      ratio: settings.point_to_currency_ratio,
      maxLimit: settings.max_redemption_per_transaction,
    });
  }, [settings]);

  const SettingRow = ({
    title,
    toggleKey,
    pointsKey,
    currentSettings,
    // onUpdate,
  }: SettingRowProps): JSX.Element => {
    const [isEditing, setIsEditing] = useState(false);
    const [localSettings, setLocalSettings] = useState({
      toggle: currentSettings[toggleKey],
      points: currentSettings[pointsKey],
    });

    const handleSave = async () => {
      try {
        const gymId = await retrieveGymId();
        await AxiosPrivate.patch(
          `/api/configure-points-settings/?gym_id=${gymId}`,
          {
            settings: {
              [toggleKey]: localSettings.toggle,
              [pointsKey]: localSettings.points,
            },
          }
        );
        invalidateAll();
        getData();
        setIsEditing(false);
        toast.success("Settings updated successfully");
      } catch (error) {
        console.error("Error updating settings:", error);
      }
    };

    const handleCancel = () => {
      setLocalSettings({
        toggle: currentSettings[toggleKey],
        points: currentSettings[pointsKey],
      });
      setIsEditing(false);
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newToggleValue = e.target.checked;
      setIsEditing(true);
      setLocalSettings((prev) => ({
        toggle: newToggleValue,
        points: newToggleValue ? prev.points || 1 : prev.points,
      }));
    };

    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSettings((prev) => ({
        ...prev,
        points: Number(e.target.value),
      }));
      if (!isEditing) {
        setIsEditing(true);
      }
    };

    useEffect(() => {
      setLocalSettings({
        toggle: currentSettings[toggleKey],
        points: currentSettings[pointsKey],
      });
    }, [currentSettings, toggleKey, pointsKey]);

    return (
      <div className="bg-gray-50 rounded-lg p-4 md:px-6 shadow-sm border border-primary/70">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
          <Text className="font-medium text-[15px] text-gray-900">{title}</Text>
          <Tooltip
            content={"No Allowed"}
            placement="bottom"
            className={!auth && !access ? "" : "hidden"}
          >
            <div>
              <Switch
                name={toggleKey}
                value={toggleKey}
                disabled={!auth && !access}
                checked={Boolean(
                  isEditing ? localSettings.toggle : currentSettings[toggleKey]
                )}
                onChange={handleSwitchChange}
                className="max-sm:self-end"
              />
            </div>
          </Tooltip>
        </div>

        <div className="mt-3">
          <div className="space-y-3">
            {(isEditing || currentSettings[toggleKey]) && (
              <Input
                type="number"
                value={
                  isEditing
                    ? localSettings.points.toString()
                    : currentSettings[pointsKey].toString()
                }
                onChange={handlePointsChange}
                className="max-w-[200px]"
                disabled={!localSettings.toggle || (!auth && !access)}
              />
            )}
            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="h-8"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} className="h-8">
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <WidgetCard
      title="Loyalty Program Settings"
      className="relative"
      headerClassName="mb-6"
    >
      {loading ? (
        <div className="w-full flex items-center justify-center my-6">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 lg:p-6">
          <SettingRow
            title="Membership Renewal Points"
            toggleKey="on_membership_renewal"
            pointsKey="points_membership_renewal"
            currentSettings={settings}
            //   onUpdate={updateSetting}
          />

          <SettingRow
            title="New Membership Points"
            toggleKey="on_new_membership"
            pointsKey="points_new_membership"
            currentSettings={settings}
            //   onUpdate={updateSetting}
          />

          <SettingRow
            title="Personal Training Points"
            toggleKey="on_personal_training"
            pointsKey="points_personal_training"
            currentSettings={settings}
            //   onUpdate={updateSetting}
          />

          <SettingRow
            title="Product Purchase Points"
            toggleKey="on_purchasing_products"
            pointsKey="points_purchasing_products"
            currentSettings={settings}
            //   onUpdate={updateSetting}
          />

          <SettingRow
            title="Attendance Points"
            toggleKey="on_attendance"
            pointsKey="points_attendance"
            currentSettings={settings}
            //   onUpdate={updateSetting}
          />

          <SettingRow
            title="Absence Deduction (1 week)"
            toggleKey="on_deduction_absence_1week"
            pointsKey="points_deduction_absence_1week"
            currentSettings={settings}
            //   onUpdate={updateSetting}
          />

          <SettingRow
            title="Late Payment Deduction"
            toggleKey="on_deduction_late_payment"
            pointsKey="points_deduction_late_payment"
            currentSettings={settings}
            //   onUpdate={updateSetting}
          />

          <div className="bg-gray-50/80 rounded-lg p-4 md:px-6 shadow-sm border border-primary/70 grid gap-4 md:grid-cols-2 col-span-full">
            <div className="grid sm:grid-cols-2 gap-2 items-center">
              <Text className="font-medium text-[15px] text-gray-900">
                Points to Currency Ratio
              </Text>
              <Input
                type="number"
                value={
                  conversionEditing
                    ? localConversion.ratio
                    : settings.point_to_currency_ratio.toString()
                }
                disabled={!auth && !access}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setConversionEditing(true);
                  setLocalConversion((prev) => ({
                    ...prev,
                    ratio: e.target.value,
                  }));
                }}
                className="w-32 max-sm:self-end"
                step="0.1"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-2 items-center">
              <Text className="font-medium text-[15px] text-gray-900">
                Max Redemption Per Transaction
              </Text>
              <Input
                type="number"
                value={
                  conversionEditing
                    ? localConversion.maxLimit
                    : settings.max_redemption_per_transaction.toString()
                }
                disabled={!auth && !access}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setConversionEditing(true);
                  setLocalConversion((prev) => ({
                    ...prev,
                    maxLimit: e.target.value,
                  }));
                }}
                className="w-32 max-sm:self-end"
              />
            </div>
            {conversionEditing && (
              <div className="flex justify-end space-x-2 col-span-2">
                <Button
                  variant="outline"
                  onClick={handleConversionCancel}
                  className="h-8"
                >
                  Cancel
                </Button>
                <Button onClick={handleConversionSave} className="h-8">
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
