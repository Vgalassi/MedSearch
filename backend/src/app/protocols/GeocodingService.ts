import { Address } from "../../domain/value-objects/Address";

export interface GeocodingService {

   getCoordinates(address: Address): Promise<Address>;

}