import { useEffect, useRef, useState } from "react";
import "./FingerprintScanner.css";
import Logo from "../../assets/logo-branco.svg";

interface FingerprintScannerProps {
    onSuccess: () => void;
}

type ScannerState = "idle" | "scanning" | "success";
const SCAN_DURATION = 1500;

export default function FingerprintScanner({
    onSuccess
} : FingerprintScannerProps) {
    const [status, setStatus] = useState<ScannerState>("idle");

    const startTime = useRef<number | null>(null);
    const animationFrame = useRef<number | null>(null);
    const completed = useRef(false);

    function cancelAnimation() {
        if (animationFrame.current != null) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    }

    function resetScan() {
        cancelAnimation();
        startTime.current = null;

        if (completed.current) return;

        setStatus("idle");
    }

    function updateProgress(timestamp: number) {
        if (startTime.current === null || completed.current) return;

        const elapsed = timestamp - startTime.current;
        const nextProgress = Math.min(elapsed / SCAN_DURATION, 1);


        if (nextProgress >= 1) {
            completed.current = true;
            setStatus("success");
            animationFrame.current = null;
            return;
        }

        animationFrame.current = requestAnimationFrame(updateProgress);
    }

    function startScan() {
        if (status === "success" || startTime.current != null) return;

        startTime.current = performance.now();
        setStatus("scanning");

        animationFrame.current = requestAnimationFrame(updateProgress);
    }

    useEffect(() => {
        if (status !== "success") return;

        const timeout = window.setTimeout(onSuccess, 1000);

        return () => window.clearTimeout(timeout);
    }, [status, onSuccess]);

    useEffect(() => {
        return () => cancelAnimation();
    }, []);

    return (
        <div className="fp-aux">
            <section className="fingerprint">
                <header>
                    <div className="aux">
                        <img src={Logo}
                        />

                        <div>
                            <h1>S.H.I.E.L.D.</h1>
                            <h2>STRATEGIC HOMELAND INTERVENTION,</h2>
                            <h2>ENFORCEMENT AND LOGISTIC DIVISION</h2>
                        </div>
                    </div>

                    <p>AUTENTICAÇÃO BIOMÉTRICA NECESSÁRIA</p>
                </header>

                <button className={status}
                    disabled={status === "success"}
                    onContextMenu={(e) => e.preventDefault()}
                    onLostPointerCapture={resetScan}
                    onPointerCancel={resetScan}
                    onPointerDown={(e) => {
                        if (status === "success") return;

                        e.currentTarget.setPointerCapture(e.pointerId);
                        startScan();
                    }}
                    onPointerUp={resetScan}
                    type="button"
                >
                    <span className="__corner tl" />
                    <span className="__corner tr" />
                    <span className="__corner bl" />
                    <span className="__corner br" />

                    <div className="__icon" />

                    {status === "scanning" && (
                        <span className="__scan-line" />
                    )}

                    {status == "success" && (
                        <span className="__success">
                            ✓
                        </span>
                    )}
                </button>

                <footer>
                    SYS v.5.16.29
                </footer>
            </section>
        </div>
    );
}