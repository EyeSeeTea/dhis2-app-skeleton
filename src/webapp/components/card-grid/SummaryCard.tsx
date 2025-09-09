import i18n from "@dhis2/d2-i18n";
import { Button } from "@dhis2/ui";
import React, { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import styles from "./SummaryCard.module.css";

const SummaryCardHeader = ({ children }: PropsWithChildren) => (
    <div className={styles.cardHeader}>{children}</div>
);

type SummaryCardGroupProps = {
    title: string;
    section: OverviewSection;
};

export type SectionBase = { title: string };

type OverviewSection = SectionBase;

export const SummaryCardGroup = ({ children, title }: PropsWithChildren<SummaryCardGroupProps>) => {
    return (
        <>
            {title && <div className={styles.cardGroupHeader}>{title}</div>}

            <div className={styles.cardGroup}>{children}</div>
        </>
    );
};

type SummaryCardProps = {
    children: React.ReactNode;
    section: ModelSection;
};

type ModelSection = SectionBase & { route: string };

export const SummaryCard = ({ children, section }: SummaryCardProps) => {
    const title = section.title;
    return (
        <div data-test={`card-${title}`} className={styles.cardWrapper}>
            <Link className={styles.cardTopLink} to={`/${getSectionPath(section)}`}>
                <div className={styles.cardTop}>
                    <SummaryCardHeader>{title}</SummaryCardHeader>
                    <SummaryCardContent>{children}</SummaryCardContent>
                </div>
            </Link>
            <SummaryCardActions section={section} />
        </div>
    );
};

export const SummaryCardContent = ({ children }: PropsWithChildren) => {
    return <p className={styles.cardContent}>{children}</p>;
};

interface SummaryCardActionsProps {
    section: ModelSection;
}

function getSectionNewPath(_section: SectionBase) {
    return "NEW-TODO";
}

function getSectionPath(section: ModelSection) {
    return section.route;
}

export const SummaryCardActions = ({ section }: SummaryCardActionsProps) => {
    return (
        <div className={styles.cardActions}>
            {
                <Link to={`/${getSectionNewPath(section)}`} tabIndex={-1}>
                    <Button secondary small>
                        {i18n.t("Add new")}
                    </Button>
                </Link>
            }

            <Link to={`/${getSectionPath(section)}`} tabIndex={-1}>
                <Button secondary small>
                    {i18n.t("Manage")}
                </Button>
            </Link>
        </div>
    );
};
