package com.example.recipe.exception;

public class UserIsNotTheResourceOwnerException extends RuntimeException {
    public UserIsNotTheResourceOwnerException(String message) {
        super(message);
    }
}
