"""User profile management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, UserProfile
from app.schemas import UserProfileResponse, UserProfileUpdate

router = APIRouter(prefix="/users", tags=["Users & Profiles"])


@router.get(
    "/profile",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get profile of the authenticated user",
)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve the fitness profile for the authenticated user."""
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fitness profile has not been created yet.",
        )
    return profile


@router.put(
    "/profile",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Create or update user fitness profile",
)
def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upsert the fitness profile for the current user."""
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )

    update_dict = profile_data.model_dump(exclude_unset=True)

    if not profile:
        profile = UserProfile(user_id=current_user.id, **update_dict)
        db.add(profile)
    else:
        for key, value in update_dict.items():
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile
