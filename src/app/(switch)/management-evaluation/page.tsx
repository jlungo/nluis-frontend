import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"

export default function Page() {
    const { setPage } = usePageStore()

    useLayoutEffect(() => {
        setPage({
            module: 'mapshop-management',
            title: "MapShop Management",
            backButton: 'Back to Modules',
        })
    }, [setPage])

    return (
        <></>
    )
}
