import PasswordSettingsView from "@/app/shared/account-settings/password-settings";
import { metaObject } from "@/config/site.config";

export const metadata = {
  ...metaObject("Password"),
};

export default function ProfileSettingsFormPage({
  params: { locale },
}: {
  params: {
    locale: string;
  };
}) {
  return <PasswordSettingsView />;
}
