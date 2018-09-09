package com.mycompany.app;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import com.mycompany.app.App;

/**
 * Unit test for simple App.
 */
public class AppTest
    extends TestCase
{
    /**
     * Create the test case
     *
     * @param testName name of the test case
     */
    public AppTest( String testName )
    {
        super( testName );
    }

    /**
     * @return the suite of tests being tested
     */
    public static Test suite()
    {
        return new TestSuite( AppTest.class );
    }

    /**
     * Rigourous Test :-)
     */
    public void testApp()
    {
        assertTrue( true );
    }

    public void testAddTwoHappyFlow()
    {
        int value = App.addTwoOnlyIfEven( 2 );
        assertEquals( value, 4 );
    }

    public void testAddTwoSadFlow()
    {
        int value = App.addTwoOnlyIfEven( 1 );
        assertEquals( value, 1 );
    }
}
