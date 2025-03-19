import axios from "axios";
import { AxiosPrivate, newID } from "./AxiosPrivate";

export async function isStaff() {
  const storedIsStaff = sessionStorage.getItem("isStaff");
  if (storedIsStaff !== null) {
    return JSON.parse(storedIsStaff);
  }

  try {
    const response = await AxiosPrivate.get("/api/profile", {
      id: newID("user-profile"),
      cache: {
        ttl: 60 * 60 * 1000,
      },
    });
    const isStaff = response.data.is_staff_role;
    console.log(response.data);
    if (isStaff) {
      const staffTypeValue = response.data.associated_staff[0].staff_type;
      console.log(staffTypeValue, "Type");
      sessionStorage.setItem("staffType", JSON.stringify(staffTypeValue));
    }
    sessionStorage.setItem("isStaff", JSON.stringify(isStaff));
    return isStaff;
  } catch (error) {
    console.error("Error fetching staff status:", error);
    return false;
  }
}

export function setIsStaff(value: boolean): void {
  sessionStorage.setItem("", JSON.stringify(value));
}

export async function getStaffType() {
  try {
    const response = await AxiosPrivate.get("/api/profile", {
      id: newID("user-profile"),
      cache: {
        ttl: 60 * 60 * 1000,
      },
    });
    const isStaff = response.data.is_staff_role;
    console.log(response.data);
    if (isStaff) {
      const staffTypeValue = response.data.associated_staff[0].staff_type;
      console.log(staffTypeValue, "Type");
      sessionStorage.setItem("staffType", JSON.stringify(staffTypeValue));
      return staffTypeValue;
    } else {
      return "";
    }
  } catch (error) {
    console.error("Error fetching staff status:", error);
  } finally {
    return "";
  }
}
