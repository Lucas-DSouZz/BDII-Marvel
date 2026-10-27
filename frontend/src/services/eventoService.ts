import { API_URL } from "./apiServices";

import type { EventosResponse, FiltrosEventosResponse } from "../types/eventoTypes";
import type { PageResponse } from "../types/apiTypes";

export async function getEventos(
    filtros : Record<string, string> = {}
) : Promise<PageResponse<EventosResponse>> {
    const params = new URLSearchParams(filtros);

    const response = await fetch(
        `${API_URL}/api/evento?${params.toString()}
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<PageResponse<EventosResponse>>;
}

export async function getFiltrosEventos() : Promise<FiltrosEventosResponse> {
    const response = await fetch(
        `${API_URL}/api/evento/filtros
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<FiltrosEventosResponse>
}