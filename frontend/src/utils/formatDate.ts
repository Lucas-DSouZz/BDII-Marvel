export default function formatDate(date: string) : string {
    const parsedDate = new Date(date);

    const formated = parsedDate.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });

    return `${formated}`;
}