'use client';

import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import axios from 'axios';
import { Alert, Button, Input, Text } from 'rizzui';
import { useMedia } from '@core/hooks/use-media';
import { Form } from '@core/ui/form';
import { routes } from '@/config/routes';
import {
  forgetPasswordSchema,
  ForgetPasswordSchema,
} from '@/validators/forget-password.schema';
import { BiLogoGmail } from 'react-icons/bi';
import { PiMicrosoftOutlookLogoFill } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

const initialValues = {
  email: '',
};

export default function ResetPasswordComponent() {
  const isMedium = useMedia('(max-width: 1200px)', false);
  const [reset, setReset] = useState({});
  const [isResetSent, setIsResetSent] = useState(false);
  const t=useTranslations("auth");
  const onSubmit: SubmitHandler<ForgetPasswordSchema> = async (data) => {
    try {
      const URL = process.env.NEXT_PUBLIC_URL;
      await axios.post(`${URL}/auth/request-reset/`, data).then((res) => {
        toast.success(res.data.msg, {
          style: {
            maxWidth: '500px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        });
      });
      setIsResetSent(true);
    } catch (error: any) {
      console.error(error);
      // console.log(error.response.data.errors.non_field_errors[0]);
      toast.error(error.response.data.errors.non_field_errors[0], {
        style: {
          maxWidth: '500px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      });
      setReset(initialValues);
    }
  }
  const mailClients = [
    { name: 'Gmail', icon: BiLogoGmail, url: 'https://mail.google.com/mail/u/0/#inbox', },
    { name: 'Outlook', icon: PiMicrosoftOutlookLogoFill, url: 'https://outlook.live.com/mail/0/inbox',},
  ];

  return (
      <div>
        {!isResetSent ? (
          <>
            <Form<ForgetPasswordSchema>
              validationSchema={forgetPasswordSchema(t)}
              resetValues={reset}
              onSubmit={onSubmit}
              useFormProps={{
                defaultValues: initialValues,
              }}
            >
              {({ register, formState: { errors } }) => (
                <div className="space-y-6">
                  <Input
                    type="email"
                    label="Email"
                    size='lg'
                    placeholder="Enter your email"
                    className="[&>label>span]:font-medium"
                    {...register('email')}
                    error={errors.email?.message}
                    labelClassName='text-gray-900 '
                  />
                  <Button
                    className="w-full"
                    type="submit"
                    size={isMedium ? 'lg' : 'xl'}
                  >
                    Reset Password
                  </Button>
                </div>
              )}
            </Form>
            <Text className="mt-6 text-center text-[15px] leading-loose text-gray-700  md:mt-7 lg:mt-9 lg:text-base">
             {` Don't want to reset? `}
              <Link
                href={routes.auth.signIn}
                className="font-bold text-gray-700 transition-colors   hover:text-primary"
                >
                Sign In
              </Link>
            </Text>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center text-gray-700  '>
            <p className=" mb-4">
              {` We've sent a password reset link to your email`}
              </p>
            <div className="flex flex-col items-center gap-4">
              <Text className="text-gray-900  font-bold">Quick access to your inbox:</Text>
              <div className="flex justify-center gap-4">
                {mailClients.map((client, index) => (
                  <a
                    key={index}
                    href={client.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center gap-2 hover:underline text-center py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-gray-100 `}
                    aria-label={`Open ${client.name}`}
                  >
                    <client.icon className="size-6 text-primary " />
                    <span className="text-sm font-medium">{client.name}</span>
                  </a>
                ))}
              </div>
              <Text className="text-sm mt-4 text-center">
                If you use a different email service, please open your email application and check your inbox for the reset link.
              </Text>
            </div>
          </div>
        )}
    </div>
  );
}