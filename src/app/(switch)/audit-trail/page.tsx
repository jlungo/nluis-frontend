import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"

export default function Page() {
    const { setPage } = usePageStore()

    useLayoutEffect(() => {
        setPage({
            module: 'audit-trail',
            title: "Audit Trail",
            backButton: 'Back to Modules',
        })
    }, [setPage])

    return (
        <></>
    )
}
