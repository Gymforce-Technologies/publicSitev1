import PublicHeader from "@/layouts/hydrogen/public-header";
import MemberSidebar from "@/layouts/hydrogen/public-member-sidebar";

export default function PublicMemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-grow">
      <MemberSidebar
        className="fixed hidden xl:block bg-inherit"
        // memberId={memberId as string}
        // link={previousPath}
      />
      <div className="flex w-full flex-col xl:ms-[270px] xl:w-[calc(100%-270px)] 2xl:ms-72 2xl:w-[calc(100%-288px)]">
        <PublicHeader />
        <div className="flex flex-grow flex-col  px-4 pb-6 pt-2 md:px-5 lg:px-6 lg:pb-8 3xl:px-8 3xl:pt-4 4xl:px-10 4xl:pb-9">
          {children}
        </div>
      </div>
    </div>
  );
}
