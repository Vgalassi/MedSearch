import { injectable } from "inversify";
import type { GeocodingService } from "../../app/protocols/GeocodingService";
import { Address } from "../../domain/value-objects/Address";
import { NotfoundError } from "../../domain/errors/NotFoundError";
@injectable()
export class NominatimGeocodingService implements GeocodingService {

    async getCoordinates(address: Address) {

        const query = [
            address.street,
            address.number,
            address.city,
            address.state,
            "Brasil"
        ].join(", ");
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
            {
                headers: {
                    "User-Agent": "MedSearch/1.0"
                }
            }
        );

        const data = await response.json();

        if (data.length === 0) {
            throw new NotfoundError(
                "address",
                query
            );

        }

        return new Address(
            address.street,
            address.city,
            address.state,
            address.cep,
            address.number,
            Number(data[0].lat),
            Number(data[0].lon)
        )

    }
}
