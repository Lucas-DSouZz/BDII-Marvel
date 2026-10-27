import { API_URL } from "./apiServices";

import type { HabilidadesResponse } from "../types/habilidadeTypes";
import type { PageResponse } from "../types/apiTypes";

export async function getHabilidades(
    filtros : Record<string, string> = {}
) : Promise<PageResponse<HabilidadesResponse>> {
    const params = new URLSearchParams(filtros);

    const response = await fetch(
        `${API_URL}/api/habilidade?${params.toString()}
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<PageResponse<HabilidadesResponse>>;
}