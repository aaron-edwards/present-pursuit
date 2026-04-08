"use client";

import { useEffect, useRef, useState } from "react";

import { UnicornBuddy } from "@/components/unicorn-buddy";
import { getCelebrationBuddyVariant } from "@/lib/hunt";

type ScanStatus =
  | { kind: "idle"; message: string }
  | { kind: "starting"; message: string }
  | { kind: "active"; message: string }
  | { kind: "unsupported"; message: string }
  | { kind: "error"; message: string };

type InlineScanResult =
  | {
      destination: string;
      status: "redirect";
    }
  | {
      currentDestination: string;
      message: string;
      status: "blocked";
    }
  | {
      message: string;
      nextDestination: string;
      nextLabel: string;
      status: "success";
    };

const INLINE_CONFETTI_PIECES = Array.from({ length: 20 }, (_, index) => ({
  id: `inline-confetti-${index + 1}`,
  offset: index,
  left: [
    8, 18, 29, 40, 51, 63, 74, 85, 12, 23, 35, 46, 58, 69, 81, 15, 27, 49, 66,
    78,
  ][index],
  top: [
    9, 6, 11, 7, 13, 8, 12, 10, 20, 17, 22, 18, 24, 19, 21, 30, 27, 29, 26, 31,
  ][index],
}));

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorLike;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

function isNavigableResult(result: string): boolean {
  try {
    const url = new URL(result, window.location.href);
    const sameOrigin = url.origin === window.location.origin;
    const allowedPath =
      url.pathname === "/" ||
      url.pathname === "/start" ||
      url.pathname === "/done" ||
      url.pathname === "/hunt" ||
      url.pathname.startsWith("/hunt/") ||
      url.pathname.startsWith("/scan/") ||
      url.pathname.startsWith("/celebrate/");

    return sameOrigin && allowedPath;
  } catch {
    return false;
  }
}

export function InlineQrScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const successDialogRef = useRef<HTMLDialogElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const frameRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const processingRef = useRef(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [showAvailabilityPopup, setShowAvailabilityPopup] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [successState, setSuccessState] = useState<{
    message: string;
    nextDestination: string;
    nextLabel: string;
  } | null>(null);
  const [supported, setSupported] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(
    null,
  );
  const [scanStatus, setScanStatus] = useState<ScanStatus>({
    kind: "idle",
    message:
      "Open the camera here if you want to scan the next QR without leaving the page.",
  });
  const [scannerFeedback, setScannerFeedback] = useState<
    "idle" | "error" | "success"
  >("idle");

  useEffect(() => {
    setHasMounted(true);

    const hasCameraAccess =
      typeof navigator.mediaDevices?.getUserMedia === "function";
    const hasBarcodeDetector = typeof window.BarcodeDetector === "function";
    const nextSupported = Boolean(
      window.isSecureContext && hasCameraAccess && hasBarcodeDetector,
    );

    setSupported(nextSupported);

    if (!window.isSecureContext) {
      setAvailabilityMessage(
        `This page is not running in a secure context. The in-page scanner works on https:// pages and on localhost, but not on plain http://${window.location.host}.`,
      );
      return;
    }

    if (!hasCameraAccess) {
      setAvailabilityMessage(
        "This browser does not expose camera access for in-page scanning.",
      );
      return;
    }

    if (!hasBarcodeDetector) {
      setAvailabilityMessage(
        "This browser can open the camera, but it does not expose BarcodeDetector for automatic QR scanning.",
      );
      return;
    }

    setAvailabilityMessage(null);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (scannerOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!scannerOpen && dialog.open) {
      dialog.close();
    }
  }, [scannerOpen]);

  useEffect(() => {
    const dialog = successDialogRef.current;
    if (!dialog) {
      return;
    }

    if (successOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!successOpen && dialog.open) {
      dialog.close();
    }
  }, [successOpen]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }

      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!scannerOpen) {
      processingRef.current = false;
      setScannerFeedback("idle");

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }

      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
        streamRef.current = null;
      }

      return;
    }

    if (!supported) {
      setScanStatus({
        kind: "unsupported",
        message:
          "This browser does not expose the in-page QR scanner APIs. The phone camera app can still scan the printed QR codes normally.",
      });
      return;
    }

    let cancelled = false;

    async function startScanner() {
      setShowAvailabilityPopup(false);
      setScanStatus({
        kind: "starting",
        message: "Opening the rear camera...",
      });

      try {
        const BarcodeDetectorCtor = window.BarcodeDetector;
        if (!BarcodeDetectorCtor) {
          setScanStatus({
            kind: "unsupported",
            message:
              "This browser does not expose the in-page QR scanner APIs. The phone camera app can still scan the printed QR codes normally.",
          });
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
        });

        if (cancelled) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        detectorRef.current = new BarcodeDetectorCtor({
          formats: ["qr_code"],
        });

        setScanStatus({
          kind: "active",
          message:
            "Camera is live. Hold the QR inside the frame and we will open it automatically.",
        });

        const scanFrame = async () => {
          if (cancelled || !videoRef.current || !detectorRef.current) {
            return;
          }

          if (processingRef.current) {
            frameRef.current = requestAnimationFrame(scanFrame);
            return;
          }

          if (
            videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
          ) {
            try {
              const barcodes = await detectorRef.current.detect(
                videoRef.current,
              );
              const match = barcodes.find(
                (barcode) =>
                  barcode.rawValue && isNavigableResult(barcode.rawValue),
              );

              if (match?.rawValue) {
                console.debug("[scanner] QR detected", {
                  rawValue: match.rawValue,
                });
                processingRef.current = true;
                setScanStatus({
                  kind: "active",
                  message: "Checking that QR...",
                });

                const inlineUrl = new URL(match.rawValue, window.location.href);
                inlineUrl.searchParams.set("mode", "inline");
                console.debug("[scanner] Fetching inline scan result", {
                  inlineUrl: inlineUrl.toString(),
                });

                const response = await fetch(inlineUrl.toString(), {
                  credentials: "same-origin",
                });
                console.debug("[scanner] Inline scan HTTP response", {
                  ok: response.ok,
                  status: response.status,
                  url: response.url,
                });

                const result = (await response.json()) as InlineScanResult;
                console.debug("[scanner] Inline scan payload", result);

                if (result.status === "redirect") {
                  console.debug("[scanner] Redirecting browser", {
                    destination: result.destination,
                  });
                  for (const track of stream.getTracks()) {
                    track.stop();
                  }
                  window.location.assign(result.destination);
                  return;
                }

                if (result.status === "blocked") {
                  console.debug("[scanner] Wrong or out-of-order QR", {
                    message: result.message,
                    currentDestination: result.currentDestination,
                  });
                  setScannerFeedback("error");
                  setScanStatus({
                    kind: "active",
                    message: result.message,
                  });
                  feedbackTimeoutRef.current = window.setTimeout(() => {
                    setScannerFeedback("idle");
                    processingRef.current = false;
                    frameRef.current = requestAnimationFrame(scanFrame);
                  }, 850);
                  return;
                }

                console.debug("[scanner] Correct QR accepted", {
                  nextDestination: result.nextDestination,
                  nextLabel: result.nextLabel,
                });
                setScannerFeedback("success");
                setScanStatus({
                  kind: "active",
                  message: "That is the right QR. Loading the celebration...",
                });
                feedbackTimeoutRef.current = window.setTimeout(() => {
                  for (const track of stream.getTracks()) {
                    track.stop();
                  }

                  setSuccessState({
                    message: result.message,
                    nextDestination: result.nextDestination,
                    nextLabel: result.nextLabel,
                  });
                  console.debug("[scanner] Opening success dialog", {
                    nextDestination: result.nextDestination,
                  });
                  setScannerOpen(false);
                  setSuccessOpen(true);
                  setScannerFeedback("idle");
                  processingRef.current = false;
                }, 350);
                return;
              }
            } catch {
              console.debug("[scanner] QR detection or fetch failed");
              processingRef.current = false;
              setScanStatus({
                kind: "error",
                message:
                  "The camera opened, but QR detection failed on this device. You can still use the phone camera app as a fallback.",
              });
              return;
            }
          }

          frameRef.current = requestAnimationFrame(scanFrame);
        };

        frameRef.current = requestAnimationFrame(scanFrame);
      } catch (error) {
        const denied =
          error instanceof DOMException &&
          (error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError");

        setScanStatus({
          kind: "error",
          message: denied
            ? "Camera permission was denied. Allow camera access in the browser and try again."
            : "Could not open the camera. On mobile this usually needs HTTPS and a supported browser.",
        });
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
        streamRef.current = null;
      }
    };
  }, [scannerOpen, supported]);

  return (
    <section className="scanner-card">
      <div className="button-group">
        <button
          className="button button-primary"
          onClick={() => {
            if (!hasMounted) {
              return;
            }

            if (!supported) {
              setShowAvailabilityPopup(true);
              return;
            }

            setScannerOpen(true);
          }}
          type="button"
        >
          {hasMounted && !supported
            ? "Why Scanner Is Unavailable"
            : "Scan the QR"}
        </button>
      </div>

      {showAvailabilityPopup && availabilityMessage ? (
        <div aria-live="polite" className="scanner-popup" role="alert">
          <p>{availabilityMessage}</p>
          <button
            className="button button-secondary"
            onClick={() => setShowAvailabilityPopup(false)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <dialog
        aria-label="QR scanner"
        className="scanner-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setScannerOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setScannerOpen(false);
          }
        }}
        onClose={() => {
          setScannerOpen(false);
          setShowAvailabilityPopup(false);
        }}
        ref={dialogRef}
      >
        <div className="scanner-dialog-panel">
          <div className="scanner-dialog-header">
            <div>
              <p className="eyebrow">Scanner</p>
              <h3>Scan the hidden QR</h3>
            </div>
            <button
              aria-label="Close scanner"
              className="scanner-close"
              onClick={() => setScannerOpen(false)}
              type="button"
            >
              Close
            </button>
          </div>

          <p className="scanner-status-text">{scanStatus.message}</p>
          {availabilityMessage ? (
            <p className="scanner-warning">{availabilityMessage}</p>
          ) : null}

          <div className="scanner-frame scanner-frame-dialog">
            <video
              ref={videoRef}
              autoPlay
              className="scanner-video"
              muted
              playsInline
            />
            <div
              className={`scanner-target${
                scannerFeedback === "error"
                  ? " scanner-target-error"
                  : scannerFeedback === "success"
                    ? " scanner-target-success"
                    : ""
              }`}
            />
          </div>

          <p className="scanner-help">
            Hold the QR inside the frame and keep the phone steady for a moment.
          </p>
        </div>
      </dialog>

      <dialog
        aria-label="Celebration"
        className="scanner-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setSuccessOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setSuccessOpen(false);
          }
        }}
        onClose={() => setSuccessOpen(false)}
        ref={successDialogRef}
      >
        <div className="scanner-dialog-panel success-dialog-panel">
          <div className="confetti-burst" aria-hidden="true">
            {INLINE_CONFETTI_PIECES.map((piece) => (
              <span
                className="confetti-piece"
                key={piece.id}
                style={
                  {
                    "--confetti-index": piece.offset,
                    "--confetti-left": `${piece.left}%`,
                    "--confetti-top": `${piece.top}%`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
          <p className="eyebrow">Checkpoint Complete</p>
          <h3 className="success-title">
            {successState?.message ?? "Well done."}
          </h3>
          <UnicornBuddy
            className="success-buddy"
            imageClassName="success-buddy-image"
            variant={getCelebrationBuddyVariant()}
          />
          <p className="scanner-status-text">
            You found the right spot. Ready for the next part of the pursuit?
          </p>
          <div className="button-group">
            <button
              className="button button-primary"
              onClick={() => {
                if (successState) {
                  window.location.assign(successState.nextDestination);
                }
              }}
              type="button"
            >
              {successState?.nextLabel ?? "Continue"}
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
