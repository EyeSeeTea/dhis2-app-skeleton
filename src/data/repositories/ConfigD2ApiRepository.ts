import { User } from "../../domain/entities/User";
import { ConfigRepository } from "../../domain/repositories/ConfigRepository";
import { D2Api } from "../../types/d2-api";

export class ConfigD2ApiRepository implements ConfigRepository {
    constructor(private api: D2Api) {}

    public async getCurrentUser(): Promise<User> {
        const { userCredentials, ...user } = await this.api.currentUser
            .get({
                fields: {
                    id: true,
                    displayName: true,
                    organisationUnits: { id: true, path: true, level: true },
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true },
                    },
                },
            })
            .getData();

        return {
            id: user.id,
            name: user.displayName,
            organisationUnits: user.organisationUnits,
            username: userCredentials.username,
            userRoles: userCredentials.userRoles,
        };
    }
}
