import { ClinicShowData } from "./types/UserShowData";
export function ClinicCard({name}:ClinicShowData){
    return (
        <p>{name}</p>
    )
}