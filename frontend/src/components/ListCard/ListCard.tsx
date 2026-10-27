import "./ListCard.css";

interface ListCardProps {
    children: React.ReactNode;
    Width: string;
}

export default function ListCard({
    children,
    Width
} : ListCardProps) {
    return (
        <div className={`list-card ${Width}`} >
            {children}
        </div>
    )
}