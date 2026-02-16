package com.aiaca.api.service;

import com.aiaca.api.dto.AuthDtos;
import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.model.User;
import com.aiaca.api.repository.UserRepository;
import com.aiaca.api.security.JwtService;
import com.aiaca.api.security.TokenBlacklist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TokenBlacklist tokenBlacklist;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       AuthenticationManager authenticationManager, TokenBlacklist tokenBlacklist) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.tokenBlacklist = tokenBlacklist;
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already registered");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        log.info("User registered: {}", user.getEmail());
        return new AuthDtos.AuthResponse(user.getId(), user.getEmail(), token, resolveRoles(user));
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
            User authenticatedUser = userRepository.findByEmail(request.email())
                    .orElseThrow(() -> new BadRequestException("Invalid credentials"));
            String token = jwtService.generateToken(authenticatedUser);
            return new AuthDtos.AuthResponse(authenticatedUser.getId(), authenticatedUser.getEmail(), token, resolveRoles(authenticatedUser));
        } catch (AuthenticationException ex) {
            throw new BadRequestException("Invalid credentials");
        }
    }

    public void logout(String token) {
        try {
            Date expiry = jwtService.extractExpiration(token);
            if (expiry.before(new Date())) {
                log.info("Ignoring logout for expired token");
                return;
            }
            tokenBlacklist.blacklist(token, expiry);
            log.info("Token blacklisted until {}", expiry);
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException ex) {
            log.info("Ignoring logout for invalid token: {}", ex.getMessage());
        }
    }

    public User createUserWithoutLogin(String email, String password, String name) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        if (name != null && !name.isBlank()) {
            user.setFullName(name);
        }
        userRepository.save(user);
        log.info("User created without login: {}", user.getEmail());
        return user;
    }

    private List<String> resolveRoles(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return List.of();
        }
        return user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toList());
    }
}
