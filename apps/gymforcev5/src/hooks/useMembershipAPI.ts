import { useCallback } from "react";
import { AxiosPrivate, invalidateAll, newID } from "@/app/[locale]/auth/AxiosPrivate";
// import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

type Membership = {
    user_id: string;
    gym_id: string;
    member_id: string;
    title: string;
    package_id: string;
    price: number;
    offer_price: number;
    paid_amount: number;
    due_date: Date;
    start_date: Date;
    payment_mode: string;
    reference: string;
    cancelled: boolean;
    cancellation_reason: string;
    renewed: boolean;
};

const useMembershipAPI = () => {
    const getAllMemberships = useCallback(async (type:string) => {
        try {
            const gymId = 1;
            const resp = await AxiosPrivate.get(`/api/list-memberships/?membership_type=${type}&gym_id=${gymId}`,{
                id:newID(`membership-list-${type}`)
            });
            // console.log(resp.data);
            return resp.data;
        } catch (error) {
            console.error("Error fetching memberships:", error);
            throw error;
        }
    }, []);

    const getSpecificMember = useCallback(async (member_id: string) => {
        try {
            const gymId = 1;
            const response = await AxiosPrivate.get(`/api/${member_id}/memberships/?gym_id=${gymId}`,{
                id:newID(`membership-${member_id}`)
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching specific member:", error);
            throw error;
        }
    }, []);

    const getSpecificMembership = useCallback(async (membership_id: string) => {
        try {
            const gymId = 1;
            const response = await AxiosPrivate.get(`/api/${membership_id}/list-memberships/?gym_id=${gymId}`,{
                id:newID(`memberships-${membership_id}`)
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching specific membership:", error);
            throw error;
        }
    }, []);

    const createMembership = useCallback(async (data: Membership) => {
        try {
            const response = await AxiosPrivate.post(`/api/create-membership/`, {...data,user_id:parseInt(data.user_id),gym_id:parseInt(data.gym_id),member_id:parseInt(data.member_id),package_id:parseInt(data.package_id)}).then((res)=>{
                invalidateAll();
                return res.data;
            });
        } catch (error) {
            console.error("Error creating membership:", error);
            throw error;
        }
    }, []);

    const updateMembership = useCallback(async (data: Membership) => {
        try {
            const response = await AxiosPrivate.put('/api/update-membership/', data).then((res)=>{
                invalidateAll();
                return res.data;
            });
        } catch (error) {
            console.error("Error updating membership:", error);
            throw error;
        }
    }, []);

    const deleteMembership = useCallback(async (membership_id: string) => {
        try {
            const response = await AxiosPrivate.delete(`/api/delete-membership/${membership_id}/`).then((res)=>{
                invalidateAll();
                return res.data;
            });
        } catch (error) {
            console.error("Error deleting membership:", error);
            throw error;
        }
    }, []);

    const renewMembership = useCallback(async (
        membership_id: string,
        data: { package_id: string; paid_amount: number; payment_mode: string; offer_price: number; due_date: Date }
    ) => {
        try {
            const response = await AxiosPrivate.patch(`/api/renew-membership/${membership_id}/`, data).then((res)=>{
                invalidateAll();
                return res.data;
            });
        } catch (error) {
            console.error("Error renewing membership:", error);
            throw error;
        }
    }, []);

    const cancelMembership = useCallback(async (membership_id: string) => {
        try {
            const response = await AxiosPrivate.post(`/api/cancel-membership/${membership_id}/`).then((res)=>{
                invalidateAll();
                return res.data;
            });
        } catch (error) {
            console.error("Error canceling membership:", error);
            throw error;
        }
    }, []);
    return {
        getAllMemberships,
        getSpecificMember,
        getSpecificMembership,
        createMembership,
        updateMembership,
        deleteMembership,
        renewMembership,
        cancelMembership,
    };
};

export default useMembershipAPI;