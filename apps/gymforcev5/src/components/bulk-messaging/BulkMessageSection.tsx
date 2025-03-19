"use client";
import {
  AdvancedRadio,
  Button,
  Input,
  Tab,
  Text,
  Textarea,
} from "rizzui";
import { useEffect, useRef, useState } from "react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import {
  FaCalendar,
  FaCalendarCheck,
  FaEnvelope,
  FaIndianRupeeSign,
  FaPhone,
  FaUser,
  FaUserCheck,
  FaUserClock,
  FaUserPlus,
  FaUsers,
  FaWhatsapp,
} from "react-icons/fa6";
import MetricCard from "@core/components/cards/metric-card";
import { RiBuilding3Fill } from "react-icons/ri";
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiMagnifyingGlassBold,
} from "react-icons/pi";
import { XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { DatePicker } from "@core/ui/datepicker";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { formatDate } from "@core/utils/format-date";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
// import ConfirmModal from "./ConfirmModal";
// import EmailResponseModal from "./EmailResponseModal";
// import MemberSearchDrawer from "./MemberSearchDrawer";
// import AvatarCard from "@core/ui/avatar-card";
import dynamic from "next/dynamic";
const AvatarCard = dynamic(() => import("@core/ui/avatar-card"));
const MemberSearchDrawer = dynamic(() => import("./MemberSearchDrawer"), {
  ssr: false,
});
const ConfirmModal = dynamic(() => import("./ConfirmModal"), {
  ssr: false,
});
const EmailResponseModal = dynamic(() => import("./EmailResponseModal"), {
  ssr: false,
});

interface MemberMetric {
  title: string;
  value: number;
  icon: React.ReactNode;
  req: string;
}

interface TemplateItem {
  label: string;
  value: string;
  icon: JSX.Element;
}
const convertToDateFnsFormat = (format: string) => {
  return format
    .replace("DD", "dd")
    .replace("MMM", "MMM")
    .replace("MM", "MM")
    .replace("YYYY", "yyyy");
};
export default function BulkMessagingSection() {
  const [mailCreds, setMailCreds] = useState<any>(null);
  const [waCreds, setWaCreds] = useState<any>(null);
  const [memberListInfo, setMemberListInfo] = useState<MemberMetric[]>([
    {
      title: "Total Members",
      value: 0,
      icon: <FaUsers size={18} />,
      req: "all",
    },
    {
      title: "Active Members",
      value: 0,
      icon: <FaUserCheck size={18} />,
      req: "active",
    },

    {
      title: "Expired Members",
      value: 0,
      icon: <FaUserClock size={18} />,
      req: "expired",
    },
    {
      title: "Daily Limit",
      value: 0,
      icon: <FaCalendar size={18} />,
      req: "daily_limit",
    },
    {
      title: "Available Credits",
      value: 0,
      icon: <FaCalendarCheck size={20} />,
      req: "overall_remaining_credits",
    },
  ]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [memberIds, setMemberIds] = useState<any[]>([]);
  const [newTemplate, setNewTemplate] = useState({
    subject: "",
    content: "",
    member_type: "all",
  });

  const [waTemplate, setWaTemplate] = useState({
    content: "",
    member_type: "all",
    schedule_time: "",
  });
  const [currentView, setCurrentView] = useState<"email" | "wa">("email");
  const [showMembers, setShowMembers] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [subLoading, setSubLoding] = useState(false);
  const [emailResp, setEmailResp] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState<"email" | "wa" | null>(null);
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const items: TemplateItem[] = [
    {
      label: "name",
      value: "{name}",
      icon: <FaUser size={14} className="group-hover:text-primary" />,
    },
    {
      label: "gym_name",
      value: "{gymName}",
      icon: <RiBuilding3Fill size={17} className="group-hover:text-primary" />,
    },
    {
      label: "phone",
      value: "{phone}",
      icon: <FaPhone size={15} className="group-hover:text-primary" />,
    },
    {
      label: "date_of_birth",
      value: "{dateOfBirth}",
      icon: <FaCalendar size={15} className="group-hover:text-primary" />,
    },
  ];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;
  const observerRef = useRef(null);
  const textareaRef2 = useRef<HTMLTextAreaElement>(null);

  const fetchCredentials = async () => {
    try {
      const gymId = await retrieveGymId();
      const [mailResp, waResp] = await Promise.all([
        AxiosPrivate.get(`/api/bulk-email/?gym_id=${gymId}`, {
          id: newID(`bulk-email-${gymId}`),
        }),
        AxiosPrivate.get(`/api/bulk-whatsapp/?gym_id=${gymId}`, {
          id: newID(`bulk-wa-${gymId}`),
        }),
      ]);
      // Update member list info with fetched data
      setMemberListInfo((prevMetrics) =>
        prevMetrics.map((metric) => {
          switch (metric.req) {
            case "all":
              return { ...metric, value: mailResp.data.all_members };
            case "active":
              return { ...metric, value: mailResp.data.active_members };
            case "expired":
              return { ...metric, value: mailResp.data.expired_members };
            default:
              return metric;
          }
        })
      );
      setMailCreds(mailResp.data);
      setWaCreds(waResp.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const getPreReq = async () => {
      await fetchCredentials();
      setCurrentView("email");
    };
    getPreReq();
  }, []);

  useEffect(() => {
    setMemberListInfo((prevMetrics) => {
      switch (currentView) {
        case "email":
          return prevMetrics.map((metric) => {
            switch (metric.req) {
              case "daily_limit":
                return { ...metric, value: mailCreds?.daily_limit };
              case "overall_remaining_credits":
                return {
                  ...metric,
                  value: mailCreds?.overall_remaining_credits,
                };
              default:
                return metric;
            }
          });
        case "wa":
          return prevMetrics.map((metric) => {
            switch (metric.req) {
              case "daily_limit":
                return { ...metric, value: waCreds?.remaining_daily_credits };
              case "overall_remaining_credits":
                return { ...metric, value: waCreds?.overall_credits };
              default:
                return metric;
            }
          });
      }
    });
  }, [currentView, mailCreds, waCreds]);

  const changeConfirm = (type: "email" | "wa" | null) => {
    setShowConfirm(type);
  };

  const insertTemplateItem = (item: TemplateItem) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = newTemplate.content;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);

      // Change from item.label to item.value
      const newContent = before + item.value + after;
      setNewTemplate((prev) => ({ ...prev, content: newContent }));

      setTimeout(() => {
        // Update cursor position based on value length instead of label length
        textareaRef.current!.selectionStart = start + item.value.length;
        textareaRef.current!.selectionEnd = start + item.value.length;
        textareaRef.current!.focus();
      }, 0);
    }
  };

  const insertWaTemplateItem = (item: TemplateItem) => {
    if (textareaRef2.current) {
      const start = textareaRef2.current.selectionStart;
      const end = textareaRef2.current.selectionEnd;
      const text = waTemplate.content;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);

      // Insert template value instead of label
      const newContent = before + item.value + after;
      setWaTemplate((prev) => ({ ...prev, content: newContent }));

      setTimeout(() => {
        // Update cursor position based on value length
        textareaRef2.current!.selectionStart = start + item.value.length;
        textareaRef2.current!.selectionEnd = start + item.value.length;
        textareaRef2.current!.focus();
      }, 0);
    }
  };

  const handleWaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") {
      const cursorPosition = textareaRef2.current!.selectionStart;
      const content = waTemplate.content;
      const beforeCursor = content.substring(0, cursorPosition);

      for (const item of items) {
        // Check for value instead of label
        if (beforeCursor.endsWith(item.value)) {
          e.preventDefault();
          const newContent =
            content.substring(0, cursorPosition - item.value.length) +
            content.substring(cursorPosition);
          setWaTemplate((prev) => ({ ...prev, content: newContent }));
          setTimeout(() => {
            textareaRef2.current!.selectionStart =
              cursorPosition - item.value.length;
            textareaRef2.current!.selectionEnd =
              cursorPosition - item.value.length;
          }, 0);
          break;
        }
      }
    }
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          handleSearch(searchText, true);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, searchText, memberList.length, showMembers]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") {
      const cursorPosition = textareaRef.current!.selectionStart;
      const content = newTemplate.content;
      const beforeCursor = content.substring(0, cursorPosition);

      for (const item of items) {
        // Check for value instead of label
        if (beforeCursor.endsWith(item.value)) {
          e.preventDefault();
          const newContent =
            content.substring(0, cursorPosition - item.value.length) +
            content.substring(cursorPosition);
          setNewTemplate((prev) => ({ ...prev, content: newContent }));
          setTimeout(() => {
            textareaRef.current!.selectionStart =
              cursorPosition - item.value.length;
            textareaRef.current!.selectionEnd =
              cursorPosition - item.value.length;
          }, 0);
          break;
        }
      }
    }
  };

  const handleSearch = async (
    searchInput: string,
    isLoadMore: boolean,
    load = false
  ) => {
    try {
      if (load) {
        setLoading(true);
      }
      if (!isLoadMore || load) {
        setOffset(0);
      }
      // Use the current offset state value directly
      const currentOffset = isLoadMore ? offset : 0;
      const gymid = await retrieveGymId();

      const response = await AxiosPrivate.post(
        `/api/member_search/v2/?gym_id=${gymid}`,
        {
          filterString: searchInput,
          limit: LIMIT,
          offset: currentOffset,
        }
      );

      const newMembers = response.data.data.memberList;
      const totalCount = response.data.data.totalCount;

      // Use functional updates to ensure we have the latest state
      setMemberList((prevList) =>
        isLoadMore ? [...prevList, ...newMembers] : newMembers
      );

      // Calculate if there are more items to load
      const newTotalCount = isLoadMore
        ? memberList.length + newMembers.length
        : newMembers.length;

      setHasMore(newTotalCount < totalCount);

      // Update offset only after data is loaded
      setOffset(isLoadMore ? currentOffset + LIMIT : LIMIT);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEmail = () => {
    setShowConfirm("email");
  };
  const handleBulkEmailFinal = async () => {
    let payload;
    let transformedContent = newTemplate.content;
    // items.forEach((item) => {
    //   transformedContent = transformedContent.replace(
    //     new RegExp(item.label, "g"),
    //     item.value
    //   );
    // });
    if (newTemplate.member_type === "selected") {
      const memberIdArray = memberIds.map((item) => item?.id);
      payload = {
        template: transformedContent,
        subject: newTemplate.subject,
        member_ids: memberIdArray,
      };
    } else {
      payload = {
        template: transformedContent,
        subject: newTemplate.subject,
        member_type: newTemplate.member_type,
      };
    }
    try {
      setSubLoding(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(`/api/bulk-email/?gym_id=${gymId}`, {
        ...payload,
      }).then((resp) => {
        toast.success("Emails Sent Successfully");
        console.log(resp);
        invalidateAll();
        setNewTemplate({
          content: "",
          member_type: "all",
          subject: "",
        });
        setMemberIds([]);
        setEmailResp(resp.data);
      });
      await fetchCredentials();
    } catch (error) {
      console.log(error);
    } finally {
      setSubLoding(false);
    }
  };
  const handleBulkWA = () => {
    setShowConfirm("wa");
  };
  const handleBulkWAFinal = async () => {
    let payload;
    let transformedContent = waTemplate.content;
    // items.forEach((item) => {
    //   transformedContent = transformedContent.replace(
    //     new RegExp(item.label, "g"),
    //     item.value
    //   );
    // });
    if (waTemplate.member_type === "selected") {
      const memberIdArray = memberIds.map((item) => item?.id);
      payload = {
        template: transformedContent,
        // subject: waTemplate.subject,
        member_ids: memberIdArray,
      };
    } else {
      payload = {
        template: transformedContent,
        // subject: waTemplate.subject,
        member_type: waTemplate.member_type,
      };
    }
    if (waTemplate.schedule_time) {
      payload = {
        ...payload,
        schedule_at: formatDate(
          new Date(waTemplate.schedule_time),
          "YYYY-MM-DD hh:mm:ss"
        ),
      };
    }
    try {
      setSubLoding(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/bulk-whatsapp/?gym_id=${gymId}`,
        {
          ...payload,
        }
      ).then((resp) => {
        // toast.success("Emails Sent Successfully");
        console.log(resp);
        invalidateAll();
        setWaTemplate({
          content: "",
          member_type: "all",
          schedule_time: "",
        });
        setMemberIds([]);
        toast.success(`WhatsApp Message sending started`);
        // setEmailResp(resp.data);
      });
      await fetchCredentials();
    } catch (error) {
      console.log(error);
    } finally {
      setSubLoding(false);
    }
  };

  const removeMember = (id: number) => {
    setMemberIds((prev) => {
      return prev.filter((member) => member.id !== id);
    });
  };
  const handleSearchInputChange = (input: string) => {
    setSearchText(input);
    setOffset(0);
    setMemberList([]);
    setHasMore(true);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      handleSearch(input, false, true);
    }, 1000);

    setTimeoutId(newTimeoutId);
  };
  const handleSelect = (data: any) => {
    setCurrentMember(data);
    setSearchText("");
    setMemberList([]);
    if (currentView === "email") {
      setNewTemplate((prev) => ({ ...prev, member_type: "selected" }));
    } else {
      setWaTemplate((prev) => ({
        ...prev,
        member_type: "selected",
      }));
    }
    setTimeout(() => {
      handleSearch("", false, true);
    }, 300);
  };

  useEffect(() => {
    if (memberIds.length > 0) {
      if (currentView === "email") {
        setNewTemplate((prev) => ({
          ...prev,
          member_type: "selected",
        }));
      } else {
        setWaTemplate((prev) => ({
          ...prev,
          member_type: "selected",
        }));
      }
    } else {
      setNewTemplate((prev) => ({
        ...prev,
        member_type: "all",
      }));
      setWaTemplate((prev) => ({
        ...prev,
        member_type: "all",
      }));
    }
  }, [memberIds]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex w-full items-center overflow-hidden">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>
        <div
          className="max-xl:flex items-center p-2 gap-4 xl:grid grid-cols-5 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
          ref={sliderEl}
        >
          {memberListInfo.map((metric) => (
            <MetricCard
              key={metric.req}
              title={metric.title}
              metric={
                metric.value
                  ? new Intl.NumberFormat().format(metric.value)
                  : "0"
              }
              className={`min-w-40 shadow border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50 ${metric.req !== "present" ? "hover:bg-primary-lighter hover:scale-105 peer-hover:bg-primary-lighter peer-hover:scale-105" : ""} cursor-pointer !p-2`}
              iconClassName={`text-primary bg-primary-lighter max-lg:size-[32px] duration-200 transition-all`}
              titleClassName="text-nowrap max-lg:text-xs font-medium max-lg:max-w-[110px] truncate"
              icon={metric.icon}
              metricClassName="text-primary max-lg:text-base text-center"
            />
          ))}
        </div>
        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={() => scrollToTheRight()}
          className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>
      <Tab className="lg:hidden">
        <Tab.List className="flex gap-4">
          <Tab.ListItem
            className="flex flex-row gap-2.5 items-center"
            onClick={() => setCurrentView("email")}
          >
            <FaEnvelope className="size-5" /> <Text>Email </Text>
          </Tab.ListItem>
          <Tab.ListItem
            className="flex flex-row gap-2.5 items-center"
            onClick={() => setCurrentView("wa")}
          >
            <FaWhatsapp className="size-5" /> <Text>WhatsApp</Text>
          </Tab.ListItem>
        </Tab.List>
        <Tab.Panels
          className="
        w-full max-w-3xl"
        >
          <Tab.Panel className="w-full  overflow-y-auto custom-scrollbar min-h-[50vh] p-2">
            <div className="flex flex-col gap-4">
              <Input
                label="Subject"
                value={newTemplate.subject}
                onChange={(e) => {
                  setNewTemplate((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }));
                }}
                className="w-full"
                placeholder="Enter Email Subject"
                labelClassName=""
              />
              <div className="space-y-2">
                <Text className="font-medium col-span-full">
                  Dynamic Fields
                </Text>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className={`group cursor-pointer ring-[1.5px] ring-gray-200 hover:ring-primary/50 ${
                        // Check content includes value instead of label
                        newTemplate.content.includes(item.value)
                          ? "ring-white text-primary bg-primary-lighter"
                          : ""
                      } p-2 rounded flex items-center gap-2`}
                      onClick={() => insertTemplateItem(item)}
                    >
                      {item.icon}
                      <Text className="font-medium capitalize">
                        {item.label.replaceAll("_", " ")}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
              <Textarea
                ref={textareaRef}
                label="Email Template"
                value={newTemplate.content}
                onChange={(e) => {
                  setNewTemplate((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }));
                }}
                onKeyDown={handleKeyDown}
                className="w-full"
                placeholder="Enter content [Try to Mimic the Sample template Messages]"
                labelClassName=""
              />
              <div className="flex flex-col gap-1.5">
                <Text className="font-medium">Send To :</Text>
                <div className="flex flex-row items-center gap-4 md:pl-10">
                  <AdvancedRadio
                    name="member_type"
                    value={newTemplate.member_type}
                    alignment="center"
                    onClick={() =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        member_type: "all",
                      }))
                    }
                    checked={newTemplate.member_type === "all"}
                    // className="flex flex-row gap-2 items-center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUsers className="size-5 text-primary" />
                    <Text>All</Text>
                  </AdvancedRadio>
                  <AdvancedRadio
                    name="member_type"
                    value={newTemplate.member_type}
                    onClick={() =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        member_type: "active",
                      }))
                    }
                    checked={newTemplate.member_type === "active"}
                    alignment="center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUserCheck className="size-5 text-primary" />
                    <Text>Active</Text>
                  </AdvancedRadio>
                  <AdvancedRadio
                    name="member_type"
                    value={newTemplate.member_type}
                    onClick={() =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        member_type: "expired",
                      }))
                    }
                    alignment="center"
                    checked={newTemplate.member_type === "expired"}
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUserClock className="size-5 text-primary" />
                    <Text>Expired</Text>
                  </AdvancedRadio>
                  <Button
                    onClick={() => {
                      setShowMembers(true);
                      setNewTemplate((prev) => ({
                        ...prev,
                        member_type: "selected",
                      }));
                      handleSearch("", false, true);
                    }}
                    className="max-md:hidden"
                  >
                    Select Members
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setShowMembers(true);
                    setNewTemplate((prev) => ({
                      ...prev,
                      member_type: "selected",
                    }));
                    handleSearch("", false, true);
                  }}
                  className="md:hidden mt-2 self-center"
                >
                  Select Members
                </Button>
              </div>
              {/* {newTemplate.member_type === "selected" ? (
                <div className="flex w-full items-center m-1"></div>
              ) : null} */}
              {memberIds.length && newTemplate.member_type === "selected" ? (
                <div className="grid sm:grid-cols-2 gap-4 m-1 my-4">
                  {memberIds.map((member) => (
                    <div
                      className="flex flex-row gap-4 items-center justify-between border rounded-xl p-3"
                      key={member?.name}
                    >
                      <AvatarCard
                        name={member.name}
                        src={member.image || "/placeholder-avatar.jpg"}
                        description={member.phone || ""}
                      />
                      <XIcon
                        className="cursor-pointer hover:text-primary"
                        onClick={() => removeMember(member?.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex w-full items-center justify-center">
                <Button
                  disabled={
                    !(newTemplate.content.length > 0) ||
                    !(newTemplate.subject.length > 0)
                  }
                  onClick={() => {
                    handleBulkEmail();
                  }}
                >
                  Send Email
                </Button>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel className="w-full  overflow-y-auto custom-scrollbar min-h-[50vh] p-1">
            <div className="flex flex-col gap-4">
              <div className="flex max-w-sm flex-col gap-2">
                <Text>Schedule Time : ( when the message should be send )</Text>
                <DatePicker
                  selected={
                    waTemplate.schedule_time
                      ? new Date(waTemplate.schedule_time)
                      : null
                  }
                  onChange={(date) => {
                    //@ts-ignore
                    setWaTemplate((prev) => ({
                      ...prev,
                      schedule_time: date,
                    }));
                  }}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  minDate={new Date()}
                  dateFormat={`${convertToDateFnsFormat(getDateFormat())} - hh:mm aa`}
                />
              </div>
              <div className="space-y-2">
                <Text className="font-medium col-span-full">
                  Dynamic Fields
                </Text>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className={`group cursor-pointer ring-[1.5px] ring-gray-200 hover:ring-primary/50 ${
                        // Check content includes value instead of label
                        waTemplate.content.includes(item.value)
                          ? "ring-white text-primary bg-primary-lighter"
                          : ""
                      } p-2 rounded flex items-center gap-2`}
                      onClick={() => insertWaTemplateItem(item)}
                    >
                      {item.icon}
                      <Text className="font-medium capitalize">
                        {item.label.replaceAll("_", " ")}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
              <Textarea
                ref={textareaRef2}
                label="Message"
                value={waTemplate.content}
                onChange={(e) => {
                  setWaTemplate((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }));
                }}
                onKeyDown={handleWaKeyDown}
                className="w-full"
                placeholder="Enter content [Try to Mimic the Sample template Messages]"
                labelClassName=""
              />
              <div className="flex flex-col gap-1.5">
                <Text className="font-medium">Send To :</Text>
                <div className="flex flex-row items-center gap-4 md:pl-10">
                  <AdvancedRadio
                    name="member_type"
                    value={waTemplate.member_type}
                    alignment="center"
                    onClick={() =>
                      setWaTemplate((prev) => ({
                        ...prev,
                        member_type: "all",
                      }))
                    }
                    checked={waTemplate.member_type === "all"}
                    // className="flex flex-row gap-2 items-center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUsers className="size-5 text-primary" />
                    <Text>All</Text>
                  </AdvancedRadio>
                  <AdvancedRadio
                    name="member_type"
                    value={waTemplate.member_type}
                    onClick={() =>
                      setWaTemplate((prev) => ({
                        ...prev,
                        member_type: "active",
                      }))
                    }
                    checked={waTemplate.member_type === "active"}
                    alignment="center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUserCheck className="size-5 text-primary" />
                    <Text>Active</Text>
                  </AdvancedRadio>
                  <AdvancedRadio
                    name="member_type"
                    value={waTemplate.member_type}
                    onClick={() =>
                      setWaTemplate((prev) => ({
                        ...prev,
                        member_type: "expired",
                      }))
                    }
                    alignment="center"
                    checked={waTemplate.member_type === "expired"}
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUserClock className="size-5 text-primary" />
                    <Text>Expired</Text>
                  </AdvancedRadio>
                  <Button
                    onClick={() => {
                      setShowMembers(true);
                      setWaTemplate((prev) => ({
                        ...prev,
                        member_type: "selected",
                      }));
                      handleSearch("", false, true);
                    }}
                    className="max-md:hidden"
                  >
                    Select Members
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setShowMembers(true);
                    setWaTemplate((prev) => ({
                      ...prev,
                      member_type: "selected",
                    }));
                    handleSearch("", false, true);
                  }}
                  className="md:hidden mt-2 self-center"
                >
                  Select Members
                </Button>
              </div>
              {memberIds.length && waTemplate.member_type === "selected" ? (
                <div className="grid sm:grid-cols-2 gap-4 m-1 my-4">
                  {memberIds.map((member) => (
                    <div
                      className="flex flex-row gap-4 items-center justify-between border rounded-xl p-3"
                      key={member?.name}
                    >
                      <AvatarCard
                        name={member.name}
                        src={member.image || "/placeholder-avatar.jpg"}
                        description={member.phone || ""}
                      />
                      <XIcon
                        className="cursor-pointer hover:text-primary"
                        onClick={() => removeMember(member?.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex w-full items-center justify-center">
                <Button
                  disabled={
                    !(waTemplate.content.length > 0)
                    // !(waTemplate.subject.length > 0)
                  }
                  onClick={() => {
                    handleBulkWA();
                  }}
                >
                  Send WhatsApp Message
                </Button>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab>
      <Tab vertical className="max-lg:hidden">
        <Tab.List className="flex gap-4">
          <Tab.ListItem
            className="flex flex-row gap-2.5 items-center"
            onClick={() => setCurrentView("email")}
          >
            <FaEnvelope className="size-5" />{" "}
            <Text className="truncate">Email Messaging</Text>
          </Tab.ListItem>
          <Tab.ListItem
            className="flex flex-row gap-2.5 items-center"
            onClick={() => setCurrentView("wa")}
          >
            <FaWhatsapp className="size-5" />{" "}
            <Text className="truncate">WhatsApp Messaging</Text>
          </Tab.ListItem>
        </Tab.List>
        <Tab.Panels
          className="
        w-full max-w-3xl"
        >
          <Tab.Panel className="w-full  overflow-y-auto custom-scrollbar min-h-[50vh] p-1">
            <div className="flex flex-col gap-4">
              <Input
                label="Subject"
                value={newTemplate.subject}
                onChange={(e) => {
                  setNewTemplate((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }));
                }}
                className="w-full"
                placeholder="Enter Email Subject"
                labelClassName=""
              />
              <div className="space-y-2">
                <Text className="font-medium col-span-full">
                  Dynamic Fields
                </Text>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className={`group cursor-pointer ring-[1.5px] ring-gray-200 hover:ring-primary/50 ${
                        // Check content includes value instead of label
                        newTemplate.content.includes(item.value)
                          ? "ring-white text-primary bg-primary-lighter"
                          : ""
                      } p-2 rounded flex items-center gap-2`}
                      onClick={() => insertTemplateItem(item)}
                    >
                      {item.icon}
                      <Text className="font-medium capitalize">
                        {item.label.replaceAll("_", " ")}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
              <Textarea
                ref={textareaRef}
                label="Email Template"
                value={newTemplate.content}
                onChange={(e) => {
                  setNewTemplate((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }));
                }}
                onKeyDown={handleKeyDown}
                className="w-full"
                placeholder="Enter content [Try to Mimic the Sample template Messages]"
                labelClassName=""
              />
              <div className="flex flex-col gap-1.5">
                <Text className="font-medium">Send To :</Text>
                <div className="flex flex-row items-center gap-4 pl-10">
                  <AdvancedRadio
                    name="member_type"
                    value={newTemplate.member_type}
                    alignment="center"
                    onClick={() =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        member_type: "all",
                      }))
                    }
                    checked={newTemplate.member_type === "all"}
                    // className="flex flex-row gap-2 items-center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUsers className="size-5 text-primary" />
                    <Text>All</Text>
                  </AdvancedRadio>
                  <AdvancedRadio
                    name="member_type"
                    value={newTemplate.member_type}
                    onClick={() =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        member_type: "active",
                      }))
                    }
                    checked={newTemplate.member_type === "active"}
                    alignment="center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUserCheck className="size-5 text-primary" />
                    <Text>Active</Text>
                  </AdvancedRadio>
                  <AdvancedRadio
                    name="member_type"
                    value={newTemplate.member_type}
                    onClick={() =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        member_type: "expired",
                      }))
                    }
                    alignment="center"
                    checked={newTemplate.member_type === "expired"}
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUserClock className="size-5 text-primary" />
                    <Text>Expired</Text>
                  </AdvancedRadio>
                  <Button
                    onClick={() => {
                      setShowMembers(true);
                      setNewTemplate((prev) => ({
                        ...prev,
                        member_type: "selected",
                      }));
                      handleSearch("", false, true);
                    }}
                  >
                    Select Members
                  </Button>
                </div>
              </div>
              {/* {newTemplate.member_type === "selected" ? (
                <div className="flex w-full items-center m-1"></div>
              ) : null} */}
              {memberIds.length && newTemplate.member_type === "selected" ? (
                <div className="grid grid-cols-3 gap-4 m-1 my-4">
                  {memberIds.map((member) => (
                    <div
                      className="flex flex-row gap-4 items-center justify-between border rounded-xl p-3"
                      key={member?.name}
                    >
                      <AvatarCard
                        name={member.name}
                        src={member.image || "/placeholder-avatar.jpg"}
                        description={member.phone || ""}
                      />
                      <XIcon
                        className="cursor-pointer hover:text-primary"
                        onClick={() => removeMember(member?.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex w-full items-center justify-center">
                <Button
                  disabled={
                    !(newTemplate.content.length > 0) ||
                    !(newTemplate.subject.length > 0)
                  }
                  onClick={() => {
                    handleBulkEmail();
                  }}
                >
                  Send Email
                </Button>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel className="w-full  overflow-y-auto custom-scrollbar min-h-[50vh] p-1">
            <div className="flex flex-col gap-4">
              <div className="flex max-w-sm flex-col gap-2">
                <Text>Schedule Time : ( when the message should be send )</Text>
                <DatePicker
                  selected={
                    waTemplate.schedule_time
                      ? new Date(waTemplate.schedule_time)
                      : null
                  }
                  onChange={(date) => {
                    //@ts-ignore
                    setWaTemplate((prev) => ({
                      ...prev,
                      schedule_time: date,
                    }));
                  }}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  minDate={new Date()}
                  dateFormat={`${convertToDateFnsFormat(getDateFormat())} - hh:mm aa`}
                />
              </div>
              <div className="space-y-2">
                <Text className="font-medium col-span-full">
                  Dynamic Fields
                </Text>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className={`group cursor-pointer ring-[1.5px] ring-gray-200 hover:ring-primary/50 ${
                        // Check content includes value instead of label
                        waTemplate.content.includes(item.value)
                          ? "ring-white text-primary bg-primary-lighter"
                          : ""
                      } p-2 rounded flex items-center gap-2`}
                      onClick={() => insertWaTemplateItem(item)}
                    >
                      {item.icon}
                      <Text className="font-medium capitalize">
                        {item.label.replaceAll("_", " ")}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
              <Textarea
                ref={textareaRef2}
                label="Message"
                value={waTemplate.content}
                onChange={(e) => {
                  setWaTemplate((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }));
                }}
                onKeyDown={handleWaKeyDown}
                className="w-full"
                placeholder="Enter content [Try to Mimic the Sample template Messages]"
                labelClassName=""
              />
              <div className="flex flex-col gap-1.5">
                <Text className="font-medium">Send To :</Text>
                <div className="flex flex-row items-center gap-4 pl-10">
                  <AdvancedRadio
                    name="member_type"
                    value={waTemplate.member_type}
                    alignment="center"
                    onClick={() =>
                      setWaTemplate((prev) => ({
                        ...prev,
                        member_type: "all",
                      }))
                    }
                    checked={waTemplate.member_type === "all"}
                    // className="flex flex-row gap-2 items-center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUsers className="size-5 text-primary" />
                    <Text>All</Text>
                  </AdvancedRadio>
                  <AdvancedRadio
                    name="member_type"
                    value={waTemplate.member_type}
                    onClick={() =>
                      setWaTemplate((prev) => ({
                        ...prev,
                        member_type: "active",
                      }))
                    }
                    checked={waTemplate.member_type === "active"}
                    alignment="center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUserCheck className="size-5 text-primary" />
                    <Text>Active</Text>
                  </AdvancedRadio>
                  <AdvancedRadio
                    name="member_type"
                    value={waTemplate.member_type}
                    onClick={() =>
                      setWaTemplate((prev) => ({
                        ...prev,
                        member_type: "expired",
                      }))
                    }
                    alignment="center"
                    checked={waTemplate.member_type === "expired"}
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <FaUserClock className="size-5 text-primary" />
                    <Text>Expired</Text>
                  </AdvancedRadio>
                  {/* <AdvancedRadio
                    name="member_type"
                    value={waTemplate.member_type}
                    onClick={() =>
                      setWaTemplate((prev) => ({
                        ...prev,
                        member_type: "selected",
                      }))
                    }
                    alignment="center"
                    contentClassName="flex flex-row gap-2 items-center"
                  >
                    <MdChecklistRtl className="size-5 text-primary" />
                    <Text>Selected</Text>
                  </AdvancedRadio> */}
                  <Button
                    onClick={() => {
                      setShowMembers(true);
                      setWaTemplate((prev) => ({
                        ...prev,
                        member_type: "selected",
                      }));
                      handleSearch("", false, true);
                    }}
                  >
                    Select Members
                  </Button>
                </div>
              </div>
              {memberIds.length && waTemplate.member_type === "selected" ? (
                <div className="grid grid-cols-3 gap-4 m-1 my-4">
                  {memberIds.map((member) => (
                    <div
                      className="flex flex-row gap-4 items-center justify-between border rounded-xl p-3"
                      key={member?.name}
                    >
                      <AvatarCard
                        name={member.name}
                        src={member.image || "/placeholder-avatar.jpg"}
                        description={member.phone || ""}
                      />
                      <XIcon
                        className="cursor-pointer hover:text-primary"
                        onClick={() => removeMember(member?.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex w-full items-center justify-center">
                <Button
                  disabled={
                    !(waTemplate.content.length > 0)
                    // !(waTemplate.subject.length > 0)
                  }
                  onClick={() => {
                    handleBulkWA();
                  }}
                >
                  Send WhatsApp Message
                </Button>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab>
      <MemberSearchDrawer
        showMembers={showMembers}
        setMemberList={setMemberList}
        setShowMembers={setShowMembers}
        searchText={searchText}
        setSearchText={setSearchText}
        memberList={memberList}
        loading={loading}
        currentMember={currentMember}
        setCurrentMember={setCurrentMember}
        handleSearch={handleSearch}
        handleSelect={handleSelect}
        showSuccess={showSuccess}
        setShowSuccess={setShowSuccess}
        setMemberIds={setMemberIds}
        currentView={currentView}
        setNewTemplate={setNewTemplate}
        setWaTemplate={setWaTemplate}
        observerRef={observerRef}
        handleSearchInputChange={handleSearchInputChange}
      />
      <EmailResponseModal emailResp={emailResp} setEmailResp={setEmailResp} />
      <ConfirmModal
        changeConfirm={changeConfirm}
        handleBulkEmailFinal={handleBulkEmailFinal}
        handleBulkWAFinal={handleBulkWAFinal}
        memberIds={memberIds}
        newTemplate={newTemplate}
        waTemplate={waTemplate}
        showConfirm={showConfirm}
        subLoading={subLoading}
      />
    </div>
  );
}
