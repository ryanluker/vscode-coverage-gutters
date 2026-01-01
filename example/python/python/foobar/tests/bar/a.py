def func(number):
    """test function with partial branch coverage"""
    if number == 4:
        return number + 1  # Tested
    elif number == 5:
        return number + 1  # May be untested
    else:
        return number  # Partially tested


def identity(x):
    return x


def validate_range(value, min_val=0, max_val=100):
    """Demonstrates complex conditional logic
    Only some branches are tested to show partial coverage
    """
    if value is None:
        return False  # Tested
    
    if not isinstance(value, (int, float)):
        return False  # May be untested
    
    if value < min_val or value > max_val:
        return False  # Partially tested (one condition)
    
    return True  # Tested


def process_data(data, transform=False, validate=True):
    """Multi-branch logic for coverage demonstration"""
    if not data:
        return []  # Tested
    
    result = data[:]
    
    if transform and len(result) > 0:
        result = [x * 2 for x in result]  # One branch tested
    
    if validate:
        result = [x for x in result if x > 0]  # May be partially tested
    
    return result
