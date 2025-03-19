'use client';

// import Addmember from '@/app/[locale]/(home)/members/_components/Addmember';
import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';

type TableLayoutProps = {
  data: unknown[];
  header: string;
  fileName: string;
} & PageHeaderTypes;

export default function TableLayout({
  data,
  header,
  fileName,
  children,
  ...props
}: React.PropsWithChildren<TableLayoutProps>) {
  return (
    <>
      <PageHeader {...props}>
      </PageHeader>

      {children}
    </>
  );
}
