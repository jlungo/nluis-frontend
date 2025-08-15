import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"

export default function DistrictLandUse() {
    const { setPage } = usePageStore()

    useLayoutEffect(() => {
        setPage({
            module: 'land-uses',
            title: "District Land Use",
            backButton: '',
        })
    }, [setPage])

    return (
        <></>
    )
}
