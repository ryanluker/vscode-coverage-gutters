package com.mycompany.example;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MyTests {
   @Test
   void testGgtForPrime() {
        assertEquals(1, Main.ggT(7, 5));
   }

   @Test
    void testGgtForZero() {
        assertEquals(42, Main.ggT(42, 0));
    }
}
