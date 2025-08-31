import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"

export default function Page() {
    const { setPage } = usePageStore()
    useLayoutEffect(() => {
        setPage({
            module: 'document-management',
            title: "Document Management",

        })
    }, [setPage])

    return (
        <></>
    )
}
