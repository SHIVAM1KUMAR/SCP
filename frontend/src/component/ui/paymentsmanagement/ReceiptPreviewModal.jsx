import BasicModal from "../modal/basicModal";
import Button from "../button/Button";

const ReceiptPreviewModal = ({
  open = false,
  receiptUrl = "",
  receiptTarget = "",
  onClose,
}) => {
  if (!open || !receiptUrl) return null;

  const isPdf = String(receiptTarget || receiptUrl).toLowerCase().includes(".pdf");

  return (
    <BasicModal
      open={open}
      title="Payment Receipt"
      onClose={onClose}
      maxWidth="lg"
      actions={
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button as="a" href={receiptUrl} download target="_blank" rel="noreferrer" variant="primary">
            Download Receipt
          </Button>
        </div>
      }
    >
      <div style={{ maxHeight: "70vh", overflow: "auto", display: "flex", justifyContent: "center" }}>
        {isPdf ? (
          <iframe
            src={receiptUrl}
            width="100%"
            height="600px"
            title="Receipt"
            style={{ border: "none", borderRadius: 12 }}
          />
        ) : (
          <img
            src={receiptUrl}
            alt="Receipt"
            style={{ maxWidth: "100%", height: "auto", objectFit: "contain", borderRadius: 12 }}
          />
        )}
      </div>
    </BasicModal>
  );
};

export default ReceiptPreviewModal;
