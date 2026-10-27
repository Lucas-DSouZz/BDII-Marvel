import { API_URL } from "./apiServices";

import type { PageResponse } from "../types/apiTypes";
import type { RegioesResponse, FiltrosRegioesResponse } from "../types/regiaoTypes";

export async function getRegioes(
    filtros : Record<string, string> = {}
) : Promise<PageResponse<RegioesResponse>> {
    const params = new URLSearchParams(filtros);

    const response = await fetch(
        `${API_URL}/api/regiao?${params.toString()}
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<PageResponse<RegioesResponse>>;
}

export async function getFiltrosRegioes() : Promise<FiltrosRegioesResponse> {
    const response = await fetch(
        `${API_URL}/api/regiao/filtros
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<FiltrosRegioesResponse>
}