from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.opportunity import Opportunity
from app.schemas.opportunity import OpportunityCreate, OpportunityUpdate, OpportunityResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])


@router.get("", response_model=List[OpportunityResponse])
def list_opportunities(
    opp_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Opportunity).filter(Opportunity.is_active == True)
    if opp_type:
        query = query.filter(Opportunity.opp_type == opp_type)
    return query.order_by(Opportunity.deadline.asc().nullslast(), Opportunity.created_at.desc()).all()


@router.post("", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    opp_in: OpportunityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    opp = Opportunity(user_id=current_user.id, **opp_in.model_dump())
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return opp


@router.get("/{id}", response_model=OpportunityResponse)
def get_opportunity(id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")
    return opp


@router.put("/{id}", response_model=OpportunityResponse)
def update_opportunity(
    id: int,
    opp_in: OpportunityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")
    if opp.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
    for field, value in opp_in.model_dump(exclude_unset=True).items():
        setattr(opp, field, value)
    db.commit()
    db.refresh(opp)
    return opp


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_opportunity(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")
    if opp.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
    db.delete(opp)
    db.commit()
    return None
