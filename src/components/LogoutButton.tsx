import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CircleAlert, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";
import { useQueryClient } from "@tanstack/react-query";

export function LogoutButton() {
    const { logout } = useAuth()
    const queryClient = useQueryClient()

    const onLogout = async () => {
        try {
            await logout()
            queryClient.clear()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast('Error', {
                // className: 'my-classname',
                description: err?.detail || "Something went wrong",
                duration: 5000,
                icon: <CircleAlert />,
            });
        }
    }

    return (
        <AlertDialog>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 text-sidebar-foreground hover:bg-sidebar-accent"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Logout</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You will need to log in again to access your account.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onLogout} className="bg-destructive text-white hover:bg-destructive/90">Logout</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
