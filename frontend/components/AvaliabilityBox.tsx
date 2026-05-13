
export function AvaliabilityBox(){
    return (
    <div>
        <label htmlFor="Sunday">
            <input type="checkbox" />
        </label>
        <label htmlFor="Monday">
            <input type="checkbox" />
        </label>
        <label htmlFor="Tuesday">
            <input type="checkbox" />
        </label>
        <label htmlFor="Wednesday">
            <input type="checkbox" />
        </label>
        <label htmlFor="Thursday">
            <input type="checkbox" />
        </label>
        <label htmlFor="Friday">
            <input type="checkbox" />
        </label>
        <label htmlFor="Saturday">
            <input type="checkbox" />
        </label>
        <label htmlFor="start">Horário de início</label>
        <input type="time" />
        <label htmlFor="end">Horário de saída</label>
        <input type="time" />
    </div>
    )
}