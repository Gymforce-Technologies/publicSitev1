// MemberSearchDrawer.jsx
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Drawer,
  Empty,
  Input,
  Loader,
  Text,
  Title,
} from "rizzui";
import { XIcon } from "lucide-react";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { Dispatch, MutableRefObject, SetStateAction, useRef } from "react";

export default function MemberSearchDrawer({
  showMembers,
  setShowMembers,
  searchText,
  setSearchText,
  memberList,
  loading,
  currentMember,
  setCurrentMember,
  handleSearch,
  handleSelect,
  showSuccess,
  setShowSuccess,
  setMemberIds,
  currentView,
  setNewTemplate,
  setWaTemplate,
  observerRef,
  setMemberList,
  handleSearchInputChange,
}: {
  showMembers: boolean;
  setShowMembers: Dispatch<SetStateAction<boolean>>;
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  memberList: any[];
  loading: boolean;
  currentMember: any;
  setCurrentMember: Dispatch<any>;
  handleSearch: (
    searchInput: string,
    isLoadMore: boolean,
    load?: boolean
  ) => Promise<void>;
  handleSelect: (data: any) => void;
  showSuccess: boolean;
  setShowSuccess: Dispatch<SetStateAction<boolean>>;
  setMemberIds: Dispatch<SetStateAction<any[]>>;
  currentView: "email" | "wa";
  setNewTemplate: Dispatch<
    SetStateAction<{
      subject: string;
      content: string;
      member_type: string;
    }>
  >;
  setWaTemplate: Dispatch<
    SetStateAction<{
      content: string;
      member_type: string;
      schedule_time: string;
    }>
  >;
  observerRef: MutableRefObject<null>;
  setMemberList: Dispatch<SetStateAction<any[]>>;
  handleSearchInputChange: (input: string) => void;
}) {
  const inputRef = useRef(null);

  return (
    <Drawer
      isOpen={showMembers}
      onClose={() => {
        setShowMembers(false);
        setSearchText("");
        setMemberList([]);
        setCurrentMember(null);
      }}
      size="lg"
      className="z-[99999]"
      containerClassName="p-4 space-y-4"
    >
      <div className="relative">
        <Input
          value={searchText}
          ref={inputRef}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          placeholder={
            currentMember === null
              ? "Search Members to Assign Session"
              : "Clear Selected Member to Search"
          }
          onFocus={() => {
            searchText.length === 0
              ? setTimeout(() => handleSearch("", false), 300)
              : "";
          }}
          prefix={<PiMagnifyingGlassBold className="text-gray-600" size={20} />}
          disabled={currentMember !== null}
          suffix={
            searchText && (
              <Button
                size="sm"
                variant="text"
                onClick={() => {
                  setSearchText("");
                  setMemberList([]);
                  setCurrentMember(null);
                  handleSearch("", false, true);
                }}
              >
                <XIcon />
              </Button>
            )
          }
        />
        {currentMember === null && (
          <div className="absolute top-full left-0 z-[9999999999] flex w-full border-2  overflow-y-auto custom-scrollbar  max-h-[88vh] shadow rounded-lg p-4 py-8 mt-4 gap-2 flex-col items-stretch bg-gray-50 ">
            {loading ? (
              <div className="flex justify-center items-center w-full my-4">
                <Loader variant="spinner" size="xl" />
              </div>
            ) : memberList.length ? (
              memberList.map((item, index) => {
                const isSecondToLast = index === memberList.length - 2;
                return (
                  <div
                    ref={isSecondToLast ? observerRef : null}
                    className="flex relative items-center gap-2.5 p-2 rounded cursor-pointer hover:bg-gray-100 hover:scale-y-105 group"
                    key={index}
                    onClick={() => handleSelect(item)}
                  >
                    <Avatar
                      name={item.name}
                      src={item.image || "/placeholder-avatar.jpg"}
                      className="text-white"
                    />
                    <div className="flex flex-col gap-2">
                      <Text className="font-medium text-gray-900 group-hover:text-gray-900">
                        {item.name}
                      </Text>
                      <Text className="text-gray-500">{item.phone}</Text>
                    </div>
                    <div className="flex items-center max-md:flex-col gap-8">
                      <Badge
                        variant="outline"
                        className="max-sm:scale-90 text-nowrap"
                      >
                        {item.membership_details?.name || "N/A"}
                      </Badge>
                      <Badge
                        size="sm"
                        variant="outline"
                        color={item.status === "active" ? "success" : "danger"}
                        className="max-sm:absolute -top-4 capitalize"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="my-4">
                <Empty text="No Members Found" />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="grid md:flex items-stretch gap-4 w-full border-2 rounded-lg shadow-sm relative">
        {currentMember && (
          <div className="p-4 grid grid-cols-2 items-center gap-4 sm:gap-x-8 min-w-full">
            <div className="col-span-full">
              <XIcon
                onClick={() => {
                  setCurrentMember(null);
                  setSearchText("");
                  setMemberList([]);
                  handleSearch("", false, true);
                }}
                className="ml-auto cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-4">
              <Avatar
                name={currentMember.name}
                size="xl"
                src={currentMember.image}
              />
              <div>
                <Title as="h6">{currentMember.name}</Title>
                <Text>{currentMember.phone}</Text>
                <Badge variant="outline">
                  {currentMember.membership_details?.name}
                </Badge>
              </div>
            </div>
            <div className="flex flex-row items-center gap-8 lg:gap-12 col-span-full mt-2">
              <Button
                onClick={() => {
                  setShowSuccess(true);
                  setTimeout(() => {
                    setCurrentMember(null);
                    setSearchText("");
                    setMemberList([]);
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
                    setMemberIds((prev) => {
                      return [...prev, currentMember];
                    });
                    setShowSuccess(false);
                    handleSearch("", false, true);
                  }, 1500);
                }}
              >
                Select
              </Button>
              <Button
                onClick={() => {
                  setCurrentMember(null);
                  setShowMembers(false);
                  setSearchText("");
                  setMemberList([]);
                  setMemberIds((prev) => {
                    return [...prev, currentMember];
                  });
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
                }}
              >
                Select and Close
              </Button>
            </div>
            <div className="flex w-full items-center justify-center">
              {showSuccess ? (
                <Alert color="success" bar>
                  Member Added Successfully
                </Alert>
              ) : null}
            </div>
          </div>
        )}
      </div>
      {loading && memberList.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <Loader variant="spinner" size="xl" />
        </div>
      )}
    </Drawer>
  );
}
