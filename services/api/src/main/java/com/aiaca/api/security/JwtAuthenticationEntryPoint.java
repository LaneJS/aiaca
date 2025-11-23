package com.aiaca.api.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Custom authentication entry point that returns 401 Unauthorized
 * when authentication fails (e.g., missing or invalid JWT token).
 * This ensures the frontend can distinguish between:
 * - 401: Authentication failure (user needs to login)
 * - 403: Authorization failure (user is authenticated but lacks permission)
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException {
        // Return 401 Unauthorized with JSON response
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required. Please log in.\"}");
    }
}
