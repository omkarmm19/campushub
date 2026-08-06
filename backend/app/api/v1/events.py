from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=List[EventResponse])
def list_events(
    event_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Event).filter(Event.is_active == True)
    if event_type:
        query = query.filter(Event.event_type == event_type)
    return query.order_by(Event.event_date.asc().nullslast(), Event.created_at.desc()).all()


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = Event(user_id=current_user.id, **event_in.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/{id}", response_model=EventResponse)
def get_event(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
    return event


@router.put("/{id}", response_model=EventResponse)
def update_event(
    id: int,
    event_in: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
    if event.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
    for field, value in event_in.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
    if event.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
    db.delete(event)
    db.commit()
    return None
