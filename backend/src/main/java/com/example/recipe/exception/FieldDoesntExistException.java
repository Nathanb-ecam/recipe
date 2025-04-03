package com.example.recipe.exception;

public class FieldDoesntExistException extends RuntimeException {
    public FieldDoesntExistException(String message) {
        super(message);
    }
}
