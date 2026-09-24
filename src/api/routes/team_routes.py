from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr

from services.team_management import team_manager, Role
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/team", tags=["Team & Sub-Accounts"])

# === Schemas ===
class CreateOrgRequest(BaseModel):
    name: str
    seats: int = 5

class InviteRequest(BaseModel):
    org_id: str
    invitee_email: EmailStr
    role: Role = "member"

class SubAccountRequest(BaseModel):
    parent_org_id: str
    sub_name: str
    sub_domain: str
    seats: int = 2

# === Organization ===
@router.post("/create")
def create_org(
    req: CreateOrgRequest,
    user = Depends(get_current_user),
):
    """Create parent billing organization"""
    return team_manager.create_organization(
        name=req.name,
        owner_domain=user["domain"],
        owner_email=user["email"],
        seats_total=req.seats,
    )

@router.get("/my-orgs")
def list_my_orgs(user = Depends(get_current_user)):
    """All orgs/sub-accounts you belong to"""
    return {"orgs": team_manager.get_user_orgs(user["email"])}

@router.get("/{org_id}")
def get_organization(org_id: str, user = Depends(get_current_user)):
    """Full org details — members, seats, sub-accounts"""
    org = team_manager.get_org(org_id)
    if not org:
        raise HTTPException(404, "Organization not found")
    if not any(m["email"] == user["email"] for m in org["members"]):
        raise HTTPException(403, "Not a member")
    return org

# === Invitations ===
@router.post("/invite")
def invite_member(
    req: InviteRequest,
    user = Depends(get_current_user),
):
    try:
        return team_manager.invite_member(
            org_id=req.org_id,
            inviter_email=user["email"],
            invitee_email=req.invitee_email,
            role=req.role,
        )
    except (ValueError, PermissionError) as e:
        raise HTTPException(400, str(e))

@router.post("/accept/{invite_id}")
def accept_invite(invite_id: str, user = Depends(get_current_user)):
    try:
        return team_manager.accept_invite(invite_id, user["email"])
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.post("/remove-member")
def remove_member(
    org_id: str,
    target_email: EmailStr,
    user = Depends(get_current_user),
):
    try:
        ok = team_manager.remove_member(org_id, user["email"], target_email)
        if not ok:
            raise HTTPException(404, "Member not found")
        return {"status": "removed"}
    except PermissionError as e:
        raise HTTPException(403, str(e))

# === Sub-Accounts ===
@router.post("/sub-account/create")
def create_sub_account(
    req: SubAccountRequest,
    user = Depends(get_current_user),
):
    try:
        return team_manager.create_sub_account(
            parent_org_id=req.parent_org_id,
            creator_email=user["email"],
            sub_domain=req.sub_domain,
            sub_name=req.sub_name,
            seats=req.seats,
        )
    except (ValueError, PermissionError) as e:
        raise HTTPException(400, str(e))
