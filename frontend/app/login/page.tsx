
export default function LoginPage(){
    return (
    <div className="m-auto">
        <div className="border-1 w-80 p-4 rounded">
            <form  action="">
                <h1>Login</h1>
                <label htmlFor="email">Email</label>
                <input type="email"  className="input" name="email" id="email"></input>
                <label  htmlFor="password">Senha</label>
                <input type="password" className="input" name="password" id="password"></input>
                <input className="border-1 p-2 m-2 mx-auto cursor-pointer hover:bg-black hover:text-white"
                 type="submit" value="Entrar"></input>
            </form>
        </div>
    </div>

    )
}