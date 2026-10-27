import { API_URL } from "./apiServices";

import type { IndividuosResponse, FiltrosIndividuosResponse } from "../types/individuoTypes";
import type { PageResponse } from "../types/apiTypes";

export async function getIndividuos(
    filtros : Record<string, string> = {}
) : Promise<PageResponse<IndividuosResponse>> {
    const params = new URLSearchParams(filtros);

    const response = await fetch(
        `${API_URL}/api/individuo?${params.toString()}
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<PageResponse<IndividuosResponse>>;
}

export async function getFiltrosIndividuos() : Promise<FiltrosIndividuosResponse> {
    const response = await fetch(
        `${API_URL}/api/individuo/filtros`
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<FiltrosIndividuosResponse>
}