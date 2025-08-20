import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Link, useLocation } from "react-router"

export default function DynamicBreadcrums() {
    const location = useLocation()
    const segments = location.pathname.split("/").filter(Boolean)

    return (
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                {segments.map((segment, index) => {
                    const href = "/" + segments.slice(0, index + 1).join("/")
                    const isFirst = index === 0
                    const isLast = index === segments.length - 1
                    const label = decodeURIComponent(segment.replace(/-/g, " "))
                    return (
                        <div key={href} className="flex items-center gap-1">
                            <BreadcrumbItem>
                                {isLast ? <></>
                                    : isFirst ? (
                                        <BreadcrumbLink asChild>
                                            <Link to={href} className="capitalize">{label}</Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link to={href} className="capitalize">{label}</Link>
                                        </BreadcrumbLink>
                                    )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </div>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}