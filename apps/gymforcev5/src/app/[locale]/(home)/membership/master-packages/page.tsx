import MasterMembershipList from "@/components/membership/master/MasterMembership"

export default function Memberships(){
    return(
        <section className=" grid grid-cols-1 gap-5 @container @[59rem]:gap-7">
            <MasterMembershipList />
        </section>
    )
}
