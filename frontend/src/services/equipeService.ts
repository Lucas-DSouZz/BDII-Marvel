import { API_URL } from "./apiServices";

import type { EquipesResponse, FiltrosEquipesResponse } from "../types/equipeTypes";
import type { PageResponse } from "../types/apiTypes";

export async function getEquipes(
    filtros : Record<string, string> = {}
) : Promise<PageResponse<EquipesResponse>> {
    const params = new URLSearchParams(filtros);

    const response = await fetch(
        `${API_URL}/api/equipe?${params.toString()}
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<PageResponse<EquipesResponse>>;
}

export async function getFiltrosEquipes() : Promise<FiltrosEquipesResponse> {
    const response = await fetch(
        `${API_URL}/api/equipe/filtros
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<FiltrosEquipesResponse>
}