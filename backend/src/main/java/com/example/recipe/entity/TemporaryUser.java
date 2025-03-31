package com.example.recipe.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@Document("temporaryUsers")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TemporaryUser {
    @Id
    private String id;
    private String username;
    private String mail;
    private String password;
    private String OTP;
}
