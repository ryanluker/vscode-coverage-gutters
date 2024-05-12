// Copyright {yyyy} {name of copyright owner}

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 
// 
// this file is copied from https://github.com/PraveenGNair/jacoco-multi-module-sample/


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
