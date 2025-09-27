import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePageStore } from "@/store/pageStore"
import { ArrowRight, ClipboardPlus, List } from "lucide-react"
import { useLayoutEffect } from "react"
import { useNavigate } from "react-router"

export default function Page() {
    const { setPage } = usePageStore()
    const navigate = useNavigate()

    useLayoutEffect(() => {
        setPage({
            module: 'system-settings',
            title: "Form Management",
        })
    }, [setPage])

    const data = [
        {
            id: 'form-workflows',
            title: 'Form workflows',
            description: 'Create, edit, and manage all your form workflows',
            icon: <ClipboardPlus className="h-8 w-8" />,
            color: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            id: 'module-levels',
            title: 'Module Levels',
            description: 'Create, edit, and manage all your module levels',
            icon: <List className="h-8 w-8" />,
            color: 'text-chart-2',
            bgColor: 'bg-chart-2/10'
        }
    ]

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-semibold">Form Management</h1>
                    <p className="text-muted-foreground">Create, edit, and manage all the systems dynamic forms</p>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:w-fit max-w-[1500px] mx-auto">
                {data.map(item => (
                    <TooltipProvider key={item.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Card
                                    className="border w-full mx-auto md:w-[48%] lg:w-fit lg:min-w-[25rem] xl:min-w-[22rem] group shadow-none hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:border-primary/20"
                                    onClick={() => navigate(`/system-settings/form-management/${item.id}`)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className={`p-3 rounded-lg ${item.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                                <div className={item.color}>
                                                    {item.icon}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                                        </div>
                                        <div className="space-y-2">
                                            <CardTitle className="text-lg font-normal group-hover:text-primary transition-colors duration-300">
                                                {item.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm leading-relaxed">
                                                {item.description}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 mt-auto">
                                        <div className="flex items-center justify-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-primary group-hover:text-primary hover:text-primary group-hover:bg-primary/10 hover:bg-primary/20 hover:dark:bg-primary/20 w-full"
                                            >
                                                Access Item
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                <div className="text-center space-y-2">
                                    <p className="font-medium text-white">{item.title}</p>
                                    <p className="text-sm text-white/70">{item.description}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </div>
    )
}
