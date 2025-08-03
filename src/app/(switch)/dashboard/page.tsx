import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"

export default function Page() {
    const { setPage } = usePageStore()

    useLayoutEffect(() => {
        setPage({
            module: 'dashboard',
            title: "Dashboard",
            backButton: 'Back to Modules',
        })
    }, [setPage])

    return (
        <></>
    )
}
