import { routes } from '@/config/routes';
// import { DUMMY_ID } from '@/config/constants';

// Note: do not add href in the label object, it is rendering as label
export const pageLinks = [
  // label start
  {
    name: 'Home',
  },
  // label end
  {
    name: 'Dashboard',
    href: routes.dashboard,
  },

  {
    name:'SMS'
  },
  {
    name: 'SMS History',
    href: routes.sms,
  },
  {
    name:'Enquiry'
  },
  {
    name: 'All Enquiry',
    href: routes.leads.leadsList,
  },
   {
    name: 'Add Enquiry',
    href: routes.leads.leadsAdd,
  },
  {
    name: 'Follow Ups',
    href: routes.leads.followupTypes,
  } 
  , {
    name: 'Categories',
    href: routes.leads.leadCategories,
  },
  {
    name: 'Sources',
    href: routes.leads.leadSources,
  },
  {
    name: 'Status',
    href: routes.leads.leadStatus,
  },
  {
    name: 'Member',
  },
  {
    name: 'Members',
    href: routes.members.list,
  },
  {
    name: 'Add Member',
    href: routes.members.new,
  },
  {
    name: 'Membership',
  },
  {
    name: 'Memberships',
    href: routes.Membership.list,
  },
  {
    name: 'Due List',
    href: routes.Membership.duelist,
  },
  {
    name: 'MasterPackages',
    href: routes.Membership.masterPackages,
  },
  // {
  //   name: 'Batches',
  //   href: routes.Membership.batches,
  // },
  {
    name: 'Staff',
  },
  {
    name: 'List Staff',
    href: routes.staff.allstaffs,
  },
  {
    name: 'Add Staff',
    href: routes.staff.addstaff,
  },
  {
    name: 'Finance',
   
  },
  {
    name: 'All Invoices',
    href: routes.finance.allinvoices,
  },
  // {
  //   name: 'Today Invoices',
  //   href: routes.finance.todayinvoices,
  // },
  // {
  //   name: 'Monthly Invoices',
  //   href: routes.finance.monthlyinvoices,
  // },
  // {
  //   name: 'Expences',
  //   href: routes.finance.expences,
  // },
  {
    name: 'Summary',
    href: routes.finance.summary,
  },
  {
    name: 'Payment Modes',
    href: routes.finance.addpaymentmodes,
  },
   {
    name: 'All Invoices',
    href: routes.finance.allinvoices,
  },
  {
    name: 'Attendance',
  },
  {
    name: 'Attendence',
    href: routes.attendance,
  },
  {
    name: 'CenterSettings',
  },
  {
    name: 'Basic Settings',
    href: routes.center.home,
  },
  // {
  //   name: 'Advance Settings',
  //   href: routes.center.advanced,
  // },
  {
    name: 'Contact Details',
    href: routes.center.contactdetails,
  },
  {
    name: 'Tax & Legals',
    href: routes.center.taxLegal,
  },
  // {
  //   name: 'Billing',
  //   href: routes.center.billing,
  // }
];
