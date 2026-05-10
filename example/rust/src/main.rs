use calculator::*;

fn main() {
    let a = 10;
    let b = 3;

    println!("Calculator Demo");
    println!("===============");
    println!("a = {}, b = {}", a, b);
    println!();

    println!("add({}, {}) = {}", a, b, add(a, b));
    println!("subtract({}, {}) = {}", a, b, subtract(a, b));
    println!("multiply({}, {}) = {}", a, b, multiply(a, b));
    
    match divide(a, b) {
        Some(result) => println!("divide({}, {}) = {}", a, b, result),
        None => println!("divide({}, {}) = Error: division by zero", a, b),
    }

    println!();
    println!("factorial(5) = {}", factorial(5));
    println!("is_prime(17) = {}", is_prime(17));
    println!("max({}, {}) = {}", a, b, max(a, b));
    println!("min({}, {}) = {}", a, b, min(a, b));
}
