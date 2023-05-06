package com.praveen.samples.jacoco.multimodule;

import static junit.framework.TestCase.assertEquals;

import org.junit.Test;

public class Module2ClassTest {

  @Test
  public void testConvertDoubleUnitTestOne() {
    Module2Class module2Class = new Module2Class();
    assertEquals(103.0, module2Class.convertToDouble(103));
  }
}
