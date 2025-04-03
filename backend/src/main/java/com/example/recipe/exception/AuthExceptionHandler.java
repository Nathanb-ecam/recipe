package com.example.recipe.exception;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<ApiErrorResponse> jwtTokenExpired(ExpiredJwtException e, HttpServletRequest request) {
        var endpoint = request.getRequestURI();
        var httpStatus = HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(httpStatus).body(
                new ApiErrorResponse(
                        httpStatus.value(),
                        httpStatus.toString().split(" ")[1],
                        endpoint,
                        e.toString()
                )
        );
    }

    @ExceptionHandler(UserIsNotTheResourceOwnerException.class)
    public ResponseEntity<ApiErrorResponse> userNotAllowedToModifyThisResource(UserIsNotTheResourceOwnerException e, HttpServletRequest request) {
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


    @ExceptionHandler(OtpException.class)
    public ResponseEntity<Object> handleOtpException(OtpException e, HttpServletRequest request) {
        var endpoint = request.getRequestURI();
        var httpStatus = HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ApiErrorResponse(
                        httpStatus.value(),
                        httpStatus.toString().split(" ")[1],
                        endpoint,
                        e.getMessage()
                )
        );
    }
}
