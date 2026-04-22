import Link from "next/link"
import LinkDropdown from "./LinkDropdown"
export default function MainHeader(){
    const registerUrls = 
    [
        {
            href: "/patient/register",
            label: "Sou paciente"
        },
        {
            href: "/medic/register",
            label: "Sou médico"
        },
        {
            href: "/clinic/register",
            label: "Sou clínica"
        },
        
    ]
    return (
        <header className="flex justify-between items-center px-2
        border-solid border-black border-b-2">
            <div>
               <Link href="/">MedSearch</Link>
            </div>
            <nav>
                    <LinkDropdown title={"registrar"} urls={registerUrls}/>
                    <Link className="m-4 border-1 p-2 rounded" href="/login">Login</Link>  
                   
            </nav>
            
        </header>
    )
}