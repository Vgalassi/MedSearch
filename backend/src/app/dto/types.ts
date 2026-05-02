
export const TYPES = {
    UserRepository: Symbol.for("UserRepository"),
    DoctorRepository: Symbol.for("DoctorRepository"),
    PatientRepository: Symbol.for("PatientRepository"),
    ClinicRepository: Symbol.for("ClinicRepository"),
    RegisterUserUseCase: Symbol.for("RegisterUserUseCase"),
    AddDoctorToClinicUseCase: Symbol.for("AddDoctorToClinicUseCase"),
    RemoveDoctorFromClinicUseCase: Symbol.for("RemoveDoctorFromClinicUseCase"),
    GetClinicDoctorsUseCase: Symbol.for("GetClinicDoctorsUseCase"),
    GetAllClinicsUseCase: Symbol.for("GetAllClinicsUseCase"),
    HashGenerator: Symbol.for("HashGenerator"),
    
};