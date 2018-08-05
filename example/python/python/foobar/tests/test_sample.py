"""testing coverage"""
from bar.a import func
from foo.a import identity


def test_answer():
    """test adding"""
    assert func(4) == identity(5)
