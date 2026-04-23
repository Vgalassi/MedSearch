
export type ClinicProps = {
  id: string,
  email: string,
  password: string,
  address: string,
  cep: string,
  latitude: number,
  longitude: number,
  description: string,
  name: string,
  phone: string,
}


export class Clinic{
    constructor(public props: ClinicProps){}
}