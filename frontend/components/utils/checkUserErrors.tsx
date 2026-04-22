import { UserCreateFormData } from "../types/UserFormData"

export function checkUserErrors(
    enteredValues: UserCreateFormData,errors: string[]):string[]{
    const {name, email, password, confirmPassword, phone}= enteredValues
    if(password !== confirmPassword) {
      errors.push("As senhas não estão iguais")
      enteredValues.password = ""
      enteredValues.confirmPassword = ""
    }
    if(password.length < 6){
      errors.push("A senha deve ter mais do que 6 caracteres")
      enteredValues.password = ""
      enteredValues.confirmPassword = ""
    }

    return errors
  }