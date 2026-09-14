from site_config import COMPONENT_COUNT, SITE_TITLE


def test_title_present():
    assert SITE_TITLE


def test_component_count_is_positive():
    assert COMPONENT_COUNT > 0
