package com.example.recipe.exception;

public record ApiErrorResponse(
        int statusCode,
        String errorCode,
        String url,
        String message
) {}
