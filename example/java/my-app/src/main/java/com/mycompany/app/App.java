package com.mycompany.app;

/**
 * Hello world!
 *
 */
public class App
{
    public static void main( String[] args )
    {
        System.out.println( "Hello World!" );
    }

    /**
     * Demonstrates partial branch coverage
     * Tests only the even path, leaving odd path uncovered
     */
    public static int addTwoOnlyIfEven( int value )
    {
        int remainder = value % 2;
        if (remainder == 0)
        {
            return value + 2;  // This branch is tested
        }
        return value;  // This branch may not be fully tested
    }

    /**
     * Complex conditional logic for partial coverage demonstration
     * Only some branches are exercised by tests
     */
    public static String validateAndProcess(String input, boolean strict) {
        if (input == null || input.isEmpty()) {
            return "empty";  // Tested
        }
        
        if (strict && input.length() < 5) {
            return "too_short";  // May be untested
        } else if (!strict && input.length() < 3) {
            return "minimal";  // May be untested
        }
        
        return input.toUpperCase();  // Partially tested
    }

    /**
     * Ternary and nested conditions for branch coverage
     */
    public static int calculateScore(int base, boolean bonus, boolean penalty) {
        int score = base;
        score += bonus ? 10 : 0;  // One branch tested
        score -= penalty ? 5 : 0;  // Other branch may be untested
        return score;
    }
}
