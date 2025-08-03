import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"

export default function Page() {
    const { setPage } = usePageStore()

    useLayoutEffect(() => {
        setPage({
            module: 'organizations',
            title: "Organizations Management",
            backButton: 'Back to Modules',
        })
    }, [setPage])

    return (
        <></>
    )
}
