import os
from datetime import datetime
from pathlib import Path
import json
import logging
from typing import Dict, List, Optional, Literal

logger = logging.getLogger("team_management")

Role = Literal["owner", "admin", "member", "billing", "viewer"]

ROLE_PERMISSIONS = {
    "owner": {
        "billing_manage": True,
        "team_manage": True,
        "settings_edit": True,
        "usage_view": True,
        "invite_create": True,
        "plan_upgrade": True,
        "full_access": True,
    },
    "admin": {
        "billing_manage": False,
        "team_manage": True,
        "settings_edit": True,
        "usage_view": True,
        "invite_create": True,
        "plan_upgrade": False,
        "full_access": False,
    },
    "billing": {
        "billing_manage": True,
        "team_manage": False,
        "settings_edit": False,
        "usage_view": True,
        "invite_create": False,
        "plan_upgrade": True,
        "full_access": False,
    },
    "member": {
        "billing_manage": False,
        "team_manage": False,
        "settings_edit": False,
        "usage_view": True,
        "invite_create": False,
        "plan_upgrade": False,
        "full_access": False,
    },
    "viewer": {
        "billing_manage": False,
        "team_manage": False,
        "settings_edit": False,
        "usage_view": True,
        "invite_create": False,
        "plan_upgrade": False,
        "full_access": False,
    },
}

class TeamManager:
    def __init__(self):
        self.data_dir = Path("./data/teams")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.invites_dir = self.data_dir / "invites"
        self.invites_dir.mkdir(exist_ok=True)

    def _get_org_path(self, org_id: str) -> Path:
        return self.data_dir / f"{org_id}.json"

    # === CREATE ORGANIZATION ===
    def create_organization(
        self,
        name: str,
        owner_domain: str,
        owner_email: str,
        seats_total: int = 5,
    ) -> Dict:
        """Create parent org — billing account"""
        import uuid
        org_id = f"org_{uuid.uuid4().hex[:12]}"

        org = {
            "id": org_id,
            "name": name,
            "owner_domain": owner_domain,
            "billing_owner_email": owner_email,
            "seats": {
                "total": seats_total,
                "used": 1,
                "available": seats_total - 1,
            },
            "members": [
                {
                    "user_id": f"usr_{uuid.uuid4().hex[:8]}",
                    "email": owner_email,
                    "role": "owner",
                    "joined_at": datetime.utcnow().isoformat(),
                    "status": "active",
                }
            ],
            "sub_accounts": [],
            "created_at": datetime.utcnow().isoformat(),
            "plan": os.getenv("DEFAULT_TEAM_PLAN", "team-basic"),
        }

        with self._get_org_path(org_id).open("w") as f:
            json.dump(org, f, indent=2)

        logger.info(f"🏢 Org created: {name} ({org_id}) — owner: {owner_email}")
        return org

    # === INVITE MEMBER ===
    def invite_member(
        self,
        org_id: str,
        inviter_email: str,
        invitee_email: str,
        role: Role = "member",
    ) -> Dict:
        """Send invite — consumes seat"""
        org = self.get_org(org_id)
        if not org:
            raise ValueError("Organization not found")

        # Check permissions
        inviter = next((m for m in org["members"] if m["email"] == inviter_email), None)
        if not inviter or not ROLE_PERMISSIONS[inviter["role"]]["invite_create"]:
            raise PermissionError("Not authorized to invite members")

        # Check seat availability
        if org["seats"]["used"] >= org["seats"]["total"]:
            raise ValueError("No seats available — upgrade plan for more")

        # Check existing
        if any(m["email"] == invitee_email for m in org["members"]):
            raise ValueError("User already in organization")

        import uuid
        invite_id = f"inv_{uuid.uuid4().hex[:10]}"
        invite = {
            "id": invite_id,
            "org_id": org_id,
            "inviter_email": inviter_email,
            "invitee_email": invitee_email,
            "role": role,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow().replace(hour=23, minute=59, second=59) 
                           + __import__("datetime").timedelta(days=7)).isoformat(),
        }

        with (self.invites_dir / f"{invite_id}.json").open("w") as f:
            json.dump(invite, f, indent=2)

        logger.info(f"✉️ Invite sent: {invitee_email} → {org_id} as {role}")
        return invite

    # === ACCEPT INVITE ===
    def accept_invite(self, invite_id: str, user_email: str) -> Dict:
        """Confirm join — activates seat"""
        invite_path = self.invites_dir / f"{invite_id}.json"
        if not invite_path.exists():
            raise ValueError("Invite not found or expired")

        with invite_path.open() as f:
            invite = json.load(f)

        if invite["invitee_email"].lower() != user_email.lower():
            raise PermissionError("Invite does not belong to this user")
        if invite["status"] != "pending":
            raise ValueError(f"Invite already {invite['status']}")

        org = self.get_org(invite["org_id"])
        if not org:
            raise ValueError("Organization not found")

        import uuid
        new_member = {
            "user_id": f"usr_{uuid.uuid4().hex[:8]}",
            "email": user_email,
            "role": invite["role"],
            "joined_at": datetime.utcnow().isoformat(),
            "status": "active",
        }

        org["members"].append(new_member)
        org["seats"]["used"] += 1
        org["seats"]["available"] -= 1

        with self._get_org_path(org["id"]).open("w") as f:
            json.dump(org, f, indent=2)

        invite["status"] = "accepted"
        with invite_path.open("w") as f:
            json.dump(invite, f, indent=2)

        logger.info(f"✅ Joined org {org['id']}: {user_email} as {invite['role']}")
        return org

    # === REMOVE MEMBER ===
    def remove_member(self, org_id: str, remover_email: str, target_email: str) -> bool:
        """Remove/revoke access — frees seat"""
        org = self.get_org(org_id)
        if not org:
            return False

        remover = next((m for m in org["members"] if m["email"] == remover_email), None)
        if not remover or not ROLE_PERMISSIONS[remover["role"]]["team_manage"]:
            raise PermissionError("Not authorized to remove members")

        if remover_email == target_email:
            raise ValueError("Cannot remove yourself — transfer ownership first")

        original_len = len(org["members"])
        org["members"] = [m for m in org["members"] if m["email"] != target_email]

        if len(org["members"]) == original_len:
            return False

        org["seats"]["used"] -= 1
        org["seats"]["available"] += 1

        with self._get_org_path(org_id).open("w") as f:
            json.dump(org, f, indent=2)

        logger.info(f"👤 Removed from {org_id}: {target_email}")
        return True

    # === SUB-ACCOUNT / CHILD ORG ===
    def create_sub_account(
        self,
        parent_org_id: str,
        creator_email: str,
        sub_domain: str,
        sub_name: str,
        seats: int = 2,
    ) -> Dict:
        """Create managed sub-account — billing from parent"""
        parent = self.get_org(parent_org_id)
        if not parent:
            raise ValueError("Parent org not found")

        creator = next((m for m in parent["members"] if m["email"] == creator_email), None)
        if not creator or creator["role"] not in ["owner", "admin"]:
            raise PermissionError("Only owners/admins can create sub-accounts")

        import uuid
        sub_id = f"sub_{uuid.uuid4().hex[:10]}"
        sub = {
            "id": sub_id,
            "parent_org_id": parent_org_id,
            "name": sub_name,
            "domain": sub_domain,
            "billing_from_parent": True,
            "seats": {
                "total": seats,
                "used": 1,
                "available": seats - 1,
            },
            "members": [
                {
                    "user_id": f"usr_{uuid.uuid4().hex[:8]}",
                    "email": creator_email,
                    "role": "admin",
                    "joined_at": datetime.utcnow().isoformat(),
                    "status": "active",
                }
            ],
            "created_at": datetime.utcnow().isoformat(),
        }

        parent["sub_accounts"].append({
            "id": sub_id,
            "name": sub_name,
            "domain": sub_domain,
            "seats_allocated": seats,
        })

        with self._get_org_path(sub_id).open("w") as f:
            json.dump(sub, f, indent=2)
        with self._get_org_path(parent_org_id).open("w") as f:
            json.dump(parent, f, indent=2)

        logger.info(f"🏗️ Sub-account created: {sub_id} under {parent_org_id}")
        return sub

    # === UTILS ===
    def get_org(self, org_id: str) -> Optional[Dict]:
        path = self._get_org_path(org_id)
        if not path.exists():
            return None
        with path.open() as f:
            return json.load(f)

    def get_user_orgs(self, user_email: str) -> List[Dict]:
        """All orgs where user is member"""
        orgs = []
        for f in self.data_dir.glob("*.json"):
            if "invites" in str(f):
                continue
            with f.open() as fp:
                org = json.load(fp)
            if any(m["email"] == user_email and m["status"] == "active" for m in org["members"]):
                orgs.append(org)
        return sorted(orgs, key=lambda x: x["created_at"], reverse=True)

    def update_seat_allocation(self, org_id: str, new_total: int) -> Dict:
        """Called on plan upgrade — expand seats"""
        org = self.get_org(org_id)
        if not org:
            raise ValueError("Org not found")
        org["seats"]["total"] = new_total
        org["seats"]["available"] = max(0, new_total - org["seats"]["used"])
        with self._get_org_path(org_id).open("w") as f:
            json.dump(org, f, indent=2)
        return org

team_manager = TeamManager()
