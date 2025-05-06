package com.example.recipe.exception;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FieldDoesntExistException.class)
    public ResponseEntity<Object> fieldDoesntExist(FieldDoesntExistException e, HttpServletRequest request) {
        var endpoint = request.getRequestURI();
        var httpStatus = HttpStatus.BAD_REQUEST;

        return ResponseEntity.status(httpStatus).body(
                new ApiErrorResponse(
                        httpStatus.value(),
                        httpStatus.toString().split(" ")[1],
                        endpoint,
                        e.toString()
                )
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        var endpoint = request.getRequestURI();
        var httpStatus = HttpStatus.BAD_REQUEST;
        StringBuilder errorMessages = new StringBuilder("Missing fields: ");

        BindingResult result = ex.getBindingResult();
        result.getFieldErrors().forEach(error -> errorMessages.append(error.getField()).append(" - ").append(error.getDefaultMessage()).append("; "));

        return ResponseEntity.status(httpStatus).body(
                new ApiErrorResponse(
                        httpStatus.value(),
                        httpStatus.toString().split(" ")[1],
                        endpoint,
                        errorMessages.toString()
                )
        );
    }

    @ExceptionHandler(NoContentException.class)
    public ResponseEntity<ApiErrorResponse> handleNoItemsFound(NoContentException ex, HttpServletRequest request) {
        var endpoint = request.getRequestURI();
        var httpStatus = HttpStatus.NOT_FOUND;
        return ResponseEntity.status(httpStatus)
                .body(new ApiErrorResponse(
                                httpStatus.value(),
                                httpStatus.toString().split(" ")[1],
                                endpoint,
                                ex.getMessage()
                        )
                );
    }



    @ExceptionHandler(DatabaseException.class)
    public ResponseEntity<ApiErrorResponse> handleDatabaseException(DatabaseException ex, HttpServletRequest request) {
        var endpoint = request.getRequestURI();
        var httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(httpStatus)
                .body(new ApiErrorResponse(
                                httpStatus.value(),
                                httpStatus.toString().split(" ")[1],
                                endpoint,
                                ex.getMessage()
                        )
                );
    }

    @ExceptionHandler(GenericException.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(GenericException ex, HttpServletRequest request) {
        var endpoint = request.getRequestURI();
        var httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(httpStatus)
                .body(new ApiErrorResponse(
                                httpStatus.value(),
                                httpStatus.toString().split(" ")[1],
                                endpoint,
                                ex.getMessage()
                        )
                );
    }
}

