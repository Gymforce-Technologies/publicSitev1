"use client";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Button,
  Input,
  Password,
  Radio,
  RadioGroup,
  Switch,
  Text,
  Title,
} from "rizzui";

interface DurationOption {
  label: string;
  value: string;
}

interface LockState {
  lock_enabled: boolean;
  last_updated: string | null;
  duration: number;
  pin: string | null;
}

interface FormState {
  pin: string;
  otp: string;
  showOtpField: boolean;
  otpRequested: boolean;
  isChangingPin: boolean;
}

interface SubmitPayload {
  lock_enabled: boolean;
  duration: number;
  new_pin?: string;
  otp?: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  { label: "15 mins", value: "15" },
  { label: "30 mins", value: "30" },
  { label: "1 Hour", value: "60" },
  { label: "2 Hours", value: "120" },
];

export default function LockSettingSection(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lock, setLock] = useState<LockState>({
    lock_enabled: false,
    last_updated: null,
    duration: 15,
    pin: null,
  });

  const [formState, setFormState] = useState<FormState>({
    pin: "",
    otp: "",
    showOtpField: false,
    otpRequested: false,
    isChangingPin: false,
  });

  const getLock = async (): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(`/api/lockScreen/?gym_id=${gymId}`, {
        id: "lockScreen-settings",
      });

      setLock({
        lock_enabled: resp.data.lock_enabled,
        duration: resp.data.duration / 60,
        last_updated: resp.data.last_updated,
        pin: resp.data.pin,
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch lock settings");
    }
  };

  useEffect(() => {
    getLock();
  }, []);

  const resetFormState = (): void => {
    setFormState({
      pin: "",
      otp: "",
      showOtpField: false,
      otpRequested: false,
      isChangingPin: false,
    });
  };

  const requestOtp = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      await AxiosPrivate.post("/api/requestLockVerificationOtp/");
      setFormState((prev) => ({
        ...prev,
        showOtpField: true,
        otpRequested: true,
      }));
      toast.success("OTP sent to your WhatsApp number");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Failed to send OTP");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockToggle = (enabled: boolean): void => {
    setLock((prev) => ({ ...prev, lock_enabled: enabled }));
    if (!enabled) {
      resetFormState();
    }
  };

  const handlePinChange = (): void => {
    setFormState((prev) => ({
      ...prev,
      isChangingPin: true,
      pin: "",
      otp: "",
      showOtpField: false,
      otpRequested: false,
    }));
  };

  const validateForm = (): boolean => {
    if (lock.lock_enabled) {
      if (!formState.pin) {
        toast.error("Please enter a PIN");
        return false;
      }
      if (formState.pin.length < 4) {
        toast.error("PIN must be at least 4 digits");
        return false;
      }
      if (!formState.otpRequested) {
        toast.error("Please request and verify OTP");
        return false;
      }
      if (formState.showOtpField && !formState.otp) {
        toast.error("Please enter the OTP");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const payload: SubmitPayload = {
        lock_enabled: lock.lock_enabled,
        duration: Math.ceil(lock.duration * 60),
      };

      if (lock.lock_enabled || formState.isChangingPin) {
        payload.new_pin = formState.pin;
        payload.otp = formState.otp;
      }

      await AxiosPrivate.post("/api/lockScreen/", payload);
      toast.success("Settings updated successfully");
      invalidateAll();
      await getLock();
      resetFormState();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 my-4 lg:my-8 max-w-2xl">
      <Title as="h4">App Lock Settings</Title>

      <Switch
        label="Enable App Lock"
        checked={lock.lock_enabled}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleLockToggle(e.target.checked)
        }
        disabled={isLoading}
      />

      {lock.lock_enabled && (
        <>
          <div className="flex flex-col gap-2">
            <Text className="font-medium">Lock Duration *</Text>
            <RadioGroup
              value={lock.duration?.toString()}
              setValue={(value) =>
                setLock((prev) => ({
                  ...prev,
                  duration: parseInt(value.toString()),
                }))
              }
              className="grid grid-cols-2 gap-y-4 max-w-screen-xs p-2"
            >
              {DURATION_OPTIONS.map((option) => (
                <Radio
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  className="cursor-pointer"
                  disabled={isLoading}
                />
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            {(!lock.pin && lock.lock_enabled) || formState.isChangingPin ? (
              <>
                <Text className="text-gray-600">
                  {!lock.pin ? "Please set your PIN" : "Change your PIN"}
                </Text>
                <Password
                  label={!lock.pin ? "Set PIN" : "New PIN"}
                  placeholder="Enter PIN (minimum 4 digits)"
                  value={formState.pin}
                  className="[&>label>span]:font-medium max-w-xl"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormState((prev) => ({ ...prev, pin: e.target.value }))
                  }
                  maxLength={4}
                  labelClassName="text-gray-900"
                  disabled={isLoading}
                />

                {!formState.otpRequested && (
                  <Button
                    size="sm"
                    onClick={requestOtp}
                    disabled={isLoading}
                    className="max-w-xl"
                  >
                    Request OTP Verification
                  </Button>
                )}

                {formState.showOtpField && (
                  <Input
                    label="OTP Verification"
                    placeholder="Enter the OTP sent to WhatsApp"
                    value={formState.otp}
                    className="[&>label>span]:font-medium max-w-xl"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormState((prev) => ({ ...prev, otp: e.target.value }))
                    }
                    labelClassName="text-gray-900"
                    disabled={isLoading}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center w-full">
                <Button
                  size="sm"
                  onClick={handlePinChange}
                  disabled={isLoading}
                  className="max-w-xl"
                >
                  Change PIN
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <div className="w-full flex items-center justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!lock.lock_enabled || isLoading}
          className="w-full max-w-xs"
        >
          {isLoading
            ? "Updating..."
            : !lock.pin
              ? "Complete Setup"
              : "Update Settings"}
        </Button>
      </div>
    </div>
  );
}
