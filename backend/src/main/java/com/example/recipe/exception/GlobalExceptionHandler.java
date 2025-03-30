package com.example.recipe.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoContentException.class)
    public ResponseEntity<ApiErrorResponse> handleNoItemsFound(Exception ex, HttpServletRequest request) {
        var endpoint = request.getRequestURI();
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(new ApiErrorResponse(
                    400,
                                ErrorCode.NO_CONTENT.toString(),
                                endpoint,
                                ex.getMessage()
                        )
                );
    }

    @ExceptionHandler(DatabaseException.class)
    public ResponseEntity<ApiErrorResponse> handleDatabaseException(Exception ex, HttpServletRequest request) {
        var endpoint = request.getRequestURI();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse(
                    500,
                                ErrorCode.DATABASE_ERROR.toString(),
                                endpoint,
                                ex.getMessage()
                        )
                );
    }

    @ExceptionHandler(GenericException.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        var endpoint = request.getRequestURI();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse(
                    500,
                                ErrorCode.UNEXPECTED_ERROR.toString(),
                                endpoint,
                                ex.getMessage()
                        )
                );
    }
}

