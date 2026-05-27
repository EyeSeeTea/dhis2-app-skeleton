import React from "react";
import logo from "./logo-eyeseetea.png";

type ShareProps = {
    visible: boolean;
};

export const Share: React.FC<ShareProps> = ({ visible }) => {
    const [expanded, setExpanded] = React.useState(false);
    const [hover, setHover] = React.useState(false);

    const toggleExpanded = React.useCallback(() => setExpanded(prev => !prev), []);
    const openMainPage = React.useCallback(() => window.open("http://www.eyeseetea.com/", "_blank"), []);
    const openTwitter = React.useCallback(() => window.open("https://twitter.com/eyeseetealtd", "_blank"), []);
    const onMouseEnter = React.useCallback(() => setHover(true), []);
    const onMouseLeave = React.useCallback(() => setHover(false), []);

    if (!visible) return null;

    const shareStyles = hover ? { ...styles.share, ...styles.shareHover } : styles.share;

    return (
        <div>
            <div style={styles.shareTab} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                <button style={shareStyles} onClick={toggleExpanded}>
                    <i className="fa fa-share icon-xlarge" />
                </button>
            </div>

            {expanded && (
                <div style={styles.eyeseeteaShare}>
                    <p>
                        <button style={styles.eyeseeteaShareButtons} onClick={openMainPage}>
                            <img src={logo} alt="EyeSeeTea" style={styles.eyeseeteaIcon} />
                        </button>
                    </p>

                    <p>
                        <button style={styles.eyeseeteaShareButtons} onClick={openTwitter}>
                            <i className="fa fa-twitter" style={styles.twitterIcon} />
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
};

const styles = {
    eyeseeteaShare: {
        backgroundColor: "rgb(243,243,243)",
        position: "fixed" as const,
        bottom: "0px",
        right: "100px",
        borderRadius: "0px",
        height: "auto",
        opacity: ".85",
        paddingBottom: "30px",
        width: "65px",
        zIndex: 10001,
        textAlign: "center" as const,
    },

    eyeseeteaShareButtons: {
        width: "35px",
        cursor: "pointer" as const,
        backgroundColor: "white",
        borderRadius: 0,
        opacity: 1,
        color: "white",
        boxShadow: "none",
        textShadow: "none",
        border: "0px",
        textAlign: "center" as const,
    },

    eyeseeteaIcon: {
        width: "15px",
    },

    twitterIcon: {
        color: "#477726",
        fontSize: "20px",
    },

    shareTab: {
        bottom: "-3px",
        right: "100px",
        position: "fixed" as const,
        zIndex: 10002,
    },

    share: {
        textShadow: "none",
        backgroundColor: "#ff9800",
        color: "white",
        width: "65px",
        height: "38.5px",
        cursor: "pointer",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: "2px",
        backgroundClip: "padding-box",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
    },

    shareHover: {
        border: "2px solid #ff9800",
    },
};
