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

    public static int addTwoOnlyIfEven( int value )
    {
        int remainder = value % 2;
        if (remainder == 0)
        {
            return value + 2;
        }
        return value;
    }
}
