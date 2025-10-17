import "../css/home.css";
import { Link } from "react-router-dom";

function ElectricCard({
                          to,
                          badge,
                          title,
                          description,
                          color,
                      }: {
    to: string;
    badge: string;
    title: string;
    description?: string;
    color?: string;
}) {
    const style = color
        ? ({ ["--electric-border-color" as any]: color } as React.CSSProperties)
        : undefined;

    return (
        <Link to={to} className="card-link" style={style}>
            <div className="card-container">
                <div className="inner-container">
                    <div className="border-outer">
                        <div className="main-card"></div>
                    </div>
                    <div className="glow-layer-1"></div>
                    <div className="glow-layer-2"></div>
                </div>

                <div className="overlay-1"></div>
                <div className="overlay-2"></div>
                <div className="background-glow"></div>

                <div className="content-container">
                    <div className="content-top">
                        <div className="scrollbar-glass">{badge}</div>
                        <p className="title">{title}</p>
                    </div>
                    <hr className="divider" />
                    <div className="content-bottom">
                        <p className="description">
                            {description ?? "Toca o presiona Enter para continuar."}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function Main() {
    return (
        <div className="hero-bg">
            <svg className="svg-container" aria-hidden="true" width="0" height="0">
                <defs>
                    <filter id="turbulent-displace" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
                        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                            <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
                        </feOffset>
                        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
                        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                            <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
                        </feOffset>
                        <feComposite in="offsetNoise1" in2="offsetNoise2" result="combinedNoise" />
                        <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="30" xChannelSelector="R" yChannelSelector="B" />
                    </filter>
                </defs>
            </svg>

            <main className="main-container">
                <div className="hero-header">
                    <h1 className="hero-title">BABEL</h1>
                    <p className="hero-subtitle">
                        Aprende idiomas con energía. <span>Impulsado por IA</span>
                    </p>
                </div>

                <div className="cards-row">
                    <ElectricCard
                        to="/register"
                        badge="Registro"
                        title="Crear cuenta"
                        description="Configura tu perfil y empieza tu ruta de aprendizaje."
                        color="#22d3ee"
                    />
                    <ElectricCard
                        to="/login"
                        badge="Acceso"
                        title="Iniciar sesión"
                        description="Continúa justo donde lo dejaste."
                    />
                </div>
            </main>
        </div>
    );
}
