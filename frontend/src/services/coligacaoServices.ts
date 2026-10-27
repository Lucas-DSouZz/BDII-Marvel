import { API_URL } from "./apiServices";

import type { ColigacoesResponse } from "../types/coligacaoTypes";
import type { PageResponse } from "../types/apiTypes";

export async function getColigacoes(
    filtros : Record<string, string> = {}
) : Promise<PageResponse<ColigacoesResponse>> {
    const params = new URLSearchParams(filtros);

    const response = await fetch(
        `${API_URL}/api/coligacao?${params.toString()}
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<PageResponse<ColigacoesResponse>>;
}