import React from "react";
import { PageHeader } from "$/webapp/components/page-header/PageHeader";
import { SummaryCard, SummaryCardGroup } from "$/webapp/components/card-grid/SummaryCard";

const section = { title: "title2", name: "name2" };

export const CardGrid: React.FC<CardGridProps> = React.memo(({ title, cards, onBackClick }) => {
    return (
        <React.Fragment>
            {!!title && <PageHeader title={title} onBackClick={onBackClick} />}

            {cards.map(card => (
                <SummaryCardGroup key={card.key} title={card.title} section={section}>
                    {card.items.map(child => (
                        <SummaryCard
                            key={child.name}
                            section={{ title: child.name, route: child.route }}
                        >
                            {child.description}
                        </SummaryCard>
                    ))}
                </SummaryCardGroup>
            ))}
        </React.Fragment>
    );
});

export type CardGridProps = {
    cards: Card[];
    title?: string;
    onBackClick?: () => void;
};

export type Card = {
    title: string;
    key: string;
    items: CardItem[];
};

export type CardItem = {
    name: string;
    description: string;
    route: string;
};
