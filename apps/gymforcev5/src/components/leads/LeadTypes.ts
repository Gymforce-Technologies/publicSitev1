export type Lead = {
  name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  visiting_date: string;
  converted: boolean;
  visiting_center: number | null;
  source_id: number | null;
  status_id: number | null;
  category_id: number | null;
  tentative_joining_date: string;
};

export type Category = {
  id: number;
  categoryName: string;
};

export type Status = {
  id: number;
  leadStatusName: string;
};

export type Source = {
  id: number;
  leadSourceName: string;
};
