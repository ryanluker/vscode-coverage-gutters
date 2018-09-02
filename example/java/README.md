## Install
(Note follow OS specific installation information)
- download JRE10 package
- download maven

## Build
(inside my-app)
- `mvn install`

## Test
(inside my-app)
- `mvn test`
- `mvn jacoco:report`
- xml output will be in `target/site/jacoco`
- move and rename the coverage `mv target/site/jacoco/jacoco.xml cov.xml`
