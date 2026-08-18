import React from "react";
import { Dropdown, MultipleDropdown } from "@eyeseetea/d2-ui-components";
import { Id } from "$/domain/entities/Ref";
import { UsersFilters } from "$/domain/repositories/UserRepository";
import { UsersFilterInfo } from "./useUsersFilterInfo";
import { Maybe } from "$/utils/ts-utils";
import i18n from "$/utils/i18n";
import styles from "./UsersTableFilters.module.css";

export type FiltersState = {
    userGroupIds: Id[];
    userRoleIds: Id[];
    disabled: Maybe<boolean>;
};

export const initialFiltersState: FiltersState = {
    userGroupIds: [],
    userRoleIds: [],
    disabled: undefined,
};

export function toUsersFilters(state: FiltersState): UsersFilters {
    return {
        userGroupIds: state.userGroupIds.length > 0 ? state.userGroupIds : undefined,
        userRoleIds: state.userRoleIds.length > 0 ? state.userRoleIds : undefined,
        disabled: state.disabled,
    };
}

type UsersTableFiltersProps = {
    info: UsersFilterInfo;
    selection: FiltersState;
    onChange: React.Dispatch<React.SetStateAction<FiltersState>>;
};

export const UsersTableFilters: React.FC<UsersTableFiltersProps> = React.memo(props => {
    const { info, selection, onChange } = props;

    const groupItems = React.useMemo(
        () =>
            (info?.userGroups ?? []).map(userGroup => ({
                value: userGroup.id,
                text: userGroup.name,
            })),
        [info?.userGroups]
    );

    const roleItems = React.useMemo(
        () =>
            (info?.userRoles ?? []).map(userRole => ({
                value: userRole.id,
                text: userRole.name,
            })),
        [info?.userRoles]
    );

    const statusItems = React.useMemo(
        () => [
            { value: "yes", text: i18n.t("Disabled") },
            { value: "no", text: i18n.t("Enabled") },
        ],
        []
    );

    const updateGroups = React.useCallback(
        (values: string[]) =>
            onChange(prev => ({
                ...prev,
                userGroupIds: values,
            })),
        [onChange]
    );

    const updateRoles = React.useCallback(
        (values: string[]) =>
            onChange(prev => ({
                ...prev,
                userRoleIds: values,
            })),
        [onChange]
    );

    const updateStatus = React.useCallback(
        (value: string | undefined) =>
            onChange(prev => ({
                ...prev,
                disabled: value === "yes" ? true : value === "no" ? false : undefined,
            })),
        [onChange]
    );

    return (
        <div className={styles.container}>
            <MultipleDropdown
                label={i18n.t("User groups")}
                items={groupItems}
                values={selection.userGroupIds}
                onChange={updateGroups}
            />
            <MultipleDropdown
                label={i18n.t("User roles")}
                items={roleItems}
                values={selection.userRoleIds}
                onChange={updateRoles}
            />
            <Dropdown
                label={i18n.t("Status")}
                items={statusItems}
                value={
                    selection.disabled === true
                        ? "yes"
                        : selection.disabled === false
                          ? "no"
                          : undefined
                }
                onChange={updateStatus}
            />
        </div>
    );
});
