import React from "react";
import i18n from "$/utils/i18n";
import { Button, Tooltip, Modal, ModalTitle, ModalContent, ModalActions } from "@dhis2/ui";
import { IconChevronLeft24 } from "@dhis2/ui-icons";
import css from "./PageHeader.module.css";

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
        <div className={css.wrapper}>
            <div className={css.row}>
                {!!onBackClick && (
                    <div className={css.backWrap}>
                        <TooltipIconButton
                            title={i18n.t("Back")}
                            onClick={onBackClick}
                            icon={<IconChevronLeft24 />}
                            data-test="page-header-back"
                        />
                    </div>
                )}

                <h2 data-test="page-header-title">{title}</h2>
            </div>

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
        </div>
    );
});
