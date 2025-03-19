// import { routes } from '@/config/routes';
import PersonalInfoView from '@/app/shared/account-settings/personal-info';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Profile Settings'),
};

export default function ProfileSettingsFormPage({
  params: { locale },
}: {
  params: {
    locale: string;
  };
}) {
  return <PersonalInfoView />;
}
