package com.praveen.samples.jacoco.multimodule;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class Module1ClassIntegrationTest {

  @Test
  public void testConvertToLongIntegrationTestTwo() {
    Module1Class module1Class = new Module1Class();
    assertEquals(180L, module1Class.convertToLong(180));
  }
}
