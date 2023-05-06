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