import uuid


class PaymentRequiredError(Exception):
    def __init__(
        self,
        book_id: uuid.UUID,
        free_page_limit: int,
        message: str = "Subscribe to read beyond the free preview",
    ) -> None:
        self.book_id = book_id
        self.free_page_limit = free_page_limit
        self.message = message
        super().__init__(message)
