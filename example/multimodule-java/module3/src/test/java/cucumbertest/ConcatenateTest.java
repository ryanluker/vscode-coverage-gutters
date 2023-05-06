package cucumbertest;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = "cucumbertest",
    strict = true//to suppress unwanted warnings related to cucumber
)
public class ConcatenateTest {

}