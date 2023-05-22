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


package cucumbertest;

import com.praveen.samples.jacoco.multimodule.Module1Class;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.TestCase.assertEquals;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class ConcatenateSteps {
   private Logger logger = LoggerFactory.getLogger(ConcatenateSteps.class);

    private Module1Class module1Class;

    @Given("^that an integer (\\d+)$")
    public void setNumber(int number) throws Throwable {
        logger.info( "Given: that: " + number);
        module1Class = new Module1Class();
        module1Class.setNumber(number);

    }

    @When("^number (\\d+) is self concatenated$")
    public void concatenateNow(int number) throws Throwable {
        logger.info( "When: number: " + number);
        module1Class.concatenate(number);
    }

    @Then("^The concatenated output for number (\\d+) should be (.*)$")
    public void calculationDone(int number, String result) throws Throwable {
        assertThat(number, is(module1Class.getNumber()));
        assertEquals(result, module1Class.getResult());
    }
}