package com.praveen.samples.jacoco.multimodule;

import static junit.framework.TestCase.assertEquals;

import org.junit.Test;


public class Module2ClassIntegrationTest {
    @Test
    public void testConvertFloatIntegrationTestTwo() {
        Module2Class module2Class = new Module2Class();
        assertEquals( 129f, module2Class.convertToFloat( 129));
    }
}
