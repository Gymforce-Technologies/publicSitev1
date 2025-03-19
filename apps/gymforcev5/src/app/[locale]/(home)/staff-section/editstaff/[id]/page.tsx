import React from "react";
import EditStaffView from "../../../../../../components/staff/editstaff/EditStaffModel";
import { Title } from "rizzui";

const EditStaff = () => {
  return (
    <div>
      <Title as="h3" className="">
        Edit Staff
      </Title>
      <EditStaffView />
    </div>
  );
};

export default EditStaff;
