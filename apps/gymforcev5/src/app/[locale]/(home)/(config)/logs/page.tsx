"use client";
import BulkEmailLogs from "@/components/logs/BulkEmailLogs";
import BulkWALogs from "@/components/logs/BulkWALogs";
import WhatsAppLogs from "@/components/logs/WhatsAppLogs";
import WidgetCard from "@core/components/cards/widget-card";
import { Tab } from "rizzui";

export default function LogsPage() {
  return (
    <WidgetCard title="Message Log's" className="relative dark:bg-inherit">
      <div>
        <Tab>
          <Tab.List className="mt-3 mb-1">
            <Tab.ListItem className=" p-4 font-medium">
              WhatsApp Logs
            </Tab.ListItem>
            <Tab.ListItem className="p-4 font-medium">
              Bulk WhatsApp Logs
            </Tab.ListItem>
            <Tab.ListItem className="p-4 font-medium">
              Bulk Email Logs
            </Tab.ListItem>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <WhatsAppLogs />
            </Tab.Panel>
            <Tab.Panel>
              <BulkWALogs />
            </Tab.Panel>
            <Tab.Panel>
              <BulkEmailLogs />
            </Tab.Panel>
          </Tab.Panels>
        </Tab>
      </div>
    </WidgetCard>
  );
}
