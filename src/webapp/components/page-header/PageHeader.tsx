import React from "react";
import styled from "styled-components";
import i18n from "$/utils/i18n";
import { Button, Tooltip, Modal, ModalTitle, ModalContent, ModalActions } from "@dhis2/ui";
import { IconChevronLeft24 } from "@dhis2/ui-icons";

export type PageHeaderProps = React.PropsWithChildren<{
    title: string;
    onBackClick?: () => void;
    helpText?: string;
}>;

const TooltipIconButton: React.FC<{
    title: string;
    onClick: () => void;
    icon: React.ReactElement;
    "data-test"?: string;
}> = ({ title, onClick, icon, ...rest }) => (
    <Tooltip content={title} placement="top">
        <Button small icon={icon} onClick={onClick} {...rest} />
    </Tooltip>
);

export const PageHeader: React.FC<PageHeaderProps> = React.memo(props => {
    const { title, onBackClick, helpText, children } = props;
    const [helpOpen, setHelpOpen] = React.useState(false);

    return (
        <Wrapper>
            <Row>
                {!!onBackClick && (
                    <BackWrap>
                        <TooltipIconButton
                            title={i18n.t("Back")}
                            onClick={onBackClick}
                            icon={<IconChevronLeft24 />}
                            data-test="page-header-back"
                        />
                    </BackWrap>
                )}

                <h2 data-test="page-header-title">{title}</h2>
            </Row>

            {helpText && <Button onClick={() => setHelpOpen(true)}>{i18n.t("Help")}</Button>}

            {children}

            {helpText && (
                <Modal position="middle" onClose={() => setHelpOpen(false)} hide={!helpOpen} large>
                    <ModalTitle>{i18n.t("Help")}</ModalTitle>
                    <ModalContent>
                        <p>{helpText}</p>
                    </ModalContent>
                    <ModalActions>
                        <Button onClick={() => setHelpOpen(false)}>{i18n.t("Close")}</Button>
                    </ModalActions>
                </Modal>
            )}
        </Wrapper>
    );
});

/* ---- styles ---- */

const Wrapper = styled.div`
    display: block;
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    column-gap: 0.5rem;
`;

const BackWrap = styled.div`
    padding-top: 10px;
    margin-bottom: 5px;
`;
