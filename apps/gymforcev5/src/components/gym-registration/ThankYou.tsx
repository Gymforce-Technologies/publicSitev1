'use client'
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { Button } from "rizzui";

export default function ThankYou() {
    const router=useRouter();
    return (
        <div className="flex flex-col items-center justify-center min-w-screen min-h-screen flex-shrink-0 gap-4">
            <div className="flex flex-row flex-nowrap items-center gap-4 ">
                <FaCheckCircle  color="green" size={28}/>
                <h2 className="text-3xl font-bold">All Set!</h2>
            </div>
            <p className="text-lg sm:text-xl mb-2">{`Your setup is complete. You're ready to go!`}</p>
            <Button 
                variant="solid" 
                className="min-w-40" 
                onClick={() => {
                    router.push('/dashboard');
                }}
              >
                Explore the App
            </Button>
        </div>
    )
}