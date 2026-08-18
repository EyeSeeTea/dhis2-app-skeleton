import _c from "$/domain/entities/generic/Collection";
import { HashMap } from "$/domain/entities/generic/HashMap";
import { getId, Id } from "$/domain/entities/Ref";
import { User } from "$/domain/entities/User";
import { UserGroup } from "$/domain/entities/UserGroup";
import { UserRole } from "$/domain/entities/UserRole";
import i18n from "$/utils/i18n";
import { UsersFilterInfo } from "./useUsersFilterInfo";

/* Renders the user groups and user roles of a user, which are stored as ids. Build it once and
   share it, so the indexes are built once for all the consumers. */
export class UserView {
    private userGroupsById: HashMap<Id, UserGroup>;
    private userRolesById: HashMap<Id, UserRole>;

    constructor(info: UsersFilterInfo) {
        this.userGroupsById = _c(info.userGroups).indexBy(getId);
        this.userRolesById = _c(info.userRoles).indexBy(getId);
    }

    renderUserGroups(user: User, options: RenderOptions = {}): string {
        const names = user.userGroupIds.map(id => this.userGroupsById.get(id)?.name ?? id);
        return render(names, options);
    }

    renderUserRoles(user: User, options: RenderOptions = {}): string {
        const names = user.userRoleIds.map(id => this.userRolesById.get(id)?.name ?? id);
        return render(names, options);
    }
}

/* ellipsis: maximum amount of names to show. The extra ones are replaced by their count. */
type RenderOptions = { ellipsis?: number };

function render(names0: string[], options: RenderOptions): string {
    const { ellipsis } = options;
    const names = _c(names0).sort().value();
    if (ellipsis === undefined || names.length <= ellipsis) return names.join(separator);

    const shown = names.slice(0, ellipsis).join(separator);
    const remaining = i18n.t("(+{{count}} more)", { count: names.length - ellipsis });

    return `${shown} ${remaining}`;
}

const separator = ", ";
