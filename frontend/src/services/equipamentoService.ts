import { API_URL } from "./apiServices";

import type { EquipamentosResponse, FiltrosEquipamentosResponse } from "../types/equipamentoTypes";
import type { PageResponse } from "../types/apiTypes";

export async function getEquipamentos(
    filtros : Record<string, string> = {}
) : Promise<PageResponse<EquipamentosResponse>> {
    const params = new URLSearchParams(filtros);

    const response = await fetch(
        `${API_URL}/api/equipamento?${params.toString()}
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<PageResponse<EquipamentosResponse>>;
}

export async function getFiltrosEquipamentos() : Promise<FiltrosEquipamentosResponse> {
    const response = await fetch(
        `${API_URL}/api/equipamento/filtros
        `
    );

    if (!response.ok)
        throw new Error("Unable to query.");

    return response.json() as Promise<FiltrosEquipamentosResponse>
}