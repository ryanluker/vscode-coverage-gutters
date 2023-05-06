package com.praveen.samples.jacoco.multimodule;

public class Module1Class {

  private int number;
  private String result;

  public String convertToString(int inputNumber) {
    return String.valueOf(inputNumber);
  }

  public long convertToLong(int inputNumber) {
    return Long.valueOf(inputNumber);
  }

  /**
   * A concatenation function. We will not write unit/integration test for this function. Rather we
   * would invoke this method from module3 i.e functional tests using cucumber, To see if we are
   * getting overall test coverage.
   *
   * @param inputNumber any number.
   * @return self conatenated number in string.
   */
  public String concatenate(int inputNumber) {
    // Just some random operation
    String result = convertToString(inputNumber) + convertToLong(inputNumber);
    this.setResult(result);
    return result;
  }

  public int getNumber() {
    return number;
  }

  public void setNumber(int number) {
    this.number = number;
  }

  public String getResult() {
    return result;
  }

  public void setResult(String result) {
    this.result = result;
  }
}
