from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.
    Every model (User, HousingListing, etc.) will inherit from this.
    """
    pass
