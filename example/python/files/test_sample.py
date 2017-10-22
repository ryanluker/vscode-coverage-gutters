"""testing coverage"""

# content of test_sample.py
def func(number):
    """test function"""
    if number is 4:
        return number + 1
    elif number is 5:
        return number + 1
    else:
        return number

def test_answer():
    """test adding"""
    assert func(4) == 5
