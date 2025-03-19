import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { getGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { FaUser, FaCalendar, FaIndianRupeeSign } from "react-icons/fa6";
import { MdAccountBalanceWallet } from "react-icons/md";
import { RiBuilding3Fill } from "react-icons/ri";
import { Button, Input, Loader, Modal, Text, Textarea, Title } from "rizzui";

interface NewTemplate {
  name: string;
  content: string;
}

interface TemplateItem {
  label: string;
  value: string;
  icon: JSX.Element;
}

export default function Edit({
  setIsEditOpen,
  fetchTemplates,
  template,
  setTemplate,
}: {
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchTemplates: () => Promise<void>;
  template: any;
  setTemplate: React.Dispatch<any>;
}) {
  const [newTemplate, setNewTemplate] = useState<NewTemplate>({
    name: "",
    content: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const items: TemplateItem[] = [
    {
      label: "member_name",
      value: "{member_name}",
      icon: <FaUser size={15} className="group-hover:text-primary" />,
    },
    {
      label: "gym_name",
      value: "{gym_name}",
      icon: <RiBuilding3Fill size={16} className="group-hover:text-primary" />,
    },
    {
      label: "due_amount",
      value: "{due}",
      icon: (
        <MdAccountBalanceWallet
          size={16}
          className="group-hover:text-primary"
        />
      ),
    },
    {
      label: "end_date",
      value: "{end_date}",
      icon: <FaCalendar size={15} className="group-hover:text-primary" />,
    },
    {
      label: "due_date",
      value: "{due_date}",
      icon: <CiCalendarDate size={15} className="group-hover:text-primary" />,
    },
    {
      label: "currency",
      value: "{currency}",
      icon: (
        <FaIndianRupeeSign size={15} className="group-hover:text-primary" />
      ),
    },
  ];

  const handleEditTemplate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      let transformedContent = newTemplate.content;
      items.forEach((item) => {
        transformedContent = transformedContent.replace(
          new RegExp(item.label, "g"),
          item.value
        );
      });
      const gymId = await getGymId();
      await AxiosPrivate.put(
        `/api/wa-templates/update/${template.id}/?gym_id=${gymId}`,
        {
          ...newTemplate,
          content: transformedContent,
          gym_id: gymId,
        }
      );
      setIsEditOpen(false);
      setNewTemplate({ name: "", content: "" });
      invalidateAll();
      fetchTemplates();
      setTemplate(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const insertTemplateItem = (item: TemplateItem) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = newTemplate.content;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);

      const newContent = before + item.label + after;
      setNewTemplate((prev) => ({ ...prev, content: newContent }));

      setTimeout(() => {
        textareaRef.current!.selectionStart = start + item.label.length;
        textareaRef.current!.selectionEnd = start + item.label.length;
        textareaRef.current!.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") {
      const cursorPosition = textareaRef.current!.selectionStart;
      const content = newTemplate.content;
      const beforeCursor = content.substring(0, cursorPosition);

      for (const item of items) {
        if (beforeCursor.endsWith(item.label)) {
          e.preventDefault();
          const newContent =
            content.substring(0, cursorPosition - item.label.length) +
            content.substring(cursorPosition);
          setNewTemplate((prev) => ({ ...prev, content: newContent }));
          setTimeout(() => {
            textareaRef.current!.selectionStart =
              cursorPosition - item.label.length;
            textareaRef.current!.selectionEnd =
              cursorPosition - item.label.length;
          }, 0);
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (template) {
      let transformedContent = template.content;
      items.forEach((item) => {
        transformedContent = transformedContent.replace(
          new RegExp(item.value, "g"),
          item.label
        );
      });
      setNewTemplate({
        name: template.name,
        content: transformedContent,
      });
    }
  }, [template]);

  return (
    <Modal
      isOpen={true}
      onClose={() => setIsEditOpen(false)}
      size="md"
      // containerClassName="dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex flex-col gap-4 p-6 md:p-8 ">
        <div className="flex items-center justify-between mb-4">
          <Title as="h3" className="text-gray-900 ">
            Update Template
          </Title>
          <XIcon
            onClick={() => setIsEditOpen(false)}
            className="cursor-pointer"
          />
        </div>
        <Input
          label="Name"
          value={newTemplate.name}
          onChange={(e) => {
            setNewTemplate((prev) => ({ ...prev, name: e.target.value }));
          }}
          className="w-full"
          placeholder="Enter name"
          labelClassName=""
        />
        <div className="space-y-2">
          <Text className="font-medium col-span-full">Dynamic Fields</Text>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <div
                key={index}
                className={`group cursor-pointer ring-[1.5px] ring-gray-200 hover:ring-primary/50 ${newTemplate.content.includes(item.label) ? " ring-white  text-primary bg-primary-lighter" : ""} p-2 rounded flex items-center gap-2`}
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
          label="Content"
          value={newTemplate.content}
          onChange={(e) => {
            setNewTemplate((prev) => ({ ...prev, content: e.target.value }));
          }}
          onKeyDown={handleKeyDown}
          className="w-full"
          placeholder="Enter content [Try to Mimic the Sample template Messages]"
          labelClassName=""
        />
        <Button onClick={handleEditTemplate} className="max-w-xs self-center">
          {isLoading ? <Loader variant="threeDot" /> : "Update"}
        </Button>
      </div>
    </Modal>
  );
}
