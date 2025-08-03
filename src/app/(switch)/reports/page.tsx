import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"

export default function Page() {
    const { setPage } = usePageStore()

    useLayoutEffect(() => {
        setPage({
            module: 'reports',
            title: "Reports & Analytics",
            backButton: 'Back to Modules',
        })
    }, [setPage])

    return (
        <></>
    )
}
