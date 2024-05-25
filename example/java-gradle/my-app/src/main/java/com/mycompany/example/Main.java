package com.mycompany.example;
public class Main {
    
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
    
    public static int ggT(int a, int b) {
        while (b != 0) {
            if (a > b) {
                a = a - b;
            } else {
                b = b - a;
            }
        }
        return a;
    }
}
