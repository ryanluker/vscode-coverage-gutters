package com.praveen.samples.jacoco.multimodule;

import org.junit.Test;
import org.junit.experimental.categories.Category;

import static org.junit.Assert.assertEquals;

public class Module1ClassTest {
    @Test
    public void testConvertToStringUnitTestOne() {
        Module1Class domainClass1 = new Module1Class();
        assertEquals( "190", domainClass1.convertToString( 190));
    }
}
