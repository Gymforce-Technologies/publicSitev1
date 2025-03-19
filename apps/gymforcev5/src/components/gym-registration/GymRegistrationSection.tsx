"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Welcome from "./Welcome";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
// import BillingSettingsView from "../(home)/centersettings/components/billing-settings";
// import { Announcement, Button, Text, Title } from 'rizzui';
import { AxiosPrivate } from "../../app/[locale]/auth/AxiosPrivate";

import dynamic from "next/dynamic";
// import PaymentSection from './PaymentSection';
const PaymentSection = dynamic(() => import("./PaymentSection"));
// import ThankYou from './ThankYou';
const ThankYou = dynamic(() => import("./ThankYou"));
// import RegistrationPage from './RegistrationPage';
const RegistrationPage = dynamic(() => import("./RegistrationPage"));

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -50 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.6,
};

const GymRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentSkipped, setPaymentSkipped] = useState(false);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const skipPayment = () => {
    setPaymentSkipped(true);
    setCurrentStep(3);
  };

  const userInfo = async () => {
    const user = await AxiosPrivate.get("/api/profile").then((res) => {
      console.log(res.data);
      if (res.data.with_subscription) {
        // setCurrentStep(3);
        return;
      }
    });
  };

  useEffect(() => {
    const checkGym = async () => {
      const gymId = await retrieveGymId();
      if (gymId) {
        userInfo();
        setCurrentStep(1);
      }
    };
    checkGym();
  }, []);

  return (
    <div className="w-screen h-screen overflow-y-auto no-scrollbar">
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="welcome"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Welcome nextStep={nextStep} />
          </motion.div>
        )}
        {currentStep === 1 && (
          <motion.div
            key="registration"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <RegistrationPage nextStep={nextStep} />
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div
            key="payment"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <PaymentSection nextStep={() => setCurrentStep(3)} />
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div
            key="thankyou"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ThankYou />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GymRegistration;
