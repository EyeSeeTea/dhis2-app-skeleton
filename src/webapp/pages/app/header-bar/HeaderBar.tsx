import { HeaderBar as D2HeaderBar } from "@dhis2/ui";

type HeaderBarProps = {
    appName: string;
};

// avoid rendering header for versions > 2.41
// https://developers.dhis2.org/docs/references/global-shell/#header-bars
export const HeaderBar: React.FC<HeaderBarProps> = props => {
    const { appName } = props;
    const shouldRenderHeaderBar = window.self === window.top;
    if (!shouldRenderHeaderBar) return null;

    return (
        <div className="header-bar-wrapper">
            <D2HeaderBar appName={appName} />
            <style jsx>{`
                .header-bar-wrapper :global(div:first-of-type) {
                    box-sizing: border-box;
                }
            `}</style>
        </div>
    );
};
