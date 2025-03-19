// components/LockScreen.tsx
import { useEffect, useState } from "react";
import LogoMain from "@/../public/svg/icon/gymforce-icon-black.svg";
import LogoMainText from "@/../public/svg/gymforce-text/gymforce-text-black.svg";
import { Alert, Button, Input, Modal, Password, Text, Title } from "rizzui";
import Image from "next/image";
import Link from "next/link";
import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";

interface LockScreenProps {
  onUnlock: (password: string) => boolean;
}

interface ResetFormState {
  newPin: string;
  otp: string;
  showOtpField: boolean;
  otpRequested: boolean;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [lock, setLock] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [resetForm, setResetForm] = useState<ResetFormState>({
    newPin: "",
    otp: "",
    showOtpField: false,
    otpRequested: false,
  });

  useEffect(() => {
    const handleUnlock = () => {
      const success = onUnlock(password);
      if (!success) {
        setError("Incorrect password");
      }
    };
    if (password.length === 4) {
      handleUnlock();
    } else {
      setError("");
    }
  }, [password]);

  const requestOtp = async () => {
    try {
      setIsLoading(true);
      await AxiosPrivate.post("/api/requestLockVerificationOtp/");
      setResetForm((prev) => ({
        ...prev,
        showOtpField: true,
        otpRequested: true,
      }));
      toast.success("OTP sent to your WhatsApp number");
    } catch (error) {
      console.log(error);
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    if (!resetForm.newPin || resetForm.newPin.length < 4) {
      toast.error("PIN must be at least 4 digits");
      return;
    }

    if (!resetForm.otpRequested) {
      toast.error("Please request and verify OTP");
      return;
    }

    if (!resetForm.otp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      setIsLoading(true);
      await AxiosPrivate.post("/api/lockScreen/", {
        new_pin: resetForm.newPin,
        otp: resetForm.otp,
      }).then(() => {
        const newPin = resetForm.newPin;
        const oldLockState: any = localStorage.getItem("appLock");
        const newLockState = {
          isLocked: true,
          expiresAt: oldLockState?.expiresAt,
          newPin,
        };
        localStorage.setItem("appLock", JSON.stringify(newLockState));
      });
      toast.success("PIN changed successfully");
      setIsResetting(false);
      setPassword("");
      setResetForm({
        newPin: "",
        otp: "",
        showOtpField: false,
        otpRequested: false,
      });
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to change PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const renderResetForm = () => (
    <div className="grid gap-6">
      <Password
        label="New PIN"
        placeholder="Enter new PIN (minimum 4 digits)"
        value={resetForm.newPin}
        className="[&>label>span]:font-medium"
        onChange={(e) =>
          setResetForm((prev) => ({ ...prev, newPin: e.target.value }))
        }
        maxLength={4}
        disabled={isLoading}
      />

      {!resetForm.otpRequested && (
        <Button size="sm" onClick={requestOtp} disabled={isLoading}>
          Request OTP Verification
        </Button>
      )}

      {resetForm.showOtpField && (
        <Input
          label="OTP Verification"
          placeholder="Enter the OTP sent to WhatsApp"
          value={resetForm.otp}
          className="[&>label>span]:font-medium"
          onChange={(e) =>
            setResetForm((prev) => ({ ...prev, otp: e.target.value }))
          }
          disabled={isLoading}
        />
      )}

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setIsResetting(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button onClick={handleResetSubmit} disabled={isLoading}>
          {isLoading ? "Changing PIN..." : "Change PIN"}
        </Button>
      </div>
    </div>
  );

  const renderLockForm = () => (
    <>
      <Password
        placeholder="Enter your password"
        size="lg"
        className="[&>label>span]:font-medium"
        onChange={(e) => setPassword(e.target.value)}
        labelClassName="text-gray-900"
      />
      {error && (
        <Alert color="danger" size="sm">
          {error}
        </Alert>
      )}
    </>
  );

  return (
    <Modal
      isOpen={lock}
      size="full"
      onClose={() => {}}
      containerClassName="flex items-center justify-center bg-gray-50"
    >
      <div className="flex w-full flex-col justify-center px-5">
        <div className="mx-auto w-full max-w-md py-12 md:max-w-lg lg:max-w-xl">
          <div className="flex flex-col items-center">
            <Link href={"/"} className="mb-7 inline-block max-w-[64px] lg:mb-9">
              <Image
                src={LogoMain}
                alt="Gymforce"
                className="size-10 dark:invert"
              />
            </Link>
            <Title
              as="h3"
              className="mb-7 text-center text-[28px] font-bold leading-snug md:text-3xl md:!leading-normal lg:mb-10 lg:text-4xl text-gray-900 dark:text-gray-200"
            >
              {isResetting ? "Reset PIN" : "Unlock your App"}
            </Title>
          </div>
          <div className="grid gap-8 p-8 border rounded-lg">
            {isResetting ? renderResetForm() : renderLockForm()}
          </div>
          {!isResetting && (
            <Text className="mt-6 text-center text-[15px] leading-loose text-gray-700 lg:mt-8 lg:text-start xl:text-base">
              Forgot your Lock password?{" "}
              <Button variant="text" onClick={() => setIsResetting(true)}>
                Reset
              </Button>
            </Text>
          )}
        </div>
      </div>
    </Modal>
  );
}
