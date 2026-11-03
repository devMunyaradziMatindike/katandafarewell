import Swal from "sweetalert2";

export function showProcessing(title = "Processing…", text = "Please wait") {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: true,
    showConfirmButton: false,
    showDenyButton: true,
    denyButtonText: "Cancel waiting",
    denyButtonColor: "#7a1f2b",
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

export function showThankYou() {
  return Swal.fire({
    icon: "success",
    title: "Siyabonga. Tinotenda. Thank you",
    confirmButtonText: "OK",
    confirmButtonColor: "#0b1f3a",
  });
}

export function showPaymentError(message: string) {
  return Swal.fire({
    icon: "error",
    title: "Payment failed",
    text: message,
    confirmButtonColor: "#7a1f2b",
  });
}

export async function pollDonationUntilSettled(
  publicRef: string,
  signal?: AbortSignal
) {
  const delays = [1500, 2500, 3500, 4500, 6000, 8000];

  for (const delay of delays) {
    if (signal?.aborted) {
      return "cancelled" as const;
    }

    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), delay);
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
    });

    if (signal?.aborted) {
      return "cancelled" as const;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/donations/${publicRef}/status`,
        {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal,
        }
      );
      const payload = await res.json();
      const status = payload?.data?.status as string | undefined;
      const paid = Boolean(payload?.data?.paid);

      if (paid || status === "confirmed") {
        return "confirmed" as const;
      }
      if (status === "failed") {
        return "failed" as const;
      }
    } catch (err) {
      if (signal?.aborted || (err instanceof DOMException && err.name === "AbortError")) {
        return "cancelled" as const;
      }
      // keep polling
    }
  }

  return "pending" as const;
}
