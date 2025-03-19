import React, { useState } from "react";
import { Modal, Button, Password, Text, Title, Input } from "rizzui";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { XIcon } from "lucide-react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

const Login = ({
  isOpen,
  onClose,
  staff,
}: {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // setLoading(true);
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.post(
        `api/staff/allow-login/?gym_id=${gymId}`,
        {
          email: email,
          password: password,
          first_name: staff.name.split(" ")[0],
          last_name: staff.name.split(" ")[1] || staff.name.split(" ")[0], // can't find the lastname
          staff: parseInt(staff.id as string),
        }
      ).then((resp) => {
        console.log(resp);
        toast.success("Login enabled successfully");
        invalidateAll();
        onClose();
      });
    } catch (error) {
      console.error("Error enabling login:", error);
      toast.error("Something went wrong while enabling login");
    // } finally {
    //   setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      // containerClassName='dark:bg-gray-800 '
    >
      <form onSubmit={handleSubmit} className="grid gap-3 p-5 xl:p-8 mx-auto">
        <div className="flex flex-row justify-between items-center mr-5">
          <Title as="h4" className="">
            Enable Login for - {staff.name}
          </Title>
          <XIcon className="cursor-pointer" onClick={onClose} />
        </div>
        <div className="flex flex-row gap-5 items-center">
          <Text className=" font-bold text-lg">Staff Type:</Text>
          <span className="font-medium text-gray-900">
            {staff.staffType.staffTypeName}
          </span>
        </div>
        <Input
          label="Email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2"
          labelClassName=""
          required
        />
        <Password
          label="Password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
          labelClassName=""
          required
        />
        <Button type="submit">Enable Login</Button>
      </form>
    </Modal>
  );
};

export default Login;
