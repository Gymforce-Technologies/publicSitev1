import { routes } from "@/config/routes";
// import { DUMMY_ID } from "@/config/constants";
import {
  PiSquaresFourDuotone,
  PiCurrencyCircleDollarDuotone,
  PiUsersThreeBold,
  PiArticleMediumDuotone,
  PiUsersDuotone,
  PiChartLineDuotone,
  // PiUserCircleDuotone,
  // PiCaretCircleUpDownBold,
  // PiUserCheckBold,
  PiCubeFocusBold,
  // PiCirclesFourDuotone,
  PiWhatsappLogoBold,
  PiBellSimpleRingingDuotone,
  PiChartBarDuotone,
  PiChartPieSliceFill,
  PiCoins,
  PiOfficeChairFill,
} from "react-icons/pi";
// import { BiCalendarWeek, BiCategoryAlt, BiSolidOffer } from "react-icons/bi";
import {
  FaAddressCard,
  FaBowlRice,
  FaBuildingUser,
  FaCalendarXmark,
  FaCartShopping,
  FaChartPie,
  FaClock,
  FaEnvelopesBulk,
  FaMoneyBillTrendUp,
  FaRegCalendarCheck,
  FaUserClock,
  FaUsersViewfinder,
} from "react-icons/fa6";
import {
  RiAppsFill,
  RiChatPollLine,
  // RiBuildingFill,
  // RiGalleryFill,
  RiListSettingsLine,
  RiShoppingBag3Fill,
} from "react-icons/ri";
import {
  TbChefHat,
  TbReportAnalytics,
  TbShoppingBagPlus,
} from "react-icons/tb";
// import { HiMiniClipboardDocumentList } from "react-icons/hi2";
import { IoIosList, IoMdPersonAdd } from "react-icons/io";
import {
  LucideDumbbell,
  LucideFileClock,
  // LucideListEnd,
  LucideListMinus,
  // LucideListOrdered,
  LucideListRestart,
  // LucideListStart,
  // LucideListTree,
  LucideListX,
  LucidePackagePlus,
} from "lucide-react";
import { BsPersonFillAdd, BsPersonFillCheck } from "react-icons/bs";
import {
  MdOutlineCategory,
  MdOutlinePayment,
  MdSportsGymnastics,
  MdSportsHandball,
  MdOutlineMarkEmailUnread,
  MdNoMeals,
  MdFormatListBulleted,
  MdShoppingCartCheckout,
  // MdBusiness,
} from "react-icons/md";
import { IoBody, IoLibrarySharp, IoMan } from "react-icons/io5";
// import {
//   BiCalendarWeek,
//   BiSolidUserBadge,
//   BiSolidUserRectangle,
// } from "react-icons/bi";
import { FaClipboardList } from "react-icons/fa";
// import { AiOutlineWhatsApp } from "react-icons/ai";
// import { MdMessage } from "react-icons/md";
// import { CiImport } from "react-icons/ci";
export const menuItems = [
  // label start
  {
    name: "Overview",
    typeLevel: [1, 2, 3],
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    drop: false,
    icon: <PiSquaresFourDuotone />,
    typeLevel: [1, 2, 3],
    permission: { name: "public", access: "read" },
  },

  // {
  //   name: "SMS",
  //   href: routes.sms,
  //   drop: false,
  //   icon:<MdMessage />
  // },
  {
    name: "Follow ups",
    href: routes.leads.followupTypes,
    drop: false,
    icon: <FaUsersViewfinder />,
    new: true,
    typeLevel: [1, 2, 3],
    permission: { name: "mainEnquiryManagement", access: "no_access" },
  },
  {
    // name:"Enquiry",
    name: "Enquiry",
    href: routes.leads.leadsList,
    drop: true,
    icon: <PiChartLineDuotone />,
    permission: { name: "mainEnquiryManagement", access: "no_access" },
    typeLevel: [1, 2, 3],
    dropdownItems: [
      {
        name: "All Enquiries",
        href: routes.leads.leadsList,
        drop: true,
        icon: <PiChartLineDuotone />,
      },
      {
        name: "Add Enquiry",
        href: routes.leads.leadsAdd,
        drop: false,
        icon: <BsPersonFillAdd />,
      },
    ],
  },
  {
    name: "Member",
    href: routes.members.list,
    drop: true,
    icon: <PiUsersDuotone />,
    typeLevel: [1, 2, 3],
    permission: { name: "mainMemberManagement", access: "no_access" },
    dropdownItems: [
      {
        name: "All Members",
        href: routes.members.list,
        drop: false,
        icon: <IoIosList />,
      },
      {
        name: "Add New Member",
        href: routes.members.new,
        drop: false,
        icon: <IoMdPersonAdd />,
      },
      // {
      //   name:"Config",
      //   href:"Member/Config",
      //   drop:true,
      //   icon:<svg className="fill-current"  data-name="Layer 1" height="200" id="Layer_1" viewBox="0 0 200 200" width="200" xmlns="http://www.w3.org/2000/svg">
      //   <title/><path  d="M36.5,75C41,89.5,54,100,70,100s29-10.5,33.5-25H170a10,10,0,0,0,0-20H103.5C99,40.5,86,30,70,30S41,40.5,36.5,55H25a10,10,0,0,0,0,20ZM70,50A15,15,0,1,1,55,65,14.73,14.73,0,0,1,70,50Zm105,75H163.5C159,110.5,146,100,130,100s-29,10.5-33.5,25H30a10,10,0,0,0,0,20H96.5c4.5,14.5,17.5,25,33.5,25s29-10.5,33.5-25H175a10,10,0,0,0,0-20Zm-45,25a15,15,0,1,1,15-15A14.73,14.73,0,0,1,130,150Z"/>
      //   </svg>,
      // }
    ],
  },
  {
    name: "Membership",
    href: routes.Membership.list,
    icon: <PiArticleMediumDuotone />,
    drop: true,
    permission: { name: "mainMembershipManagement", access: "no_access" },
    typeLevel: [1, 2, 3],
    dropdownItems: [
      {
        name: "All",
        href: routes.Membership.list,
        icon: <IoIosList />,
        drop: false,
      },
      {
        name: "PT",
        href: routes.Membership.pt,
        icon: <BsPersonFillCheck />,
        drop: false,
      },
      {
        name: "Dues",
        href: routes.Membership.duelist,
        icon: <LucideListX />,
        drop: false,
      },
      {
        name: "Expiry",
        href: routes.Membership.upcomming,
        icon: <LucideListRestart />,
        drop: false,
      },
      {
        name: "Expired",
        href: routes.Membership.expired,
        icon: <LucideListMinus />,
        drop: false,
      },
    ],
  },
  {
    name: "Analytics",
    href: routes.analytic.business,
    drop: true,
    icon: <PiChartBarDuotone />,
    permission: { name: "mainAnalyticsManagement", access: "no_access" },
    new: true,
    typeLevel: [1, 2, 3],
    dropdownItems: [
      {
        name: "Business Stats",
        href: routes.analytic.business,
        drop: false,
        icon: <FaChartPie />,
      },
      {
        name: "Members Stats",
        href: routes.analytic.members,
        drop: false,
        icon: <FaUserClock />,
      },
      {
        name: "Membership Stats",
        href: routes.analytic.membership,
        drop: false,
        icon: <PiChartPieSliceFill />,
      },
      {
        name: "Enquiry Stats",
        href: routes.analytic.enquiry,
        drop: false,
        icon: <FaBuildingUser />,
      },
      {
        name: "Expense Stats",
        href: routes.analytic.expenses,
        drop: false,
        icon: <FaMoneyBillTrendUp />,
      },
    ],
  },
  {
    name: "Inventory",
    href: routes.eCommerce.products,
    drop: true,
    icon: <RiShoppingBag3Fill />,
    new: true,
    typeLevel: [1],
    permission: { name: "public", access: "read" },
    dropdownItems: [
      {
        name: "Products",
        href: routes.eCommerce.products,
        drop: false,
        icon: <FaCartShopping />,
        // type:[1]
      },
      {
        name: "Categories",
        href: routes.eCommerce.categories,
        drop: false,
        icon: <MdOutlineCategory />,
      },
      {
        name: "Orders",
        href: routes.eCommerce.orders,
        drop: false,
        icon: <MdFormatListBulleted />,
      },
    ],
  },
  {
    name: "Finance",
    href: routes.finance.allinvoices,
    drop: true,
    icon: <PiCurrencyCircleDollarDuotone />,
    permission: { name: "mainPaymentManagement", access: "no_access" },
    typeLevel: [1, 2, 3],
    dropdownItems: [
      {
        name: "All Invoices",
        href: routes.finance.allinvoices,
        drop: false,
        icon: (
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-3 5h3m-6 0h.01M12 16h3m-6 0h.01M10 3v4h4V3h-4Z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    name: "Expenses",
    href: routes.expenses,
    drop: false,
    icon: (
      <svg
        id="Layer_1"
        version="1.1"
        viewBox="0 0 30 30"
        xmlSpace="preserve"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        fill="currentColor"
      >
        <path
          className="st1"
          d="M25,22v4c0,0.6-0.4,1-1,1H6c-0.6,0-1-0.4-1-1V13c0-0.6,0.4-1,1-1h18c0.6,0,1,0.4,1,1v4h-4.5c-1.4,0-2.5,1.1-2.5,2.5c0,1.4,1.1,2.5,2.5,2.5H25z M20.5,18.5c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S21.1,18.5,20.5,18.5z M18.5,2C17.1,2,16,3.1,16,4.5S17.1,7,18.5,7S21,5.9,21,4.5S19.9,2,18.5,2z M14.7,10C14.9,9.6,15,9.2,15,8.7c0-1.7-1.3-3-3-3s-3,1.3-3,3C9,9.2,9.1,9.6,9.3,10H14.7z"
        />
      </svg>
    ),
    typeLevel: [1, 2, 3],
    permission: { name: "mainExpenseManagement", access: "no_access" },
  },
  {
    name: "Attendance",
    href: routes.attendance,
    drop: false,
    icon: <FaRegCalendarCheck />,
    permission: { name: "mainAttendanceManagement", access: "no_access" },
    typeLevel: [1, 2, 3],
  },
  {
    name: "Seat Allocation",
    href: routes.seats,
    icon: <PiOfficeChairFill />,
    drop: false,
    new: true,
    permission: { name: "mainBookingManagement", access: "no_access" },
    typeLevel: [2],
  },
  {
    name: "Booking",
    href: routes.booking,
    drop: false,
    icon: <FaClipboardList />,
    permission: { name: "mainBookingManagement", access: "no_access" },
    new: true,
    typeLevel: [1],
  },
  {
    name: "Staff",
    href: routes.staff.allstaffs,
    drop: true,
    icon: <PiUsersThreeBold />,
    typeLevel: [1, 2, 3],
    permission: { name: "private", access: "no_access" },
    dropdownItems: [
      {
        name: "All Staffs",
        href: routes.staff.allstaffs,
        drop: false,
        icon: <PiUsersThreeBold />,
      },
      {
        name: "Add Staff",
        href: routes.staff.addstaff,
        drop: false,
        icon: <IoMdPersonAdd />,
      },
    ],
  },
  {
    name: "Books",
    href: routes.books,
    // drop:true,
    icon: <IoLibrarySharp />,
    typeLevel: [2],
    permission: { name: "mainBookManagement", access: "public" },
    dropdownItems: [
      {
        name: "All Books",
        href: routes.books,
        // drop:true,
        icon: <IoLibrarySharp />,
        typeLevel: [2],
        permission: { name: "mainBookManagement", access: "public" },
      },
      {
        name: "Return/Issue History",
        href: routes.bookIssuereturn,
        // drop:true,
        icon: <LucideFileClock />,
        typeLevel: [2],
        permission: { name: "mainBookManagement", access: "public" },
      },
    ],
    // drop
  },
  {
    name: "Workout",
    href: routes.workout.workoutList,
    drop: true,
    icon: <MdSportsHandball />,
    permission: { name: "mainWorkoutManagement", access: "no_access" },
    new: true,
    typeLevel: [1],
    dropdownItems: [
      {
        name: "Workouts",
        href: routes.workout.workoutList,
        drop: false,
        icon: <MdSportsHandball />,
      },
      {
        name: "Exercises",
        href: routes.workout.exercise,
        drop: false,
        icon: <MdSportsGymnastics />,
      },
      {
        name: "Equipments",
        href: routes.workout.equipments,
        drop: false,
        icon: <LucideDumbbell />,
      },
      {
        name: "Body Parts",
        href: routes.workout.bodyParts,
        drop: false,
        icon: <IoMan />,
      },
    ],
  },
  {
    name: "Diet",
    href: routes.meals,
    drop: true,
    icon: <MdNoMeals />,
    permission: { name: "mainDietManagement", access: "no_access" },
    new: true,
    typeLevel: [1],
    dropdownItems: [
      {
        name: "Meal Plans",
        href: routes.meals,
        drop: false,
        icon: <FaBowlRice />,
      },
      {
        name: "Recipes",
        href: routes.recipe,
        drop: false,
        icon: <TbChefHat />,
      },
    ],
  },
  {
    name: "Center Settings",
    href: routes.center.home,
    drop: true,
    icon: <RiListSettingsLine />,
    typeLevel: [1, 2, 3],
    permission: { name: "private", access: "no_access" },
    dropdownItems: [
      {
        name: " Settings",
        href: routes.center.home,
        drop: true,
        icon: (
          <svg
            className="h-6 w-6 fill-current"
            version="1.1"
            viewBox="0 0 24 24"
            xmlSpace="preserve"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <g id="info" />
            <g id="icons">
              <g id="settings2">
                <path d="M5,11h14c2.2,0,4-1.8,4-4c0-2.2-1.8-4-4-4H5C2.8,3,1,4.8,1,7C1,9.2,2.8,11,5,11z M5,5c1.1,0,2,0.9,2,2c0,1.1-0.9,2-2,2    S3,8.1,3,7C3,5.9,3.9,5,5,5z" />
                <path d="M19,13H5c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4h14c2.2,0,4-1.8,4-4C23,14.8,21.2,13,19,13z M19,19c-1.1,0-2-0.9-2-2    c0-1.1,0.9-2,2-2s2,0.9,2,2C21,18.1,20.1,19,19,19z" />
              </g>
            </g>
          </svg>
        ),
      },
      // {
      //   name: "Advanced",
      //   href: routes.center.advanced,
      //   drop: false,
      //   icon: <PiCubeFocusBold />,
      // },
      {
        name: "Social Connections",
        href: routes.center.contactdetails,
        drop: false,
        new: true,
        icon: <RiAppsFill />,
      },
      {
        name: "Tax and Legals",
        href: routes.center.taxLegal,
        drop: false,
        icon: <TbReportAnalytics />,
      },
    ],
  },
  {
    name: "Subscription",
    href: routes.plans,
    drop: false,
    new: true,
    typeLevel: [1, 2, 3],
    permission: { name: "private", access: "no_access" },
    icon: (
      <svg
        version="1.1"
        viewBox="0 0 24 24"
        xmlSpace="preserve"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        fill="currentColor"
      >
        <g id="icons">
          <path
            d="M23,3c0-1.1-0.9-2-2-2l-7.3,0c-0.5,0-1,0.2-1.4,0.6L1.6,12.3c-0.8,0.8-0.8,2.1,0,2.9l7.3,7.3c0.8,0.8,2.1,0.8,2.9,0 l10.7-10.7c0.4-0.4,0.6-0.9,0.6-1.4L23,3z M17,9.1c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2s2,0.9,2,2C19,8.2,18.1,9.1,17,9.1z"
            id="notes"
          />
        </g>
      </svg>
    ),
    dropdownItems: [
      {
        name: "Center Plans",
        href: routes.plans,
        drop: false,
        icon: (
          <svg
            version="1.1"
            viewBox="0 0 24 24"
            xmlSpace="preserve"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            fill="currentColor"
          >
            <g id="icons">
              <path
                d="M23,3c0-1.1-0.9-2-2-2l-7.3,0c-0.5,0-1,0.2-1.4,0.6L1.6,12.3c-0.8,0.8-0.8,2.1,0,2.9l7.3,7.3c0.8,0.8,2.1,0.8,2.9,0 l10.7-10.7c0.4-0.4,0.6-0.9,0.6-1.4L23,3z M17,9.1c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2s2,0.9,2,2C19,8.2,18.1,9.1,17,9.1z"
                id="notes"
              />
            </g>
          </svg>
        ),
      },
      {
        name: "Credit's",
        href: routes.addons,
        drop: false,
        icon: <TbShoppingBagPlus />,
      },
    ],
  },
  {
    name: "Bulk Message",
    href: routes.bulkMessage,
    icon: <FaEnvelopesBulk />,
    new: true,
    drop: false,
    permission: { name: "public", access: "read" },
  },
  {
    name: "Config",
    href: routes.memberCategories,
    drop: true,
    typeLevel: [1, 2, 3],
    icon: (
      <svg
        className="fill-current"
        data-name="Layer 1"
        height="200"
        id="Layer_1"
        viewBox="0 0 200 200"
        width="200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title />
        <path d="M36.5,75C41,89.5,54,100,70,100s29-10.5,33.5-25H170a10,10,0,0,0,0-20H103.5C99,40.5,86,30,70,30S41,40.5,36.5,55H25a10,10,0,0,0,0,20ZM70,50A15,15,0,1,1,55,65,14.73,14.73,0,0,1,70,50Zm105,75H163.5C159,110.5,146,100,130,100s-29,10.5-33.5,25H30a10,10,0,0,0,0,20H96.5c4.5,14.5,17.5,25,33.5,25s29-10.5,33.5-25H175a10,10,0,0,0,0-20Zm-45,25a15,15,0,1,1,15-15A14.73,14.73,0,0,1,130,150Z" />
      </svg>
    ),
    permission: { name: "mainConfigManagement", access: "no_access" },
    dropdownItems: [
      {
        name: "Sources",
        href: routes.VisitingSources,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            width="24px"
            height="24px"
            // strokeWidth={2}
            viewBox="0 0 512 512"
            style={{
              shapeRendering: "geometricPrecision",
              textRendering: "geometricPrecision",
              // imageRendering: "optimizeQuality",
              fillRule: "evenodd",
              clipRule: "evenodd",
            }}
            fill="currentColor"
          >
            <g>
              <path
                style={{ opacity: 0.929 }}
                // fill="#000000"
                d="M 80.5,-0.5 C 94.1667,-0.5 107.833,-0.5 121.5,-0.5C 156.532,8.36033 181.366,29.3603 196,62.5C 236.833,50.5294 277.666,50.5294 318.5,62.5C 332.052,28.9444 356.385,7.94437 391.5,-0.5C 405.167,-0.5 418.833,-0.5 432.5,-0.5C 474.253,10.9196 500.586,37.5863 511.5,79.5C 511.5,92.5 511.5,105.5 511.5,118.5C 503.066,153.343 482.399,178.01 449.5,192.5C 449.167,193.167 448.833,193.833 448.5,194.5C 460.5,234.5 460.5,274.5 448.5,314.5C 463.762,321.901 477.262,331.901 489,344.5C 500.005,358.175 507.505,373.508 511.5,390.5C 511.5,403.5 511.5,416.5 511.5,429.5C 503.453,464.72 482.787,489.553 449.5,504C 404.556,518.973 366.056,509.14 334,474.5C 327.014,466.196 321.847,456.863 318.5,446.5C 277.833,458.452 237.166,458.452 196.5,446.5C 170.664,497.916 129.331,518.083 72.5,507C 56.5711,502.289 42.7378,494.123 31,482.5C 28.9449,473.556 32.4449,469.723 41.5,471C 69.1119,495.324 100.112,500.991 134.5,488C 173.178,468.275 189.678,436.775 184,393.5C 176.387,361.22 156.887,339.72 125.5,329C 79.0989,318.788 44.9323,334.621 23,376.5C 14.0599,399.654 14.3933,422.654 24,445.5C 26.4347,452.571 24.1014,456.904 17,458.5C 14.1128,458.097 11.7795,456.764 10,454.5C -9.72823,405.249 0.43844,363.416 40.5,329C 48.2327,323.803 56.2327,319.136 64.5,315C 52.5,274.667 52.5,234.333 64.5,194C 18.221,172.298 -2.94563,135.798 1,84.5C 9.81956,39.4623 36.3196,11.1289 80.5,-0.5 Z M 99.5,13.5 C 146.871,17.0405 175.371,42.0405 185,88.5C 186.798,103.379 184.798,117.712 179,131.5C 175.099,140.039 170.432,148.039 165,155.5C 164.498,163.653 168.331,166.82 176.5,165C 195.84,142.838 204.007,117.005 201,87.5C 200.73,84.7759 200.23,82.1092 199.5,79.5C 199.709,78.914 200.043,78.414 200.5,78C 238.36,66.362 276.026,66.6954 313.5,79C 306.25,125.825 322.583,161.825 362.5,187C 384.741,198.436 408.074,202.269 432.5,198.5C 444.5,235.831 444.5,273.165 432.5,310.5C 385.606,304.032 349.44,320.699 324,360.5C 312.104,382.443 308.604,405.61 313.5,430C 275.9,442.473 238.233,442.64 200.5,430.5C 206.843,382.672 189.51,346.172 148.5,321C 126.648,310.308 103.814,306.808 80,310.5C 68.6667,273.167 68.6667,235.833 80,198.5C 104.61,202.232 128.11,198.399 150.5,187C 156.707,179.667 155.207,174.5 146,171.5C 104.819,192.192 68.152,186.192 36,153.5C 15.6014,127.492 10.9347,98.825 22,67.5C 37.1008,34.0376 62.9342,16.0376 99.5,13.5 Z M 410.5,13.5 C 454.683,16.3333 482.85,38.9999 495,81.5C 501.072,124.19 485.239,155.69 447.5,176C 406.704,191.343 372.204,182.51 344,149.5C 323.915,119.216 322.248,87.8832 339,55.5C 355.82,29.5086 379.653,15.5086 410.5,13.5 Z M 115.5,68.5 C 121.522,68.3526 126.356,70.686 130,75.5C 132.395,104.576 119.895,123.743 92.5,133C 88.2028,134.092 83.8695,134.425 79.5,134C 87.8326,130.61 89.4993,125.276 84.5,118C 67.941,111.369 60.1077,99.2021 61,81.5C 72.8648,91.0095 86.3648,94.8428 101.5,93C 103,92.1667 104.167,91 105,89.5C 103.52,79.659 107.02,72.659 115.5,68.5 Z M 202.5,225.5 C 211.5,225.5 220.5,225.5 229.5,225.5C 229.5,238.5 229.5,251.5 229.5,264.5C 220.5,264.5 211.5,264.5 202.5,264.5C 202.5,251.5 202.5,238.5 202.5,225.5 Z M 401.5,325.5 C 447.955,323.817 478.788,344.817 494,388.5C 502.298,433.735 486.132,466.901 445.5,488C 401.414,503.194 365.914,491.694 339,453.5C 319.03,413.365 324.863,377.532 356.5,346C 369.833,335.331 384.833,328.497 401.5,325.5 Z M 377.5,372.5 C 400.502,372.333 423.502,372.5 446.5,373C 447.333,373.833 448.167,374.667 449,375.5C 449.667,398.5 449.667,421.5 449,444.5C 448.692,445.308 448.192,445.975 447.5,446.5C 424.21,447.656 400.876,447.823 377.5,447C 376.692,446.692 376.025,446.192 375.5,445.5C 374.344,422.21 374.177,398.876 375,375.5C 376.045,374.627 376.878,373.627 377.5,372.5 Z M 88.5,388.5 C 100.139,395.322 111.806,402.155 123.5,409C 112.248,416.211 100.748,423.044 89,429.5C 88.5001,415.837 88.3334,402.171 88.5,388.5 Z M 408.5,403.5 C 414.295,402.137 417.961,404.304 419.5,410C 414.8,419.735 409.8,419.902 404.5,410.5C 405.094,407.692 406.427,405.359 408.5,403.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.928 }}
                // fill="#000000"
                d="M 419.5,40.5 C 426.175,40.3337 432.842,40.5004 439.5,41C 442.366,42.3929 443.699,44.7262 443.5,48C 443.592,50.8139 442.592,53.1473 440.5,55C 434.581,56.1956 428.581,56.8622 422.5,57C 418.359,58.4741 415.526,61.3074 414,65.5C 413.5,73.4931 413.334,81.4931 413.5,89.5C 418.511,89.3341 423.511,89.5007 428.5,90C 433.343,94.3796 433.677,99.0462 429.5,104C 424.264,105.339 418.93,105.839 413.5,105.5C 413.667,121.17 413.5,136.837 413,152.5C 409.987,157.535 405.82,158.702 400.5,156C 399.299,155.097 398.465,153.931 398,152.5C 397.5,136.837 397.333,121.17 397.5,105.5C 392.401,105.825 387.401,105.325 382.5,104C 378.221,98.967 378.554,94.3003 383.5,90C 388.155,89.5008 392.821,89.3342 397.5,89.5C 397.334,80.8269 397.5,72.1603 398,63.5C 400.918,51.7517 408.085,44.085 419.5,40.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.931 }}
                // fill="#000000"
                d="M 113.5,52.5 C 121.543,52.0101 128.876,54.0101 135.5,58.5C 139.226,55.9702 143.226,53.9702 147.5,52.5C 155.453,54.7282 157.62,59.7282 154,67.5C 152.185,71.7958 149.852,75.7958 147,79.5C 147.442,105.787 136.942,126.287 115.5,141C 91.0276,153.849 66.6943,153.516 42.5,140C 38.5,135.667 38.5,131.333 42.5,127C 48.9829,126.16 55.3162,124.826 61.5,123C 48.5181,111.394 43.0181,96.8936 45,79.5C 45.5731,72.8742 47.2397,66.5409 50,60.5C 52.9948,57.7352 56.4948,56.9019 60.5,58C 67.695,67.8491 77.195,74.3491 89,77.5C 92.0143,63.9867 100.181,55.6533 113.5,52.5 Z M 115.5,68.5 C 107.02,72.659 103.52,79.659 105,89.5C 104.167,91 103,92.1667 101.5,93C 86.3648,94.8428 72.8648,91.0095 61,81.5C 60.1077,99.2021 67.941,111.369 84.5,118C 89.4993,125.276 87.8326,130.61 79.5,134C 83.8695,134.425 88.2028,134.092 92.5,133C 119.895,123.743 132.395,104.576 130,75.5C 126.356,70.686 121.522,68.3526 115.5,68.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.934 }}
                // fill="#000000"
                d="M 306.5,176.5 C 309.187,176.336 311.854,176.503 314.5,177C 316.333,177.5 317.5,178.667 318,180.5C 318.989,224.25 318.656,267.917 317,311.5C 313.421,314.854 309.588,315.187 305.5,312.5C 303.333,309.531 301.999,306.197 301.5,302.5C 296.325,299.412 290.992,296.579 285.5,294C 281.196,289.845 280.862,285.512 284.5,281C 286.199,280.042 288.033,279.542 290,279.5C 294.329,280.33 298.329,281.997 302,284.5C 302.833,258.494 302.667,232.494 301.5,206.5C 283.781,215.612 265.281,222.612 246,227.5C 245.5,239.495 245.333,251.495 245.5,263.5C 252.69,264.548 259.69,266.381 266.5,269C 272.701,276.309 271.201,281.475 262,284.5C 255.518,282.421 249.018,280.421 242.5,278.5C 241.5,279 240.5,279.5 239.5,280C 234.511,280.499 229.511,280.666 224.5,280.5C 225.482,296.329 226.482,312.162 227.5,328C 226.791,336.522 222.457,339.189 214.5,336C 213.667,335.167 212.833,334.333 212,333.5C 210.606,315.844 209.439,298.177 208.5,280.5C 199.565,282.03 192.731,279.03 188,271.5C 186.394,255.22 186.061,238.887 187,222.5C 188.618,215.216 193.118,211.049 200.5,210C 212.833,209.333 225.167,209.333 237.5,210C 239.355,210.422 241.189,210.922 243,211.5C 263.706,206.395 283.206,198.395 301.5,187.5C 301.833,183.17 303.5,179.504 306.5,176.5 Z M 202.5,225.5 C 202.5,238.5 202.5,251.5 202.5,264.5C 211.5,264.5 220.5,264.5 229.5,264.5C 229.5,251.5 229.5,238.5 229.5,225.5C 220.5,225.5 211.5,225.5 202.5,225.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.935 }}
                // fill="#000000"
                d="M 374.5,356.5 C 399.502,356.333 424.502,356.5 449.5,357C 457.333,359.5 462.5,364.667 465,372.5C 465.667,397.833 465.667,423.167 465,448.5C 462.833,456 458,460.833 450.5,463C 424.833,463.667 399.167,463.667 373.5,463C 365.556,460.723 360.722,455.556 359,447.5C 358.333,422.5 358.333,397.5 359,372.5C 361.685,364.65 366.852,359.316 374.5,356.5 Z M 377.5,372.5 C 376.878,373.627 376.045,374.627 375,375.5C 374.177,398.876 374.344,422.21 375.5,445.5C 376.025,446.192 376.692,446.692 377.5,447C 400.876,447.823 424.21,447.656 447.5,446.5C 448.192,445.975 448.692,445.308 449,444.5C 449.667,421.5 449.667,398.5 449,375.5C 448.167,374.667 447.333,373.833 446.5,373C 423.502,372.5 400.502,372.333 377.5,372.5 Z M 408.5,403.5 C 406.427,405.359 405.094,407.692 404.5,410.5C 409.8,419.902 414.8,419.735 419.5,410C 417.961,404.304 414.295,402.137 408.5,403.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.927 }}
                // fill="#000000"
                d="M 81.5,368.5 C 86.1929,368.898 90.5262,370.398 94.5,373C 110.749,382.374 126.916,391.874 143,401.5C 147.44,409.211 145.94,415.377 138.5,420C 122.67,428.747 107.004,437.747 91.5,447C 86.5,450.333 81.5,450.333 76.5,447C 74.2256,444.656 73.0589,441.822 73,438.5C 72.3333,418.833 72.3333,399.167 73,379.5C 73.4543,373.897 76.2876,370.23 81.5,368.5 Z M 88.5,388.5 C 88.3334,402.171 88.5001,415.837 89,429.5C 100.748,423.044 112.248,416.211 123.5,409C 111.806,402.155 100.139,395.322 88.5,388.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.924 }}
                // fill="#000000"
                d="M 405.5,387.5 C 423.044,385.382 433.044,393.049 435.5,410.5C 433.253,426.793 423.92,434.293 407.5,433C 392.247,428.336 386.414,418.169 390,402.5C 393.106,395.225 398.272,390.225 405.5,387.5 Z M 408.5,403.5 C 406.427,405.359 405.094,407.692 404.5,410.5C 409.8,419.902 414.8,419.735 419.5,410C 417.961,404.304 414.295,402.137 408.5,403.5 Z"
              />
            </g>
          </svg>
        ),
        drop: false,
      },
      {
        name: "Advanced Fields",
        href: routes.configuration,
        icon: <RiListSettingsLine />,
        drop: false,
        new: true,
      },
      {
        name: "Points",
        href: routes.loyalty,
        icon: <PiCoins />,
        drop: false,
        new: true,
      },
      {
        name: "Measurements",
        href: routes.measurements,
        icon: <IoBody />,
        drop: false,
        new: true,
        typeLevel: [1],
      },
      {
        name: "Categories",
        href: routes.memberCategories,
        icon: <MdOutlineCategory />,
        drop: false,
      },
      {
        name: "Payment Modes",
        href: routes.finance.addpaymentmodes,
        drop: false,
        icon: <MdOutlinePayment />,
      },
      {
        name: "Master Packages",
        href: routes.Membership.masterPackages,
        icon: <LucidePackagePlus />,
        drop: false,
      },
      {
        name: "Staff Shifts",
        href: routes.shifts,
        icon: <FaClock />,
        drop: false,
        new: true,
        typeLevel: [1],
      },
      // FaCalendarXmark
      {
        name: "Holidays",
        href: routes.holidays,
        icon: <FaCalendarXmark />,
        drop: false,
        new: true,
      },
      {
        name: "Batches",
        href: routes.batches,
        icon: (
          <svg
            data-name="Layer 1"
            id="Layer_1"
            viewBox="0 0 508.33 508.36"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <defs>
              <style>
                {`
              .cls-1 {
                fill-rule:evenodd;
              }
              .cls-2 {
                fill: #fff;
              }
            `}
              </style>
            </defs>
            <path
              className="cls-1"
              d="M485,29.72c11.45,15.13,16.61,40.21,19.15,70.7,3.36,45.5,4.71,100.1,6,156.52-1.67,57.47-2.35,115.43-6,156.52-2.88,31.54-9,52.66-19.22,65.47-13,12.79-37.94,23.59-73.5,26.15-43.25,3.69-96.61,3.65-155.48,5.1-65.44-1.12-109.82-.64-156.38-5.08-36.32-2.52-60.08-13.19-74.7-26.07-10.83-14.54-14-30-17-66.24-3.75-41.85-4.58-98.56-6-155.54C4,200.57,4.13,143.44,7.9,100.74,10.43,67.05,14.42,44.4,24.65,30,39,17.77,63.48,11.69,100,8.69c50-5.85,102.06-7,155.88-6.87,55.39.09,108.56,1.67,156,6.34,32,2.56,58.48,8.07,73.07,21.56Z"
              transform="translate(-1.83 -1.82)"
            />
            <path
              className="cls-2"
              d="M228.7,281.11c-29.17,0-42.82,27.07-42.82,53.52h0c0,10.7,0,10.7,10.7,10.7h64.23c10.7,0,10.7,0,10.7-10.7h0C271.52,308.19,257.87,281.11,228.7,281.11Z"
              transform="translate(-1.83 -1.82)"
            />
            <circle className="cls-2" cx="226.86" cy="225.77" r="42.82" />
            <path
              className="cls-2"
              d="M346.45,270.41c-29.17,0-53.52,27.07-53.52,53.52v10.7c0,10.7,0,10.7,10.7,10.7h85.64c10.7,0,10.7,0,10.7-10.7v-10.7C400,297.48,375.62,270.41,346.45,270.41Z"
              transform="translate(-1.83 -1.82)"
            />
            <circle className="cls-2" cx="344.61" cy="204.36" r="53.52" />
            <path
              className="cls-2"
              d="M132.36,291.82c-21.41,0-32.11,21.41-32.11,32.11v10.7c0,10.7,0,10.7,10.7,10.7h42.82c10.7,0,10.7,0,10.7-10.7v-10.7C164.47,313.23,153.76,291.82,132.36,291.82Z"
              transform="translate(-1.83 -1.82)"
            />
            <circle className="cls-2" cx="130.52" cy="247.18" r="32.11" />
          </svg>
        ),
        drop: false,
      },
      {
        name: "Enrollment Fee",
        href: routes.enrollment,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            fill="currentColor"
            id="icon"
            viewBox="0 0 128 128"
            width="24"
          >
            <path
              d="M0 0 C1.06424698 -0.01007584 1.06424698 -0.01007584 2.1499939 -0.02035522 C4.49232011 -0.03932988 6.83435954 -0.04325954 9.17675781 -0.04541016 C10.81097531 -0.05184001 12.44519165 -0.05856851 14.07940674 -0.06558228 C17.50576442 -0.0775548 20.93202131 -0.08126328 24.35839844 -0.08007812 C28.7341593 -0.07987529 33.10926811 -0.10714032 37.48487473 -0.14162254 C40.86166306 -0.16394113 44.23829593 -0.16791411 47.61515045 -0.16685867 C49.22739146 -0.1692086 50.83963715 -0.1779977 52.45180511 -0.19352341 C68.12705368 -0.33030884 68.12705368 -0.33030884 74.87988281 4.29052734 C76.93847656 6.43896484 76.93847656 6.43896484 78.31738281 8.66552734 C79.02701172 9.75994141 79.02701172 9.75994141 79.75097656 10.87646484 C82.12299342 15.94880539 82.04848215 21.44398329 82.08300781 26.95458984 C82.08870789 27.66908295 82.09440796 28.38357605 82.10028076 29.11972046 C82.10967427 30.62065167 82.11624209 32.12160299 82.12011719 33.62255859 C82.12988435 35.91588796 82.16098362 38.20834289 82.19238281 40.50146484 C82.19890833 41.96500123 82.20416057 43.42854397 82.20800781 44.89208984 C82.22035461 45.57445709 82.23270142 46.25682434 82.24542236 46.95986938 C82.231234 49.99041903 82.01212906 52.04784916 80.55078125 54.72949219 C78.87988281 56.29052734 78.87988281 56.29052734 75.81738281 56.66552734 C72.87988281 56.29052734 72.87988281 56.29052734 70.87988281 54.29052734 C70.6585608 51.79519691 70.55466455 49.40214453 70.53613281 46.90380859 C70.52151001 46.16857468 70.50688721 45.43334076 70.49182129 44.67582703 C70.4452556 42.31828286 70.41113097 39.96082128 70.37988281 37.60302734 C70.33849914 34.51548737 70.28463627 31.42851621 70.22363281 28.34130859 C70.21571716 27.28935051 70.21571716 27.28935051 70.2076416 26.21614075 C70.11568971 21.59793964 69.79802122 17.5193611 67.87988281 13.29052734 C61.63878041 10.08672469 53.95359826 10.98485062 47.09863281 10.98974609 C45.75777048 10.9858523 44.41690936 10.98151623 43.0760498 10.97676086 C40.27543119 10.96932894 37.47493872 10.96956834 34.67431641 10.97485352 C31.10012807 10.9806523 27.52645725 10.96369317 23.95235443 10.94050884 C21.18639144 10.92572138 18.42055179 10.92490643 15.65455627 10.92801857 C13.70095535 10.92726153 11.74737344 10.91343551 9.79382324 10.89933777 C0.88222477 10.87204729 0.88222477 10.87204729 -7.12011719 14.29052734 C-9.56734146 18.66580798 -9.4096245 23.14473356 -9.39477539 28.0246582 C-9.39988632 28.89357193 -9.40499725 29.76248566 -9.41026306 30.6577301 C-9.42413786 33.52368093 -9.42320393 36.38939072 -9.42089844 39.25537109 C-9.42478642 41.25167429 -9.4291213 43.24797666 -9.43388367 45.24427795 C-9.44134125 49.426307 -9.44105785 53.60825161 -9.43579102 57.7902832 C-9.42999585 63.14471359 -9.44693086 68.49879814 -9.47013569 73.85317135 C-9.48487969 77.97532669 -9.48574383 82.09739885 -9.48262596 86.21957588 C-9.4831388 88.19350431 -9.48836947 90.16743744 -9.49843788 92.14134026 C-9.51079832 94.90345506 -9.50401303 97.66489761 -9.49243164 100.42700195 C-9.50007538 101.23914154 -9.50771912 102.05128113 -9.51559448 102.88803101 C-9.4707371 107.73742653 -8.82915658 111.10046253 -6.12011719 115.29052734 C-0.39771164 118.31848733 6.55626811 117.67487868 12.88769531 117.76904297 C13.75652344 117.79546875 14.62535156 117.82189453 15.52050781 117.84912109 C16.30973633 117.86257568 17.09896484 117.87603027 17.91210938 117.88989258 C19.87988281 118.29052734 19.87988281 118.29052734 21.87988281 121.29052734 C21.32432726 126.8460829 21.32432726 126.8460829 19.87988281 128.29052734 C15.53403645 128.63055098 11.17480356 128.61583151 6.81738281 128.66552734 C4.99303711 128.72160156 4.99303711 128.72160156 3.13183594 128.77880859 C-4.29214393 128.85131626 -9.44443281 128.3067884 -15.12011719 123.29052734 C-20.96864161 117.28809438 -21.41901973 110.904509 -21.41064453 102.93969727 C-21.41736176 102.01693497 -21.42407898 101.09417267 -21.43099976 100.14344788 C-21.44994777 97.10257535 -21.4539024 94.06192393 -21.45605469 91.02099609 C-21.46248501 88.89878754 -21.46921354 86.77657987 -21.47622681 84.65437317 C-21.48819171 80.20844468 -21.49190845 75.76259384 -21.49072266 71.31665039 C-21.49051956 65.63401851 -21.51781634 59.95188723 -21.55226707 54.26937389 C-21.57456097 49.88631425 -21.57855942 45.50337458 -21.5775032 41.12026405 C-21.57985561 39.02599679 -21.5886587 36.93172604 -21.60416794 34.83751488 C-21.62387729 31.90117228 -21.61797021 28.96590281 -21.60595703 26.02954102 C-21.61719604 25.17365387 -21.62843506 24.31776672 -21.64001465 23.4359436 C-21.5727389 16.92840833 -20.16616673 10.64638508 -15.67279625 5.69600201 C-10.48254803 1.20674726 -6.80857863 0.04050114 0 0 Z "
              transform="translate(27.1201171875,-0.29052734375)"
            />
            <path
              d="M0 0 C4.51300787 2.05136721 7.0911952 4.7255435 9.3046875 9.078125 C10.54496776 12.50631538 10.61885578 15.43025364 10 19 C7.35639951 24.31443052 4.15364572 28.38179854 0.046875 32.6328125 C-0.53100769 33.23253876 -1.10889038 33.83226501 -1.70428467 34.45016479 C-2.92704354 35.70982592 -4.15428193 36.96515272 -5.38574219 38.21630859 C-6.61994457 39.47992753 -7.84160612 40.75592882 -9.04980469 42.04443359 C-17.88615337 51.46777865 -25.31076735 56.35227567 -38 59 C-38.73637695 59.19609863 -39.47275391 59.39219727 -40.23144531 59.59423828 C-43.18571709 60.27204056 -45.99013936 60.16721448 -49 60 C-51 58 -51 58 -51.25341797 54.40625 C-50.84164236 40.02447058 -44.08748654 29.54547016 -34.00390625 19.8515625 C-32.6278635 18.56743038 -31.2515589 17.28357881 -29.875 16 C-28.48821339 14.65639827 -27.10407974 13.31005272 -25.72265625 11.9609375 C-23.20115852 9.52278343 -20.67667471 7.08892657 -18.11279297 4.6953125 C-17.60682587 4.22109863 -17.10085876 3.74688477 -16.57955933 3.25830078 C-11.51105388 -0.77934709 -6.24056014 -0.71553592 0 0 Z M-8 11 C-8.32539569 14.10055631 -8.32539569 14.10055631 -6.125 16.1875 C-4.21188666 18.21631554 -4.21188666 18.21631554 -2 18 C-1.30840599 16.15274948 -1.30840599 16.15274948 -1 14 C-1.66 13.01 -2.32 12.02 -3 11 C-5.58380177 10.74969023 -5.58380177 10.74969023 -8 11 Z M-27 29.5 C-27.83273438 30.29148437 -28.66546875 31.08296875 -29.5234375 31.8984375 C-34.4404531 36.75180241 -37.11118579 40.07994648 -38 47 C-29.22899386 46.03422355 -25.31974627 42.19780957 -19.4375 35.875 C-18.61958984 35.02550781 -17.80167969 34.17601562 -16.95898438 33.30078125 C-14.95576645 31.21556025 -12.97078953 29.11581771 -11 27 C-12.61594832 24.95880212 -14.2856382 22.95927063 -16 21 C-20.32803245 21 -24.07624736 26.61245482 -27 29.5 Z "
              transform="translate(112,68)"
            />
            <path
              d="M0 0 C1.72716751 -0.01925285 1.72716751 -0.01925285 3.48922729 -0.03889465 C4.74333405 -0.04628159 5.9974408 -0.05366852 7.28955078 -0.0612793 C9.20781174 -0.07338692 9.20781174 -0.07338692 11.16482544 -0.08573914 C13.87680938 -0.10077858 16.588767 -0.11061075 19.30078125 -0.11816406 C22.77697558 -0.12923216 26.25253036 -0.16363099 29.72849846 -0.20333576 C33.04049102 -0.2357439 36.35241184 -0.24027595 39.66455078 -0.2487793 C40.91460907 -0.26628738 42.16466736 -0.28379547 43.4526062 -0.30183411 C45.18923019 -0.29744576 45.18923019 -0.29744576 46.9609375 -0.29296875 C47.98162323 -0.29883499 49.00230896 -0.30470123 50.05392456 -0.31074524 C52.60986328 0.17700195 52.60986328 0.17700195 54.50979614 2.03840637 C55.60986328 4.17700195 55.60986328 4.17700195 54.85986328 6.86450195 C53.60986328 9.17700195 53.60986328 9.17700195 52.60986328 10.17700195 C50.81038743 10.28646691 49.00661943 10.32609178 47.20385742 10.33813477 C46.04918472 10.34774231 44.89451202 10.35734985 43.70484924 10.36724854 C42.44760544 10.37149841 41.19036163 10.37574829 39.89501953 10.38012695 C37.97320107 10.38867706 37.97320107 10.38867706 36.01255798 10.3973999 C33.29637249 10.40791729 30.58021667 10.41375521 27.86401367 10.41723633 C24.37887055 10.4227249 20.8941174 10.4467569 17.40909672 10.47520828 C14.09191114 10.49828012 10.77478127 10.50028064 7.45751953 10.50512695 C6.20229996 10.51747375 4.94708038 10.52982056 3.65382385 10.5425415 C2.49599899 10.53954041 1.33817413 10.53653931 0.14526367 10.53344727 C-0.87764267 10.5370929 -1.90054901 10.54073853 -2.95445251 10.54449463 C-3.7582283 10.42322205 -4.56200409 10.30194946 -5.39013672 10.17700195 C-7.39013672 7.17700195 -7.39013672 7.17700195 -7.07763672 4.05200195 C-5.9477372 -0.6730324 -4.58066118 0.04424808 0 0 Z "
              transform="translate(33.39013671875,49.822998046875)"
            />
            <path
              d="M0 0 C1.72716751 -0.01925285 1.72716751 -0.01925285 3.48922729 -0.03889465 C4.74333405 -0.04628159 5.9974408 -0.05366852 7.28955078 -0.0612793 C9.20781174 -0.07338692 9.20781174 -0.07338692 11.16482544 -0.08573914 C13.87680938 -0.10077858 16.588767 -0.11061075 19.30078125 -0.11816406 C22.77697558 -0.12923216 26.25253036 -0.16363099 29.72849846 -0.20333576 C33.04049102 -0.2357439 36.35241184 -0.24027595 39.66455078 -0.2487793 C40.91460907 -0.26628738 42.16466736 -0.28379547 43.4526062 -0.30183411 C45.18923019 -0.29744576 45.18923019 -0.29744576 46.9609375 -0.29296875 C47.98162323 -0.29883499 49.00230896 -0.30470123 50.05392456 -0.31074524 C52.60986328 0.17700195 52.60986328 0.17700195 54.50979614 2.03840637 C55.60986328 4.17700195 55.60986328 4.17700195 54.85986328 6.86450195 C53.60986328 9.17700195 53.60986328 9.17700195 52.60986328 10.17700195 C50.81038743 10.28646691 49.00661943 10.32609178 47.20385742 10.33813477 C46.04918472 10.34774231 44.89451202 10.35734985 43.70484924 10.36724854 C42.44760544 10.37149841 41.19036163 10.37574829 39.89501953 10.38012695 C37.97320107 10.38867706 37.97320107 10.38867706 36.01255798 10.3973999 C33.29637249 10.40791729 30.58021667 10.41375521 27.86401367 10.41723633 C24.37887055 10.4227249 20.8941174 10.4467569 17.40909672 10.47520828 C14.09191114 10.49828012 10.77478127 10.50028064 7.45751953 10.50512695 C6.20229996 10.51747375 4.94708038 10.52982056 3.65382385 10.5425415 C2.49599899 10.53954041 1.33817413 10.53653931 0.14526367 10.53344727 C-0.87764267 10.5370929 -1.90054901 10.54073853 -2.95445251 10.54449463 C-3.7582283 10.42322205 -4.56200409 10.30194946 -5.39013672 10.17700195 C-7.39013672 7.17700195 -7.39013672 7.17700195 -7.07763672 4.05200195 C-5.9477372 -0.6730324 -4.58066118 0.04424808 0 0 Z "
              transform="translate(33.39013671875,29.822998046875)"
            />
            <path
              d="M0 0 C0.83729141 -0.0033284 1.67458282 -0.0066568 2.5372467 -0.01008606 C4.31185353 -0.01515881 6.08646992 -0.01749428 7.86108398 -0.01733398 C10.58267881 -0.01951922 13.30386768 -0.03766758 16.02539062 -0.05664062 C17.74609236 -0.05957467 19.46679602 -0.06155939 21.1875 -0.0625 C22.00524399 -0.06968552 22.82298798 -0.07687103 23.66551208 -0.08427429 C29.43133421 -0.06085329 29.43133421 -0.06085329 31.66015625 2.16796875 C31.91015625 5.16796875 31.91015625 5.16796875 31.66015625 8.16796875 C29.06075056 10.76737444 27.23380188 10.42673686 23.69116211 10.47151184 C22.87655518 10.47060043 22.06194824 10.46968903 21.22265625 10.46875 C19.96884155 10.47517769 19.96884155 10.47517769 18.68969727 10.48173523 C16.92107042 10.48748248 15.15241994 10.48797588 13.38378906 10.48364258 C10.67081615 10.48048117 7.95893183 10.50394095 5.24609375 10.52929688 C3.5299493 10.53156961 1.8138019 10.53227348 0.09765625 10.53125 C-0.71695068 10.54045975 -1.53155762 10.54966949 -2.37084961 10.55915833 C-4.65625 10.5402832 -4.65625 10.5402832 -8.33984375 10.16796875 C-10.33984375 7.16796875 -10.33984375 7.16796875 -10.02734375 4.04296875 C-8.70284076 -1.49586196 -4.91534438 0.00667251 0 0 Z "
              transform="translate(36.33984375,69.83203125)"
            />
          </svg>
        ),
        drop: false,
      },
      {
        name: "Templates",
        href: routes.WATemplates,
        drop: false,
        icon: <PiWhatsappLogoBold />,
      },
      {
        name: "Notification Settings",
        href: routes.notificationSettings,
        icon: <PiBellSimpleRingingDuotone />,
        drop: false,
      },
      {
        name: "Message Log's",
        href: routes.logs,
        icon: <RiChatPollLine />,
        drop: false,
      },
      {
        name: "Email SMTP",
        href: routes.smtp,
        icon: <MdOutlineMarkEmailUnread />,
        new: true,
      },
    ],
  },
];
