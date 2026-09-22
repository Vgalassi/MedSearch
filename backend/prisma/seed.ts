import "reflect-metadata";
import { TYPES } from "../src/app/dto/types";
import type { RegisterUserDto } from "../src/app/dto/RegisterUserDto";
import type { CepService } from "../src/app/protocols/CepService";
import type { GeocodingService } from "../src/app/protocols/GeocodingService";
import { RegisterUserUseCase } from "../src/app/usecases/RegisterUserUseCase";
import { container } from "../src/infra/di/container";
import { prisma } from "../src/lib/prisma";
import { Address } from "../src/domain/value-objects/Address";
import { Cep } from "../src/domain/value-objects/Cep";

type SeedAddress = {
  street: string;
  city: string;
  state: string;
  cep: string;
  latitude: number;
  longitude: number;
};

const password = "123456";

const addresses: SeedAddress[] = [
  {
    street: "Avenida Paulista",
    city: "Sao Paulo",
    state: "SP",
    cep: "01311000",
    latitude: -23.561414,
    longitude: -46.655881,
  },
  {
    street: "Rua XV de Novembro",
    city: "Curitiba",
    state: "PR",
    cep: "80020310",
    latitude: -25.429596,
    longitude: -49.271272,
  },
  {
    street: "Avenida Afonso Pena",
    city: "Belo Horizonte",
    state: "MG",
    cep: "30130003",
    latitude: -19.919052,
    longitude: -43.938668,
  },
  {
    street: "Praia de Botafogo",
    city: "Rio de Janeiro",
    state: "RJ",
    cep: "22250040",
    latitude: -22.948557,
    longitude: -43.180806,
  },
  {
    street: "Avenida Beira Mar",
    city: "Fortaleza",
    state: "CE",
    cep: "60165001",
    latitude: -3.725286,
    longitude: -38.493417,
  },
  {
    street: "Avenida Borges de Medeiros",
    city: "Porto Alegre",
    state: "RS",
    cep: "90110150",
    latitude: -30.034647,
    longitude: -51.217658,
  },
  {
    street: "Avenida Francisco Glicerio",
    city: "Campinas",
    state: "SP",
    cep: "13012000",
    latitude: -22.905639,
    longitude: -47.060833,
  },
  {
    street: "Avenida Jose de Souza Campos",
    city: "Campinas",
    state: "SP",
    cep: "13025120",
    latitude: -22.889305,
    longitude: -47.047245,
  },
  {
    street: "Avenida dos Esportes",
    city: "Valinhos",
    state: "SP",
    cep: "13270000",
    latitude: -22.969622,
    longitude: -46.995842,
  },
  {
    street: "Avenida Independencia",
    city: "Vinhedo",
    state: "SP",
    cep: "13280000",
    latitude: -23.030175,
    longitude: -46.983119,
  },
  {
    street: "Avenida Jose Paulino",
    city: "Paulinia",
    state: "SP",
    cep: "13140000",
    latitude: -22.761069,
    longitude: -47.154098,
  },
  {
    street: "Avenida Reboucas",
    city: "Sumare",
    state: "SP",
    cep: "13170000",
    latitude: -22.821934,
    longitude: -47.266761,
  },
  {
    street: "Avenida Santana",
    city: "Hortolandia",
    state: "SP",
    cep: "13184000",
    latitude: -22.858384,
    longitude: -47.220712,
  },
  {
    street: "Rua Treze de Maio",
    city: "Jaguariuna",
    state: "SP",
    cep: "13910000",
    latitude: -22.703719,
    longitude: -46.985062,
  },
];

const clinics: RegisterUserDto[] = [
  {
    role: "CLINIC",
    name: "Clinica Vida Paulista",
    email: "clinica.paulista@seed.com",
    password,
    phone: "11940000001",
    cep: "01311000",
    number: "1000",
    description: "Atendimento clinico geral, exames de rotina e acompanhamento preventivo.",
  },
  {
    role: "CLINIC",
    name: "Centro Medico Curitiba",
    email: "clinica.curitiba@seed.com",
    password,
    phone: "41940000002",
    cep: "80020310",
    number: "245",
    description: "Consultas especializadas com foco em agilidade e cuidado familiar.",
  },
  {
    role: "CLINIC",
    name: "Saude Minas Integrada",
    email: "clinica.minas@seed.com",
    password,
    phone: "31940000003",
    cep: "30130003",
    number: "720",
    description: "Clinica multidisciplinar com cardiologia, pediatria e ortopedia.",
  },
  {
    role: "CLINIC",
    name: "Med Botafogo",
    email: "clinica.botafogo@seed.com",
    password,
    phone: "21940000004",
    cep: "22250040",
    number: "316",
    description: "Consultas medicas e acompanhamento ambulatorial na zona sul.",
  },
  {
    role: "CLINIC",
    name: "Clinica Beira Mar",
    email: "clinica.fortaleza@seed.com",
    password,
    phone: "85940000005",
    cep: "60165001",
    number: "890",
    description: "Especialidades medicas com atendimento humanizado e estrutura moderna.",
  },
  {
    role: "CLINIC",
    name: "Nucleo Saude Porto Alegre",
    email: "clinica.portoalegre@seed.com",
    password,
    phone: "51940000006",
    cep: "90110150",
    number: "1501",
    description: "Centro medico com agenda integrada para consultas presenciais.",
  },
  {
    role: "CLINIC",
    name: "Clinica Campinas Centro",
    email: "clinica.campinas.centro@seed.com",
    password,
    phone: "19940000007",
    cep: "13012000",
    number: "640",
    description: "Atendimento multidisciplinar no centro de Campinas.",
  },
  {
    role: "CLINIC",
    name: "Instituto Saude Cambui",
    email: "clinica.cambui@seed.com",
    password,
    phone: "19940000008",
    cep: "13025120",
    number: "980",
    description: "Consultas e acompanhamento preventivo na regiao do Cambui.",
  },
  {
    role: "CLINIC",
    name: "Centro Medico Valinhos",
    email: "clinica.valinhos@seed.com",
    password,
    phone: "19940000009",
    cep: "13270000",
    number: "315",
    description: "Especialidades medicas e atendimento familiar em Valinhos.",
  },
  {
    role: "CLINIC",
    name: "Clinica Bem Viver Vinhedo",
    email: "clinica.vinhedo@seed.com",
    password,
    phone: "19940000010",
    cep: "13280000",
    number: "450",
    description: "Cuidado integrado e consultas especializadas em Vinhedo.",
  },
  {
    role: "CLINIC",
    name: "Nucleo Medico Paulinia",
    email: "clinica.paulinia@seed.com",
    password,
    phone: "19940000011",
    cep: "13140000",
    number: "725",
    description: "Atendimento clinico e especialidades para a regiao de Paulinia.",
  },
  {
    role: "CLINIC",
    name: "Saude Integrada Sumare",
    email: "clinica.sumare@seed.com",
    password,
    phone: "19940000012",
    cep: "13170000",
    number: "1120",
    description: "Centro de consultas e prevencao em saude em Sumare.",
  },
  {
    role: "CLINIC",
    name: "Clinica Horizonte Hortolandia",
    email: "clinica.hortolandia@seed.com",
    password,
    phone: "19940000013",
    cep: "13184000",
    number: "590",
    description: "Atendimento humanizado e diversas especialidades em Hortolandia.",
  },
  {
    role: "CLINIC",
    name: "Centro Clinico Jaguariuna",
    email: "clinica.jaguariuna@seed.com",
    password,
    phone: "19940000014",
    cep: "13910000",
    number: "210",
    description: "Consultas medicas e acompanhamento ambulatorial em Jaguariuna.",
  },
];

const patients: RegisterUserDto[] = [
  {
    role: "PATIENT",
    name: "Ana Souza",
    email: "ana.souza@seed.com",
    password,
    phone: "11950000001",
    cpf: "12345678062",
  },
  {
    role: "PATIENT",
    name: "Bruno Lima",
    email: "bruno.lima@seed.com",
    password,
    phone: "41950000002",
    cpf: "12345678143",
  },
  {
    role: "PATIENT",
    name: "Carla Mendes",
    email: "carla.mendes@seed.com",
    password,
    phone: "31950000003",
    cpf: "12345678224",
  },
  {
    role: "PATIENT",
    name: "Daniel Rocha",
    email: "daniel.rocha@seed.com",
    password,
    phone: "21950000004",
    cpf: "12345678305",
  },
  {
    role: "PATIENT",
    name: "Fernanda Costa",
    email: "fernanda.costa@seed.com",
    password,
    phone: "85950000005",
    cpf: "12345678496",
  },
  {
    role: "PATIENT",
    name: "Gabriel Martins",
    email: "gabriel.martins@seed.com",
    password,
    phone: "51950000006",
    cpf: "12345678577",
  },
];

const doctorTemplates = [
  ["Mariana Alves", "Cardiologia", "CRM-SP-10001"],
  ["Rafael Pereira", "Ortopedia", "CRM-PR-10002"],
  ["Juliana Castro", "Pediatria", "CRM-MG-10003"],
  ["Thiago Nunes", "Dermatologia", "CRM-RJ-10004"],
  ["Patricia Gomes", "Ginecologia", "CRM-CE-10005"],
  ["Lucas Ferreira", "Neurologia", "CRM-RS-10006"],
  ["Camila Barbosa", "Endocrinologia", "CRM-SP-10007"],
  ["Eduardo Ribeiro", "Psiquiatria", "CRM-PR-10008"],
  ["Renata Carvalho", "Oftalmologia", "CRM-MG-10009"],
  ["Felipe Dias", "Urologia", "CRM-RJ-10010"],
  ["Bianca Teixeira", "Clinica Geral", "CRM-CE-10011"],
  ["Andre Moreira", "Gastroenterologia", "CRM-RS-10012"],
  ["Beatriz Martins", "Cardiologia", "CRM-SP-10013"],
  ["Gustavo Almeida", "Ortopedia", "CRM-SP-10014"],
  ["Larissa Moraes", "Pediatria", "CRM-SP-10015"],
  ["Henrique Araujo", "Dermatologia", "CRM-SP-10016"],
  ["Isabela Freitas", "Ginecologia", "CRM-SP-10017"],
  ["Marcelo Cardoso", "Neurologia", "CRM-SP-10018"],
  ["Aline Rodrigues", "Endocrinologia", "CRM-SP-10019"],
  ["Caio Fernandes", "Psiquiatria", "CRM-SP-10020"],
  ["Natalia Oliveira", "Oftalmologia", "CRM-SP-10021"],
  ["Rodrigo Santos", "Urologia", "CRM-SP-10022"],
  ["Vanessa Lopes", "Clinica Geral", "CRM-SP-10023"],
  ["Diego Correia", "Gastroenterologia", "CRM-SP-10024"],
  ["Priscila Ramos", "Otorrinolaringologia", "CRM-SP-10025"],
  ["Leandro Batista", "Reumatologia", "CRM-SP-10026"],
  ["Monica Vieira", "Pneumologia", "CRM-SP-10027"],
  ["Sergio Mendes", "Infectologia", "CRM-SP-10028"],
] as const;

const independentDoctorTemplates = [
  ["Helena Duarte", "Clinica Geral", "CRM-SP-10029"],
  ["Murilo Pacheco", "Cardiologia", "CRM-SP-10030"],
  ["Tatiana Neves", "Pediatria", "CRM-SP-10031"],
  ["Fabio Monteiro", "Ortopedia", "CRM-SP-10032"],
  ["Cecilia Andrade", "Dermatologia", "CRM-SP-10033"],
  ["Vinicius Porto", "Neurologia", "CRM-SP-10034"],
] as const;

class SeedCepService implements CepService {
  async findAddress(cep: string, number: string): Promise<Address> {
    const address = addresses.find((item) => item.cep === cep);

    if (!address) {
      throw new Error(`CEP ${cep} nao encontrado no seed`);
    }

    return new Address(
      address.street,
      address.city,
      address.state,
      new Cep(address.cep),
      number,
    );
  }
}

class SeedGeocodingService implements GeocodingService {
  async getCoordinates(address: Address): Promise<Address> {
    const seededAddress = addresses.find(
      (item) => item.cep === address.cep.value,
    );

    if (!seededAddress) {
      throw new Error(`Coordenadas do CEP ${address.cep.value} nao encontradas`);
    }

    return new Address(
      address.street,
      address.city,
      address.state,
      address.cep,
      address.number,
      seededAddress.latitude,
      seededAddress.longitude,
    );
  }
}

async function createUser(registerUserUseCase: RegisterUserUseCase, data: RegisterUserDto) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    console.log(`Ignorando ${data.email}: usuario ja existe`);
    return existingUser;
  }

  const user = await registerUserUseCase.execute(data);
  console.log(`Criado ${data.role.toLowerCase()}: ${data.email}`);
  return { id: user.id.value };
}

async function findClinicIdByEmail(email: string): Promise<string> {
  const clinic = await prisma.clinic.findFirst({
    where: {
      user: {
        email,
      },
    },
    select: {
      id: true,
    },
  });

  if (!clinic) {
    throw new Error(`Clinica do email ${email} nao encontrada`);
  }

  return clinic.id;
}

async function main() {
  const registerUserUseCase = new RegisterUserUseCase(
    container.get(TYPES.UserRepository),
    container.get(TYPES.DoctorRepository),
    container.get(TYPES.PatientRepository),
    container.get(TYPES.ClinicRepository),
    container.get(TYPES.HashGenerator),
    new SeedCepService(),
    new SeedGeocodingService(),
  );

  for (const clinic of clinics) {
    await createUser(registerUserUseCase, clinic);
  }

  const clinicIds = await Promise.all(
    clinics.map((clinic) => findClinicIdByEmail(clinic.email)),
  );

  for (const patient of patients) {
    await createUser(registerUserUseCase, patient);
  }

  for (const [index, [name, speciality, crm]] of doctorTemplates.entries()) {
    await createUser(registerUserUseCase, {
      role: "DOCTOR",
      name,
      email: `medico.${index + 1}@seed.com`,
      password,
      phone: `1196${String(index + 1).padStart(7, "0")}`,
      crm,
      speciality,
      clinicId: clinicIds[index % clinicIds.length],
    });
  }

  for (const [index, [name, speciality, crm]] of independentDoctorTemplates.entries()) {
    const doctorNumber = doctorTemplates.length + index + 1;

    await createUser(registerUserUseCase, {
      role: "DOCTOR",
      name,
      email: `medico.${doctorNumber}@seed.com`,
      password,
      phone: `1196${String(doctorNumber).padStart(7, "0")}`,
      crm,
      speciality,
    });
  }

  console.log("Seed finalizado com sucesso");
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
