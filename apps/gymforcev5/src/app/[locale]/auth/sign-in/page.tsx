import SignInForm from "./sign-in-form";
import AuthWrapperOne from "@/app/shared/auth-layout/auth-wrapper-one";
import Image from "next/image";
import UnderlineShape from "@core/components/shape/underline";
import { metaObject } from "@/config/site.config";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useTranslations } from "next-intl";
import Hero from "@/../public/gymforce_hero.png";
// import LogoMainText from "@/../public/svg/gymforce-text/gymforce-text-black.svg";

export const metadata = {
  ...metaObject("Sign In"),
};

export default function SignIn() {
  const t = useTranslations("auth");
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <AuthWrapperOne
        title={
          <>
            Welcome back! Please{" "}
            <span className="relative inline-block ">
              Sign in to
              <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue md:w-28 xl:-bottom-1.5 xl:w-36" />
            </span>{" "}
            continue.
          </>
        }
        description="By signing up, you will gain access to exclusive content, special
        offers, and be the first to hear about exciting news and updates."
        bannerTitle="The simplest way to manage your workspace."
        bannerDescription="Amet minim mollit non deserunt ullamco est sit aliqua dolor do
        amet sint velit officia consequat duis."
        isSocialLoginActive={false}
        pageImage={
          <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
            <Image
              src={Hero}
              alt="Sign Up Thumbnail"
              fill
              priority
              sizes="(max-width: 768px) 100vw"
              className="object-cover"
            />
          </div>
        }
      >
        <SignInForm />
      </AuthWrapperOne>
    </GoogleOAuthProvider>
  );
}
