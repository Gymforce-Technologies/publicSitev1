import React from "react";
import AddStaffView from "../../../../../components/staff/addstaff/AddStaff";
import { Title } from "rizzui";

const AddStaff = () => {
  return (
    <div>
      <Title as="h3" className="mx-2">
        Add Staff
      </Title>
      <div className="mt-5 px-4 lg:px-7 ">
        <AddStaffView />
      </div>
    </div>
  );
};

export default AddStaff;
