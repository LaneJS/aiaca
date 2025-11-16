package com.aiaca.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class AuthDtos {
    public record RegisterRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record AuthResponse(UUID userId, String email, String token) {}
}
