import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"

export default function Page() {
    const { setPage } = usePageStore()

    useLayoutEffect(() => {
        setPage({
            module: 'management-evaluation',
            title: "Management & Evaluation",
            backButton: 'Back to Modules',
        })
    }, [setPage])

    return (
        <></>
    )
}
