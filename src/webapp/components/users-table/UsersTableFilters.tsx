import React from "react";
import styled from "styled-components";
import { Dropdown, MultipleDropdown } from "@eyeseetea/d2-ui-components";
import { Id } from "$/domain/entities/Ref";
import { UsersFilters } from "$/domain/repositories/UserRepository";
import { UsersFilterInfo } from "$/domain/usecases/GetUsersFilterInfoUseCase";
import { Maybe } from "$/utils/ts-utils";
import i18n from "$/utils/i18n";

export type FiltersState = {
    userGroupIds: Id[];
    userRoleIds: Id[];
    canLogin: Maybe<"yes" | "no">;
};

export const initialFiltersState: FiltersState = {
    userGroupIds: [],
    userRoleIds: [],
    canLogin: undefined,
};

export function toUsersFilters(state: FiltersState): UsersFilters {
    return {
        userGroupIds: state.userGroupIds.length > 0 ? state.userGroupIds : undefined,
        userRoleIds: state.userRoleIds.length > 0 ? state.userRoleIds : undefined,
        canLogin: state.canLogin === "yes" ? true : state.canLogin === "no" ? false : undefined,
    };
}

type UsersTableFiltersProps = {
    info: Maybe<UsersFilterInfo>;
    selection: FiltersState;
    onChange: React.Dispatch<React.SetStateAction<FiltersState>>;
};

export const UsersTableFilters: React.FC<UsersTableFiltersProps> = React.memo(props => {
    const { info, selection, onChange } = props;

    const groupItems = React.useMemo(
        () =>
            (info?.userGroups || []).map(userGroup => ({
                value: userGroup.id,
                text: userGroup.name,
            })),
        [info?.userGroups]
    );

    const roleItems = React.useMemo(
        () =>
            (info?.userRoles || []).map(userRole => ({
                value: userRole.id,
                text: userRole.name,
            })),
        [info?.userRoles]
    );

    const statusItems = React.useMemo(
        () => [
            { value: "yes", text: i18n.t("Enabled") },
            { value: "no", text: i18n.t("Disabled") },
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
                canLogin: value === "yes" || value === "no" ? value : undefined,
            })),
        [onChange]
    );

    return (
        <Container>
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
                value={selection.canLogin}
                onChange={updateStatus}
            />
        </Container>
    );
});

const Container = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 0;
`;
