

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
    FindClinicByIdUseCase: Symbol.for("FindClinicByIdUseCase"),
    GetAllDoctorsUseCase: Symbol.for("GetAllDoctorsUseCase"),
    GetDoctorAvailableDaysUseCase: Symbol.for("GetDoctorAvailableDaysUseCase"),
    AppointmentRepository: Symbol.for("AppointmentRepository"),
    DoctorSettingsRepository: Symbol.for("DoctorSettingsRepository"),
    AvailabilityRepository: Symbol.for("AvailabilityRepository"),
    CreateAppointmentUseCase: Symbol.for("CreateAppointmentUseCase"),
    CancelAppointmentUseCase: Symbol.for("CancelAppointmentUseCase"),
    ListPatientAppointmentsUseCase: Symbol.for("ListPatientAppointmentsUseCase"),
    ListDoctorAppointmentsUseCase: Symbol.for("ListDoctorAppointmentsUseCase"),
    ListDoctorAvailableSlotsUseCase: Symbol.for("ListDoctorAvailableSlotsUseCase"),
    HashGenerator: Symbol.for("HashGenerator"),
    
};
