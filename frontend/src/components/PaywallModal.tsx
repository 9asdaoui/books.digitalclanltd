import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

type PaywallModalProps = {
  open: boolean;
  onClose: () => void;
  freePageLimit?: number;
  paypalClientId?: string;
};

export function PaywallModal({ open, onClose, freePageLimit, paypalClientId }: PaywallModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Continue Reading"
      variant="paywall"
      footer={
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="paywall" fullWidth onClick={onClose}>
            Subscribe with PayPal
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            Maybe later
          </Button>
        </div>
      }
    >
      <p>
        You&apos;ve reached the free preview limit
        {freePageLimit != null ? ` (${freePageLimit} pages)` : ""}. Upgrade to unlock full access.
      </p>
      {paypalClientId ? (
        <p className="mt-2 text-xs text-surface-500">PayPal checkout ready — client ID configured.</p>
      ) : (
        <p className="mt-2 text-xs text-surface-500">PayPal Client ID not configured yet.</p>
      )}
    </Modal>
  );
}
