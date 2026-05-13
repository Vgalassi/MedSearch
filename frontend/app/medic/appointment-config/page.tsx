import { AvaliabilityBox } from "@/components/AvaliabilityBox"

export default function(){
    return(
    <>
    <p>Essa é a configuração do médico </p>
    <div className="">
    <form action="">
        <label>
            <span>Liberar consultas?</span>
            <input type="checkbox"/>
        </label>
        <label htmlFor="minTime">Tempo mínimo</label>
        <input type="number" />
        <label htmlFor="maxTime">Tempo máximo</label>
        <input type="number" />
        <label htmlFor="minTime">Duração Padrão</label>
        <input type="number" />
        <label htmlFor="minTime">Intervalo entre consultas</label>
        <input type="number" />
        <label htmlFor="minTime">Duração Padrão</label>
        <input type="number" />
        <label htmlFor="">Máximo diário de consultas</label>
        <input type="number" />
        <AvaliabilityBox></AvaliabilityBox>
        
    </form>
    </div>
    </>
    )
}