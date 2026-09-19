"""Tests for the workflow-permission-check loader."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from loader import (can_write, check_many, check_workflow_write, explain,
                    missing, required)

CONTENTS_ONLY = ["contents:write"]
FULL = ["contents:write", "workflows:write"]
ACTIONS_ONLY = ["actions:write"]


def test_required_unknown_defaults_read_only():
    assert required("nope") == ["contents:read"]


def test_workflow_write_needs_both():
    assert required("workflow_write") == ["contents:write", "workflows:write"]


def test_contents_write_is_not_enough_for_workflow():
    # the core lesson: contents:write does NOT imply workflows:write
    assert can_write("workflow_write", CONTENTS_ONLY) is False
    assert can_write("code_write", CONTENTS_ONLY) is True


def test_can_write_true_when_full():
    assert can_write("workflow_write", FULL) is True


def test_missing_lists_the_gap():
    assert missing("workflow_write", CONTENTS_ONLY) == ["workflows:write"]


def test_explain_shape():
    r = explain("workflow_write", CONTENTS_ONLY)
    assert r["allowed"] is False
    assert r["missing"] == ["workflows:write"]
    assert r["workflow_scoped"] is True


def test_check_workflow_write():
    assert check_workflow_write(CONTENTS_ONLY)["allowed"] is False
    assert check_workflow_write(FULL)["allowed"] is True


def test_rerun_ci_needs_actions():
    assert can_write("rerun_ci", ACTIONS_ONLY) is True
    assert can_write("rerun_ci", CONTENTS_ONLY) is False


def test_check_many_reports_blocked():
    r = check_many(["code_write", "workflow_write"], CONTENTS_ONLY)
    assert r["all_allowed"] is False
    assert r["blocked"] == ["workflow_write"]


def test_check_many_all_allowed():
    r = check_many(["code_write", "workflow_write"], FULL)
    assert r["all_allowed"] is True
    assert r["blocked"] == []
