import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

/**
 * ✅ Fetch all land-use plans (metadata) for a given locality
 * Example endpoint:
 *   GET /api/v1/zoning/plans/?locality=10305
 */
export const usePlansQuery = (params?: { locality?: string | number } | null) =>
  useQuery({
    queryKey: ["plans", params],
    queryFn: async () => {
      const response = await api.get("/zoning/plans/", {
        params: { locality: params?.locality },
      });
      return response.data;
    },
    enabled: !!params?.locality, // only run if locality is defined
  });

type PlanDetailArg =
  | string
  | number
  | { locality?: string | number }
  | undefined
  | null;

/**
 * ✅ Fetch details + tile template for the latest plan in a given locality
 * Example endpoints:
 *   GET /api/v1/zoning/plans/latest/{locality_id}/
 *   GET /api/v1/zoning/plans/latest/{locality_id}/tiles/{z}/{x}/{y}.mvt
 */
export const usePlanDetailQuery = (arg?: PlanDetailArg) =>
  useQuery({
    queryKey: ["plan", arg],
    enabled: !!(
      arg && (typeof arg === "object" ? (arg as any).locality : arg)
    ),
    queryFn: async () => {
      if (!arg) throw new Error("No id or locality provided");

      // Handle both number/string and object forms
      const locality =
        typeof arg === "object" ? (arg as any).locality : arg;

      if (!locality) throw new Error("No locality provided");

      // ✅ Fetch the latest plan metadata for this locality
      const planMetaRes = await api.get(`/zoning/plans/latest/${locality}/`);
      const planMeta = planMetaRes.data;

      // ✅ Construct correct vector tile URL template
      // Used by map renderers like Mapbox GL or MapLibre
      const tileUrlTemplate = `${api.defaults.baseURL}/zoning/plans/latest/${locality}/tiles/{z}/{x}/{y}.mvt`;

      return {
        ...planMeta,
        tiles: [tileUrlTemplate],
      };
    },
  });

export default usePlansQuery;
