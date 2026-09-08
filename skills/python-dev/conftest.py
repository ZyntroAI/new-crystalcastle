"""Make the hyphenated skill dir importable as skills.python_dev for tests.

The on-disk folder is `skills/python-dev` (dash), but modules use dotted import
`skills.python_dev`. This registers an alias before collection.
"""
import os
import sys

_REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_SKILLS = os.path.join(_REPO, "skills")
_DIR = os.path.join(_SKILLS, "python-dev")

if _REPO not in sys.path:
    sys.path.insert(0, _REPO)
if _DIR not in sys.path:
    sys.path.insert(0, _DIR)

# Register skills/python-dev under the dotted name `skills.python_dev`.
import importlib.util  # noqa: E402

_pkg_name = "skills.python_dev"
if _pkg_name not in sys.modules:
    spec = importlib.util.spec_from_loader(_pkg_name, loader=None, is_package=True)
    pkg = importlib.util.module_from_spec(spec)
    pkg.__path__ = [_DIR]
    sys.modules[_pkg_name] = pkg

# Also alias individual submodules so `from skills.python_dev.X import ...` works.
for sub in ("security", "static_layer", "runtime_layer", "orchestrator", "workflow"):
    full = f"{_pkg_name}.{sub}"
    if full not in sys.modules:
        spec = importlib.util.spec_from_file_location(full, os.path.join(_DIR, f"{sub}.py"))
        mod = importlib.util.module_from_spec(spec)
        sys.modules[full] = mod
        assert spec.loader is not None
        spec.loader.exec_module(mod)
