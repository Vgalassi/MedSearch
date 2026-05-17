export type AppointmentDetails = {
  id: string;
  patientId: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  day: string;
  status: string;
  reason: string | null;
  notes: string | null;
  doctor: {
    id: string;
    name: string;
    phone: string;
    crm: string;
    speciality: string;
  };
  clinic: {
    id: string;
    name: string;
    phone: string;
    address: string;
    cep: string;
  } | null;
  patient: {
    id: string;
    name: string;
    phone: string;
  };
};
