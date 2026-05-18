package com.example.userservice.Request;
import lombok.Data;

@Data
public class SigninRequest {
    private String email;
    private String password;
}