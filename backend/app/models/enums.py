from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    AUTHOR = "AUTHOR"
    READER = "READER"


class SubscriptionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    TRAILING = "TRAILING"
