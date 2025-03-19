"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiZap, FiTrendingUp } from "react-icons/fi";
import { Tab, Text, Title } from "rizzui";
import { AxiosPrivate } from "../../app/[locale]/auth/AxiosPrivate";
import DateCell from "@core/ui/date-cell";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import { getDateFormat } from "../../app/[locale]/auth/DateFormat";

interface VersionHistory {
  id: number;
  version_number: string;
  title: string;
  description: string;
  release_date: string;
  version_type: string;
}

interface GroupedFeatures {
  latest: VersionHistory[];
  popular: VersionHistory[];
}

export default function NewFeatureSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [groupedFeatures, setGroupedFeatures] = useState<GroupedFeatures>({
    latest: [],
    popular: [],
  });

  const getData = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/version-history/?gym_id=${gymId}`
      );
      const features = resp.data;

      // Group features by version_type
      const grouped = features.reduce(
        (acc: GroupedFeatures, feature: VersionHistory) => {
          if (feature.version_type === "latest") {
            acc.latest.push(feature);
          } else if (feature.version_type === "popular") {
            acc.popular.push(feature);
          }
          return acc;
        },
        { latest: [], popular: [] }
      );

      setGroupedFeatures(grouped);
    } catch (error) {
      console.error("Error fetching version history:", error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const totalTabs = 2; // Now we have fixed 2 tabs: Latest and Popular

    if (autoSwitch) {
      interval = setInterval(() => {
        setActiveTab((prev) => {
          if (prev === totalTabs - 1) {
            setAutoSwitch(false);
            return 0;
          }
          return prev + 1;
        });
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [autoSwitch]);

  useEffect(() => {
    getData();
  }, []);

  const tabFeatures = [
    {
      id: "latest",
      title: "Latest Features",
      icon: <FiZap className="w-5 h-5" />,
      features: groupedFeatures.latest,
    },
    {
      id: "popular",
      title: "Most Popular",
      icon: <FiTrendingUp className="w-5 h-5" />,
      features: groupedFeatures.popular,
    },
  ];

  const FeatureCard = ({ feature }: { feature: VersionHistory }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col gap-3 p-4 bg-primary-lighter dark:bg-gray-200 rounded-lg max-w-3xl mb-4"
    >
      <div className="flex items-center justify-between">
        <Text className="font-semibold text-base text-gray-900">
          {feature.title}
        </Text>
        <Text className="text-sm text-gray-500">@{feature.version_number}</Text>
      </div>
      <Text className="text-gray-700">{feature.description}</Text>
      <Title as="h6" className="text-xs text-gray-700 self-end">
        Release Date{" "}
        {
          <DateCell
            date={new Date(feature.release_date)}
            timeClassName="hidden"
            dateFormat={getDateFormat()}
          />
        }
      </Title>
    </motion.div>
  );

  return (
    <div className="min-w-full p-4 sm:p-8 md:p-10">
      <div className="max-w-7xl mb-10">
        <Title as="h2" className="mb-4 max-sm:text-lg">
          {` What's New in Our Latest Update`}
        </Title>
        <Text className="sm:text-lg">
          {`We're constantly improving our platform to serve you better. Explore
          our latest features, popular tools, and trending updates that are
          helping teams like yours achieve more.`}
        </Text>
      </div>
      <div className="hidden md:flex flex-1 justify-center items-center">
        <Tab
          vertical
          selectedIndex={activeTab}
          onChange={(index) => {
            setActiveTab(index);
            setAutoSwitch(false);
          }}
        >
          <Tab.List className="flex flex-col gap-4">
            {tabFeatures.map((tab, index) => (
              <Tab.ListItem
                key={tab.id}
                className={`p-6
                  ${activeTab === index ? "bg-primary-lighter dark:bg-gray-200 rounded-lg" : "bg-none py-4"}
                  flex items-center gap-4 transition-all duration-300 ease-in-out`}
              >
                {tab.icon}
                <Text className="font-semibold text-base">{tab.title}</Text>
              </Tab.ListItem>
            ))}
          </Tab.List>

          <Tab.Panels className="flex-1 p-8">
            {tabFeatures.map((tab, index) => (
              <Tab.Panel key={tab.id}>
                {activeTab === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <motion.h5
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl font-bold text-gray-900 mb-6"
                    >
                      {tab.title}
                    </motion.h5>

                    <div className="space-y-4">
                      {tab.features.map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab>
      </div>
      <div className="flex md:hidden flex-1 justify-center items-center">
        <Tab
          selectedIndex={activeTab}
          onChange={(index) => {
            setActiveTab(index);
            setAutoSwitch(false);
          }}
        >
          <Tab.List className="flex flex-row gap-2 sm:gap-4">
            {tabFeatures.map((tab, index) => (
              <Tab.ListItem
                key={tab.id}
                className={` ${activeTab === index ? "bg-primary-lighter dark:bg-gray-200 rounded-lg" : "bg-none sm:py-4"}
                  flex items-center gap-2 sm:gap-4 transition-all duration-300 ease-in-out`}
              >
                {tab.icon}
                <Text className="font-semibold sm:text-base">{tab.title}</Text>
              </Tab.ListItem>
            ))}
          </Tab.List>

          <Tab.Panels className="flex-1 p-4 md:p-8">
            {tabFeatures.map((tab, index) => (
              <Tab.Panel key={tab.id}>
                {activeTab === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <motion.h5
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-lg sm:text-2xl font-bold text-gray-900 sm:mb-6"
                    >
                      {tab.title}
                    </motion.h5>

                    <div className="space-y-2 sm:space-y-4">
                      {tab.features.map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab>
      </div>
    </div>
  );
}
